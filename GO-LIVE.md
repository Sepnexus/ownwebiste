# Go-live playbook — pushing the current build to sepnexus.com production

This walks through:

1. Deploying the latest `next-rebuild` branch to the existing VPS
2. Switching Razorpay from test → live
3. Verifying Resend, the cron, n8n usage tracking, and DNS

All commands below assume the VPS at `root@srv844822.hstgr.cloud`. Everything
is idempotent — safe to re-run on any failure.

---

## A. Code deploy (no Razorpay changes yet)

This part is safe to do without flipping to live mode. You can ship the new
code today, leave Razorpay on test, then flip to live whenever you're ready
in section B.

```bash
ssh root@srv844822.hstgr.cloud
cd /root/sepnexus-web
bash scripts/deploy-prod.sh
```

The script:

- `git pull` on `next-rebuild`
- `docker compose up -d --build` (which runs migrations on container boot via
  `instrumentation.ts` → `lib/db/migrate.ts`)
- Waits for `/api/health` to return 200
- Backfills any unnumbered paid invoices with sequential numbers

What's new in this update from the last deploy:

- **migration 0008** — adds `invoice_number`, `billing_snapshot`, `business_snapshot`
  to `invoices`, plus the `invoice_counters` table for atomic numbering
- **new dependency** `@react-pdf/renderer` (auto-installed by `npm ci` in the
  build step)
- **own-branded PDF invoices** at `/api/invoices/:id/pdf` and the matching
  customer/admin viewer pages
- **email logo** switched from base64 data URI to CID attachment so it
  actually renders in Gmail
- **auto-sync plans to Razorpay** on create/update (no more manual second click)
- **custom plan banner** on the customer dashboard
- **"Email us to update payment method"** mailto on `/dashboard/billing`
  (Razorpay has no self-serve customer portal)

Once it's up:

```bash
# Tail the logs for a minute to make sure boot + migrate cleared
docker logs -n 200 -f sepnexus-web
```

Look for `[migrate] running migrations from /app/drizzle` followed by
`[migrate] done`. Ctrl+C out once you see normal request logs.

Smoke-test in your browser:

- https://sepnexus.com/ — homepage renders
- https://sepnexus.com/admin/invoices — the new global invoice list
- https://sepnexus.com/dashboard/billing — "Payment method" card with mailto

If the build fails mid-way: `docker logs -n 200 sepnexus-web` shows the
TypeScript or Next error. The previous container keeps running until the new
one boots cleanly, so there's no outage during a failed deploy.

---

## B. Razorpay: test → live cutover

Do this only when you're ready to accept real money. Have your Razorpay
dashboard open in a browser. **Once you flip, existing test-mode
subscriptions stop being valid** — currently only the `akshay+12@sepnexus.com`
test sub, which is fine to abandon.

### 1. Generate live API keys

Razorpay Dashboard → **switch the toggle in the top-left from Test Mode to
Live Mode** → Settings → API Keys → **Generate Live Keys**. Razorpay shows
the key ID + secret **once** — copy both.

### 2. Create the live webhook

Still in Live Mode: Settings → Webhooks → **+ Add new webhook**.

- **URL:** `https://sepnexus.com/api/billing/webhook`
- **Secret:** click "Generate". Copy the generated string — you'll paste it
  into `.env`.
- **Active events** (tick every one of these):
  - `subscription.activated`
  - `subscription.charged`
  - `subscription.completed`
  - `subscription.cancelled`
  - `subscription.halted`
  - `subscription.paused`
  - `subscription.resumed`
  - `subscription.pending`
  - `subscription.authenticated`
  - `subscription.expired`
  - `invoice.paid`
  - `payment.failed`

Save. Razorpay will fire a test ping immediately — a row should appear in
the `webhook_events` table within seconds.

### 3. Update the VPS .env

```bash
ssh root@srv844822.hstgr.cloud
nano /root/sepnexus-web/.env
```

Change the three Razorpay lines:

```
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxx     # from step 2
```

Save (Ctrl+O, Enter, Ctrl+X).

### 4. Clear the test-mode plan IDs so plans re-sync against live

Test-mode `plan_xxx` IDs aren't valid in live mode. Wipe the columns; the
next admin save (or our auto-sync, or the manual Sync button) will recreate
them in live.

```bash
docker exec -i postgresql psql -U sepnexus -d sepnexus <<'EOF'
UPDATE pricing_plans
SET razorpay_plan_id_monthly = NULL,
    razorpay_plan_id_yearly  = NULL,
    updated_at = NOW();
EOF
```

### 5. Restart so the new keys load

```bash
cd /root/sepnexus-web
docker compose up -d
```

### 6. Re-sync every plan against live

Sign in at https://sepnexus.com/admin, go to `/admin/pricing`, hit **Sync to
Razorpay** on each visible plan. The button calls
`/api/admin/billing/sync-plan`, which now creates the plans in live mode and
saves the new `plan_xxxxx` IDs.

Confirm in the table: each plan should show "Synced" (not "Coming soon").

### 7. Subscribe yourself once to verify the live flow

Use a real card (or your own corporate card with a small plan).
- Visit `/pricing` → pick a plan → checkout → complete the Razorpay flow.
- Watch `docker logs -f sepnexus-web` for the webhook to land.
- `/dashboard/billing` should show the paid invoice within seconds.
- The receipt email should arrive with `SEP-2026-NNNN` and the PDF attached.
- Cancel from `/dashboard` immediately afterwards if it was a test.

---

## C. Resend production domain

Right now the From address is `noreply@sepnexus.com`. Resend won't send from
that address unless the **sepnexus.com domain is verified** in your Resend
account. To check:

- Resend Dashboard → Domains
- If `sepnexus.com` is listed with status "Verified" — done.
- If not: Add Domain → enter `sepnexus.com` → Resend gives you DNS records
  (TXT for SPF, CNAME for DKIM, TXT for DMARC). Add them all in GoDaddy DNS.
  Verification usually takes 5–30 min.

Without this, all transactional emails (receipts, invites, OTPs) will
silently fail to deliver, or land in spam.

Test by triggering any flow that sends an email — easiest: `/contact` form.
The admin notification should arrive.

---

## D. Period-close cron (overage billing)

This is the cron the user asked about — without it, n8n execution overage
never gets billed. From DEPLOY.md step 4:

```bash
ssh root@srv844822.hstgr.cloud

# Copy your CRON_SECRET from /root/sepnexus-web/.env first.
echo 'CRON_SECRET=PASTE_SECRET_HERE' > /etc/sepnexus.cron.env
chmod 600 /etc/sepnexus.cron.env

cat > /etc/cron.d/sepnexus-period-close <<'EOF'
0 * * * * root . /etc/sepnexus.cron.env && curl -s -X POST -H "Authorization: Bearer ${CRON_SECRET}" https://sepnexus.com/api/cron/period-close >> /var/log/sepnexus-cron.log 2>&1
EOF
```

Trigger once manually to confirm wiring:

```bash
. /etc/sepnexus.cron.env && curl -s -X POST -H "Authorization: Bearer $CRON_SECRET" https://sepnexus.com/api/cron/period-close
# Expect: {"ok":true,"closed":0,"charged":0,"errors":[]}
```

---

## E. n8n usage ingestion

If you've set up n8n's "Workflow finished" lifecycle webhook (or a tail node
in the shared workflow templates), make sure it points at:

```
POST https://sepnexus.com/api/usage/exec
Authorization: Bearer <USAGE_INGEST_SECRET from .env>
Content-Type: application/json
{"customerId": "<uuid>", "executionId": "...", "workflowId": "...", ...}
```

See `docs/n8n-integration.md` for the full shape. Until this fires, the
`usage_counters` table won't accumulate executions and overage will always
compute as 0.

---

## F. Operational hygiene (do these now, not later)

- [ ] **Off-host pg_dump backups** — see DEPLOY.md "Postgres backups" section.
      The VPS volume is your only copy until you set this up.
- [ ] **/api/health uptime monitor** — Better Stack or UptimeRobot, 60s
      interval, alert on 1 failed check.
- [ ] **Admin password rotation** — log in once with `Qwerty@123`, change it
      from `/admin/account`.
- [ ] **2FA on admin** — same page, scan QR, save the 8 recovery codes in
      1Password.

---

## Rollback

If a deploy goes sideways:

```bash
ssh root@srv844822.hstgr.cloud
cd /root/sepnexus-web
git log --oneline -10           # find the last good SHA
git checkout <good-sha>
docker compose up -d --build
```

Migrations are forward-only — Drizzle doesn't auto-rollback. If a new
migration broke prod, you need to write a manual down-migration in SQL and
apply it via `psql` before rolling the code back.

The previous container keeps serving traffic until the new one is healthy,
so a failed `docker compose up --build` leaves the old version running.

# Deploying sepnexus-web to your Hostinger VPS

This is the **Next.js + Postgres** deployment (Phase 1+). It mirrors the
`webhook-buffer` deployment pattern: same VPS, same `root_default` Docker
network, same Traefik for routing + Let's Encrypt SSL, same shared Postgres
container (`postgresql`). Adds **one new container** (`sepnexus-web`).

The site is now a Next.js app with:
- Public marketing pages (Home, Services, Portfolio, About, Pricing, Contact)
- Database-backed contact form (writes to `contacts` table, emails admin)
- Auth-protected admin panel (`/admin`) and customer dashboard (`/dashboard`)
- Resend-backed transactional email

> Older deploys served a static Vite bundle from nginx. That's gone — this
> Dockerfile builds a Next.js standalone server. Same deploy ritual otherwise.

---

## Step 1 — On the VPS: create the database for our app

The existing Postgres has a superuser `appuser`. We use it once to create a
new database and user just for this app. n8n's data and webhook-buffer's data
are not touched.

```bash
ssh root@srv844822.hstgr.cloud

NEW_PG_PASSWORD='paste-a-long-random-string-here'

docker exec -i postgresql psql -U appuser -d postgres <<EOF
CREATE DATABASE sepnexus;
CREATE USER sepnexus WITH PASSWORD '$NEW_PG_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE sepnexus TO sepnexus;
EOF

# Postgres 15+ requires explicit grants on the public schema:
docker exec -i postgresql psql -U appuser -d sepnexus <<EOF
GRANT ALL ON SCHEMA public TO sepnexus;
EOF
```

Save `$NEW_PG_PASSWORD`.

---

## Step 2 — On the VPS: pull and configure

If you've never deployed this app on this VPS:

```bash
cd /root
git clone https://github.com/Sepnexus/ownwebiste.git sepnexus-web
cd sepnexus-web
git checkout next-rebuild   # while we're on the rebuild branch
cp .env.example .env
nano .env
```

If you already have it from the static deploy:

```bash
cd /root/sepnexus-web
git fetch && git checkout next-rebuild && git pull
nano .env
```

Edit `.env` with the right values:

```bash
DATABASE_URL=postgresql://sepnexus:THE_PASSWORD_FROM_STEP_1@postgresql:5432/sepnexus
PUBLIC_HOST=sepnexus.srv844822.hstgr.cloud   # staging; switch to sepnexus.com later
PUBLIC_BASE_URL=https://sepnexus.srv844822.hstgr.cloud

AUTH_SECRET=$(openssl rand -base64 48)        # paste the actual string into the file
ADMIN_EMAIL=akshay@sepnexus.com
ADMIN_PASSWORD=Qwerty@123                     # change after first login

RESEND_API_KEY=re_change_me                   # add once Resend signup is done
EMAIL_FROM="Sepnexus <noreply@sepnexus.com>"
EMAIL_REPLY_TO=akshay@sepnexus.com

RAZORPAY_KEY_ID=rzp_test_Snd39z8iCBdtph
RAZORPAY_KEY_SECRET=IlSChkjhYevOtBz56BFGmWQj
RAZORPAY_WEBHOOK_SECRET=set-in-phase-4

RUN_MIGRATIONS_ON_BOOT=1
```

Save (Ctrl+O, Enter, Ctrl+X).

> The admin user is **seeded on first boot** if no users exist in the DB yet.
> After first login, change the password from the dashboard.

---

## Step 3 — Generate the migration files (one-time, on your laptop)

This runs once locally to produce the SQL migration files that the container
will apply on boot.

```bash
# On laptop:
cd /Users/akshaypalsingh/Desktop/sepnexus
npm install
npx drizzle-kit generate
git add drizzle/
git commit -m "add initial drizzle migrations"
git push origin next-rebuild
```

Then on the VPS:

```bash
cd /root/sepnexus-web
git pull
```

---

## Step 4 — Build and start the container

```bash
cd /root/sepnexus-web
docker compose up -d --build
```

First build takes 2–4 minutes (npm ci + Next build). After:

```bash
docker ps | grep sepnexus-web
docker logs -f sepnexus-web
```

You should see something like:

```
[migrate] running migrations from /app/drizzle
[migrate] done
[seed] admin user created: akshay@sepnexus.com
[seed] pricing plans seeded (5 plans)
- Local:   http://0.0.0.0:3000
```

Press Ctrl+C to stop tailing.

---

## Step 5 — Confirm Traefik picked it up + got SSL

Wait ~30 seconds for Let's Encrypt, then:

```bash
curl -I https://sepnexus.srv844822.hstgr.cloud/
```

Expect `HTTP/2 200`. Open in your browser. You should see the homepage with
intro overlay, hero, etc.

Test the auth flow:

1. Visit `/login`
2. Enter `akshay@sepnexus.com` / `Qwerty@123`
3. You should land on `/admin` with an empty inbox

Test the contact form:

1. Visit `/contact`
2. Fill in name + email + message + tick consent + submit
3. Open `/admin` — your submission should be listed
4. Click into it — read the full message
5. (Once Resend is configured) check your inbox for both notify-admin and
   confirm-submitter emails

---

## Step 6 — Point sepnexus.com at the VPS

VPS public IP from the login banner: `93.127.194.153`.

At GoDaddy → DNS → Manage DNS for `sepnexus.com`:

| Type  | Host  | Value             | TTL     |
|-------|-------|-------------------|---------|
| A     | `@`   | `93.127.194.153`  | 600     |
| A     | `www` | `93.127.194.153`  | 600     |

> Do NOT touch the existing `MX`, `TXT` (SPF), `CNAME` (autodiscover) records
> — those route email through Google Workspace. Only add the two A records
> above.

After DNS propagates (`dig sepnexus.com +short` returns the IP), edit `.env`
on the VPS:

```bash
nano /root/sepnexus-web/.env
# change PUBLIC_HOST=sepnexus.com
# change PUBLIC_BASE_URL=https://sepnexus.com
docker compose up -d
```

Wait ~30 seconds for the cert, then:

```bash
curl -I https://sepnexus.com/
curl -I https://www.sepnexus.com/   # should be 301 → https://sepnexus.com/
```

---

## Razorpay configuration (Phase 3)

The schema, API and admin UI for subscriptions are in place. Before customers
can actually pay, do these one-time steps inside Razorpay's dashboard.

### 1. Enable international + USD subscriptions

Account → Profile → International Payments must be enabled (already is on
Akshay's account). Confirm USD is in the supported currencies list.

### 2. Configure the webhook

Razorpay Dashboard → Settings → Webhooks → **+ Add new webhook**:

- **URL:** `https://sepnexus.com/api/billing/webhook` (or
  `https://sepnexus.srv844822.hstgr.cloud/api/billing/webhook` while staging)
- **Active events** (tick all of these):
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
- **Secret:** Razorpay generates one — copy it. Paste into `.env` as
  `RAZORPAY_WEBHOOK_SECRET`, then `docker compose up -d` to reload.

> Verification: Razorpay sends a test ping. The corresponding row should
> appear in the `webhook_events` table within seconds.

### 3. Sync your pricing plans to Razorpay

After deploying, sign in as admin → /admin/pricing → click **"Sync to
Razorpay"** on each plan you want customers to be able to subscribe to. The
button calls `/api/admin/billing/sync-plan`, which creates the matching plan
in Razorpay (monthly + yearly) and stores the IDs back on the row.

The "Synced" / "Partial" / "Not synced" pill on each row tells you the state.
Plans that aren't fully synced will show "Coming soon" on the customer
dashboard instead of a Subscribe button.

### 4. Going from test to live

When you're ready to take real money:

- Razorpay Dashboard → flip **Test Mode → Live Mode**.
- Generate live API keys: Settings → API Keys → Generate.
- Update `.env` on the VPS:
  ```
  RAZORPAY_KEY_ID=rzp_live_xxx
  RAZORPAY_KEY_SECRET=xxx
  RAZORPAY_WEBHOOK_SECRET=<from the LIVE webhook you reconfigure>
  ```
- Truncate `pricing_plans` (or just clear the `razorpay_plan_id_*` columns)
  so admin re-syncs against live mode. Test-mode plans aren't valid in live.

---

## Updating later

```bash
ssh root@srv844822.hstgr.cloud
cd /root/sepnexus-web
git pull
docker compose up -d --build
```

Migrations run automatically on container boot.

---

## Local dev (optional)

```bash
# 1. Run a Postgres locally on 5433 (so it doesn't clash with anything)
docker run -d --name sepnexus-pg-dev \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=sepnexus \
  -p 5433:5432 \
  postgres:16

# 2. Apply schema (uses .env.local)
echo 'DATABASE_URL=postgresql://postgres:postgres@localhost:5433/sepnexus' > .env.local
echo 'AUTH_SECRET=dev-secret-at-least-32-characters-please' >> .env.local
echo 'ADMIN_EMAIL=akshay@sepnexus.com' >> .env.local
echo 'ADMIN_PASSWORD=dev-password' >> .env.local
echo 'PUBLIC_BASE_URL=http://localhost:3000' >> .env.local
echo 'RUN_MIGRATIONS_ON_BOOT=1' >> .env.local

npm run db:push

# 3. Run dev server
npm run dev
```

Open `http://localhost:3000` and `http://localhost:3000/login`.

---

## Troubleshooting

**`docker compose up` fails with `network root_default not found`**
Run `docker network ls` and confirm the network. Edit `docker-compose.yml`.

**Traefik returns 404**
Container needs to be on `root_default`:
```bash
docker inspect sepnexus-web --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}'
```
Should print `root_default`.

**SSL cert never appears**
DNS first. `dig sepnexus.com +short` must return the VPS IP.

**Migration fails on first boot — "permission denied for schema public"**
Re-run the `GRANT ALL ON SCHEMA public TO sepnexus` from Step 1.

**Contact form returns 500**
Check `docker logs sepnexus-web` — usually means DB env var is wrong or the
schema hasn't been migrated. Restart with `docker compose up -d` after fix.

**Admin login bounces back to `/login`**
The cookie is being set but rejected. Make sure `PUBLIC_BASE_URL` matches the
actual URL you're hitting (https://sepnexus.com vs https://sepnexus.srv844822.hstgr.cloud).

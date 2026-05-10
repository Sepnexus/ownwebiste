# Wiring an n8n instance to Sepnexus usage tracking

Every Sepnexus-operated n8n instance — shared or dedicated — reports each
workflow execution to `https://sepnexus.com/api/usage/exec`. The API ingests
events idempotently, increments the customer's monthly execution counter,
sends 80% / 100% threshold emails, and bills overage at period close.

This guide is for the **operator** (you) configuring an n8n instance, not for
end customers.

## What we send

One POST per execution with a Bearer token and minimal JSON:

```http
POST https://sepnexus.com/api/usage/exec
Authorization: Bearer <USAGE_INGEST_SECRET>
Content-Type: application/json

{
  "customerId":   "uuid of the Sepnexus user whose workflow ran",
  "source":       "shared-n8n" | "dedicated-n8n",
  "externalId":   "<n8n execution id>",
  "workflowId":   "<n8n workflow id>",
  "workflowName": "<n8n workflow name>",
  "status":       "success" | "error" | "canceled",
  "durationMs":   1234,
  "occurredAt":   "2026-05-10T15:00:00Z"
}
```

Response: `{"ok":true,"duplicate":false}` (or `duplicate:true` if you replay).

## Two viable wiring patterns

### Pattern A — shared instance, central reporter workflow

For the shared n8n that hosts multiple Starter / Pro customers.

1. Tag every customer's workflows with a tag whose name is `customer:<uuid>`.
   Set this when provisioning the customer's n8n account, not after.
2. Build one **internal** workflow on the shared instance called
   `Sepnexus Usage Reporter`. Trigger: **n8n's "Workflow finished" event**
   (n8n → Settings → API → Webhooks → Workflow execution finished).
   Or, if you can't enable that, an Execute Workflow Trigger called from a
   tail node added to a workflow template.
3. The reporter:
   - Reads the finished execution's payload (workflow id, execution id, status).
   - Fetches the workflow's tags to find the `customer:<uuid>`.
   - POSTs to `/api/usage/exec` with the structured body above.

If the reporter ever falls behind, replays are safe — the API is idempotent
on `(customerId, externalId)`.

### Pattern B — dedicated instance, one customer

For Dedicated-tier customers on their own VPS.

Easier — the whole instance belongs to one customer, so `customerId` is
constant. Add a final "Sepnexus Usage" HTTP node to each workflow template,
or run a small daily reporter that polls n8n's `/executions` API and forwards
new entries.

## What you need configured on the Sepnexus side

In `.env` on the VPS:

```
USAGE_INGEST_SECRET=<at-least-32-char random string>
```

This is the same secret n8n's reporter uses as its Bearer token. Generate
with `openssl rand -base64 32`. Store it in n8n as a credential (HTTP Header
Auth — `Authorization: Bearer <value>`) — never paste it into a workflow
node directly.

Rotate every ~6 months: generate a new secret, update both n8n and `.env`,
then `docker compose up -d`.

## Period close (overage billing)

We don't bill overage in real time. A cron on the VPS hits
`POST /api/cron/period-close` every hour, which:

1. Finds usage_counters whose `period_end` has passed and `closed_at` is null.
2. Computes `overage_units = max(0, used - included)`.
3. Computes `overage_cents = ceil(units / 1000) * overageUsdPer1k * 100`.
4. POSTs a Razorpay subscription **addon** for that amount → it lands on the
   subscription's next invoice.
5. Marks the counter `closed_at`.

Failure handling: each counter close is independent. If the Razorpay call
fails, the counter stays `open` and the next cron run retries. The `errors`
array in the cron response surfaces the IDs that need attention.

### Cron setup on the VPS

In `.env`:

```
CRON_SECRET=<at-least-32-char random string>
```

Then add an hourly cron entry on the VPS:

```cron
# /etc/cron.d/sepnexus-period-close
0 * * * * root curl -s -X POST -H "Authorization: Bearer ${CRON_SECRET}" https://sepnexus.com/api/cron/period-close >> /var/log/sepnexus-cron.log 2>&1
```

(Substitute `${CRON_SECRET}` with the actual value, since cron doesn't
expand env vars by default. Or set the value in the cron file's first line:
`CRON_SECRET=…`.)

## Manual reconciliation

If something goes sideways:

- The raw event log lives in `usage_events`. Every n8n execution we received
  is there — query by `user_id` or `workflow_id` to investigate.
- The rolled-up counters live in `usage_counters`. Edit one row to fix a
  miscount, set `closed_at = NULL` to make the cron re-process it, etc.
- Every Razorpay addon we created is recorded as `razorpay_addon_id` on the
  closed counter row.

## Testing locally

1. `npm run dev`
2. Generate a customer + active subscription in the DB.
3. Hit the endpoint with curl:

```bash
curl -X POST http://localhost:3001/api/usage/exec \
  -H "Authorization: Bearer dev-usage-ingest-secret-min-16-chars-please" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "<uuid>",
    "source": "shared-n8n",
    "externalId": "exec-001",
    "workflowId": "wf-1",
    "workflowName": "Daily report",
    "status": "success",
    "durationMs": 420,
    "occurredAt": "2026-05-10T15:00:00Z"
  }'
```

Watch `/admin/usage` and the customer's `/dashboard` for the live counter to
update.

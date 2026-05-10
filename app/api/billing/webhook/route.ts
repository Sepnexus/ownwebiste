import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { verifyWebhookSignature, type RzpSubscription } from "@/lib/razorpay";
import { applySubscriptionEvent, recordInvoiceFromCharge } from "@/lib/billing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Razorpay webhook. We verify the HMAC signature, dedupe by event id,
 * then dispatch by event type. Always return 200 once we've stored the
 * event row — even if processing fails — so Razorpay doesn't retry storms;
 * the row is left with `error` set and can be replayed later.
 */
export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || secret === "set-in-phase-4" || secret === "change_me") {
    return Response.json({ error: "Webhook secret not configured" }, { status: 503 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");
  const ok = verifyWebhookSignature({ body: rawBody, signature, secret });
  if (!ok) {
    return Response.json({ error: "Bad signature" }, { status: 401 });
  }

  let parsed: WebhookPayload;
  try {
    parsed = JSON.parse(rawBody) as WebhookPayload;
  } catch {
    return Response.json({ error: "Bad JSON" }, { status: 400 });
  }

  const eventId = req.headers.get("x-razorpay-event-id") ?? null;
  const eventType = parsed?.event ?? "unknown";

  // Idempotent insert: if we've seen this event id, no-op.
  if (eventId) {
    const [seen] = await db
      .select({ id: schema.webhookEvents.id, processedAt: schema.webhookEvents.processedAt })
      .from(schema.webhookEvents)
      .where(eq(schema.webhookEvents.razorpayEventId, eventId))
      .limit(1);
    if (seen?.processedAt) {
      return Response.json({ ok: true, dedup: true });
    }
  }

  const [row] = await db
    .insert(schema.webhookEvents)
    .values({
      source: "razorpay",
      eventType,
      razorpayEventId: eventId,
      payload: parsed,
      signature,
    })
    .returning({ id: schema.webhookEvents.id });

  try {
    await dispatch(parsed);
    await db
      .update(schema.webhookEvents)
      .set({ processedAt: new Date() })
      .where(eq(schema.webhookEvents.id, row.id));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[webhook] failed to process ${eventType}:`, msg);
    await db
      .update(schema.webhookEvents)
      .set({ error: msg, processedAt: new Date() })
      .where(eq(schema.webhookEvents.id, row.id));
    // Return 200 so Razorpay marks delivered. The row carries the error for replay.
  }

  return Response.json({ ok: true });
}

/* ============== Dispatch ============== */

type WebhookPayload = {
  event: string;
  payload: {
    subscription?: { entity: RzpSubscription };
    payment?: {
      entity: {
        id: string;
        amount: number;
        currency: string;
        status: string;
        captured: boolean;
        created_at: number;
        invoice_id?: string | null;
        order_id?: string | null;
        method?: string;
      };
    };
    invoice?: {
      entity: {
        id: string;
        order_id?: string;
        subscription_id?: string;
        amount: number;
        amount_paid: number;
        amount_due: number;
        currency: string;
        status: string;
        paid_at?: number | null;
        period_start?: number | null;
        period_end?: number | null;
      };
    };
  };
};

async function dispatch(p: WebhookPayload) {
  const sub = p.payload?.subscription?.entity;
  const inv = p.payload?.invoice?.entity;
  const pay = p.payload?.payment?.entity;

  switch (p.event) {
    case "subscription.activated":
    case "subscription.charged":
    case "subscription.completed":
    case "subscription.cancelled":
    case "subscription.halted":
    case "subscription.paused":
    case "subscription.resumed":
    case "subscription.pending":
    case "subscription.authenticated":
    case "subscription.expired":
    case "subscription.updated":
      if (sub) {
        await applySubscriptionEvent({ event: p.event, rzpSub: sub });
      }
      // For charged events, also create/update invoice if present.
      if (p.event === "subscription.charged" && inv) {
        await recordInvoiceFromCharge({
          rzpSubscriptionId: inv.subscription_id ?? sub?.id ?? "",
          rzpInvoiceId: inv.id,
          rzpPaymentId: pay?.id,
          amountCents: inv.amount_paid || inv.amount,
          currency: inv.currency,
          paid: inv.status === "paid",
          paidAt: inv.paid_at ? new Date(inv.paid_at * 1000) : null,
          periodStart: inv.period_start ? new Date(inv.period_start * 1000) : null,
          periodEnd: inv.period_end ? new Date(inv.period_end * 1000) : null,
        });
      }
      break;

    case "invoice.paid":
      if (inv) {
        await recordInvoiceFromCharge({
          rzpSubscriptionId: inv.subscription_id ?? "",
          rzpInvoiceId: inv.id,
          rzpPaymentId: pay?.id,
          amountCents: inv.amount_paid || inv.amount,
          currency: inv.currency,
          paid: true,
          paidAt: inv.paid_at ? new Date(inv.paid_at * 1000) : new Date(),
          periodStart: inv.period_start ? new Date(inv.period_start * 1000) : null,
          periodEnd: inv.period_end ? new Date(inv.period_end * 1000) : null,
        });
      }
      break;

    case "payment.failed":
      // Logged via webhook_events row; no DB-state change needed unless we
      // want to flip the subscription to a "payment_failed" mirror state.
      break;

    default:
      // Other events (refunds, disputes, etc.) — recorded but not handled.
      break;
  }
}

import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { verifyWebhookSignature, type RzpSubscription } from "@/lib/razorpay";
import { applySubscriptionEvent, recordInvoiceFromCharge } from "@/lib/billing";
import {
  notifyAdminSubscriptionStarted,
  notifyAdminSubscriptionCancelled,
  notifyAdminPaymentReceived,
  notifyAdminPaymentFailed,
  sendWelcomePostPaymentEmail,
} from "@/lib/email-templates";
import { issueAuthToken } from "@/lib/auth";

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
        if (sub) {
          void notifyPayment(sub.id, inv.amount_paid || inv.amount, inv.currency, inv.id);
        }
      }
      if (p.event === "subscription.activated" && sub) {
        void notifySubscriptionStarted(sub.id);
        // Self-serve signups have no password yet — issue an invite-style
        // magic link and welcome them. Idempotent by design: if the user
        // already has a password, the welcome email is skipped.
        void maybeWelcomeSelfServeUser(sub.id).catch((e) =>
          console.error("[webhook] welcome email failed:", e),
        );
      }
      if (p.event === "subscription.cancelled" && sub) {
        void notifySubscriptionCancelled(sub.id);
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
        if (inv.subscription_id) {
          void notifyPayment(inv.subscription_id, inv.amount_paid || inv.amount, inv.currency, inv.id);
        }
      }
      break;

    case "payment.failed":
      if (pay && pay.invoice_id) {
        const [row] = await db
          .select({
            user: schema.users,
            plan: schema.pricingPlans,
          })
          .from(schema.invoices)
          .leftJoin(
            schema.subscriptions,
            eq(schema.subscriptions.id, schema.invoices.subscriptionId),
          )
          .leftJoin(schema.users, eq(schema.users.id, schema.subscriptions.userId))
          .leftJoin(
            schema.pricingPlans,
            eq(schema.pricingPlans.id, schema.subscriptions.planId),
          )
          .where(eq(schema.invoices.razorpayInvoiceId, pay.invoice_id))
          .limit(1);
        if (row?.user && row?.plan) {
          void notifyAdminPaymentFailed({
            customerEmail: row.user.email,
            customerName: row.user.name,
            planName: row.plan.name,
            amountCents: pay.amount,
            currency: pay.currency,
          }).catch((e) => console.error("[webhook] failed-notify failed:", e));
        }
      }
      break;

    default:
      break;
  }
}

async function maybeWelcomeSelfServeUser(rzpSubId: string) {
  const [row] = await db
    .select({ sub: schema.subscriptions, user: schema.users, plan: schema.pricingPlans })
    .from(schema.subscriptions)
    .leftJoin(schema.users, eq(schema.users.id, schema.subscriptions.userId))
    .leftJoin(schema.pricingPlans, eq(schema.pricingPlans.id, schema.subscriptions.planId))
    .where(eq(schema.subscriptions.razorpaySubscriptionId, rzpSubId))
    .limit(1);
  if (!row?.user || !row?.plan) return;
  // Only welcome users who haven't set a password yet (self-serve signups).
  if (row.user.passwordHash) return;
  if (row.user.inviteAcceptedAt) return;

  const { plain } = await issueAuthToken({ userId: row.user.id, kind: "invite" });
  const base = process.env.PUBLIC_BASE_URL ?? "http://localhost:3000";
  const acceptUrl = `${base}/invite/${plain}`;

  // Mark invitedAt so it shows up in admin as a known invite, even though
  // they came in through self-serve.
  await db
    .update(schema.users)
    .set({ invitedAt: new Date(), updatedAt: new Date() })
    .where(eq(schema.users.id, row.user.id));

  await sendWelcomePostPaymentEmail({
    to: row.user.email,
    name: row.user.name,
    acceptUrl,
    planName: row.plan.name,
    amountUsd:
      row.sub.period === "yearly" ? row.plan.priceYearlyUsd : row.plan.priceMonthlyUsd,
    period: row.sub.period,
  });
}

async function notifySubscriptionStarted(rzpSubId: string) {
  const [row] = await db
    .select({ sub: schema.subscriptions, user: schema.users, plan: schema.pricingPlans })
    .from(schema.subscriptions)
    .leftJoin(schema.users, eq(schema.users.id, schema.subscriptions.userId))
    .leftJoin(schema.pricingPlans, eq(schema.pricingPlans.id, schema.subscriptions.planId))
    .where(eq(schema.subscriptions.razorpaySubscriptionId, rzpSubId))
    .limit(1);
  if (!row?.user || !row?.plan) return;
  await notifyAdminSubscriptionStarted({
    customerEmail: row.user.email,
    customerName: row.user.name,
    planName: row.plan.name,
    period: row.sub.period,
    amountUsd:
      row.sub.period === "yearly" ? row.plan.priceYearlyUsd : row.plan.priceMonthlyUsd,
  }).catch((e) => console.error("[webhook] sub-started notify:", e));
}

async function notifySubscriptionCancelled(rzpSubId: string) {
  const [row] = await db
    .select({ user: schema.users, plan: schema.pricingPlans })
    .from(schema.subscriptions)
    .leftJoin(schema.users, eq(schema.users.id, schema.subscriptions.userId))
    .leftJoin(schema.pricingPlans, eq(schema.pricingPlans.id, schema.subscriptions.planId))
    .where(eq(schema.subscriptions.razorpaySubscriptionId, rzpSubId))
    .limit(1);
  if (!row?.user || !row?.plan) return;
  await notifyAdminSubscriptionCancelled({
    customerEmail: row.user.email,
    customerName: row.user.name,
    planName: row.plan.name,
  }).catch((e) => console.error("[webhook] sub-cancel notify:", e));
}

async function notifyPayment(
  rzpSubId: string,
  amountCents: number,
  currency: string,
  invoiceId: string | null,
) {
  const [row] = await db
    .select({ user: schema.users, plan: schema.pricingPlans })
    .from(schema.subscriptions)
    .leftJoin(schema.users, eq(schema.users.id, schema.subscriptions.userId))
    .leftJoin(schema.pricingPlans, eq(schema.pricingPlans.id, schema.subscriptions.planId))
    .where(eq(schema.subscriptions.razorpaySubscriptionId, rzpSubId))
    .limit(1);
  if (!row?.user || !row?.plan) return;
  await notifyAdminPaymentReceived({
    customerEmail: row.user.email,
    customerName: row.user.name,
    planName: row.plan.name,
    amountCents,
    currency,
    invoiceId,
  }).catch((e) => console.error("[webhook] payment notify:", e));
}

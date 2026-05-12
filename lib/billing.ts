import { db, schema } from "./db";
import { and, eq, isNull, ne, desc } from "drizzle-orm";
import {
  createPlan as rzpCreatePlan,
  createSubscription as rzpCreateSubscription,
  cancelSubscription as rzpCancelSubscription,
  updateSubscription as rzpUpdateSubscription,
  cancelScheduledChange as rzpCancelScheduledChange,
  fetchSubscription as rzpFetchSubscription,
  listInvoicesForSubscription as rzpListInvoices,
  type RzpPlanPeriod,
  type RzpSubscription,
} from "./razorpay";
import type { PricingPlan, Subscription } from "./db/schema";
import { allocateInvoiceNumber } from "./invoice-number";
import { buildBusinessSnapshot, buildBillingSnapshot } from "./business";

/** Statuses that mean "this customer is currently a paying customer". */
const ACTIVE_STATUSES = ["authenticated", "active", "pending"] as const;
/** Statuses where the subscription is over (or never started). */
const TERMINAL_STATUSES = [
  "cancelled",
  "completed",
  "expired",
  "halted",
] as const;

export type Period = "monthly" | "yearly";

/* ============== Plan sync (admin-side) ============== */

/**
 * Create the corresponding Razorpay plan for a pricing_plans row, for the
 * given period. If we already have a Razorpay plan ID stored, return it.
 */
export async function ensureRazorpayPlanId(
  plan: PricingPlan,
  period: Period,
): Promise<string> {
  const existing =
    period === "monthly" ? plan.razorpayPlanIdMonthly : plan.razorpayPlanIdYearly;
  if (existing && existing.length > 0) return existing;

  const usd = period === "monthly" ? plan.priceMonthlyUsd : plan.priceYearlyUsd;
  if (usd <= 0) throw new Error(`Plan ${plan.slug} has no ${period} price set.`);

  const rzpPeriod: RzpPlanPeriod = period === "monthly" ? "monthly" : "yearly";
  const created = await rzpCreatePlan({
    period: rzpPeriod,
    interval: 1,
    name: `${plan.name} (${period})`,
    amountCents: usd * 100,
    currency: "USD",
    description: plan.tagline ?? plan.name,
    notes: { sepnexus_plan_slug: plan.slug, sepnexus_period: period },
  });

  await db
    .update(schema.pricingPlans)
    .set({
      ...(period === "monthly"
        ? { razorpayPlanIdMonthly: created.id }
        : { razorpayPlanIdYearly: created.id }),
      updatedAt: new Date(),
    })
    .where(eq(schema.pricingPlans.id, plan.id));

  return created.id;
}

/* ============== Subscribe (customer-side) ============== */

export async function getActiveSubscriptionForUser(userId: string) {
  const [row] = await db
    .select()
    .from(schema.subscriptions)
    .where(
      and(
        eq(schema.subscriptions.userId, userId),
        ne(schema.subscriptions.status, "cancelled"),
        ne(schema.subscriptions.status, "expired"),
        ne(schema.subscriptions.status, "completed"),
        ne(schema.subscriptions.status, "halted"),
      ),
    )
    .orderBy(desc(schema.subscriptions.createdAt))
    .limit(1);
  return row ?? null;
}

export async function getLatestSubscriptionForUser(userId: string) {
  const [row] = await db
    .select()
    .from(schema.subscriptions)
    .where(eq(schema.subscriptions.userId, userId))
    .orderBy(desc(schema.subscriptions.createdAt))
    .limit(1);
  return row ?? null;
}

/**
 * Start a new Razorpay subscription for `user` against `plan` × `period`.
 * Returns the Razorpay subscription_id + checkout-friendly fields. The
 * customer then opens Razorpay Checkout to authorize the first payment.
 */
export async function startSubscription(args: {
  userId: string;
  userEmail: string;
  userName: string | null;
  plan: PricingPlan;
  period: Period;
}): Promise<{
  subscriptionId: string;
  razorpaySubscriptionId: string;
  shortUrl: string | null;
  status: string;
}> {
  // Block if they're already on an active sub.
  const existing = await getActiveSubscriptionForUser(args.userId);
  if (existing && (ACTIVE_STATUSES as readonly string[]).includes(existing.status)) {
    throw new Error(
      "You already have an active subscription. Cancel it first to switch plans.",
    );
  }

  const rzpPlanId = await ensureRazorpayPlanId(args.plan, args.period);

  // total_count: practical upper bound. 120 for monthly = 10 years; 50 for yearly.
  const totalCount = args.period === "monthly" ? 120 : 50;

  const rzpSub = await rzpCreateSubscription({
    planId: rzpPlanId,
    totalCount,
    customerNotify: true,
    notes: {
      sepnexus_user_id: args.userId,
      sepnexus_email: args.userEmail,
      sepnexus_plan_slug: args.plan.slug,
      sepnexus_period: args.period,
    },
  });

  const [inserted] = await db
    .insert(schema.subscriptions)
    .values({
      userId: args.userId,
      planId: args.plan.id,
      period: args.period,
      razorpaySubscriptionId: rzpSub.id,
      razorpayPlanId: rzpPlanId,
      status: rzpSub.status,
      shortUrl: rzpSub.short_url,
    })
    .returning();

  return {
    subscriptionId: inserted.id,
    razorpaySubscriptionId: rzpSub.id,
    shortUrl: rzpSub.short_url,
    status: rzpSub.status,
  };
}

/* ============== Cancel ============== */

export async function cancelUserSubscription(args: {
  userId: string;
  subscriptionId: string;
  atPeriodEnd: boolean;
}): Promise<Subscription> {
  const [sub] = await db
    .select()
    .from(schema.subscriptions)
    .where(
      and(
        eq(schema.subscriptions.id, args.subscriptionId),
        eq(schema.subscriptions.userId, args.userId),
      ),
    )
    .limit(1);
  if (!sub) throw new Error("Subscription not found.");
  if (!sub.razorpaySubscriptionId) {
    // It was created locally but never reached Razorpay — just mark cancelled.
    const [updated] = await db
      .update(schema.subscriptions)
      .set({
        status: "cancelled",
        cancelledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.subscriptions.id, sub.id))
      .returning();
    return updated;
  }

  const rzp = await rzpCancelSubscription(sub.razorpaySubscriptionId, {
    atCycleEnd: args.atPeriodEnd,
  });

  const [updated] = await db
    .update(schema.subscriptions)
    .set({
      status: rzp.status,
      cancelAtPeriodEnd: args.atPeriodEnd,
      cancelledAt: args.atPeriodEnd ? null : new Date(),
      updatedAt: new Date(),
    })
    .where(eq(schema.subscriptions.id, sub.id))
    .returning();
  return updated;
}

/* ============== Resume + plan change ============== */

/**
 * Undo a scheduled cancellation. The customer set cancel_at_period_end=true
 * earlier; they want to keep the subscription. We tell Razorpay to drop the
 * scheduled change and clear our local flag.
 */
export async function resumeUserSubscription(args: {
  userId: string;
  subscriptionId: string;
}): Promise<Subscription> {
  const [sub] = await db
    .select()
    .from(schema.subscriptions)
    .where(
      and(
        eq(schema.subscriptions.id, args.subscriptionId),
        eq(schema.subscriptions.userId, args.userId),
      ),
    )
    .limit(1);
  if (!sub) throw new Error("Subscription not found.");
  if (!sub.cancelAtPeriodEnd) throw new Error("This subscription isn't scheduled to cancel.");
  if (!sub.razorpaySubscriptionId) {
    const [updated] = await db
      .update(schema.subscriptions)
      .set({ cancelAtPeriodEnd: false, updatedAt: new Date() })
      .where(eq(schema.subscriptions.id, sub.id))
      .returning();
    return updated;
  }

  const rzp = await rzpCancelScheduledChange(sub.razorpaySubscriptionId);
  const [updated] = await db
    .update(schema.subscriptions)
    .set({
      cancelAtPeriodEnd: false,
      cancelledAt: null,
      status: rzp.status,
      updatedAt: new Date(),
    })
    .where(eq(schema.subscriptions.id, sub.id))
    .returning();
  return updated;
}

/**
 * Schedule a switch to a different plan (or different period of the same plan)
 * at the next billing cycle. We only support `cycle_end` for now — `now` would
 * trigger immediate proration which Razorpay handles but adds UX complexity.
 */
export async function changeUserPlan(args: {
  userId: string;
  subscriptionId: string;
  newPlanId: string;
  newPeriod: Period;
}): Promise<Subscription> {
  const [sub] = await db
    .select()
    .from(schema.subscriptions)
    .where(
      and(
        eq(schema.subscriptions.id, args.subscriptionId),
        eq(schema.subscriptions.userId, args.userId),
      ),
    )
    .limit(1);
  if (!sub) throw new Error("Subscription not found.");

  const [newPlan] = await db
    .select()
    .from(schema.pricingPlans)
    .where(eq(schema.pricingPlans.id, args.newPlanId))
    .limit(1);
  if (!newPlan) throw new Error("Target plan not found.");
  if (!newPlan.visible) throw new Error("Target plan is not currently available.");

  const newRzpPlanId = await ensureRazorpayPlanId(newPlan, args.newPeriod);

  if (!sub.razorpaySubscriptionId) {
    // No live Razorpay sub — just update the local pointer.
    const [updated] = await db
      .update(schema.subscriptions)
      .set({
        planId: newPlan.id,
        period: args.newPeriod,
        razorpayPlanId: newRzpPlanId,
        updatedAt: new Date(),
      })
      .where(eq(schema.subscriptions.id, sub.id))
      .returning();
    return updated;
  }

  await rzpUpdateSubscription(sub.razorpaySubscriptionId, {
    planId: newRzpPlanId,
    scheduleChangeAt: "cycle_end",
    customerNotify: true,
  });

  // Don't flip planId locally yet — we wait for subscription.updated webhook to
  // confirm the change actually took effect at cycle end. We do persist a hint.
  const meta = (sub.metadata as Record<string, unknown> | null) ?? {};
  const [updated] = await db
    .update(schema.subscriptions)
    .set({
      metadata: {
        ...meta,
        scheduledPlanChange: {
          newPlanId: newPlan.id,
          newPeriod: args.newPeriod,
          newRzpPlanId,
          scheduledAt: new Date().toISOString(),
        },
      },
      updatedAt: new Date(),
    })
    .where(eq(schema.subscriptions.id, sub.id))
    .returning();
  return updated;
}

/* ============== Sync from Razorpay (webhook-free fallback) ============== */

/**
 * Pull the current state from Razorpay for one subscription and reconcile our
 * DB. Used when webhooks aren't reaching us (e.g. local dev without ngrok)
 * or when the customer hits refresh. Idempotent — safe to call repeatedly.
 *
 * Also pulls related invoices and the welcome-email path for fresh self-serve
 * customers (mirrors what the webhook would have done).
 */
export async function syncSubscriptionFromRazorpay(args: {
  subscriptionId: string;
}): Promise<{ status: string; invoicesSynced: number; changed: boolean }> {
  const [sub] = await db
    .select()
    .from(schema.subscriptions)
    .where(eq(schema.subscriptions.id, args.subscriptionId))
    .limit(1);
  if (!sub) throw new Error("Subscription not found.");
  if (!sub.razorpaySubscriptionId) {
    return { status: sub.status, invoicesSynced: 0, changed: false };
  }

  const rzpSub = await rzpFetchSubscription(sub.razorpaySubscriptionId);
  const previousStatus = sub.status;

  await applySubscriptionEvent({ event: "sync", rzpSub });

  // Pull invoices for this subscription too — even if /charged didn't fire.
  let invoicesSynced = 0;
  try {
    const items = await rzpListInvoices(sub.razorpaySubscriptionId);
    for (const inv of items) {
      await recordInvoiceFromCharge({
        rzpSubscriptionId: sub.razorpaySubscriptionId,
        rzpInvoiceId: inv.id,
        rzpPaymentId: inv.payment_id ?? undefined,
        rzpShortUrl: inv.short_url ?? null,
        amountCents: inv.amount_paid || inv.amount,
        currency: inv.currency,
        paid: inv.status === "paid",
        paidAt: inv.paid_at ? new Date(inv.paid_at * 1000) : null,
        periodStart: inv.billing_start ? new Date(inv.billing_start * 1000) : null,
        periodEnd: inv.billing_end ? new Date(inv.billing_end * 1000) : null,
        // Don't spam old receipts during a sync — only the live webhook path
        // should trigger receipt emails for fresh invoices.
        skipReceiptEmail: true,
      });
      invoicesSynced += 1;
    }
  } catch (e) {
    console.error("[sync] fetching invoices failed:", e);
  }

  // If the subscription just became active and the user has no password yet
  // (self-serve flow), trigger the welcome email + invite token.
  const justActivated =
    rzpSub.status === "active" || rzpSub.status === "authenticated";
  if (justActivated && previousStatus !== rzpSub.status) {
    try {
      const { issueAuthToken } = await import("./auth");
      const { sendWelcomePostPaymentEmail } = await import("./email-templates");
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, sub.userId))
        .limit(1);
      const [plan] = await db
        .select()
        .from(schema.pricingPlans)
        .where(eq(schema.pricingPlans.id, sub.planId))
        .limit(1);
      if (user && plan && !user.passwordHash && !user.inviteAcceptedAt) {
        const { plain } = await issueAuthToken({ userId: user.id, kind: "invite" });
        const base = process.env.PUBLIC_BASE_URL ?? "http://localhost:3000";
        const acceptUrl = `${base}/invite/${plain}`;
        await db
          .update(schema.users)
          .set({ invitedAt: new Date(), updatedAt: new Date() })
          .where(eq(schema.users.id, user.id));
        await sendWelcomePostPaymentEmail({
          to: user.email,
          name: user.name,
          acceptUrl,
          planName: plan.name,
          amountUsd:
            sub.period === "yearly" ? plan.priceYearlyUsd : plan.priceMonthlyUsd,
          period: sub.period,
          currency: plan.currency,
        });
      }
    } catch (e) {
      console.error("[sync] welcome email path failed:", e);
    }
  }

  return {
    status: rzpSub.status,
    invoicesSynced,
    changed: previousStatus !== rzpSub.status,
  };
}

/* ============== Webhook event application ============== */

/**
 * Apply a Razorpay subscription event to our DB. Idempotent: re-applying the
 * same event sets identical fields.
 */
export async function applySubscriptionEvent(args: {
  event: string; // e.g. 'subscription.activated'
  rzpSub: RzpSubscription;
}): Promise<void> {
  const [row] = await db
    .select()
    .from(schema.subscriptions)
    .where(eq(schema.subscriptions.razorpaySubscriptionId, args.rzpSub.id))
    .limit(1);
  if (!row) {
    console.warn(
      `[billing] subscription event for unknown rzp_id=${args.rzpSub.id} (event=${args.event}); ignoring`,
    );
    return;
  }

  const update: Partial<typeof schema.subscriptions.$inferInsert> = {
    status: args.rzpSub.status,
    updatedAt: new Date(),
  };
  if (args.rzpSub.current_start) {
    update.currentPeriodStart = new Date(args.rzpSub.current_start * 1000);
  }
  if (args.rzpSub.current_end) {
    update.currentPeriodEnd = new Date(args.rzpSub.current_end * 1000);
  }
  if (args.event === "subscription.cancelled") {
    update.cancelledAt = args.rzpSub.ended_at
      ? new Date(args.rzpSub.ended_at * 1000)
      : new Date();
  }

  await db
    .update(schema.subscriptions)
    .set(update)
    .where(eq(schema.subscriptions.id, row.id));
}

export async function recordInvoiceFromCharge(args: {
  rzpSubscriptionId: string;
  rzpInvoiceId?: string;
  rzpPaymentId?: string;
  rzpShortUrl?: string | null;
  amountCents: number;
  currency: string;
  paid: boolean;
  paidAt?: Date | null;
  periodStart?: Date | null;
  periodEnd?: Date | null;
  /** Set true to suppress the customer receipt email (e.g. for replays/sync). */
  skipReceiptEmail?: boolean;
}): Promise<void> {
  const [sub] = await db
    .select()
    .from(schema.subscriptions)
    .where(eq(schema.subscriptions.razorpaySubscriptionId, args.rzpSubscriptionId))
    .limit(1);
  if (!sub) {
    console.warn(`[billing] invoice for unknown sub ${args.rzpSubscriptionId}; ignoring`);
    return;
  }

  // Idempotent insert — if we already have a row for this Razorpay invoice, update it.
  if (args.rzpInvoiceId) {
    const [existing] = await db
      .select({ id: schema.invoices.id })
      .from(schema.invoices)
      .where(eq(schema.invoices.razorpayInvoiceId, args.rzpInvoiceId))
      .limit(1);
    if (existing) {
      await db
        .update(schema.invoices)
        .set({
          status: args.paid ? "paid" : "pending",
          paidAt: args.paid ? args.paidAt ?? new Date() : null,
          razorpayPaymentId: args.rzpPaymentId ?? null,
          razorpayShortUrl: args.rzpShortUrl ?? null,
          updatedAt: new Date(),
        })
        .where(eq(schema.invoices.id, existing.id));
      return;
    }
  }

  // Snapshot the customer + business identity AT invoice time, so the PDF can be
  // regenerated later without picking up retroactive edits to the user / plan / business profile.
  const [user] = await db
    .select({ name: schema.users.name, email: schema.users.email })
    .from(schema.users)
    .where(eq(schema.users.id, sub.userId))
    .limit(1);
  const [plan] = await db
    .select({ name: schema.pricingPlans.name })
    .from(schema.pricingPlans)
    .where(eq(schema.pricingPlans.id, sub.planId))
    .limit(1);

  // Allocate our own sequential number only for paid invoices (one per real txn).
  // Pending invoices stay unnumbered until they settle.
  const invoiceNumber = args.paid ? await allocateInvoiceNumber() : null;

  const businessSnapshot = user && plan
    ? buildBusinessSnapshot({
        planName: plan.name,
        planPeriod: (sub.period as "monthly" | "yearly") ?? "monthly",
      })
    : null;
  const billingSnapshot = user ? buildBillingSnapshot(user) : null;

  const [inserted] = await db
    .insert(schema.invoices)
    .values({
      subscriptionId: sub.id,
      userId: sub.userId,
      razorpayInvoiceId: args.rzpInvoiceId ?? null,
      razorpayPaymentId: args.rzpPaymentId ?? null,
      razorpayShortUrl: args.rzpShortUrl ?? null,
      invoiceNumber,
      businessSnapshot,
      billingSnapshot,
      amountCents: args.amountCents,
      currency: args.currency,
      status: args.paid ? "paid" : "pending",
      paidAt: args.paid ? args.paidAt ?? new Date() : null,
      periodStart: args.periodStart ?? null,
      periodEnd: args.periodEnd ?? null,
    })
    .returning({ id: schema.invoices.id });

  // Brand-new paid invoice + caller didn't opt out → send the receipt.
  if (args.paid && !args.skipReceiptEmail && inserted) {
    void sendInvoiceReceipt(sub, inserted.id, args).catch((e) =>
      console.error("[billing] receipt email failed:", e),
    );
  }
}

/**
 * Send the customer a Sepnexus-branded "Payment received" email with the
 * Sepnexus-branded PDF attached. Internal invoice ID drives both the
 * "View invoice" link and the PDF render.
 */
export async function sendInvoiceReceipt(
  sub: Subscription,
  invoiceId: string,
  args: {
    rzpInvoiceId?: string;
    rzpShortUrl?: string | null;
    amountCents: number;
    currency: string;
    periodEnd?: Date | null;
  },
) {
  const [user] = await db
    .select({ email: schema.users.email, name: schema.users.name })
    .from(schema.users)
    .where(eq(schema.users.id, sub.userId))
    .limit(1);
  const [plan] = await db
    .select({ name: schema.pricingPlans.name })
    .from(schema.pricingPlans)
    .where(eq(schema.pricingPlans.id, sub.planId))
    .limit(1);
  if (!user || !plan) return;

  const { sendPaymentReceivedEmail } = await import("./email-templates");
  await sendPaymentReceivedEmail({
    to: user.email,
    name: user.name,
    planName: plan.name,
    amountCents: args.amountCents,
    currency: args.currency,
    invoiceId, // internal id → drives PDF + hosted view links
    periodEnd: args.periodEnd ?? null,
  });
}

export { ACTIVE_STATUSES, TERMINAL_STATUSES };

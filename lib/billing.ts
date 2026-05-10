import { db, schema } from "./db";
import { and, eq, isNull, ne, desc } from "drizzle-orm";
import {
  createPlan as rzpCreatePlan,
  createSubscription as rzpCreateSubscription,
  cancelSubscription as rzpCancelSubscription,
  fetchSubscription as rzpFetchSubscription,
  type RzpPlanPeriod,
  type RzpSubscription,
} from "./razorpay";
import type { PricingPlan, Subscription } from "./db/schema";

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
  amountCents: number;
  currency: string;
  paid: boolean;
  paidAt?: Date | null;
  periodStart?: Date | null;
  periodEnd?: Date | null;
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
          updatedAt: new Date(),
        })
        .where(eq(schema.invoices.id, existing.id));
      return;
    }
  }

  await db.insert(schema.invoices).values({
    subscriptionId: sub.id,
    userId: sub.userId,
    razorpayInvoiceId: args.rzpInvoiceId ?? null,
    razorpayPaymentId: args.rzpPaymentId ?? null,
    amountCents: args.amountCents,
    currency: args.currency,
    status: args.paid ? "paid" : "pending",
    paidAt: args.paid ? args.paidAt ?? new Date() : null,
    periodStart: args.periodStart ?? null,
    periodEnd: args.periodEnd ?? null,
  });
}

export { ACTIVE_STATUSES, TERMINAL_STATUSES };

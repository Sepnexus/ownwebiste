import { and, eq, gte, lt, sql, isNull } from "drizzle-orm";
import { db, schema } from "./db";
import { createSubscriptionAddon, RazorpayError } from "./razorpay";
import { sendUsage80Warning, sendUsage100Warning } from "./email-templates";
import type { UsageCounter, Subscription, PricingPlan } from "./db/schema";

export type IngestArgs = {
  userId: string;
  externalId?: string | null;
  source: "shared-n8n" | "dedicated-n8n" | "manual";
  workflowId?: string | null;
  workflowName?: string | null;
  status?: "success" | "error" | "canceled" | null;
  durationMs?: number | null;
  occurredAt: Date;
  meta?: Record<string, unknown> | null;
};

/**
 * Ingest a single usage event. Idempotent on (userId, externalId): if the same
 * external id has already been recorded for this user, returns ok without
 * incrementing the counter.
 *
 * Increments the customer's current-period usage counter (creating it if the
 * subscription has rolled to a new period since the last event).
 *
 * Sends 80% / 100% warning emails the first time each threshold is crossed.
 */
export async function ingestExecutionEvent(args: IngestArgs): Promise<{
  duplicate: boolean;
  counterId?: string;
}> {
  // Find the active sub for this user.
  const sub = await getActiveSubscription(args.userId);

  // Insert the raw event. If we have an externalId and it's a duplicate, the
  // unique index throws; we catch and return early.
  let inserted = false;
  try {
    await db.insert(schema.usageEvents).values({
      userId: args.userId,
      subscriptionId: sub?.id ?? null,
      kind: "execution",
      source: args.source,
      externalId: args.externalId ?? null,
      workflowId: args.workflowId ?? null,
      workflowName: args.workflowName ?? null,
      status: args.status ?? null,
      durationMs: args.durationMs ?? null,
      meta: args.meta ?? null,
      occurredAt: args.occurredAt,
    });
    inserted = true;
  } catch (e) {
    if (isUniqueViolation(e, "usage_events_external_uniq")) {
      return { duplicate: true };
    }
    throw e;
  }

  if (!inserted || !sub) return { duplicate: false };

  // Roll the event into the period counter. If the period has changed (new
  // billing cycle), we open a fresh counter row.
  const counter = await ensureCurrentCounter(sub, args.occurredAt);
  if (!counter) return { duplicate: false };

  const [updated] = await db
    .update(schema.usageCounters)
    .set({
      executionsUsed: sql`${schema.usageCounters.executionsUsed} + 1`,
      lastEventAt: args.occurredAt,
      updatedAt: new Date(),
    })
    .where(eq(schema.usageCounters.id, counter.id))
    .returning();

  // Threshold warning emails — fire-and-forget.
  await maybeSendThresholdWarnings(updated);

  return { duplicate: false, counterId: counter.id };
}

/* ============== Counter management ============== */

async function getActiveSubscription(userId: string) {
  const [row] = await db
    .select()
    .from(schema.subscriptions)
    .where(
      and(
        eq(schema.subscriptions.userId, userId),
        sql`${schema.subscriptions.status} IN ('authenticated','active','pending','created')`,
      ),
    )
    .orderBy(sql`${schema.subscriptions.createdAt} DESC`)
    .limit(1);
  return row ?? null;
}

async function getPlan(planId: string): Promise<PricingPlan | null> {
  const [row] = await db
    .select()
    .from(schema.pricingPlans)
    .where(eq(schema.pricingPlans.id, planId))
    .limit(1);
  return row ?? null;
}

/**
 * Find or create the usage counter row for `sub`'s current period that
 * contains `at`. If the subscription doesn't have current_period_*
 * populated yet, fall back to a per-month bucket starting from the sub's
 * createdAt.
 */
export async function ensureCurrentCounter(
  sub: Subscription,
  at: Date,
): Promise<UsageCounter | null> {
  const { periodStart, periodEnd } = currentPeriodFor(sub, at);

  const [existing] = await db
    .select()
    .from(schema.usageCounters)
    .where(
      and(
        eq(schema.usageCounters.userId, sub.userId),
        eq(schema.usageCounters.periodStart, periodStart),
      ),
    )
    .limit(1);
  if (existing) return existing;

  const plan = await getPlan(sub.planId);
  if (!plan) return null;

  const [created] = await db
    .insert(schema.usageCounters)
    .values({
      userId: sub.userId,
      subscriptionId: sub.id,
      periodStart,
      periodEnd,
      executionsIncluded: plan.executionsIncluded ?? 0,
      overageUsdPer1k: plan.overageUsdPer1k ?? null,
    })
    .onConflictDoNothing()
    .returning();

  if (created) return created;

  // Concurrent insert — re-fetch.
  const [refetched] = await db
    .select()
    .from(schema.usageCounters)
    .where(
      and(
        eq(schema.usageCounters.userId, sub.userId),
        eq(schema.usageCounters.periodStart, periodStart),
      ),
    )
    .limit(1);
  return refetched ?? null;
}

/**
 * Given the subscription and a moment, return the [start, end) of the
 * billing period that contains it. Falls back to a synthetic monthly bucket
 * from the sub's creation date when Razorpay hasn't populated the period yet.
 */
export function currentPeriodFor(
  sub: Subscription,
  at: Date,
): { periodStart: Date; periodEnd: Date } {
  const t = at.getTime();
  if (
    sub.currentPeriodStart &&
    sub.currentPeriodEnd &&
    sub.currentPeriodStart.getTime() <= t &&
    t < sub.currentPeriodEnd.getTime()
  ) {
    return {
      periodStart: sub.currentPeriodStart,
      periodEnd: sub.currentPeriodEnd,
    };
  }
  // Synthetic bucket — start at sub.createdAt or the most-recent month boundary.
  const anchor = sub.currentPeriodStart ?? sub.createdAt;
  const stepMs =
    sub.period === "yearly"
      ? 365 * 24 * 60 * 60 * 1000
      : 30 * 24 * 60 * 60 * 1000;
  let start = new Date(anchor);
  while (start.getTime() + stepMs <= t) {
    start = new Date(start.getTime() + stepMs);
  }
  return { periodStart: start, periodEnd: new Date(start.getTime() + stepMs) };
}

/* ============== Threshold warnings ============== */

async function maybeSendThresholdWarnings(c: UsageCounter): Promise<void> {
  if (!c.executionsIncluded || c.executionsIncluded <= 0) return;
  const used = c.executionsUsed;
  const limit = c.executionsIncluded;
  const pct = used / limit;

  if (pct >= 1 && !c.warning100SentAt) {
    await db
      .update(schema.usageCounters)
      .set({ warning100SentAt: new Date(), updatedAt: new Date() })
      .where(eq(schema.usageCounters.id, c.id));
    void notifyAtThreshold(c, 100).catch((e) =>
      console.error("[usage] 100% notify failed:", e),
    );
  } else if (pct >= 0.8 && !c.warning80SentAt && !c.warning100SentAt) {
    await db
      .update(schema.usageCounters)
      .set({ warning80SentAt: new Date(), updatedAt: new Date() })
      .where(eq(schema.usageCounters.id, c.id));
    void notifyAtThreshold(c, 80).catch((e) =>
      console.error("[usage] 80% notify failed:", e),
    );
  }
}

async function notifyAtThreshold(c: UsageCounter, pct: 80 | 100) {
  const [user] = await db
    .select({ email: schema.users.email, name: schema.users.name })
    .from(schema.users)
    .where(eq(schema.users.id, c.userId))
    .limit(1);
  if (!user) return;
  if (pct === 80) {
    await sendUsage80Warning({
      to: user.email,
      name: user.name,
      used: c.executionsUsed,
      included: c.executionsIncluded,
      periodEnd: c.periodEnd,
    });
  } else {
    const overageRate = c.overageUsdPer1k ?? 0;
    await sendUsage100Warning({
      to: user.email,
      name: user.name,
      used: c.executionsUsed,
      included: c.executionsIncluded,
      overageUsdPer1k: overageRate,
      periodEnd: c.periodEnd,
    });
  }
}

/* ============== Period close (overage billing) ============== */

export async function closeBillingPeriods(args: {
  /** Process counters whose periodEnd is at or before this moment. */
  cutoff: Date;
  /** Hard cap to avoid runaway in case of a back-fill. */
  limit?: number;
}): Promise<{
  closed: number;
  charged: number;
  errors: { counterId: string; error: string }[];
}> {
  const counters = await db
    .select()
    .from(schema.usageCounters)
    .where(
      and(
        lt(schema.usageCounters.periodEnd, args.cutoff),
        isNull(schema.usageCounters.closedAt),
      ),
    )
    .limit(args.limit ?? 500);

  let charged = 0;
  const errors: { counterId: string; error: string }[] = [];

  for (const c of counters) {
    try {
      await closeOneCounter(c);
      const [refreshed] = await db
        .select({ overageCents: schema.usageCounters.overageCents })
        .from(schema.usageCounters)
        .where(eq(schema.usageCounters.id, c.id))
        .limit(1);
      if ((refreshed?.overageCents ?? 0) > 0) charged += 1;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push({ counterId: c.id, error: msg });
      console.error(`[period-close] counter ${c.id}: ${msg}`);
    }
  }

  return { closed: counters.length, charged, errors };
}

async function closeOneCounter(c: UsageCounter): Promise<void> {
  const used = c.executionsUsed;
  const included = c.executionsIncluded ?? 0;
  const overageUnits = Math.max(0, used - included);
  const ratePer1k = c.overageUsdPer1k ?? 0;

  // No overage or no charge rate: just close the counter.
  if (overageUnits <= 0 || ratePer1k <= 0) {
    await db
      .update(schema.usageCounters)
      .set({
        overageUnits,
        overageCents: 0,
        closedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.usageCounters.id, c.id));
    return;
  }

  // We bill in whole 1,000-execution buckets, rounded up, in cents.
  const buckets = Math.ceil(overageUnits / 1_000);
  const overageCents = buckets * ratePer1k * 100;

  // Look up the subscription's Razorpay id.
  const [sub] = await db
    .select()
    .from(schema.subscriptions)
    .where(eq(schema.subscriptions.id, c.subscriptionId))
    .limit(1);

  if (!sub?.razorpaySubscriptionId) {
    // No Razorpay link (test data, manual sub, etc.). Just record the math.
    await db
      .update(schema.usageCounters)
      .set({
        overageUnits,
        overageCents,
        closedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.usageCounters.id, c.id));
    return;
  }

  let addonId: string | null = null;
  try {
    const addon = await createSubscriptionAddon({
      subscriptionId: sub.razorpaySubscriptionId,
      name: `Execution overage (${overageUnits.toLocaleString()} units)`,
      amountCents: overageCents,
      currency: "USD",
      description: `Period ${c.periodStart.toISOString().slice(0, 10)} → ${c.periodEnd.toISOString().slice(0, 10)}`,
    });
    addonId = addon.id;
  } catch (e) {
    if (e instanceof RazorpayError) {
      throw new Error(`Razorpay addon failed: ${e.message}`);
    }
    throw e;
  }

  await db
    .update(schema.usageCounters)
    .set({
      overageUnits,
      overageCents,
      razorpayAddonId: addonId,
      closedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(schema.usageCounters.id, c.id));
}

/* ============== Pg error helpers ============== */

type PgErrorLike = {
  code?: string;
  constraint?: string;
  message?: string;
  cause?: PgErrorLike;
};

function isUniqueViolation(e: unknown, constraintName?: string): boolean {
  const visit = (x: unknown): boolean => {
    if (!x || typeof x !== "object") return false;
    const err = x as PgErrorLike;
    if (err.code === "23505") {
      if (!constraintName) return true;
      if (err.constraint === constraintName) return true;
    }
    const msg = err.message ?? "";
    if (constraintName && msg.includes(constraintName)) return true;
    return err.cause ? visit(err.cause) : false;
  };
  return visit(e);
}

/* ============== Read helpers (dashboards) ============== */

export async function getCurrentUsageForUser(userId: string): Promise<{
  counter: UsageCounter | null;
  subscription: Subscription | null;
  plan: PricingPlan | null;
}> {
  const sub = await getActiveSubscription(userId);
  if (!sub) return { counter: null, subscription: null, plan: null };
  const counter = await ensureCurrentCounter(sub, new Date());
  const plan = await getPlan(sub.planId);
  return { counter, subscription: sub, plan };
}

/**
 * Per-subscription usage lookup — used by the multi-sub dashboard so each
 * subscription card can show its own counter.
 */
export async function getCurrentUsageForSubscription(
  subscriptionId: string,
): Promise<UsageCounter | null> {
  const [sub] = await db
    .select()
    .from(schema.subscriptions)
    .where(eq(schema.subscriptions.id, subscriptionId))
    .limit(1);
  if (!sub) return null;
  return ensureCurrentCounter(sub, new Date());
}

/** Sum executions used across recent periods for a user — for an admin view. */
export async function getRecentCountersForUser(userId: string, limit = 12) {
  return db
    .select()
    .from(schema.usageCounters)
    .where(eq(schema.usageCounters.userId, userId))
    .orderBy(sql`${schema.usageCounters.periodStart} DESC`)
    .limit(limit);
}

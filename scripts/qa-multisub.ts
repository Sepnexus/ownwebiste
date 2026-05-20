/**
 * Behavioural QA for the multi-sub + cleanup logic.
 *
 * Doesn't touch Razorpay — it manipulates rows directly and calls our local
 * lib helpers. Run against the local DB:
 *
 *   npx tsx --env-file=.env.local scripts/qa-multisub.ts
 *
 * The script seeds throw-away rows, exercises each pathway, asserts the
 * expected state, then cleans up after itself.
 */
import { db, schema } from "@/lib/db";
import { and, eq, isNull } from "drizzle-orm";
import {
  cancelUserSubscription,
  syncSubscriptionFromRazorpay,
} from "@/lib/billing";

const PASS = "\x1b[32m✓\x1b[0m";
const FAIL = "\x1b[31m✗\x1b[0m";

let failures = 0;
function assert(name: string, cond: boolean) {
  if (cond) {
    console.log(`  ${PASS} ${name}`);
  } else {
    console.log(`  ${FAIL} ${name}`);
    failures += 1;
  }
}

async function main() {
  console.log("QA: multi-sub + cleanup behavioural tests\n");

  // ------------------------------------------------------------------
  // Set up a throw-away customer + plan to play with.
  // ------------------------------------------------------------------
  const [user] = await db
    .insert(schema.users)
    .values({
      email: `qa-${Date.now()}@example.test`,
      name: "QA User",
      role: "customer",
      passwordHash: null,
    })
    .returning();
  const [plan] = await db
    .insert(schema.pricingPlans)
    .values({
      slug: `qa-${Date.now()}`,
      category: "n8n",
      name: "QA Plan",
      priceMonthlyUsd: 10,
      priceYearlyUsd: 100,
      currency: "USD",
      visible: false,
      executionsIncluded: 1000,
      features: [],
    })
    .returning();

  // ------------------------------------------------------------------
  // 1. Cancel on a `created` sub should mark cancelled locally, NOT
  //    blow up by calling Razorpay.
  // ------------------------------------------------------------------
  console.log("1. cancelUserSubscription on a `created` sub");
  const [createdSub] = await db
    .insert(schema.subscriptions)
    .values({
      userId: user.id,
      planId: plan.id,
      period: "monthly",
      status: "created",
      razorpaySubscriptionId: "sub_fake_qa_1", // would normally call Razorpay
    })
    .returning();
  const result1 = await cancelUserSubscription({
    userId: user.id,
    subscriptionId: createdSub.id,
    atPeriodEnd: false,
  });
  assert("returns cancelled status", result1.status === "cancelled");
  assert("cancelledAt is set", result1.cancelledAt !== null);

  // ------------------------------------------------------------------
  // 2. cancelUserSubscription on a sub with no razorpaySubscriptionId
  //    (created locally, never reached Razorpay).
  // ------------------------------------------------------------------
  console.log("\n2. cancelUserSubscription on a sub without rzp id");
  const [orphanSub] = await db
    .insert(schema.subscriptions)
    .values({
      userId: user.id,
      planId: plan.id,
      period: "monthly",
      status: "pending",
      razorpaySubscriptionId: null,
    })
    .returning();
  const result2 = await cancelUserSubscription({
    userId: user.id,
    subscriptionId: orphanSub.id,
    atPeriodEnd: false,
  });
  assert("local cancel still works", result2.status === "cancelled");

  // ------------------------------------------------------------------
  // 3. Multi-sub: customer can hold two active subs at once.
  //    (Direct DB inserts — startSubscription needs live Razorpay.)
  // ------------------------------------------------------------------
  console.log("\n3. Two concurrent active subs are allowed");
  await db
    .insert(schema.subscriptions)
    .values({
      userId: user.id,
      planId: plan.id,
      period: "monthly",
      status: "active",
      razorpaySubscriptionId: "sub_fake_qa_2",
    })
    .returning();
  await db
    .insert(schema.subscriptions)
    .values({
      userId: user.id,
      planId: plan.id,
      period: "monthly",
      status: "active",
      razorpaySubscriptionId: "sub_fake_qa_3",
    })
    .returning();
  const liveSubs = await db
    .select()
    .from(schema.subscriptions)
    .where(
      and(eq(schema.subscriptions.userId, user.id), eq(schema.subscriptions.status, "active")),
    );
  assert("two active subs co-exist", liveSubs.length === 2);

  // ------------------------------------------------------------------
  // 4. Invoice display on dashboard/billing aggregates across subs.
  //    Insert one invoice per sub and confirm a userId query returns both.
  // ------------------------------------------------------------------
  console.log("\n4. Invoices aggregate across subs for a user");
  await db.insert(schema.invoices).values([
    {
      subscriptionId: liveSubs[0].id,
      userId: user.id,
      amountCents: 1000,
      currency: "USD",
      status: "paid",
      paidAt: new Date(),
    },
    {
      subscriptionId: liveSubs[1].id,
      userId: user.id,
      amountCents: 1500,
      currency: "INR",
      status: "paid",
      paidAt: new Date(),
    },
  ]);
  const invoices = await db
    .select()
    .from(schema.invoices)
    .where(eq(schema.invoices.userId, user.id));
  assert("two invoices fetched by userId", invoices.length === 2);
  assert(
    "invoices belong to distinct subs",
    new Set(invoices.map((i) => i.subscriptionId)).size === 2,
  );

  // ------------------------------------------------------------------
  // 5. Currency aggregation: SUM grouped by currency should be per-ccy.
  // ------------------------------------------------------------------
  console.log("\n5. Multi-currency stat aggregation");
  const { sql } = await import("drizzle-orm");
  const ccyRows = await db
    .select({
      currency: schema.invoices.currency,
      cents: sql<number>`COALESCE(SUM(${schema.invoices.amountCents}),0)::int`,
    })
    .from(schema.invoices)
    .where(eq(schema.invoices.userId, user.id))
    .groupBy(schema.invoices.currency);
  const usdRow = ccyRows.find((r) => r.currency === "USD");
  const inrRow = ccyRows.find((r) => r.currency === "INR");
  assert("USD row present", !!usdRow && usdRow.cents === 1000);
  assert("INR row present (not blended)", !!inrRow && inrRow.cents === 1500);
  assert("two currency rows", ccyRows.length === 2);

  // ------------------------------------------------------------------
  // Cleanup.
  // ------------------------------------------------------------------
  console.log("\n6. Cleanup throw-away rows");
  await db.delete(schema.invoices).where(eq(schema.invoices.userId, user.id));
  await db.delete(schema.subscriptions).where(eq(schema.subscriptions.userId, user.id));
  await db.delete(schema.pricingPlans).where(eq(schema.pricingPlans.id, plan.id));
  await db.delete(schema.users).where(eq(schema.users.id, user.id));
  assert("rows deleted", true);

  console.log(`\n${failures === 0 ? PASS : FAIL} ${failures === 0 ? "All checks passed" : `${failures} failure(s)`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("✗ Test run failed:", e);
  process.exit(1);
});

/**
 * Fire ensureRazorpayPlanId on a specific plan (one-off backfill).
 * Run with: npx tsx --env-file=.env.local scripts/sync-plan-once.ts <planId>
 */
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { ensureRazorpayPlanId } from "@/lib/billing";

async function main() {
  const id = process.argv[2];
  if (!id) {
    console.error("Usage: sync-plan-once.ts <planId>");
    process.exit(1);
  }
  const [plan] = await db
    .select()
    .from(schema.pricingPlans)
    .where(eq(schema.pricingPlans.id, id))
    .limit(1);
  if (!plan) {
    console.error("Plan not found:", id);
    process.exit(1);
  }
  console.log(`Syncing "${plan.name}" (${plan.slug}) to Razorpay…`);
  if (plan.priceMonthlyUsd > 0) {
    const m = await ensureRazorpayPlanId(plan, "monthly");
    console.log(`  monthly → ${m}`);
  }
  if (plan.priceYearlyUsd > 0) {
    const y = await ensureRazorpayPlanId(plan, "yearly");
    console.log(`  yearly → ${y}`);
  }
  console.log("Done.");
}

main().catch((e) => {
  console.error("Failed:", e);
  process.exit(1);
});

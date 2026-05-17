/**
 * Backfill: assign sequential Sepnexus invoice numbers + snapshots to existing
 * paid invoices that pre-date the own-invoices migration (drizzle/0008).
 *
 * Idempotent — rows that already have an invoice_number are skipped. Numbers are
 * allocated in chronological order so the sequence reflects real history.
 *
 * Run with:  npx tsx --env-file=.env.local scripts/backfill-invoice-numbers.ts
 */
import { db, schema } from "@/lib/db";
import { asc, eq, isNull, and } from "drizzle-orm";
import { allocateInvoiceNumber } from "@/lib/invoice-number";
import { buildBusinessSnapshot, buildBillingSnapshot } from "@/lib/business";

async function main() {
  const rows = await db
    .select({
      inv: schema.invoices,
      user: schema.users,
      sub: schema.subscriptions,
      plan: schema.pricingPlans,
    })
    .from(schema.invoices)
    .leftJoin(schema.users, eq(schema.users.id, schema.invoices.userId))
    .leftJoin(
      schema.subscriptions,
      eq(schema.subscriptions.id, schema.invoices.subscriptionId),
    )
    .leftJoin(
      schema.pricingPlans,
      eq(schema.pricingPlans.id, schema.subscriptions.planId),
    )
    .where(
      and(eq(schema.invoices.status, "paid"), isNull(schema.invoices.invoiceNumber)),
    )
    .orderBy(asc(schema.invoices.createdAt));

  if (rows.length === 0) {
    console.log("Nothing to backfill — all paid invoices already have numbers.");
    return;
  }

  console.log(`Found ${rows.length} paid invoice(s) without a Sepnexus number.`);

  for (const { inv, user, sub, plan } of rows) {
    if (!user || !sub || !plan) {
      console.warn(`! Skipping invoice ${inv.id} — missing user/sub/plan join.`);
      continue;
    }
    // Allocate against the calendar year the invoice was created in, so the
    // sequence reflects the year of issuance rather than the year of backfill.
    const year = new Date(inv.createdAt).getFullYear();
    const number = await allocateInvoiceNumber(year);

    const businessSnap = buildBusinessSnapshot({
      planName: plan.name,
      planPeriod: (sub.period as "monthly" | "yearly") ?? "monthly",
    });
    const billingSnap = buildBillingSnapshot(user);

    await db
      .update(schema.invoices)
      .set({
        invoiceNumber: number,
        businessSnapshot: businessSnap,
        billingSnapshot: billingSnap,
        updatedAt: new Date(),
      })
      .where(eq(schema.invoices.id, inv.id));

    console.log(`  ${inv.id.slice(0, 8)} → ${number}  (${user.email}, ${plan.name})`);
  }

  console.log(`\nBackfilled ${rows.length} invoice(s).`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("✗ Backfill failed:", e);
    process.exit(1);
  });

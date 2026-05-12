/**
 * Send a real "Payment received" email for an existing invoice, end-to-end:
 * renders the Sepnexus PDF, attaches it, BCCs the admin, links to the internal
 * invoice page.
 *
 * Run with:
 *   npx tsx --env-file=.env.local scripts/test-receipt-email.ts <invoiceId>
 *
 * If no invoiceId is passed, picks the most recent paid invoice.
 */
import { db, schema } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { sendInvoiceReceipt } from "@/lib/billing";

async function main() {
  const argId = process.argv[2];

  const [row] = argId
    ? await db
        .select({ inv: schema.invoices, sub: schema.subscriptions })
        .from(schema.invoices)
        .leftJoin(
          schema.subscriptions,
          eq(schema.subscriptions.id, schema.invoices.subscriptionId),
        )
        .where(eq(schema.invoices.id, argId))
        .limit(1)
    : await db
        .select({ inv: schema.invoices, sub: schema.subscriptions })
        .from(schema.invoices)
        .leftJoin(
          schema.subscriptions,
          eq(schema.subscriptions.id, schema.invoices.subscriptionId),
        )
        .where(eq(schema.invoices.status, "paid"))
        .orderBy(desc(schema.invoices.createdAt))
        .limit(1);

  if (!row || !row.sub) {
    console.error("No matching paid invoice found.");
    process.exit(1);
  }

  await sendInvoiceReceipt(row.sub, row.inv.id, {
    rzpInvoiceId: row.inv.razorpayInvoiceId ?? undefined,
    rzpShortUrl: row.inv.razorpayShortUrl,
    amountCents: row.inv.amountCents,
    currency: row.inv.currency,
    periodEnd: row.inv.periodEnd,
  });

  console.log(
    `✓ Payment receipt sent for invoice ${row.inv.invoiceNumber ?? row.inv.id} (${row.inv.id})`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("✗ Send failed:", e);
    process.exit(1);
  });

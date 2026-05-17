/**
 * Smoke test the manual invoice flow: create one, render its PDF, mark it paid.
 * Run: npx tsx --env-file=.env.local scripts/test-manual-invoice.ts
 */
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { createManualInvoice, markManualInvoicePaid } from "@/lib/manual-invoice";
import { loadManualInvoicePdfData, renderInvoicePdf } from "@/lib/invoice-pdf";
import { writeFileSync } from "node:fs";

async function main() {
  const [admin] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.role, "admin"))
    .limit(1);
  if (!admin) throw new Error("No admin user found");

  const result = await createManualInvoice({
    buyerName: "Acme Automation Pvt Ltd",
    buyerEmail: "billing@acme.example",
    buyerAddress: { line1: "4th Floor, Tower B", city: "Bengaluru", country: "India" },
    currency: "EUR",
    lineItems: [
      { description: "n8n workflow build — discovery phase", quantity: 1, unitAmount: 1200 },
      { description: "Custom node development", quantity: 8, unitAmount: 150 },
      { description: "Managed hosting setup (one-time)", quantity: 1, unitAmount: 500 },
    ],
    notes: "Net 15. Bank transfer details sent separately.",
    createdBy: admin.id,
  });
  if (!result.ok) throw new Error(`create failed: ${result.error}`);
  console.log(`✓ created ${result.invoiceNumber} (${result.id})`);

  const data = await loadManualInvoicePdfData(result.id);
  if (!data) throw new Error("loadManualInvoicePdfData returned null");
  const pdf = await renderInvoicePdf(data);
  writeFileSync("/tmp/manual-invoice.pdf", pdf);
  console.log(
    `✓ PDF rendered: ${pdf.length} bytes → /tmp/manual-invoice.pdf  (total ${data.amountCents} ${data.currency} minor units)`,
  );

  await markManualInvoicePaid(result.id);
  console.log("✓ marked paid");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("✗", e);
    process.exit(1);
  });

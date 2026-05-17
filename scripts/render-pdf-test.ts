import { loadInvoicePdfData, renderInvoicePdf } from "@/lib/invoice-pdf";
import { writeFileSync } from "node:fs";

async function main() {
  const id = process.argv[2] ?? "e8c0f20e-6269-4ea4-bcc1-216478015471";
  const data = await loadInvoicePdfData(id);
  if (!data) {
    console.error("No invoice found:", id);
    process.exit(1);
  }
  const buf = await renderInvoicePdf(data);
  writeFileSync("/tmp/sepnexus-invoice.pdf", buf);
  console.log(`✓ PDF rendered: ${buf.length} bytes → /tmp/sepnexus-invoice.pdf`);
  console.log(
    `  ${data.invoiceNumber} · ${data.business.legalName} · ${data.business.address.city}`,
  );
}

main().catch((e) => {
  console.error("✗", e);
  process.exit(1);
});

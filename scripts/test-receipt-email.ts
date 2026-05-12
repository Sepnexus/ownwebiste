import { sendPaymentReceivedEmail } from "@/lib/email-templates";

async function main() {
  await sendPaymentReceivedEmail({
    to: "akshay@sepnexus.com",
    name: "Akshay",
    planName: "n8n Hosting · Starter (Monthly)",
    amountCents: 1200,
    currency: "USD",
    invoiceShortUrl: "https://rzp.io/i/test-invoice-link",
    invoiceId: "inv_test_RECEIPT_demo",
    periodEnd: new Date("2026-06-12"),
  });
  console.log("✓ Payment received email sent to akshay@sepnexus.com");
}

main().catch((e) => {
  console.error("✗ Send failed:", e);
  process.exit(1);
});

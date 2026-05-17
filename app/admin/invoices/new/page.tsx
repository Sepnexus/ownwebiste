import type { Metadata } from "next";
import Link from "next/link";
import ManualInvoiceForm from "./_components/ManualInvoiceForm";

export const metadata: Metadata = { title: "Admin · New invoice" };
export const dynamic = "force-dynamic";

export default function NewManualInvoicePage() {
  return (
    <>
      <Link
        href="/admin/invoices"
        style={{
          fontFamily: "var(--mono)",
          fontSize: 12,
          color: "var(--muted)",
          textDecoration: "none",
        }}
      >
        ← Invoices
      </Link>
      <h1 style={{ marginTop: 14 }}>Generate invoice</h1>
      <p className="admin-subtitle" style={{ maxWidth: 720 }}>
        A one-off invoice not tied to a subscription — for consulting, setup
        fees, or custom work. Enter the buyer and line items; we issue it with
        the same Sepnexus-branded format and a sequential number.
      </p>
      <ManualInvoiceForm />
    </>
  );
}

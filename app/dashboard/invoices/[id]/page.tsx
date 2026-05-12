import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { currentUser } from "@/lib/auth";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { loadInvoicePdfData } from "@/lib/invoice-pdf";
import { formatAddress } from "@/lib/business";

export const metadata: Metadata = { title: "Invoice" };
export const dynamic = "force-dynamic";

function money(cents: number, currency: string): string {
  const sym = currency === "INR" ? "₹" : "$";
  return `${sym}${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function CustomerInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await currentUser();
  const { id } = await params;
  if (!user) redirect(`/login?next=/dashboard/invoices/${id}`);
  if (user.role === "admin") redirect(`/admin/invoices`);

  const data = await loadInvoicePdfData(id);
  if (!data) notFound();

  // Ownership check — loadInvoicePdfData doesn't gate auth, the page does.
  // We refetch the userId cheaply via the snapshot's email isn't reliable, so re-check:
  // Actually loadInvoicePdfData uses the same id; verify ownership by re-querying.
  // (Cheaper: the PDF route already does this; here we do it explicitly.)
  const { db, schema } = await import("@/lib/db");
  const { eq } = await import("drizzle-orm");
  const [own] = await db
    .select({ userId: schema.invoices.userId })
    .from(schema.invoices)
    .where(eq(schema.invoices.id, id))
    .limit(1);
  if (!own || own.userId !== user.id) notFound();

  const isPaid = data.status === "paid";

  return (
    <DashboardShell user={{ email: user.email, name: user.name }}>
      <Link
        href="/dashboard/billing"
        style={{
          fontFamily: "var(--mono)",
          fontSize: 12,
          color: "var(--muted)",
          textDecoration: "none",
        }}
      >
        ← Billing
      </Link>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginTop: 14,
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 11,
              letterSpacing: "0.14em",
              color: "var(--muted)",
              marginBottom: 6,
            }}
          >
            {data.business.hasGst ? "TAX INVOICE" : "INVOICE"}
          </div>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 26,
              fontWeight: 600,
              color: "var(--ink)",
              letterSpacing: "0.02em",
            }}
          >
            {data.invoiceNumber}
          </div>
          {isPaid && (
            <span
              className="pill live"
              style={{ fontSize: 11, marginTop: 8, display: "inline-block" }}
            >
              PAID
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <a
            href={`/api/invoices/${id}/pdf?download=1`}
            className="btn btn-solid"
            style={{ padding: "9px 14px", fontSize: 13 }}
          >
            Download PDF
          </a>
          <a
            href={`/api/invoices/${id}/pdf`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline"
            style={{ padding: "9px 14px", fontSize: 13 }}
          >
            View PDF
          </a>
        </div>
      </div>

      <div
        style={{
          marginTop: 28,
          padding: 28,
          border: "1px solid var(--line)",
          borderRadius: 14,
          background: "rgba(255,255,255,0.6)",
        }}
      >
        {/* From / Billed to — two columns. */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 32,
            marginBottom: 18,
          }}
        >
          <PartyBlock label="From">
            <strong>{data.business.legalName}</strong>
            <div
              style={{
                whiteSpace: "pre-line",
                color: "var(--muted)",
                fontSize: 13,
                marginTop: 4,
              }}
            >
              {formatAddress(data.business.address)}
            </div>
            <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 6 }}>
              {data.business.supportEmail}
            </div>
            {data.business.gstin && (
              <div style={{ color: "var(--muted)", fontSize: 13 }}>
                GSTIN: {data.business.gstin}
              </div>
            )}
          </PartyBlock>

          <PartyBlock label="Billed to">
            <strong>
              {data.billing.name ?? data.billing.email.split("@")[0]}
            </strong>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>
              {data.billing.email}
            </div>
          </PartyBlock>
        </div>

        {/* Date strip — single row, dividing the parties from the line items. */}
        <div
          style={{
            display: "flex",
            gap: 24,
            flexWrap: "wrap",
            padding: "10px 0",
            borderTop: "1px solid var(--line)",
            borderBottom: "1px solid var(--line)",
            marginBottom: 22,
          }}
        >
          <DateItem label="Issued">{fmtDate(data.issuedAt)}</DateItem>
          {data.paidAt && <DateItem label="Paid">{fmtDate(data.paidAt)}</DateItem>}
          {data.periodStart && data.periodEnd && (
            <DateItem label="Period">
              {fmtDate(data.periodStart)} – {fmtDate(data.periodEnd)}
            </DateItem>
          )}
        </div>

        {/* Line items */}
        <table
          className="admin-table"
          style={{ marginTop: 0, marginBottom: 0 }}
        >
          <thead>
            <tr>
              <th>Description</th>
              <th style={{ width: 80, textAlign: "right" }}>Qty</th>
              <th style={{ width: 140, textAlign: "right" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>{data.business.planName}</strong>
                <div
                  style={{ color: "var(--muted)", fontSize: 12, marginTop: 2 }}
                >
                  {data.business.planPeriod === "yearly"
                    ? "Yearly subscription"
                    : "Monthly subscription"}
                </div>
              </td>
              <td style={{ textAlign: "right", fontFamily: "var(--mono)" }}>1</td>
              <td style={{ textAlign: "right", fontFamily: "var(--mono)" }}>
                {money(data.amountCents, data.currency)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Totals */}
        <div
          style={{
            marginTop: 18,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <div style={{ minWidth: 280 }}>
            <Row label="Subtotal" value={money(data.amountCents, data.currency)} />
            {data.business.hasGst && <Row label="GST" value="—" />}
            <div
              style={{
                borderTop: "1px solid var(--ink)",
                marginTop: 8,
                paddingTop: 8,
              }}
            >
              <Row
                label={`Total ${data.currency}`}
                value={money(data.amountCents, data.currency)}
                bold
              />
            </div>
          </div>
        </div>

        {/* Payment block */}
        {isPaid && (
          <div
            style={{
              marginTop: 28,
              padding: 16,
              background: "#FAFAFA",
              borderLeft: "2px solid var(--ink)",
              borderRadius: 4,
            }}
          >
            <div
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--muted)",
                marginBottom: 8,
              }}
            >
              Payment details
            </div>
            <div style={{ fontSize: 13 }}>
              Settled via Razorpay
              {data.paidAt ? ` on ${fmtDate(data.paidAt)}` : ""}.
            </div>
            {data.razorpayPaymentId && (
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 12,
                  color: "var(--muted)",
                  marginTop: 4,
                }}
              >
                Payment ID: {data.razorpayPaymentId}
              </div>
            )}
            {data.razorpayInvoiceId && (
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 12,
                  color: "var(--muted)",
                }}
              >
                Razorpay reference: {data.razorpayInvoiceId}
              </div>
            )}
          </div>
        )}

      </div>

      <p
        style={{
          fontSize: 12,
          color: "var(--muted)",
          marginTop: 18,
          maxWidth: 720,
          lineHeight: 1.6,
        }}
      >
        Need a different billing address or company name on this invoice? Reply
        to your receipt email or write to{" "}
        <a href={`mailto:${data.business.supportEmail}`}>
          {data.business.supportEmail}
        </a>{" "}
        — we&apos;ll reissue.
      </p>
    </DashboardShell>
  );
}

function PartyBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--muted)",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}

function DateItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
      <span
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--muted)",
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 13, color: "var(--ink)" }}>{children}</span>
    </div>
  );
}

function Row({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "4px 0",
        fontWeight: bold ? 600 : 400,
        fontSize: bold ? 15 : 13,
        color: bold ? "var(--ink)" : "var(--muted)",
      }}
    >
      <span>{label}</span>
      <span style={{ fontFamily: "var(--mono)", color: "var(--ink)" }}>
        {value}
      </span>
    </div>
  );
}

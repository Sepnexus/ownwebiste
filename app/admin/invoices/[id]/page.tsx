import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { loadInvoicePdfData } from "@/lib/invoice-pdf";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { formatAddress } from "@/lib/business";
import ResendReceiptButton from "./_components/ResendReceiptButton";

export const metadata: Metadata = { title: "Admin · Invoice" };
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

export default async function AdminInvoiceDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const data = await loadInvoicePdfData(id);
  if (!data) notFound();

  const [meta] = await db
    .select({
      userId: schema.invoices.userId,
      razorpayShortUrl: schema.invoices.razorpayShortUrl,
      user: schema.users,
    })
    .from(schema.invoices)
    .leftJoin(schema.users, eq(schema.users.id, schema.invoices.userId))
    .where(eq(schema.invoices.id, id))
    .limit(1);
  if (!meta) notFound();

  const isPaid = data.status === "paid";

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

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginTop: 14,
          gap: 18,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>
            {data.business.hasGst ? "Tax Invoice" : "Invoice"}
          </h1>
          <p
            style={{
              margin: "4px 0 0",
              fontFamily: "var(--mono)",
              fontSize: 14,
              color: "var(--muted)",
            }}
          >
            {data.invoiceNumber}
          </p>
          {meta.user && (
            <p style={{ marginTop: 6 }} className="admin-subtitle">
              For{" "}
              <Link href={`/admin/customers/${meta.user.id}`}>
                {meta.user.name ?? meta.user.email.split("@")[0]} ({meta.user.email})
              </Link>
            </p>
          )}
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {isPaid && (
            <span className="pill live" style={{ fontSize: 12 }}>
              PAID
            </span>
          )}
          <a
            href={`/api/invoices/${id}/pdf?download=1`}
            className="btn btn-solid"
            style={{ padding: "8px 14px", fontSize: 13 }}
          >
            Download PDF
          </a>
          <a
            href={`/api/invoices/${id}/pdf`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline"
            style={{ padding: "8px 14px", fontSize: 13 }}
          >
            View PDF ↗
          </a>
          {isPaid && meta.user && <ResendReceiptButton invoiceId={id} />}
        </div>
      </div>

      <div
        style={{
          marginTop: 24,
          padding: 24,
          border: "1px solid var(--line)",
          borderRadius: 12,
          background: "rgba(255,255,255,0.6)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 24,
            paddingBottom: 24,
            borderBottom: "1px solid var(--line)",
            marginBottom: 24,
          }}
        >
          <Block label="From">
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
          </Block>
          <Block label="Billed to">
            <strong>
              {data.billing.name ?? data.billing.email.split("@")[0]}
            </strong>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>
              {data.billing.email}
            </div>
          </Block>
          <Block label="Details">
            <div style={{ fontSize: 13 }}>
              <strong>Issued:</strong> {fmtDate(data.issuedAt)}
            </div>
            {data.paidAt && (
              <div style={{ fontSize: 13, marginTop: 2 }}>
                <strong>Paid:</strong> {fmtDate(data.paidAt)}
              </div>
            )}
            {data.periodStart && data.periodEnd && (
              <div style={{ fontSize: 13, color: "var(--muted)" }}>
                {fmtDate(data.periodStart)} → {fmtDate(data.periodEnd)}
              </div>
            )}
          </Block>
        </div>

        <table className="admin-table" style={{ marginTop: 0, marginBottom: 0 }}>
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
                  {data.business.planPeriod === "yearly" ? "Yearly" : "Monthly"}
                </div>
              </td>
              <td style={{ textAlign: "right", fontFamily: "var(--mono)" }}>1</td>
              <td style={{ textAlign: "right", fontFamily: "var(--mono)" }}>
                {money(data.amountCents, data.currency)}
              </td>
            </tr>
          </tbody>
        </table>

        <div
          style={{
            marginTop: 18,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <div style={{ minWidth: 280 }}>
            <RowK label="Subtotal" value={money(data.amountCents, data.currency)} />
            {data.business.hasGst && <RowK label="GST" value="—" />}
            <div
              style={{
                borderTop: "1px solid var(--ink)",
                marginTop: 8,
                paddingTop: 8,
              }}
            >
              <RowK
                label={`Total ${data.currency}`}
                value={money(data.amountCents, data.currency)}
                bold
              />
            </div>
          </div>
        </div>

        {/* Razorpay cross-reference (admin-only) */}
        <div
          style={{
            marginTop: 24,
            padding: 14,
            border: "1px dashed var(--line-strong)",
            borderRadius: 8,
          }}
        >
          <div
            style={{
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--muted)",
              marginBottom: 8,
            }}
          >
            Razorpay cross-reference
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>
            {data.razorpayInvoiceId && (
              <div>Invoice: {data.razorpayInvoiceId}</div>
            )}
            {data.razorpayPaymentId && (
              <div>Payment: {data.razorpayPaymentId}</div>
            )}
          </div>
          {meta.razorpayShortUrl && (
            <a
              href={meta.razorpayShortUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost"
              style={{ padding: "5px 10px", fontSize: 11, marginTop: 8 }}
            >
              View on Razorpay ↗
            </a>
          )}
        </div>
      </div>
    </>
  );
}

function Block({
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

function RowK({
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
        fontSize: bold ? 15 : 13,
        fontWeight: bold ? 600 : 400,
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

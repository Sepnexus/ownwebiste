import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { loadManualInvoicePdfData } from "@/lib/invoice-pdf";
import { formatAddress } from "@/lib/business";
import { formatMoneyCents } from "@/lib/format";
import MarkPaidButton from "./_components/MarkPaidButton";

export const metadata: Metadata = { title: "Admin · Manual invoice" };
export const dynamic = "force-dynamic";

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function ManualInvoiceDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadManualInvoicePdfData(id);
  if (!data) notFound();

  const isPaid = data.status === "paid";
  const addr = data.billing.address
    ? formatAddress({
        line1: data.billing.address.line1 ?? "",
        line2: data.billing.address.line2 ?? "",
        city: data.billing.address.city ?? "",
        state: data.billing.address.state ?? "",
        pincode: data.billing.address.pincode ?? "",
        country: data.billing.address.country ?? "",
      })
    : "";

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
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 11,
              letterSpacing: "0.14em",
              color: "var(--muted)",
              marginBottom: 6,
            }}
          >
            INVOICE · MANUAL
          </div>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 24,
              fontWeight: 600,
              color: "var(--ink)",
            }}
          >
            {data.invoiceNumber}
          </div>
          <span
            className={`pill ${isPaid ? "live" : "draft"}`}
            style={{ fontSize: 11, marginTop: 8, display: "inline-block" }}
          >
            {isPaid ? "PAID" : "UNPAID"}
          </span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <a
            href={`/api/invoices/manual/${id}/pdf?download=1`}
            className="btn btn-solid"
            style={{ padding: "8px 14px", fontSize: 13 }}
          >
            Download PDF
          </a>
          <a
            href={`/api/invoices/manual/${id}/pdf`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline"
            style={{ padding: "8px 14px", fontSize: 13 }}
          >
            View PDF
          </a>
          <MarkPaidButton invoiceId={id} status={data.status} />
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
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 32,
            marginBottom: 18,
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
          </Block>
          <Block label="Bill to">
            <strong>{data.billing.name}</strong>
            {data.billing.email && (
              <div style={{ color: "var(--muted)", fontSize: 13 }}>
                {data.billing.email}
              </div>
            )}
            {addr && (
              <div
                style={{
                  whiteSpace: "pre-line",
                  color: "var(--muted)",
                  fontSize: 13,
                  marginTop: 4,
                }}
              >
                {addr}
              </div>
            )}
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
          </Block>
        </div>

        <table className="admin-table" style={{ marginTop: 0, marginBottom: 0 }}>
          <thead>
            <tr>
              <th>Description</th>
              <th style={{ width: 80, textAlign: "right" }}>Qty</th>
              <th style={{ width: 140, textAlign: "right" }}>Unit</th>
              <th style={{ width: 140, textAlign: "right" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.lineItems.map((it, i) => (
              <tr key={i}>
                <td>{it.description}</td>
                <td style={{ textAlign: "right", fontFamily: "var(--mono)" }}>
                  {it.quantity}
                </td>
                <td style={{ textAlign: "right", fontFamily: "var(--mono)" }}>
                  {formatMoneyCents(it.unitAmountMinor, data.currency)}
                </td>
                <td style={{ textAlign: "right", fontFamily: "var(--mono)" }}>
                  {formatMoneyCents(it.quantity * it.unitAmountMinor, data.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end" }}>
          <div
            style={{
              minWidth: 280,
              display: "flex",
              justifyContent: "space-between",
              borderTop: "1px solid var(--ink)",
              paddingTop: 10,
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            <span>Total {data.currency}</span>
            <span style={{ fontFamily: "var(--mono)" }}>
              {formatMoneyCents(data.amountCents, data.currency)}
            </span>
          </div>
        </div>

        {data.notes && (
          <div
            style={{
              marginTop: 22,
              padding: 14,
              background: "#FAFAFA",
              borderLeft: "2px solid var(--ink)",
              borderRadius: 4,
            }}
          >
            <div
              style={{
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--muted)",
                marginBottom: 6,
              }}
            >
              Notes
            </div>
            <div style={{ fontSize: 13, whiteSpace: "pre-line" }}>{data.notes}</div>
          </div>
        )}
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

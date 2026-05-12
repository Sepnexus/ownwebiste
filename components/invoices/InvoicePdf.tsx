import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { BillingSnapshot, BusinessSnapshot } from "@/lib/business";

// -- Fonts -------------------------------------------------------------------
// @react-pdf bundles a few faces by default (Helvetica). We stick with that to
// avoid shipping TTFs and to keep PDF size tiny (~30 KB).

// -- Brand assets ------------------------------------------------------------
// Load the logo once at module init; pass as a Buffer to <Image>.
let _logoBuffer: Buffer | null = null;
function logoBuffer(): Buffer | null {
  if (_logoBuffer !== null) return _logoBuffer;
  try {
    _logoBuffer = readFileSync(
      path.join(process.cwd(), "public/assets/sepnexus-mark.png"),
    );
  } catch {
    _logoBuffer = null;
  }
  return _logoBuffer;
}

// -- Types -------------------------------------------------------------------
export type InvoicePdfData = {
  invoiceNumber: string;
  issuedAt: Date;
  paidAt: Date | null;
  status: "paid" | "pending" | "failed" | "refunded" | "partially_refunded";
  currency: string;
  amountCents: number;
  periodStart: Date | null;
  periodEnd: Date | null;
  razorpayPaymentId: string | null;
  razorpayInvoiceId: string | null;
  business: BusinessSnapshot;
  billing: BillingSnapshot;
};

// -- Styling -----------------------------------------------------------------
const COLORS = {
  ink: "#111111",
  muted: "#6B6B6B",
  line: "#E5E5E5",
  accent: "#0A0A0A",
  paidBg: "#E8F5EC",
  paidInk: "#1A6E2F",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.ink,
    padding: 48,
    lineHeight: 1.45,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 36,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 32, height: 32 },
  brandText: { fontFamily: "Times-Italic", fontSize: 22, color: COLORS.ink },
  metaRight: { textAlign: "right" },
  invoiceTitle: {
    fontFamily: "Times-Roman",
    fontSize: 24,
    marginBottom: 4,
    color: COLORS.ink,
  },
  invoiceNumber: { fontSize: 11, color: COLORS.muted },
  // Two-column "from / to / details"
  partyGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
    gap: 24,
  },
  partyCol: { flex: 1 },
  partyLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: COLORS.muted,
    marginBottom: 4,
  },
  partyName: { fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  partyLine: { fontSize: 10, color: COLORS.ink },
  partyMuted: { fontSize: 10, color: COLORS.muted },
  // Status pill (top right)
  statusPaid: {
    backgroundColor: COLORS.paidBg,
    color: COLORS.paidInk,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    alignSelf: "flex-end",
    marginTop: 6,
  },
  // Line items table
  table: { marginBottom: 24, borderTopWidth: 1, borderTopColor: COLORS.line },
  tr: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    paddingVertical: 10,
  },
  thLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: COLORS.muted,
  },
  cellDesc: { flex: 5 },
  cellQty: { flex: 1, textAlign: "right" },
  cellAmt: { flex: 2, textAlign: "right" },
  itemTitle: { fontFamily: "Helvetica-Bold", marginBottom: 2 },
  itemPeriod: { fontSize: 9, color: COLORS.muted },
  // Totals
  totalsRow: { flexDirection: "row", marginBottom: 4 },
  totalsSpacer: { flex: 6 },
  totalsLabel: { flex: 2, textAlign: "right", color: COLORS.muted },
  totalsValue: { flex: 2, textAlign: "right" },
  totalsGrand: {
    flexDirection: "row",
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.ink,
  },
  totalsGrandLabel: {
    flex: 2,
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
  },
  totalsGrandValue: {
    flex: 2,
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
  },
  // Payment details
  paymentBlock: {
    marginTop: 28,
    padding: 14,
    backgroundColor: "#FAFAFA",
    borderLeftWidth: 2,
    borderLeftColor: COLORS.ink,
    borderLeftStyle: "solid",
  },
  paymentLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: COLORS.muted,
    marginBottom: 6,
  },
  paymentLine: { fontSize: 9, color: COLORS.ink, marginBottom: 2 },
  paymentMono: { fontFamily: "Courier", fontSize: 9 },
  // Footer
  footer: {
    position: "absolute",
    left: 48,
    right: 48,
    bottom: 36,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    paddingTop: 12,
    fontSize: 8,
    color: COLORS.muted,
    textAlign: "center",
  },
  // "Bill of Supply" notice (non-GST)
  notice: { fontSize: 8, color: COLORS.muted, marginTop: 4 },
});

// -- Helpers -----------------------------------------------------------------
function money(cents: number, currency: string): string {
  const sym = currency === "INR" ? "Rs." : "$";
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

// -- Component ---------------------------------------------------------------
export function InvoicePdf({ data }: { data: InvoicePdfData }) {
  const logo = logoBuffer();
  const isPaid = data.status === "paid";

  return (
    <Document
      title={`Invoice ${data.invoiceNumber}`}
      author={data.business.legalName}
      subject={`${data.business.planName} — ${data.business.planPeriod}`}
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.brandRow}>
              {logo ? <Image src={logo} style={styles.logo} /> : null}
              <Text style={styles.brandText}>Sepnexus</Text>
            </View>
          </View>
          <View style={styles.metaRight}>
            <Text style={styles.invoiceTitle}>
              {data.business.hasGst ? "Tax Invoice" : "Invoice"}
            </Text>
            <Text style={styles.invoiceNumber}>{data.invoiceNumber}</Text>
            {isPaid ? <Text style={styles.statusPaid}>PAID</Text> : null}
            {!data.business.hasGst ? (
              <Text style={styles.notice}>Bill of Supply</Text>
            ) : null}
          </View>
        </View>

        {/* From / To / Details */}
        <View style={styles.partyGrid}>
          <View style={styles.partyCol}>
            <Text style={styles.partyLabel}>From</Text>
            <Text style={styles.partyName}>{data.business.legalName}</Text>
            {data.business.address.line1 ? (
              <Text style={styles.partyLine}>{data.business.address.line1}</Text>
            ) : null}
            {data.business.address.line2 ? (
              <Text style={styles.partyLine}>{data.business.address.line2}</Text>
            ) : null}
            <Text style={styles.partyLine}>
              {[data.business.address.city, data.business.address.state]
                .filter(Boolean)
                .join(", ")}
            </Text>
            <Text style={styles.partyLine}>
              {[data.business.address.pincode, data.business.address.country]
                .filter(Boolean)
                .join(" ")}
            </Text>
            <Text style={[styles.partyMuted, { marginTop: 4 }]}>
              {data.business.supportEmail}
            </Text>
            {data.business.gstin ? (
              <Text style={styles.partyMuted}>GSTIN: {data.business.gstin}</Text>
            ) : null}
          </View>

          <View style={styles.partyCol}>
            <Text style={styles.partyLabel}>Billed to</Text>
            <Text style={styles.partyName}>
              {data.billing.name ?? data.billing.email.split("@")[0]}
            </Text>
            <Text style={styles.partyLine}>{data.billing.email}</Text>
            {data.billing.address?.line1 ? (
              <Text style={styles.partyLine}>{data.billing.address.line1}</Text>
            ) : null}
            {data.billing.address?.city ? (
              <Text style={styles.partyLine}>
                {data.billing.address.city}
                {data.billing.address.country
                  ? `, ${data.billing.address.country}`
                  : ""}
              </Text>
            ) : null}
          </View>

          <View style={styles.partyCol}>
            <Text style={styles.partyLabel}>Issued</Text>
            <Text style={styles.partyLine}>{fmtDate(data.issuedAt)}</Text>
            {data.paidAt ? (
              <>
                <Text style={[styles.partyLabel, { marginTop: 8 }]}>Paid on</Text>
                <Text style={styles.partyLine}>{fmtDate(data.paidAt)}</Text>
              </>
            ) : null}
            {data.periodStart && data.periodEnd ? (
              <>
                <Text style={[styles.partyLabel, { marginTop: 8 }]}>Period</Text>
                <Text style={styles.partyLine}>
                  {fmtDate(data.periodStart)} → {fmtDate(data.periodEnd)}
                </Text>
              </>
            ) : null}
          </View>
        </View>

        {/* Line items */}
        <View style={styles.table}>
          <View style={styles.tr}>
            <Text style={[styles.cellDesc, styles.thLabel]}>Description</Text>
            <Text style={[styles.cellQty, styles.thLabel]}>Qty</Text>
            <Text style={[styles.cellAmt, styles.thLabel]}>Amount</Text>
          </View>
          <View style={styles.tr}>
            <View style={styles.cellDesc}>
              <Text style={styles.itemTitle}>{data.business.planName}</Text>
              <Text style={styles.itemPeriod}>
                {data.business.planPeriod === "yearly"
                  ? "Yearly subscription"
                  : "Monthly subscription"}
                {data.periodStart && data.periodEnd
                  ? ` · ${fmtDate(data.periodStart)} → ${fmtDate(data.periodEnd)}`
                  : ""}
              </Text>
            </View>
            <Text style={styles.cellQty}>1</Text>
            <Text style={styles.cellAmt}>
              {money(data.amountCents, data.currency)}
            </Text>
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totalsRow}>
          <View style={styles.totalsSpacer} />
          <Text style={styles.totalsLabel}>Subtotal</Text>
          <Text style={styles.totalsValue}>
            {money(data.amountCents, data.currency)}
          </Text>
        </View>
        {data.business.hasGst ? (
          <View style={styles.totalsRow}>
            <View style={styles.totalsSpacer} />
            <Text style={styles.totalsLabel}>GST</Text>
            <Text style={styles.totalsValue}>—</Text>
          </View>
        ) : null}
        <View style={styles.totalsGrand}>
          <View style={styles.totalsSpacer} />
          <Text style={styles.totalsGrandLabel}>Total {data.currency}</Text>
          <Text style={styles.totalsGrandValue}>
            {money(data.amountCents, data.currency)}
          </Text>
        </View>

        {/* Payment block */}
        {isPaid ? (
          <View style={styles.paymentBlock}>
            <Text style={styles.paymentLabel}>Payment details</Text>
            <Text style={styles.paymentLine}>
              Settled via Razorpay
              {data.paidAt ? ` on ${fmtDate(data.paidAt)}` : ""}.
            </Text>
            {data.razorpayPaymentId ? (
              <Text style={[styles.paymentLine, styles.paymentMono]}>
                Payment ID: {data.razorpayPaymentId}
              </Text>
            ) : null}
            {data.razorpayInvoiceId ? (
              <Text style={[styles.paymentLine, styles.paymentMono]}>
                Reference: {data.razorpayInvoiceId}
              </Text>
            ) : null}
          </View>
        ) : null}

        {/* Footer */}
        <Text style={styles.footer} fixed>
          {data.business.legalName} · {data.business.website} ·{" "}
          {data.business.supportEmail}
          {!data.business.hasGst
            ? "  ·  Bill of Supply (issuer not registered for GST)"
            : ""}
        </Text>
      </Page>
    </Document>
  );
}

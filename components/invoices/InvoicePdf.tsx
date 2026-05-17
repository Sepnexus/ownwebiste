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
import { currencyDecimals } from "@/lib/currencies";

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
/** One billable row on an invoice. */
export type InvoiceLineItem = {
  description: string;
  /** Optional small subtitle under the description. */
  detail?: string | null;
  quantity: number;
  /** Unit price in the currency's smallest unit. */
  unitAmountMinor: number;
};

export type InvoicePdfData = {
  invoiceNumber: string;
  issuedAt: Date;
  paidAt: Date | null;
  /** "paid" gets the PAID badge; anything else renders plain. */
  status: string;
  currency: string;
  amountCents: number;
  /** Billable rows. Subscription invoices pass exactly one. */
  lineItems: InvoiceLineItem[];
  periodStart: Date | null;
  periodEnd: Date | null;
  razorpayPaymentId: string | null;
  razorpayInvoiceId: string | null;
  /** Optional free-text note shown below the totals. */
  notes?: string | null;
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
    marginBottom: 32,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 32, height: 32 },
  brandText: { fontFamily: "Times-Italic", fontSize: 22, color: COLORS.ink },
  metaRight: { textAlign: "right", alignItems: "flex-end" },
  invoiceLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    letterSpacing: 1.4,
    color: COLORS.muted,
    marginBottom: 4,
  },
  // The invoice number is the hero — large, monospace, dark.
  invoiceNumberBig: {
    fontFamily: "Courier-Bold",
    fontSize: 18,
    color: COLORS.ink,
    letterSpacing: 0.4,
  },
  // Two-column "from / billed to"
  partyGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    gap: 32,
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
  // Single-row date strip below the parties
  dateStrip: {
    flexDirection: "row",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    marginBottom: 24,
    fontSize: 10,
  },
  dateItem: { flexDirection: "row", marginRight: 18 },
  dateLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: COLORS.muted,
    marginRight: 6,
    paddingTop: 1,
  },
  dateValue: { fontSize: 10, color: COLORS.ink },
  // Status pill (top right)
  statusPaid: {
    backgroundColor: COLORS.paidBg,
    color: COLORS.paidInk,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    marginTop: 8,
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
  // Footer — single line, minimal. No legal-name / website / GST repetition.
  footer: {
    position: "absolute",
    left: 48,
    right: 48,
    bottom: 36,
    paddingTop: 12,
    fontSize: 9,
    color: COLORS.muted,
    textAlign: "center",
  },
});

// -- Helpers -----------------------------------------------------------------
// PDF fonts can't render every currency glyph (Helvetica has no €, ¥, ₹, …),
// so we deliberately stay ASCII-safe: $ and Rs. get symbols, everything else
// is shown with the ISO code suffix. Decimal count respects the currency.
function money(minor: number, currency: string): string {
  const decimals = currencyDecimals(currency);
  const major = minor / 10 ** decimals;
  const amount = major.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  if (currency === "USD") return `$${amount}`;
  if (currency === "INR") return `Rs.${amount}`;
  return `${amount} ${currency}`;
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
      subject={`Invoice ${data.invoiceNumber}`}
    >
      <Page size="A4" style={styles.page}>
        {/* Header — invoice number is the hero, "Invoice" demoted to a label. */}
        <View style={styles.header}>
          <View>
            <View style={styles.brandRow}>
              {logo ? <Image src={logo} style={styles.logo} /> : null}
              <Text style={styles.brandText}>Sepnexus</Text>
            </View>
          </View>
          <View style={styles.metaRight}>
            <Text style={styles.invoiceLabel}>
              {data.business.hasGst ? "TAX INVOICE" : "INVOICE"}
            </Text>
            <Text style={styles.invoiceNumberBig}>{data.invoiceNumber}</Text>
            {isPaid ? <Text style={styles.statusPaid}>PAID</Text> : null}
          </View>
        </View>

        {/* From / Billed to — two columns. Dates moved to a strip below. */}
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
            {(() => {
              const cityState = [
                data.business.address.city,
                data.business.address.state,
              ]
                .filter(Boolean)
                .join(", ");
              return cityState ? (
                <Text style={styles.partyLine}>{cityState}</Text>
              ) : null;
            })()}
            {(() => {
              const pinCountry = [
                data.business.address.pincode,
                data.business.address.country,
              ]
                .filter(Boolean)
                .join(" ");
              return pinCountry ? (
                <Text style={styles.partyLine}>{pinCountry}</Text>
              ) : null;
            })()}
            <Text style={[styles.partyMuted, { marginTop: 6 }]}>
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
        </View>

        {/* Date strip — Issued · Paid · Period in one tidy row. */}
        <View style={styles.dateStrip}>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>ISSUED</Text>
            <Text style={styles.dateValue}>{fmtDate(data.issuedAt)}</Text>
          </View>
          {data.paidAt ? (
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>PAID</Text>
              <Text style={styles.dateValue}>{fmtDate(data.paidAt)}</Text>
            </View>
          ) : null}
          {data.periodStart && data.periodEnd ? (
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>PERIOD</Text>
              <Text style={styles.dateValue}>
                {fmtDate(data.periodStart)} – {fmtDate(data.periodEnd)}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Line items */}
        <View style={styles.table}>
          <View style={styles.tr}>
            <Text style={[styles.cellDesc, styles.thLabel]}>Description</Text>
            <Text style={[styles.cellQty, styles.thLabel]}>Qty</Text>
            <Text style={[styles.cellAmt, styles.thLabel]}>Amount</Text>
          </View>
          {data.lineItems.map((item, i) => {
            const lineTotal = item.quantity * item.unitAmountMinor;
            // Show the unit price as a subtitle when qty isn't 1.
            const detail =
              item.detail ??
              (item.quantity !== 1
                ? `${item.quantity} × ${money(item.unitAmountMinor, data.currency)}`
                : null);
            return (
              <View style={styles.tr} key={i}>
                <View style={styles.cellDesc}>
                  <Text style={styles.itemTitle}>{item.description}</Text>
                  {detail ? (
                    <Text style={styles.itemPeriod}>{detail}</Text>
                  ) : null}
                </View>
                <Text style={styles.cellQty}>{item.quantity}</Text>
                <Text style={styles.cellAmt}>
                  {money(lineTotal, data.currency)}
                </Text>
              </View>
            );
          })}
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
              {data.razorpayPaymentId
                ? `Settled via Razorpay${data.paidAt ? ` on ${fmtDate(data.paidAt)}` : ""}.`
                : `Marked paid${data.paidAt ? ` on ${fmtDate(data.paidAt)}` : ""}.`}
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

        {/* Notes */}
        {data.notes ? (
          <View style={{ marginTop: 20 }}>
            <Text style={styles.paymentLabel}>Notes</Text>
            <Text style={{ fontSize: 9, color: COLORS.ink }}>{data.notes}</Text>
          </View>
        ) : null}

        {/* Footer — minimal, single line. */}
        <Text style={styles.footer} fixed>
          Thank you for using Sepnexus. Questions? {data.business.supportEmail}
        </Text>
      </Page>
    </Document>
  );
}

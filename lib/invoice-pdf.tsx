import { renderToBuffer } from "@react-pdf/renderer";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { InvoicePdf, type InvoicePdfData } from "@/components/invoices/InvoicePdf";
import {
  BUSINESS,
  buildBusinessSnapshot,
  buildBillingSnapshot,
  type BillingSnapshot,
  type BusinessSnapshot,
} from "@/lib/business";

/**
 * Hydrate an invoice row into the shape the PDF component expects. Resolves
 * snapshots if present, otherwise falls back to the live values (handles invoices
 * created before snapshot columns existed).
 */
export async function loadInvoicePdfData(invoiceId: string): Promise<InvoicePdfData | null> {
  const [row] = await db
    .select({
      inv: schema.invoices,
      user: schema.users,
      sub: schema.subscriptions,
      plan: schema.pricingPlans,
    })
    .from(schema.invoices)
    .leftJoin(schema.users, eq(schema.users.id, schema.invoices.userId))
    .leftJoin(
      schema.subscriptions,
      eq(schema.subscriptions.id, schema.invoices.subscriptionId),
    )
    .leftJoin(
      schema.pricingPlans,
      eq(schema.pricingPlans.id, schema.subscriptions.planId),
    )
    .where(eq(schema.invoices.id, invoiceId))
    .limit(1);

  if (!row || !row.user) return null;
  const { inv, user, sub, plan } = row;

  const businessSnap =
    (inv.businessSnapshot as BusinessSnapshot | null) ??
    buildBusinessSnapshot({
      planName: plan?.name ?? "Subscription",
      planPeriod: (sub?.period as "monthly" | "yearly") ?? "monthly",
    });

  const billingSnap =
    (inv.billingSnapshot as BillingSnapshot | null) ?? buildBillingSnapshot(user);

  const planName = businessSnap.planName || plan?.name || "Subscription";
  const planPeriod = businessSnap.planPeriod || sub?.period || "monthly";

  return {
    invoiceNumber: inv.invoiceNumber ?? `DRAFT-${inv.id.slice(0, 8)}`,
    issuedAt: inv.createdAt,
    paidAt: inv.paidAt,
    status: inv.status,
    currency: inv.currency,
    amountCents: inv.amountCents,
    // Subscription invoices are always a single billable line.
    lineItems: [
      {
        description: planName,
        detail:
          planPeriod === "yearly" ? "Yearly subscription" : "Monthly subscription",
        quantity: 1,
        unitAmountMinor: inv.amountCents,
      },
    ],
    periodStart: inv.periodStart,
    periodEnd: inv.periodEnd,
    razorpayPaymentId: inv.razorpayPaymentId,
    razorpayInvoiceId: inv.razorpayInvoiceId,
    notes: null,
    business: businessSnap,
    billing: billingSnap,
  };
}

/** A manual-invoice line item as stored in manual_invoices.line_items. */
export type ManualLineItem = {
  description: string;
  quantity: number;
  unitAmountMinor: number;
};

/**
 * Hydrate a manual (admin-generated) invoice into InvoicePdfData. Manual
 * invoices have no subscription/user — the buyer is free-form.
 */
export async function loadManualInvoicePdfData(
  id: string,
): Promise<InvoicePdfData | null> {
  const [row] = await db
    .select()
    .from(schema.manualInvoices)
    .where(eq(schema.manualInvoices.id, id))
    .limit(1);
  if (!row) return null;

  const businessSnap =
    (row.businessSnapshot as BusinessSnapshot | null) ??
    buildBusinessSnapshot({ planName: "", planPeriod: "monthly" });

  const items = (row.lineItems as ManualLineItem[]) ?? [];
  const addr = (row.buyerAddress as Record<string, string> | null) ?? undefined;

  return {
    invoiceNumber: row.invoiceNumber,
    issuedAt: row.issuedAt,
    paidAt: row.paidAt,
    status: row.status,
    currency: row.currency,
    amountCents: row.amountCents,
    lineItems: items.map((it) => ({
      description: it.description,
      quantity: it.quantity,
      unitAmountMinor: it.unitAmountMinor,
    })),
    periodStart: null,
    periodEnd: null,
    razorpayPaymentId: null,
    razorpayInvoiceId: null,
    notes: row.notes,
    business: businessSnap,
    billing: {
      name: row.buyerName,
      email: row.buyerEmail ?? "",
      address: addr,
    },
  };
}

/** Render the invoice PDF to a Buffer (for attaching to emails or streaming). */
export async function renderInvoicePdf(data: InvoicePdfData): Promise<Buffer> {
  return await renderToBuffer(<InvoicePdf data={data} />);
}

/** Build a filename like SEP-2026-0001.pdf, safe for attachments + downloads. */
export function invoiceFilename(data: InvoicePdfData): string {
  const safe = data.invoiceNumber.replace(/[^A-Z0-9_\-]/gi, "_");
  return `${safe}.pdf`;
}

/** Public URL we host the invoice at, for use in receipts + the dashboard. */
export function invoicePublicUrl(invoiceId: string): string {
  const base = (process.env.APP_URL ?? "https://sepnexus.com").replace(/\/$/, "");
  return `${base}/dashboard/invoices/${invoiceId}`;
}

/** Re-export so callers don't need a second import. */
export { BUSINESS };

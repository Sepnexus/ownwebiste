import { db, schema } from "./db";
import { eq } from "drizzle-orm";
import { allocateInvoiceNumber } from "./invoice-number";
import { buildBusinessSnapshot } from "./business";
import { isSupportedCurrency, toMinorUnits } from "./currencies";

/** A line item as the admin enters it — unit price in MAJOR units (e.g. 99.50). */
export type ManualLineItemInput = {
  description: string;
  quantity: number;
  unitAmount: number;
};

export type CreateManualInvoiceInput = {
  buyerName: string;
  buyerEmail?: string | null;
  buyerAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  } | null;
  currency: string;
  lineItems: ManualLineItemInput[];
  notes?: string | null;
  createdBy: string;
};

export type CreateManualInvoiceResult =
  | { ok: true; id: string; invoiceNumber: string }
  | { ok: false; error: string };

/**
 * Create a one-off manual invoice. Validates input, converts each line's unit
 * price into the currency's smallest unit, allocates a sequential number from
 * the shared invoice_counters, and snapshots the Sepnexus business profile.
 */
export async function createManualInvoice(
  input: CreateManualInvoiceInput,
): Promise<CreateManualInvoiceResult> {
  const buyerName = input.buyerName.trim();
  if (!buyerName) return { ok: false, error: "Buyer name is required." };

  const currency = (input.currency || "USD").trim().toUpperCase();
  if (!isSupportedCurrency(currency)) {
    return { ok: false, error: `Unsupported currency: ${currency}` };
  }

  if (!input.lineItems || input.lineItems.length === 0) {
    return { ok: false, error: "Add at least one line item." };
  }

  // Validate + normalise line items into the stored (minor-unit) shape.
  const items: Array<{
    description: string;
    quantity: number;
    unitAmountMinor: number;
  }> = [];
  for (const raw of input.lineItems) {
    const description = (raw.description ?? "").trim();
    if (!description) return { ok: false, error: "Every line item needs a description." };
    const quantity = Number(raw.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return { ok: false, error: `Invalid quantity for "${description}".` };
    }
    const unitAmount = Number(raw.unitAmount);
    if (!Number.isFinite(unitAmount) || unitAmount < 0) {
      return { ok: false, error: `Invalid amount for "${description}".` };
    }
    items.push({
      description,
      quantity,
      unitAmountMinor: toMinorUnits(unitAmount, currency),
    });
  }

  const amountCents = items.reduce(
    (sum, it) => sum + it.quantity * it.unitAmountMinor,
    0,
  );
  if (amountCents <= 0) {
    return { ok: false, error: "Invoice total must be greater than zero." };
  }

  const invoiceNumber = await allocateInvoiceNumber();
  const businessSnapshot = buildBusinessSnapshot({
    planName: "",
    planPeriod: "monthly",
  });

  const buyerAddress =
    input.buyerAddress &&
    Object.values(input.buyerAddress).some((v) => (v ?? "").trim())
      ? input.buyerAddress
      : null;

  const [row] = await db
    .insert(schema.manualInvoices)
    .values({
      invoiceNumber,
      buyerName,
      buyerEmail: input.buyerEmail?.trim() || null,
      buyerAddress,
      lineItems: items,
      notes: input.notes?.trim() || null,
      currency,
      amountCents,
      status: "unpaid",
      businessSnapshot,
      createdBy: input.createdBy,
    })
    .returning({ id: schema.manualInvoices.id });

  return { ok: true, id: row.id, invoiceNumber };
}

/** Flip a manual invoice to paid (idempotent — re-marking is a no-op). */
export async function markManualInvoicePaid(id: string): Promise<boolean> {
  const [row] = await db
    .select({ status: schema.manualInvoices.status })
    .from(schema.manualInvoices)
    .where(eq(schema.manualInvoices.id, id))
    .limit(1);
  if (!row) return false;
  if (row.status === "paid") return true;

  await db
    .update(schema.manualInvoices)
    .set({ status: "paid", paidAt: new Date(), updatedAt: new Date() })
    .where(eq(schema.manualInvoices.id, id));
  return true;
}

/** Flip a paid manual invoice back to unpaid (correction tool). */
export async function markManualInvoiceUnpaid(id: string): Promise<boolean> {
  const [row] = await db
    .select({ id: schema.manualInvoices.id })
    .from(schema.manualInvoices)
    .where(eq(schema.manualInvoices.id, id))
    .limit(1);
  if (!row) return false;

  await db
    .update(schema.manualInvoices)
    .set({ status: "unpaid", paidAt: null, updatedAt: new Date() })
    .where(eq(schema.manualInvoices.id, id));
  return true;
}

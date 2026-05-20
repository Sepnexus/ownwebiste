/**
 * Sepnexus business profile. Used on invoices, emails, legal pages.
 *
 * This is snapshotted into invoice rows at issue time (see lib/billing.ts), so
 * editing values here does NOT alter past invoices — they keep their original
 * legal name / address. Only new invoices pick up the change.
 *
 * Update this file (and ship a deploy) when:
 *  - You incorporate / change registered office
 *  - You register for GST → set `gstin` and `hasGst = true`
 *  - You want a different support email on the invoice
 */
export const BUSINESS = {
  legalName: "Sepnexus OPC Pvt Ltd",
  /**
   * Address shown on the invoice. Keep concise — these get joined into one
   * compact block. Leave line1 empty until you have a street address;
   * "Chandigarh, India" is fine on its own.
   */
  address: {
    line1: "",
    line2: "",
    city: "Chandigarh",
    state: "", // Chandigarh is a Union Territory — no separate state line
    pincode: "",
    country: "India",
  },
  /** Customer-facing support email shown on invoice + receipts. */
  supportEmail: "akshay@sepnexus.com",
  website: "sepnexus.com",
  /** Set when you register for GST. Until then invoices show "Bill of Supply". */
  gstin: null as string | null,
  hasGst: false as boolean,
  /** Prefix for sequential invoice numbers. */
  invoicePrefix: "SEP",
} as const;

export type BusinessSnapshot = {
  legalName: string;
  address: typeof BUSINESS.address;
  supportEmail: string;
  website: string;
  gstin: string | null;
  hasGst: boolean;
  planName: string;
  planPeriod: "monthly" | "yearly";
};

/**
 * Build the immutable snapshot we store on every invoice. Pass plan info because
 * plan rows are mutable — we want to freeze what the customer was billed for.
 */
export function buildBusinessSnapshot(args: {
  planName: string;
  planPeriod: "monthly" | "yearly";
}): BusinessSnapshot {
  return {
    legalName: BUSINESS.legalName,
    address: { ...BUSINESS.address },
    supportEmail: BUSINESS.supportEmail,
    website: BUSINESS.website,
    gstin: BUSINESS.gstin,
    hasGst: BUSINESS.hasGst,
    planName: args.planName,
    planPeriod: args.planPeriod,
  };
}

export type BillingSnapshot = {
  name: string | null;
  email: string;
  /** Optional — we don't collect customer billing addresses yet. */
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
};

export function buildBillingSnapshot(user: {
  name: string | null;
  email: string;
}): BillingSnapshot {
  return { name: user.name, email: user.email };
}

/** Format an address into a single multi-line string. */
export function formatAddress(addr: {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}): string {
  const parts = [
    addr.line1,
    addr.line2,
    [addr.city, addr.state].filter(Boolean).join(", "),
    [addr.pincode, addr.country].filter(Boolean).join(" "),
  ].filter(Boolean);
  return parts.join("\n");
}

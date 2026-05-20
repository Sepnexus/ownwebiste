import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createManualInvoice } from "@/lib/manual-invoice";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  buyerName: z.string().trim().min(1).max(160),
  buyerEmail: z.string().trim().email().max(200).optional().or(z.literal("")),
  buyerAddress: z
    .object({
      line1: z.string().trim().max(200).optional(),
      line2: z.string().trim().max(200).optional(),
      city: z.string().trim().max(120).optional(),
      state: z.string().trim().max(120).optional(),
      pincode: z.string().trim().max(40).optional(),
      country: z.string().trim().max(120).optional(),
    })
    .optional()
    .nullable(),
  currency: z.string().trim().min(3).max(3),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  lineItems: z
    .array(
      z.object({
        description: z.string().trim().min(1).max(300),
        quantity: z.coerce.number().positive().max(1_000_000),
        unitAmount: z.coerce.number().min(0).max(100_000_000),
      }),
    )
    .min(1)
    .max(50),
});

/** POST /api/admin/invoices/manual — create a one-off manual invoice. */
export async function POST(req: Request) {
  const admin = await requireAdmin();

  let parsed: z.infer<typeof Body>;
  try {
    parsed = Body.parse(await req.json());
  } catch (e) {
    const msg =
      e instanceof z.ZodError
        ? (e.issues[0]?.message ?? "Invalid input")
        : "Invalid request body";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }

  const result = await createManualInvoice({
    buyerName: parsed.buyerName,
    buyerEmail: parsed.buyerEmail || null,
    buyerAddress: parsed.buyerAddress ?? null,
    currency: parsed.currency,
    lineItems: parsed.lineItems,
    notes: parsed.notes || null,
    createdBy: admin.id,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  void audit({
    actor: { userId: admin.id, email: admin.email },
    action: "manual_invoice.create",
    targetType: "manual_invoice",
    targetId: result.id,
    details: { invoiceNumber: result.invoiceNumber, currency: parsed.currency },
  });

  return NextResponse.json({
    ok: true,
    id: result.id,
    invoiceNumber: result.invoiceNumber,
  });
}

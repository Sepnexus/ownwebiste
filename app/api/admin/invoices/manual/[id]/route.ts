import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { markManualInvoicePaid, markManualInvoiceUnpaid } from "@/lib/manual-invoice";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ status: z.enum(["paid", "unpaid"]) });

/**
 * PATCH /api/admin/invoices/manual/:id — flip a manual invoice's paid status.
 * Body: { status: "paid" | "unpaid" }
 */
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  const { id } = await ctx.params;

  let parsed: z.infer<typeof Body>;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const ok =
    parsed.status === "paid"
      ? await markManualInvoicePaid(id)
      : await markManualInvoiceUnpaid(id);

  if (!ok) {
    return NextResponse.json({ ok: false, error: "Invoice not found" }, { status: 404 });
  }

  void audit({
    actor: { userId: admin.id, email: admin.email },
    action: parsed.status === "paid" ? "manual_invoice.mark_paid" : "manual_invoice.mark_unpaid",
    targetType: "manual_invoice",
    targetId: id,
  });

  return NextResponse.json({ ok: true, status: parsed.status });
}

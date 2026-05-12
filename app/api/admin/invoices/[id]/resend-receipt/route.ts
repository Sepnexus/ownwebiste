import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { sendInvoiceReceipt } from "@/lib/billing";

/**
 * POST /api/admin/invoices/:id/resend-receipt
 *
 * Re-fires the Sepnexus-branded receipt email (with PDF attached) for an
 * existing invoice. Idempotent — sends another email each time. Admin-only.
 */
export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  await requireAdmin();

  const { id } = await ctx.params;
  const [row] = await db
    .select({ inv: schema.invoices, sub: schema.subscriptions })
    .from(schema.invoices)
    .leftJoin(
      schema.subscriptions,
      eq(schema.subscriptions.id, schema.invoices.subscriptionId),
    )
    .where(eq(schema.invoices.id, id))
    .limit(1);

  if (!row || !row.sub) {
    return NextResponse.json({ ok: false, error: "Invoice not found" }, { status: 404 });
  }
  if (row.inv.status !== "paid") {
    return NextResponse.json(
      { ok: false, error: "Receipt is only sent for paid invoices" },
      { status: 400 },
    );
  }

  try {
    await sendInvoiceReceipt(row.sub, row.inv.id, {
      rzpInvoiceId: row.inv.razorpayInvoiceId ?? undefined,
      rzpShortUrl: row.inv.razorpayShortUrl,
      amountCents: row.inv.amountCents,
      currency: row.inv.currency,
      periodEnd: row.inv.periodEnd,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[admin] resend-receipt failed:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  loadManualInvoicePdfData,
  renderInvoicePdf,
  invoiceFilename,
} from "@/lib/invoice-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/invoices/manual/:id/pdf — stream a manual invoice's PDF.
 *
 * Admin-only: manual invoices have no customer account attached, so there's
 * no customer-facing access path. ?download=1 forces a Save dialog.
 */
export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  await requireAdmin();

  const { id } = await ctx.params;
  const data = await loadManualInvoicePdfData(id);
  if (!data) return new NextResponse("Not found", { status: 404 });

  const pdf = await renderInvoicePdf(data);
  const wantsDownload = new URL(req.url).searchParams.get("download") === "1";

  return new NextResponse(pdf as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(pdf.length),
      "Content-Disposition": `${wantsDownload ? "attachment" : "inline"}; filename="${invoiceFilename(data)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

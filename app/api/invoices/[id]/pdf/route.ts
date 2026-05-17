import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import {
  loadInvoicePdfData,
  renderInvoicePdf,
  invoiceFilename,
} from "@/lib/invoice-pdf";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

/**
 * GET /api/invoices/:id/pdf
 *
 * Streams a Sepnexus-branded PDF invoice. Auth-gated: the customer who owns the
 * invoice OR any admin can fetch it. Anyone else gets 404 (not 403, to avoid
 * leaking the existence of invoice IDs).
 *
 * ?download=1 → Content-Disposition: attachment (triggers Save dialog)
 * default     → inline (renders in the browser tab)
 */
export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const me = await currentUser();
  if (!me) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await ctx.params;

  // Ownership check first — cheap query before we render anything.
  const [row] = await db
    .select({ userId: schema.invoices.userId, number: schema.invoices.invoiceNumber })
    .from(schema.invoices)
    .where(eq(schema.invoices.id, id))
    .limit(1);
  if (!row) return new NextResponse("Not found", { status: 404 });
  if (me.role !== "admin" && row.userId !== me.id) {
    return new NextResponse("Not found", { status: 404 });
  }

  const data = await loadInvoicePdfData(id);
  if (!data) return new NextResponse("Not found", { status: 404 });

  const pdf = await renderInvoicePdf(data);
  const url = new URL(req.url);
  const wantsDownload = url.searchParams.get("download") === "1";
  const filename = invoiceFilename(data);

  return new NextResponse(pdf as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(pdf.length),
      "Content-Disposition": `${wantsDownload ? "attachment" : "inline"}; filename="${filename}"`,
      "Cache-Control": "private, max-age=60",
    },
  });
}

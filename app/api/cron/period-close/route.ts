import { closeBillingPeriods } from "@/lib/usage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Periodically called by a system cron (every hour or so). Finds usage_counters
 * whose period has ended but not been closed, computes overage in whole-1k
 * buckets, posts a Razorpay subscription addon for the overage, and marks the
 * counter `closed_at`.
 *
 * Auth: `Authorization: Bearer $CRON_SECRET`. Returns a JSON summary.
 */
export async function POST(req: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected || expected.length < 16) {
    return Response.json({ error: "CRON_SECRET not configured" }, { status: 503 });
  }
  const auth = req.headers.get("authorization") ?? "";
  const presented = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (presented !== expected) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await closeBillingPeriods({ cutoff: new Date() });
  return Response.json({ ok: true, ...result });
}

// Allow GET too so curl/cron without -X POST works the same.
export const GET = POST;

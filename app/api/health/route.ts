import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Liveness + DB readiness probe. Returns 200 only when Postgres is reachable.
 * Suitable for Better Stack / UptimeRobot / Hostinger uptime monitors.
 */
export async function GET() {
  const t0 = Date.now();
  try {
    await db.execute(sql`SELECT 1`);
    return Response.json(
      {
        ok: true,
        service: "sepnexus-web",
        time: new Date().toISOString(),
        dbLatencyMs: Date.now() - t0,
      },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return Response.json(
      { ok: false, error: msg, time: new Date().toISOString() },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
}

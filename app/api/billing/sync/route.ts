import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { syncSubscriptionFromRazorpay } from "@/lib/billing";
import { RazorpayError } from "@/lib/razorpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ subscriptionId: z.string().uuid() });

/**
 * Pulls the live subscription state from Razorpay and reconciles our DB.
 * Customer-facing — they can hit this to refresh their dashboard if the
 * webhook hasn't landed yet (or never reaches us locally). Admin can also
 * call it from /admin/customers/[id].
 */
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in first." }, { status: 401 });

  let parsed: z.infer<typeof Body>;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  // Ownership check (or admin override)
  if (user.role !== "admin") {
    const [sub] = await db
      .select({ id: schema.subscriptions.id })
      .from(schema.subscriptions)
      .where(
        and(
          eq(schema.subscriptions.id, parsed.subscriptionId),
          eq(schema.subscriptions.userId, user.id),
        ),
      )
      .limit(1);
    if (!sub) return Response.json({ error: "Not found." }, { status: 404 });
  }

  try {
    const result = await syncSubscriptionFromRazorpay({
      subscriptionId: parsed.subscriptionId,
    });
    return Response.json({ ok: true, ...result });
  } catch (e) {
    if (e instanceof RazorpayError) {
      return Response.json({ error: `Razorpay: ${e.message}` }, { status: 502 });
    }
    const msg = e instanceof Error ? e.message : "Sync failed.";
    return Response.json({ error: msg }, { status: 400 });
  }
}

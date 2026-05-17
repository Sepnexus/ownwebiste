import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { startSubscription } from "@/lib/billing";
import { RazorpayError } from "@/lib/razorpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  planId: z.string().uuid(),
  period: z.enum(["monthly", "yearly"]),
});

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in first." }, { status: 401 });
  if (user.role !== "customer" && user.role !== "admin") {
    return Response.json({ error: "Account role not permitted." }, { status: 403 });
  }

  let parsed: z.infer<typeof Body>;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const [plan] = await db
    .select()
    .from(schema.pricingPlans)
    .where(eq(schema.pricingPlans.id, parsed.planId))
    .limit(1);
  if (!plan) return Response.json({ error: "Plan not found" }, { status: 404 });
  if (!plan.visible) {
    return Response.json({ error: "Plan is not currently available" }, { status: 400 });
  }

  try {
    const result = await startSubscription({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      plan,
      period: parsed.period,
    });
    return Response.json({
      ok: true,
      subscriptionId: result.subscriptionId,
      razorpaySubscriptionId: result.razorpaySubscriptionId,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      shortUrl: result.shortUrl,
      status: result.status,
      customer: { name: user.name ?? "", email: user.email },
    });
  } catch (e) {
    if (e instanceof RazorpayError) {
      console.error("[subscribe] Razorpay error:", e);
      return Response.json(
        { error: `Razorpay: ${e.message}` },
        { status: 502 },
      );
    }
    const msg = e instanceof Error ? e.message : "Subscribe failed.";
    return Response.json({ error: msg }, { status: 400 });
  }
}

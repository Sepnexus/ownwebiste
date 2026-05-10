import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { ensureRazorpayPlanId } from "@/lib/billing";
import { RazorpayError } from "@/lib/razorpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ planId: z.string().uuid() });

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user || user.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
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

  try {
    const monthly = plan.priceMonthlyUsd > 0
      ? await ensureRazorpayPlanId(plan, "monthly")
      : null;
    const yearly = plan.priceYearlyUsd > 0
      ? await ensureRazorpayPlanId(plan, "yearly")
      : null;
    return Response.json({ ok: true, monthly, yearly });
  } catch (e) {
    if (e instanceof RazorpayError) {
      return Response.json({ error: e.message }, { status: 502 });
    }
    const msg = e instanceof Error ? e.message : "Sync failed";
    return Response.json({ error: msg }, { status: 400 });
  }
}

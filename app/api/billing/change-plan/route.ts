import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { changeUserPlan } from "@/lib/billing";
import { RazorpayError } from "@/lib/razorpay";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  subscriptionId: z.string().uuid(),
  newPlanId: z.string().uuid(),
  newPeriod: z.enum(["monthly", "yearly"]),
});

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in first." }, { status: 401 });

  let parsed: z.infer<typeof Body>;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    await changeUserPlan({
      userId: user.id,
      subscriptionId: parsed.subscriptionId,
      newPlanId: parsed.newPlanId,
      newPeriod: parsed.newPeriod,
    });
    void audit({
      actor: { userId: user.id, email: user.email },
      action: "subscription.plan_change_scheduled",
      targetType: "subscription",
      targetId: parsed.subscriptionId,
      details: { newPlanId: parsed.newPlanId, newPeriod: parsed.newPeriod },
    });
    return Response.json({
      ok: true,
      message: "Plan change scheduled for the next billing cycle.",
    });
  } catch (e) {
    if (e instanceof RazorpayError) {
      return Response.json({ error: `Razorpay: ${e.message}` }, { status: 502 });
    }
    const msg = e instanceof Error ? e.message : "Plan change failed.";
    return Response.json({ error: msg }, { status: 400 });
  }
}

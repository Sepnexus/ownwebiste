import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { cancelUserSubscription } from "@/lib/billing";
import { RazorpayError } from "@/lib/razorpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  subscriptionId: z.string().uuid(),
  atPeriodEnd: z.boolean().optional(),
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
    const updated = await cancelUserSubscription({
      userId: user.id,
      subscriptionId: parsed.subscriptionId,
      atPeriodEnd: parsed.atPeriodEnd ?? true,
    });
    return Response.json({ ok: true, status: updated.status });
  } catch (e) {
    if (e instanceof RazorpayError) {
      return Response.json({ error: `Razorpay: ${e.message}` }, { status: 502 });
    }
    const msg = e instanceof Error ? e.message : "Cancel failed.";
    return Response.json({ error: msg }, { status: 400 });
  }
}

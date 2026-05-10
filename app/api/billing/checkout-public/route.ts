import { z } from "zod";
import { eq, isNull, and } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { startSubscription } from "@/lib/billing";
import { RazorpayError } from "@/lib/razorpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public checkout: anyone can hit this with email + name + planId + period.
 *
 * 1. Looks up (or creates) a pending customer user with that email — no
 *    password yet. Refuses to create a new account if the email already
 *    belongs to an admin.
 * 2. Creates the Razorpay subscription against the chosen plan.
 * 3. Returns Checkout-friendly identifiers so the browser can open Razorpay.
 *
 * After the customer pays, our webhook handler treats the first
 * `subscription.activated` for a user without a password as the account
 * activation moment: it issues an invite token and emails the customer a
 * magic link to set their password.
 */
const Body = z.object({
  email: z.string().trim().email().max(254),
  name: z.string().trim().min(1).max(120).optional().nullable(),
  planId: z.string().uuid(),
  period: z.enum(["monthly", "yearly"]),
});

export async function POST(req: Request) {
  let parsed: z.infer<typeof Body>;
  try {
    parsed = Body.parse(await req.json());
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid input";
    return Response.json({ error: msg }, { status: 400 });
  }

  const email = parsed.email.toLowerCase();

  // Plan must exist, be visible, and not be a custom-for-someone-else plan.
  const [plan] = await db
    .select()
    .from(schema.pricingPlans)
    .where(eq(schema.pricingPlans.id, parsed.planId))
    .limit(1);
  if (!plan) return Response.json({ error: "Plan not found" }, { status: 404 });
  if (!plan.visible) {
    return Response.json({ error: "Plan is not currently available" }, { status: 400 });
  }
  if (plan.customForUserId) {
    return Response.json(
      { error: "This plan is custom for another customer." },
      { status: 403 },
    );
  }
  const synced =
    parsed.period === "monthly"
      ? plan.razorpayPlanIdMonthly
      : plan.razorpayPlanIdYearly;
  if (!synced) {
    return Response.json(
      { error: "This plan isn't configured for billing yet. Please contact us." },
      { status: 400 },
    );
  }

  // Find or create the customer.
  const [existing] = await db
    .select()
    .from(schema.users)
    .where(and(eq(schema.users.email, email), isNull(schema.users.deletedAt)))
    .limit(1);

  if (existing && existing.role === "admin") {
    return Response.json(
      { error: "That email is already used by an administrator." },
      { status: 400 },
    );
  }

  let user: typeof schema.users.$inferSelect;
  if (existing) {
    user = existing;
  } else {
    const [created] = await db
      .insert(schema.users)
      .values({
        email,
        name: parsed.name ?? null,
        role: "customer",
        // No invite/accept yet — the first successful payment activates the
        // account via the welcome email triggered from the webhook.
      })
      .returning();
    user = created;
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
      console.error("[checkout-public] Razorpay error:", e);
      return Response.json({ error: `Razorpay: ${e.message}` }, { status: 502 });
    }
    const msg = e instanceof Error ? e.message : "Subscribe failed.";
    return Response.json({ error: msg }, { status: 400 });
  }
}

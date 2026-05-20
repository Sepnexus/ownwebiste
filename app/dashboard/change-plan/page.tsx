import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { and, asc, desc, eq, isNull, or, ne } from "drizzle-orm";
import DashboardShell from "@/components/dashboard/DashboardShell";
import ChangePlanClient from "./_components/ChangePlanClient";

export const metadata: Metadata = { title: "Change plan" };
export const dynamic = "force-dynamic";

export default async function ChangePlanPage({
  searchParams,
}: {
  searchParams: Promise<{ subscriptionId?: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/login?next=/dashboard/change-plan");
  if (user.role === "admin") redirect("/admin");

  const { subscriptionId } = await searchParams;

  // Multi-sub model: each "Change plan" link from a subscription card carries
  // a ?subscriptionId=... so we know which one we're changing. If no id is
  // given, fall back to the most recent non-terminal sub (back-compat with
  // bookmarked links from the single-sub era).
  const [activeSub] = await db
    .select({ sub: schema.subscriptions, plan: schema.pricingPlans })
    .from(schema.subscriptions)
    .leftJoin(schema.pricingPlans, eq(schema.pricingPlans.id, schema.subscriptions.planId))
    .where(
      and(
        eq(schema.subscriptions.userId, user.id),
        ne(schema.subscriptions.status, "cancelled"),
        ne(schema.subscriptions.status, "expired"),
        ne(schema.subscriptions.status, "completed"),
        ne(schema.subscriptions.status, "halted"),
        ...(subscriptionId ? [eq(schema.subscriptions.id, subscriptionId)] : []),
      ),
    )
    .orderBy(desc(schema.subscriptions.createdAt))
    .limit(1);

  if (!activeSub?.sub || !activeSub.plan) {
    redirect("/dashboard");
  }

  const plans = await db
    .select()
    .from(schema.pricingPlans)
    .where(
      and(
        eq(schema.pricingPlans.visible, true),
        or(
          isNull(schema.pricingPlans.customForUserId),
          eq(schema.pricingPlans.customForUserId, user.id),
        ),
      ),
    )
    .orderBy(asc(schema.pricingPlans.category), asc(schema.pricingPlans.sortOrder));

  return (
    <DashboardShell user={{ email: user.email, name: user.name }}>
      <Link
        href="/dashboard"
        style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)", textDecoration: "none" }}
      >
        ← Dashboard
      </Link>
      <h1 style={{ marginTop: 14 }}>
        Change <em>plan.</em>
      </h1>
      <p className="lede-row">
        Switching takes effect at the end of your current billing period — no immediate charge,
        no proration confusion. Your usage and history carry forward.
      </p>
      <ChangePlanClient
        subscriptionId={activeSub.sub.id}
        currentPlanId={activeSub.plan.id}
        currentPeriod={activeSub.sub.period as "monthly" | "yearly"}
        plans={plans}
        customerId={user.id}
      />
    </DashboardShell>
  );
}

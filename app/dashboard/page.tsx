import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { asc, eq, desc } from "drizzle-orm";
import DashboardShell from "@/components/dashboard/DashboardShell";
import PlansGrid from "@/components/dashboard/PlansGrid";
import SubscriptionPanel from "@/components/dashboard/SubscriptionPanel";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ subscribed?: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/login?next=/dashboard");
  if (user.role === "admin") redirect("/admin");

  const { subscribed } = await searchParams;

  // Most recent non-terminal subscription, if any.
  const [activeSub] = await db
    .select({
      sub: schema.subscriptions,
      plan: schema.pricingPlans,
    })
    .from(schema.subscriptions)
    .leftJoin(schema.pricingPlans, eq(schema.pricingPlans.id, schema.subscriptions.planId))
    .where(eq(schema.subscriptions.userId, user.id))
    .orderBy(desc(schema.subscriptions.createdAt))
    .limit(1);

  const hasLiveSubscription =
    activeSub &&
    !["cancelled", "expired", "completed", "halted"].includes(activeSub.sub.status);

  // Plans for the upgrade/subscribe grid.
  const plans = await db
    .select()
    .from(schema.pricingPlans)
    .where(eq(schema.pricingPlans.visible, true))
    .orderBy(asc(schema.pricingPlans.category), asc(schema.pricingPlans.sortOrder));

  return (
    <DashboardShell user={{ email: user.email, name: user.name }}>
      <h1>
        Welcome back,
        <br />
        <em>{user.name?.split(" ")[0] ?? user.email.split("@")[0]}.</em>
      </h1>
      <p className="lede-row">
        {hasLiveSubscription
          ? "Your subscription is in good standing. Manage it below."
          : "Choose a plan to get started. You'll authorize the first payment with Razorpay."}
      </p>

      {subscribed === "1" && !hasLiveSubscription && (
        <div
          style={{
            background: "rgba(43,182,224,0.1)",
            border: "1px solid var(--c-cyan)",
            color: "var(--c-cyan)",
            padding: "12px 16px",
            borderRadius: 12,
            marginBottom: 24,
            fontSize: 14,
            maxWidth: 720,
          }}
        >
          Payment authorised — your subscription will activate within a minute. This page will
          refresh automatically once the webhook lands.
        </div>
      )}

      {hasLiveSubscription && activeSub.plan ? (
        <>
          <SubscriptionPanel
            subscriptionId={activeSub.sub.id}
            status={activeSub.sub.status}
            planName={activeSub.plan.name}
            period={activeSub.sub.period}
            amountUsd={
              activeSub.sub.period === "monthly"
                ? activeSub.plan.priceMonthlyUsd
                : activeSub.plan.priceYearlyUsd
            }
            nextBillingDate={
              activeSub.sub.currentPeriodEnd
                ? new Date(activeSub.sub.currentPeriodEnd).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : null
            }
            cancelAtPeriodEnd={activeSub.sub.cancelAtPeriodEnd}
          />
          <p
            style={{
              marginTop: 18,
              color: "var(--muted)",
              fontSize: 14,
            }}
          >
            Need an invoice? <Link href="/dashboard/billing">View billing history →</Link>
          </p>
        </>
      ) : (
        <PlansGrid
          plans={plans}
          customer={{ name: user.name, email: user.email }}
        />
      )}
    </DashboardShell>
  );
}

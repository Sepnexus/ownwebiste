import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { asc, eq, desc, and, or, isNull } from "drizzle-orm";
import DashboardShell from "@/components/dashboard/DashboardShell";
import PlansGrid from "@/components/dashboard/PlansGrid";
import SubscriptionPanel from "@/components/dashboard/SubscriptionPanel";
import UsagePanel from "@/components/dashboard/UsagePanel";
import { getCurrentUsageForUser } from "@/lib/usage";

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
  let [activeSub] = await db
    .select({
      sub: schema.subscriptions,
      plan: schema.pricingPlans,
    })
    .from(schema.subscriptions)
    .leftJoin(schema.pricingPlans, eq(schema.pricingPlans.id, schema.subscriptions.planId))
    .where(eq(schema.subscriptions.userId, user.id))
    .orderBy(desc(schema.subscriptions.createdAt))
    .limit(1);

  // If the sub is in a pre-active state (created/pending) AND we haven't
  // touched it recently, pull fresh state from Razorpay. This makes the
  // dashboard self-healing when webhooks haven't reached us yet (especially
  // on localhost where Razorpay can't post back).
  if (
    activeSub?.sub.razorpaySubscriptionId &&
    ["created", "pending", "authenticated"].includes(activeSub.sub.status)
  ) {
    const ageSec = (Date.now() - new Date(activeSub.sub.updatedAt).getTime()) / 1000;
    if (ageSec > 5) {
      try {
        const { syncSubscriptionFromRazorpay } = await import("@/lib/billing");
        await syncSubscriptionFromRazorpay({ subscriptionId: activeSub.sub.id });
        // Re-fetch after sync.
        const refreshed = await db
          .select({ sub: schema.subscriptions, plan: schema.pricingPlans })
          .from(schema.subscriptions)
          .leftJoin(
            schema.pricingPlans,
            eq(schema.pricingPlans.id, schema.subscriptions.planId),
          )
          .where(eq(schema.subscriptions.id, activeSub.sub.id))
          .limit(1);
        if (refreshed[0]) activeSub = refreshed[0];
      } catch (e) {
        console.error("[dashboard] auto-sync failed:", e);
      }
    }
  }

  const hasLiveSubscription =
    activeSub &&
    !["cancelled", "expired", "completed", "halted"].includes(activeSub.sub.status);

  // Plans for the upgrade/subscribe grid: every visible global plan,
  // PLUS any plan custom-issued for this customer.
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

      {/*
        Surface custom-issued plans prominently. The admin can build a one-off
        plan for this specific customer (pricing_plans.customForUserId); without
        this banner they'd only see it if they happened to visit /change-plan.
      */}
      {hasLiveSubscription &&
        (() => {
          const customOffers = plans.filter(
            (p) =>
              p.customForUserId === user.id &&
              p.id !== activeSub?.plan?.id,
          );
          if (customOffers.length === 0) return null;
          return (
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(177,73,153,0.06), rgba(43,182,224,0.04))",
                border: "1px solid var(--c-magenta)",
                borderRadius: 14,
                padding: "18px 22px",
                marginBottom: 28,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--c-magenta)",
                    marginBottom: 4,
                  }}
                >
                  Custom plan{customOffers.length > 1 ? "s" : ""} for you
                </div>
                <div style={{ fontSize: 16, color: "var(--ink)" }}>
                  We&apos;ve tailored{" "}
                  {customOffers
                    .map((p) => <strong key={p.id}>{p.name}</strong>)
                    .reduce<React.ReactNode[]>(
                      (acc, el, i) =>
                        i === 0 ? [el] : [...acc, " and ", el],
                      [],
                    )}{" "}
                  for your account.
                </div>
              </div>
              <Link
                href="/dashboard/change-plan"
                className="btn btn-solid"
                style={{ padding: "10px 16px", fontSize: 13 }}
              >
                Review &amp; switch →
              </Link>
            </div>
          );
        })()}

      {hasLiveSubscription && activeSub.plan ? (
        <>
          <UsagePanelWrapper userId={user.id} />
          <div style={{ height: 24 }} />
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
            currency={activeSub.plan.currency}
            shortUrl={activeSub.sub.shortUrl}
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
          customerId={user.id}
        />
      )}
    </DashboardShell>
  );
}

async function UsagePanelWrapper({ userId }: { userId: string }) {
  const { counter } = await getCurrentUsageForUser(userId);
  if (!counter) return null;
  return (
    <UsagePanel
      used={counter.executionsUsed}
      included={counter.executionsIncluded}
      overageUsdPer1k={counter.overageUsdPer1k}
      periodStart={counter.periodStart}
      periodEnd={counter.periodEnd}
      lastEventAt={counter.lastEventAt}
    />
  );
}

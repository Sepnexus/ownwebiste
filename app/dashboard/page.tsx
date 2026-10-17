import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { asc, eq, desc, and, or, isNull, ne } from "drizzle-orm";
import DashboardShell from "@/components/dashboard/DashboardShell";
import PlansGrid from "@/components/dashboard/PlansGrid";
import SubscriptionPanel from "@/components/dashboard/SubscriptionPanel";
import UsagePanel from "@/components/dashboard/UsagePanel";
import { getCurrentUsageForSubscription } from "@/lib/usage";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

const TERMINAL_STATUSES = ["cancelled", "expired", "completed", "halted"];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ subscribed?: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/login?next=/dashboard");
  if (user.role === "admin") redirect("/admin");

  const { subscribed } = await searchParams;

  // All non-terminal subs the customer has. Multi-sub model: a customer can
  // run several plans concurrently (different products, or repeats for
  // separate projects). Render each as its own card.
  let liveSubs = await db
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
      ),
    )
    .orderBy(desc(schema.subscriptions.createdAt));

  // Self-heal: any sub still in created/pending/authenticated that we haven't
  // touched for >5s gets a Razorpay re-sync. This both lights up real auth's
  // that the webhook missed AND expires stale failed-payment subs (>30 min in
  // created → marked expired by syncSubscriptionFromRazorpay).
  const stale = liveSubs.filter(
    (s) =>
      s.sub.razorpaySubscriptionId &&
      ["created", "pending", "authenticated"].includes(s.sub.status) &&
      (Date.now() - new Date(s.sub.updatedAt).getTime()) / 1000 > 5,
  );
  if (stale.length > 0) {
    const { syncSubscriptionFromRazorpay } = await import("@/lib/billing");
    await Promise.allSettled(
      stale.map((s) =>
        syncSubscriptionFromRazorpay({ subscriptionId: s.sub.id }),
      ),
    );
    // Re-fetch in case statuses changed (esp. created → expired).
    liveSubs = await db
      .select({ sub: schema.subscriptions, plan: schema.pricingPlans })
      .from(schema.subscriptions)
      .leftJoin(
        schema.pricingPlans,
        eq(schema.pricingPlans.id, schema.subscriptions.planId),
      )
      .where(
        and(
          eq(schema.subscriptions.userId, user.id),
          ne(schema.subscriptions.status, "cancelled"),
          ne(schema.subscriptions.status, "expired"),
          ne(schema.subscriptions.status, "completed"),
          ne(schema.subscriptions.status, "halted"),
        ),
      )
      .orderBy(desc(schema.subscriptions.createdAt));
  }

  const hasAnyLive = liveSubs.length > 0;
  // Subs still waiting on Razorpay to confirm the first payment. After
  // checkout (?subscribed=1) their cards poll the sync endpoint briefly.
  const anyAwaitingPayment = liveSubs.some((s) =>
    ["created", "pending"].includes(s.sub.status),
  );
  const justSubscribed = subscribed === "1";
  const firstName =
    user.name?.trim().split(/\s+/)[0] || user.email.split("@")[0];
  const activePlanIds = new Set(
    liveSubs.map((s) => s.plan?.id).filter(Boolean) as string[],
  );

  // Plans the customer can subscribe to next. Globally-visible plans PLUS any
  // custom plans issued for this user. We DON'T exclude their existing plans
  // here — the user wants to be able to spin up a second sub on the same plan
  // (e.g. n8n Starter for project A AND project B).
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

  // Custom plans the customer isn't subscribed to yet — surface as a banner.
  const customOffers = plans.filter(
    (p) => p.customForUserId === user.id && !activePlanIds.has(p.id),
  );

  return (
    <DashboardShell user={{ email: user.email, name: user.name }}>
      <h1>
        Welcome back,
        <br />
        <em>{firstName}.</em>
      </h1>
      <p className="lede-row">
        {hasAnyLive
          ? `You have ${liveSubs.length} active subscription${liveSubs.length === 1 ? "" : "s"}. Add another below or manage existing ones.`
          : "Choose a plan to get started. You'll authorize the first payment with Razorpay."}
      </p>

      {justSubscribed && (
        <div
          role="status"
          style={{
            background: "rgba(43,182,224,0.1)",
            border: "1px solid var(--c-cyan)",
            color: "var(--c-cyan-ink)",
            padding: "12px 16px",
            borderRadius: 12,
            marginBottom: 24,
            fontSize: 14,
            maxWidth: 720,
          }}
        >
          {anyAwaitingPayment ? (
            <>
              Payment authorised — your new subscription usually activates within a
              minute. For the next minute this page checks with Razorpay every few
              seconds and updates on its own. If it still says pending after that,
              click <em>Refresh status</em>.
            </>
          ) : (
            <>Payment authorised — thank you. Your subscriptions are listed below.</>
          )}
        </div>
      )}

      {customOffers.length > 0 && (
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
                color: "var(--c-magenta-ink)",
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
                  (acc, el, i) => (i === 0 ? [el] : [...acc, " and ", el]),
                  [],
                )}{" "}
              for your account.
            </div>
          </div>
          <a
            href="#plans"
            className="btn btn-solid"
            style={{ padding: "10px 16px", fontSize: 13 }}
          >
            See plans below ↓
          </a>
        </div>
      )}

      {/* Active subscriptions — one card per sub. */}
      {hasAnyLive && (
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ marginBottom: 16 }}>Your subscriptions</h2>
          <div style={{ display: "grid", gap: 24 }}>
            {liveSubs.map(({ sub, plan }) =>
              plan ? (
                <SubCard
                  key={sub.id}
                  sub={sub}
                  plan={plan}
                  autoRefresh={justSubscribed}
                />
              ) : null,
            )}
          </div>
          <p
            style={{
              marginTop: 14,
              color: "var(--muted)",
              fontSize: 14,
            }}
          >
            Need an invoice?{" "}
            <Link href="/dashboard/billing">View billing history →</Link>
          </p>
        </section>
      )}

      {/* Subscribe (or add another) — always visible. */}
      <section id="plans" style={{ marginTop: hasAnyLive ? 8 : 0 }}>
        <h2 style={{ marginBottom: 8 }}>
          {hasAnyLive ? "Add another subscription" : "Available plans"}
        </h2>
        <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 20 }}>
          Each subscription bills independently. You can subscribe to multiple
          plans — or even multiple copies of the same plan for separate
          projects.
        </p>
        <PlansGrid
          plans={plans}
          customer={{ name: user.name, email: user.email }}
          customerId={user.id}
        />
      </section>
    </DashboardShell>
  );
}

/** One subscription card: usage panel + sub panel. */
async function SubCard({
  sub,
  plan,
  autoRefresh,
}: {
  sub: typeof schema.subscriptions.$inferSelect;
  plan: typeof schema.pricingPlans.$inferSelect;
  /** Poll Razorpay for a status change (only acts while created/pending). */
  autoRefresh: boolean;
}) {
  const counter = await getCurrentUsageForSubscription(sub.id);
  return (
    <div
      style={{
        border: "1px solid var(--line)",
        borderRadius: 16,
        padding: 20,
        background: "rgba(255,255,255,0.5)",
      }}
    >
      {counter && (
        <>
          <UsagePanel
            used={counter.executionsUsed}
            included={counter.executionsIncluded}
            overageUsdPer1k={counter.overageUsdPer1k}
            currency={plan.currency}
            periodStart={counter.periodStart}
            periodEnd={counter.periodEnd}
            lastEventAt={counter.lastEventAt}
          />
          <div style={{ height: 20 }} />
        </>
      )}
      <SubscriptionPanel
        subscriptionId={sub.id}
        status={sub.status}
        planName={plan.name}
        period={sub.period}
        amountUsd={
          sub.period === "monthly"
            ? plan.priceMonthlyUsd
            : plan.priceYearlyUsd
        }
        currency={plan.currency}
        shortUrl={sub.shortUrl}
        nextBillingDate={
          sub.currentPeriodEnd
            ? new Date(sub.currentPeriodEnd).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : null
        }
        cancelAtPeriodEnd={sub.cancelAtPeriodEnd}
        autoRefresh={autoRefresh}
      />
    </div>
  );
}

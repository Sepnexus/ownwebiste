import type { Metadata } from "next";
import Link from "next/link";
import { db, schema } from "@/lib/db";
import { desc, eq, and, gte, isNull, sql, lt } from "drizzle-orm";

export const metadata: Metadata = { title: "Admin · Overview" };
export const dynamic = "force-dynamic";

const ACTIVE = ["authenticated", "active"] as const;

function fmtUsd(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export default async function AdminOverviewPage() {
  const now = new Date();
  const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const last7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    activeMrrRow,
    activeCustRow,
    newSubsRow,
    cancelsRow,
    revenueMonthRow,
    pendingOverageRow,
    executionsMonthRow,
    contactsRow,
    customersTotalRow,
    pendingSubsRow,
  ] = await Promise.all([
    // MRR — sum of (priceMonthly for monthly subs) + (priceYearly/12 for yearly subs)
    db
      .select({
        mrrCents: sql<number>`COALESCE(SUM(
          CASE WHEN ${schema.subscriptions.period} = 'yearly' THEN ${schema.pricingPlans.priceYearlyUsd} * 100 / 12
               ELSE ${schema.pricingPlans.priceMonthlyUsd} * 100
          END
        ), 0)::int`,
      })
      .from(schema.subscriptions)
      .leftJoin(schema.pricingPlans, eq(schema.pricingPlans.id, schema.subscriptions.planId))
      .where(sql`${schema.subscriptions.status} IN ('authenticated', 'active')`),

    // Active customers (distinct user_id)
    db
      .select({
        count: sql<number>`COUNT(DISTINCT ${schema.subscriptions.userId})::int`,
      })
      .from(schema.subscriptions)
      .where(sql`${schema.subscriptions.status} IN ('authenticated', 'active')`),

    // New subs in last 30d
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.subscriptions)
      .where(gte(schema.subscriptions.createdAt, last30)),

    // Cancellations in last 30d
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.subscriptions)
      .where(
        and(
          gte(schema.subscriptions.cancelledAt, last30),
          sql`${schema.subscriptions.cancelledAt} IS NOT NULL`,
        ),
      ),

    // Revenue this month (paid invoices in current month)
    db
      .select({
        cents: sql<number>`COALESCE(SUM(${schema.invoices.amountCents}), 0)::int`,
      })
      .from(schema.invoices)
      .where(
        and(
          eq(schema.invoices.status, "paid"),
          gte(schema.invoices.paidAt, monthStart),
        ),
      ),

    // Pending overage (computed but not yet billed — closed counters with overage_cents > 0
    // and a Razorpay addon_id, OR open counters with current usage above limit).
    db
      .select({
        cents: sql<number>`COALESCE(SUM(GREATEST(${schema.usageCounters.overageCents}, 0)), 0)::int`,
      })
      .from(schema.usageCounters)
      .where(sql`${schema.usageCounters.closedAt} IS NULL`),

    // Executions this month across all customers
    db
      .select({
        execs: sql<number>`COALESCE(SUM(${schema.usageCounters.executionsUsed}), 0)::int`,
      })
      .from(schema.usageCounters)
      .where(gte(schema.usageCounters.periodStart, monthStart)),

    // Open contact submissions
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.contacts)
      .where(isNull(schema.contacts.handledAt)),

    // Total customers
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.users)
      .where(and(eq(schema.users.role, "customer"), isNull(schema.users.deletedAt))),

    // Subs that exist in our DB but haven't reached active yet (webhook lag /
    // payment not authorized). Flagged so admin knows to click ↻ Sync on the
    // customer detail page if it sits here for too long.
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.subscriptions)
      .where(sql`${schema.subscriptions.status} IN ('created', 'pending')`),
  ]);

  const mrrCents = Number(activeMrrRow[0]?.mrrCents ?? 0);
  const arrCents = mrrCents * 12;
  const activeCustomers = Number(activeCustRow[0]?.count ?? 0);
  const newSubs30 = Number(newSubsRow[0]?.count ?? 0);
  const cancels30 = Number(cancelsRow[0]?.count ?? 0);
  const revenueMonth = Number(revenueMonthRow[0]?.cents ?? 0);
  const pendingOverage = Number(pendingOverageRow[0]?.cents ?? 0);
  const executionsMonth = Number(executionsMonthRow[0]?.execs ?? 0);
  const openContacts = Number(contactsRow[0]?.count ?? 0);
  const totalCustomers = Number(customersTotalRow[0]?.count ?? 0);
  const pendingSubs = Number(pendingSubsRow[0]?.count ?? 0);

  // Top customers by usage this month
  const topUsageRows = await db
    .select({
      userId: schema.usageCounters.userId,
      executions: schema.usageCounters.executionsUsed,
      included: schema.usageCounters.executionsIncluded,
      email: schema.users.email,
      name: schema.users.name,
    })
    .from(schema.usageCounters)
    .leftJoin(schema.users, eq(schema.users.id, schema.usageCounters.userId))
    .where(gte(schema.usageCounters.periodStart, monthStart))
    .orderBy(desc(schema.usageCounters.executionsUsed))
    .limit(5);

  // Recent activity feed: union of recent subs, recent paid invoices, recent contacts.
  const recentSubs = await db
    .select({
      sub: schema.subscriptions,
      plan: schema.pricingPlans,
      user: schema.users,
    })
    .from(schema.subscriptions)
    .leftJoin(schema.pricingPlans, eq(schema.pricingPlans.id, schema.subscriptions.planId))
    .leftJoin(schema.users, eq(schema.users.id, schema.subscriptions.userId))
    .orderBy(desc(schema.subscriptions.createdAt))
    .limit(8);

  const recentInvoices = await db
    .select({
      inv: schema.invoices,
      plan: schema.pricingPlans,
      user: schema.users,
    })
    .from(schema.invoices)
    .leftJoin(schema.subscriptions, eq(schema.subscriptions.id, schema.invoices.subscriptionId))
    .leftJoin(schema.pricingPlans, eq(schema.pricingPlans.id, schema.subscriptions.planId))
    .leftJoin(schema.users, eq(schema.users.id, schema.invoices.userId))
    .orderBy(desc(schema.invoices.createdAt))
    .limit(8);

  type ActivityItem =
    | { kind: "subscribe"; at: Date; href: string; line: string }
    | { kind: "cancel"; at: Date; href: string; line: string }
    | { kind: "payment"; at: Date; href: string; line: string };

  const activity: ActivityItem[] = [];

  for (const r of recentSubs) {
    if (!r.user || !r.plan) continue;
    activity.push({
      kind: r.sub.cancelledAt ? "cancel" : "subscribe",
      at: r.sub.cancelledAt ?? r.sub.createdAt,
      href: `/admin/customers/${r.user.id}`,
      line: r.sub.cancelledAt
        ? `${r.user.name ?? r.user.email} cancelled ${r.plan.name}`
        : `${r.user.name ?? r.user.email} started ${r.plan.name} (${r.sub.period})`,
    });
  }
  for (const r of recentInvoices) {
    if (!r.user) continue;
    if (r.inv.status !== "paid") continue;
    activity.push({
      kind: "payment",
      at: r.inv.paidAt ?? r.inv.createdAt,
      href: `/admin/customers/${r.user.id}`,
      line: `Paid ${fmtUsd(r.inv.amountCents)} · ${r.user.name ?? r.user.email} · ${r.plan?.name ?? ""}`,
    });
  }
  activity.sort((a, b) => b.at.getTime() - a.at.getTime());
  const recentActivity = activity.slice(0, 12);

  return (
    <>
      <h1>Overview</h1>
      <p className="admin-subtitle">
        Live snapshot of MRR, customers, usage and recent activity.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 36,
        }}
      >
        <Stat label="MRR" value={fmtUsd(mrrCents)} sub="Recurring monthly" accent="var(--c-magenta)" />
        <Stat label="ARR" value={fmtUsd(arrCents)} sub="MRR × 12" accent="var(--c-cyan)" />
        <Stat
          label="Active customers"
          value={activeCustomers.toLocaleString()}
          sub={`${totalCustomers} total invited`}
          accent="var(--c-yellow)"
        />
        <Stat
          label="Revenue (this month)"
          value={fmtUsd(revenueMonth)}
          sub="Paid invoices"
          accent="var(--c-orange)"
        />
        <Stat
          label="New subs (30d)"
          value={newSubs30.toLocaleString()}
          sub={`${cancels30} cancelled`}
          accent="var(--c-cyan)"
        />
        <Stat
          label="Executions (this month)"
          value={executionsMonth.toLocaleString()}
          sub="Across all customers"
          accent="var(--c-magenta)"
        />
        <Stat
          label="Pending overage"
          value={fmtUsd(pendingOverage)}
          sub="Will be billed at next close"
          accent="var(--c-red)"
        />
        <Stat
          label="Inbox"
          value={openContacts.toLocaleString()}
          sub="Open contact submissions"
          accent="var(--ink)"
        />
        {pendingSubs > 0 && (
          <Stat
            label="Pending subs"
            value={pendingSubs.toLocaleString()}
            sub="Paid but webhook not landed — click into a customer & hit ↻ Sync"
            accent="var(--c-orange)"
          />
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr",
          gap: 32,
        }}
      >
        <section>
          <h2 style={{ marginTop: 0 }}>Recent activity</h2>
          {recentActivity.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>Nothing to show yet.</p>
          ) : (
            <div
              style={{
                border: "1px solid var(--line)",
                borderRadius: 12,
                background: "rgba(255,255,255,0.6)",
                overflow: "hidden",
              }}
            >
              {recentActivity.map((a, i) => (
                <Link
                  key={i}
                  href={a.href}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "92px 1fr auto",
                    gap: 12,
                    padding: "12px 16px",
                    borderTop: i === 0 ? "none" : "1px solid var(--line)",
                    color: "var(--ink-2)",
                    textDecoration: "none",
                    fontSize: 14,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 10,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color:
                        a.kind === "subscribe"
                          ? "var(--c-cyan)"
                          : a.kind === "cancel"
                            ? "var(--c-red)"
                            : "var(--c-magenta)",
                    }}
                  >
                    {a.kind}
                  </span>
                  <span>{a.line}</span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>
                    {a.at.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 style={{ marginTop: 0 }}>Top customers by usage (this month)</h2>
          {topUsageRows.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>No usage recorded yet.</p>
          ) : (
            <div
              style={{
                border: "1px solid var(--line)",
                borderRadius: 12,
                background: "rgba(255,255,255,0.6)",
                overflow: "hidden",
              }}
            >
              {topUsageRows.map((r) => {
                const widthPct =
                  r.included > 0 ? Math.min(100, (r.executions / r.included) * 100) : 100;
                return (
                  <Link
                    key={r.userId}
                    href={`/admin/customers/${r.userId}`}
                    style={{
                      display: "block",
                      padding: "12px 16px",
                      borderTop: "1px solid var(--line)",
                      color: "var(--ink-2)",
                      textDecoration: "none",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ color: "var(--ink)", fontSize: 14 }}>
                        {r.name ?? r.email?.split("@")[0]}
                      </span>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)" }}>
                        {r.executions.toLocaleString()}
                        {r.included > 0 ? ` / ${r.included.toLocaleString()}` : ""}
                      </span>
                    </div>
                    <div
                      style={{
                        height: 4,
                        background: "rgba(20,17,16,0.06)",
                        borderRadius: 999,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${widthPct}%`,
                          height: "100%",
                          background:
                            r.included > 0 && r.executions > r.included
                              ? "linear-gradient(90deg, var(--c-yellow), var(--c-red))"
                              : "linear-gradient(90deg, var(--c-magenta), var(--c-cyan))",
                        }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 12 }}>
            <Link href="/admin/usage" style={{ color: "var(--ink-2)" }}>
              See all usage →
            </Link>
          </p>
        </section>
      </div>
    </>
  );
}

function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent: string;
}) {
  return (
    <div
      style={{
        border: "1px solid var(--line)",
        borderTop: `2px solid ${accent}`,
        borderRadius: 12,
        padding: "18px 20px",
        background: "rgba(255,255,255,0.6)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--muted)",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--serif)",
          fontSize: 28,
          letterSpacing: "-0.012em",
          color: "var(--ink)",
          lineHeight: 1.05,
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            marginTop: 4,
            fontSize: 12,
            color: "var(--muted)",
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { db, schema } from "@/lib/db";
import { desc, eq, sql, isNull } from "drizzle-orm";

export const metadata: Metadata = { title: "Admin · Usage" };
export const dynamic = "force-dynamic";

export default async function AdminUsagePage() {
  // Pull every counter that's still open (closedAt is null) — i.e. an
  // in-flight current period — sorted by % of allowance consumed.
  const rows = await db
    .select({
      counter: schema.usageCounters,
      user: schema.users,
      plan: schema.pricingPlans,
      sub: schema.subscriptions,
    })
    .from(schema.usageCounters)
    .leftJoin(schema.users, eq(schema.users.id, schema.usageCounters.userId))
    .leftJoin(schema.subscriptions, eq(schema.subscriptions.id, schema.usageCounters.subscriptionId))
    .leftJoin(schema.pricingPlans, eq(schema.pricingPlans.id, schema.subscriptions.planId))
    .where(isNull(schema.usageCounters.closedAt))
    .orderBy(desc(schema.usageCounters.lastEventAt))
    .limit(200);

  const [agg] = await db
    .select({
      live: sql<number>`count(*) FILTER (WHERE ${schema.usageCounters.closedAt} IS NULL)::int`,
      pendingClose: sql<number>`count(*) FILTER (WHERE ${schema.usageCounters.closedAt} IS NULL AND ${schema.usageCounters.periodEnd} < now())::int`,
      executionsThisMonth: sql<number>`COALESCE(sum(${schema.usageCounters.executionsUsed}) FILTER (WHERE ${schema.usageCounters.closedAt} IS NULL),0)::int`,
    })
    .from(schema.usageCounters);

  return (
    <>
      <h1>Usage</h1>
      <p className="admin-subtitle">
        Live counters per customer per billing period. Overage is computed and billed via
        Razorpay add-ons by the period-close cron.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 32,
        }}
      >
        <Stat label="Active counters" value={agg?.live?.toString() ?? "0"} accent="var(--c-cyan)" />
        <Stat
          label="Awaiting close"
          value={agg?.pendingClose?.toString() ?? "0"}
          accent="var(--c-magenta)"
        />
        <Stat
          label="Executions (open)"
          value={(agg?.executionsThisMonth ?? 0).toLocaleString()}
          accent="var(--c-yellow)"
        />
      </div>

      {rows.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No active counters. They appear when a customer subscribes and starts running workflows.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Plan</th>
              <th style={{ width: 200 }}>Period</th>
              <th style={{ width: 220 }}>Usage</th>
              <th style={{ width: 130, textAlign: "right" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ counter, user, plan }) => {
              const used = counter.executionsUsed;
              const included = counter.executionsIncluded;
              const pct = included > 0 ? Math.round((used / included) * 100) : 0;
              const over = Math.max(0, used - included);
              const status =
                included === 0
                  ? "unlimited"
                  : over > 0
                    ? "over"
                    : pct >= 80
                      ? "near limit"
                      : "ok";
              const statusColor =
                status === "over"
                  ? "var(--c-red)"
                  : status === "near limit"
                    ? "var(--c-orange)"
                    : status === "unlimited"
                      ? "var(--muted)"
                      : "var(--c-cyan)";
              return (
                <tr key={counter.id}>
                  <td>
                    <Link
                      href={`/admin/customers/${user?.id ?? ""}`}
                      style={{ color: "var(--ink)", textDecoration: "none" }}
                    >
                      <strong>{user?.name ?? user?.email?.split("@")[0]}</strong>
                      <br />
                      <span style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 12 }}>
                        {user?.email}
                      </span>
                    </Link>
                  </td>
                  <td>{plan?.name ?? "—"}</td>
                  <td style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)" }}>
                    {new Date(counter.periodStart).toLocaleDateString()}
                    <br />→ {new Date(counter.periodEnd).toLocaleDateString()}
                  </td>
                  <td>
                    <UsageBar used={used} included={included} />
                  </td>
                  <td style={{ textAlign: "right", color: statusColor, fontFamily: "var(--mono)", fontSize: 12, textTransform: "uppercase" }}>
                    {status}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
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
          letterSpacing: "-0.01em",
          color: "var(--ink)",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function UsageBar({ used, included }: { used: number; included: number }) {
  if (included === 0)
    return (
      <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)" }}>
        {used.toLocaleString()} (unlimited)
      </span>
    );
  const widthPct = Math.min(100, (used / included) * 100);
  const isOver = used > included;
  return (
    <div>
      <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink)", marginBottom: 4 }}>
        {used.toLocaleString()} / {included.toLocaleString()}
      </div>
      <div
        style={{
          height: 6,
          background: "rgba(20,17,16,0.06)",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${widthPct}%`,
            height: "100%",
            background: isOver
              ? "linear-gradient(90deg, var(--c-yellow), var(--c-red))"
              : "linear-gradient(90deg, var(--c-magenta), var(--c-cyan))",
          }}
        />
      </div>
    </div>
  );
}

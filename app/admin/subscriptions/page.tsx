import type { Metadata } from "next";
import Link from "next/link";
import { db, schema } from "@/lib/db";
import { desc, eq, sql } from "drizzle-orm";

export const metadata: Metadata = { title: "Admin · Subscriptions" };
export const dynamic = "force-dynamic";

export default async function AdminSubscriptionsPage() {
  // List subscriptions joined with user + plan.
  const rows = await db
    .select({
      sub: schema.subscriptions,
      user: schema.users,
      plan: schema.pricingPlans,
    })
    .from(schema.subscriptions)
    .leftJoin(schema.users, eq(schema.users.id, schema.subscriptions.userId))
    .leftJoin(schema.pricingPlans, eq(schema.pricingPlans.id, schema.subscriptions.planId))
    .orderBy(desc(schema.subscriptions.createdAt))
    .limit(200);

  const [counts] = await db
    .select({
      total: sql<number>`count(*)::int`,
      active: sql<number>`count(*) FILTER (WHERE ${schema.subscriptions.status} IN ('authenticated','active'))::int`,
      pending: sql<number>`count(*) FILTER (WHERE ${schema.subscriptions.status} IN ('created','pending'))::int`,
      cancelled: sql<number>`count(*) FILTER (WHERE ${schema.subscriptions.status} IN ('cancelled','expired','completed','halted'))::int`,
    })
    .from(schema.subscriptions);

  return (
    <>
      <h1>Subscriptions</h1>
      <p className="admin-subtitle">
        Razorpay-backed subscriptions across all customers. Live state is updated by webhooks.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 14,
          marginBottom: 32,
        }}
      >
        {(
          [
            ["Total", counts.total, "var(--c-cyan)"],
            ["Active", counts.active, "var(--c-magenta)"],
            ["Pending", counts.pending, "var(--c-yellow)"],
            ["Closed", counts.cancelled, "var(--muted)"],
          ] as const
        ).map(([label, value, color]) => (
          <div
            key={label}
            style={{
              border: "1px solid var(--line)",
              borderTop: `2px solid ${color}`,
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
            <div style={{ fontFamily: "var(--serif)", fontSize: 32, color: "var(--ink)" }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {rows.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No subscriptions yet.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Plan</th>
              <th style={{ width: 100 }}>Period</th>
              <th style={{ width: 110 }}>Status</th>
              <th style={{ width: 160 }}>Renews</th>
              <th style={{ width: 160, fontFamily: "var(--mono)", fontSize: 10 }}>
                Razorpay ID
              </th>
              <th style={{ width: 90, textAlign: "right" }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ sub, user, plan }) => (
              <tr key={sub.id}>
                <td>
                  {user ? (
                    <Link
                      href={`/admin/customers/${user.id}`}
                      style={{ color: "var(--ink)", textDecoration: "none" }}
                    >
                      <strong style={{ color: "var(--ink)" }}>
                        {user.name ?? user.email.split("@")[0]}
                      </strong>
                      <br />
                      <span
                        style={{
                          color: "var(--muted)",
                          fontFamily: "var(--mono)",
                          fontSize: 12,
                        }}
                      >
                        {user.email}
                      </span>
                    </Link>
                  ) : (
                    <span style={{ color: "var(--muted)" }}>—</span>
                  )}
                </td>
                <td>{plan?.name ?? "—"}</td>
                <td style={{ color: "var(--muted)" }}>{sub.period}</td>
                <td>
                  <span className={`pill ${pillFor(sub.status)}`}>{sub.status}</span>
                </td>
                <td style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)" }}>
                  {sub.currentPeriodEnd
                    ? new Date(sub.currentPeriodEnd).toLocaleDateString()
                    : "—"}
                </td>
                <td style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>
                  {sub.razorpaySubscriptionId ?? "—"}
                </td>
                <td style={{ textAlign: "right" }}>
                  {user && (
                    <Link
                      href={`/admin/customers/${user.id}`}
                      className="btn btn-outline"
                      style={{ padding: "6px 10px", fontSize: 12 }}
                    >
                      View →
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

function pillFor(status: string): string {
  if (["authenticated", "active"].includes(status)) return "live";
  if (["cancelled", "expired", "completed", "halted"].includes(status)) return "hidden";
  return "draft";
}

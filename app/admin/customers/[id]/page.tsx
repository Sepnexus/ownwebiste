import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db, schema } from "@/lib/db";
import { desc, eq, and, isNull } from "drizzle-orm";
import { getRecentCountersForUser } from "@/lib/usage";

export const metadata: Metadata = { title: "Admin · Customer" };
export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user] = await db
    .select()
    .from(schema.users)
    .where(and(eq(schema.users.id, id), isNull(schema.users.deletedAt)))
    .limit(1);
  if (!user) notFound();

  const subs = await db
    .select({
      sub: schema.subscriptions,
      plan: schema.pricingPlans,
    })
    .from(schema.subscriptions)
    .leftJoin(schema.pricingPlans, eq(schema.pricingPlans.id, schema.subscriptions.planId))
    .where(eq(schema.subscriptions.userId, user.id))
    .orderBy(desc(schema.subscriptions.createdAt))
    .limit(20);

  const invoices = await db
    .select({ inv: schema.invoices, plan: schema.pricingPlans })
    .from(schema.invoices)
    .leftJoin(schema.subscriptions, eq(schema.subscriptions.id, schema.invoices.subscriptionId))
    .leftJoin(schema.pricingPlans, eq(schema.pricingPlans.id, schema.subscriptions.planId))
    .where(eq(schema.invoices.userId, user.id))
    .orderBy(desc(schema.invoices.createdAt))
    .limit(20);

  const counters = await getRecentCountersForUser(user.id, 12);

  return (
    <>
      <Link
        href="/admin/customers"
        style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)", textDecoration: "none" }}
      >
        ← Customers
      </Link>
      <h1 style={{ marginTop: 14 }}>{user.name ?? user.email.split("@")[0]}</h1>
      <p className="admin-subtitle">
        <a href={`mailto:${user.email}`}>{user.email}</a>
        {user.invitedAt && (
          <span style={{ color: "var(--muted)" }}>
            {" "}· invited {new Date(user.invitedAt).toLocaleDateString()}
          </span>
        )}
        {user.inviteAcceptedAt && (
          <span style={{ color: "var(--c-cyan)" }}>
            {" "}· accepted {new Date(user.inviteAcceptedAt).toLocaleDateString()}
          </span>
        )}
      </p>

      <h2 style={{ marginTop: 32 }}>Subscriptions</h2>
      {subs.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>None.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Plan</th>
              <th style={{ width: 100 }}>Period</th>
              <th style={{ width: 110 }}>Status</th>
              <th style={{ width: 160 }}>Renews</th>
              <th style={{ width: 220, fontFamily: "var(--mono)", fontSize: 10 }}>Razorpay ID</th>
            </tr>
          </thead>
          <tbody>
            {subs.map(({ sub, plan }) => (
              <tr key={sub.id}>
                <td>{plan?.name ?? "—"}</td>
                <td style={{ color: "var(--muted)" }}>{sub.period}</td>
                <td>
                  <span className={`pill ${pillFor(sub.status)}`}>{sub.status}</span>
                </td>
                <td style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)" }}>
                  {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : "—"}
                </td>
                <td style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>
                  {sub.razorpaySubscriptionId ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Usage history</h2>
      {counters.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No usage recorded yet.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Period</th>
              <th style={{ width: 200 }}>Executions</th>
              <th style={{ width: 130, textAlign: "right" }}>Overage</th>
              <th style={{ width: 110 }}>State</th>
            </tr>
          </thead>
          <tbody>
            {counters.map((c) => (
              <tr key={c.id}>
                <td style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)" }}>
                  {new Date(c.periodStart).toLocaleDateString()} →{" "}
                  {new Date(c.periodEnd).toLocaleDateString()}
                </td>
                <td>
                  <span style={{ fontFamily: "var(--mono)" }}>
                    {c.executionsUsed.toLocaleString()} /{" "}
                    {c.executionsIncluded === 0 ? "∞" : c.executionsIncluded.toLocaleString()}
                  </span>
                </td>
                <td style={{ textAlign: "right", fontFamily: "var(--mono)", fontSize: 13 }}>
                  {c.overageCents != null && c.overageCents > 0
                    ? `$${(c.overageCents / 100).toFixed(2)}`
                    : "—"}
                </td>
                <td>
                  {c.closedAt ? (
                    <span className="pill draft">closed</span>
                  ) : (
                    <span className="pill live">open</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Recent invoices</h2>
      {invoices.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>None.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: 160 }}>Date</th>
              <th>Plan</th>
              <th style={{ width: 110 }}>Status</th>
              <th style={{ width: 130, textAlign: "right" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(({ inv, plan }) => (
              <tr key={inv.id}>
                <td style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)" }}>
                  {new Date(inv.createdAt).toLocaleDateString()}
                </td>
                <td>{plan?.name ?? "—"}</td>
                <td>
                  <span className={`pill ${inv.status === "paid" ? "live" : "draft"}`}>
                    {inv.status}
                  </span>
                </td>
                <td style={{ textAlign: "right", fontFamily: "var(--mono)" }}>
                  ${(inv.amountCents / 100).toFixed(2)} {inv.currency}
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

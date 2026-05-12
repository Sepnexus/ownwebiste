import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db, schema } from "@/lib/db";
import { desc, eq, and, isNull, asc } from "drizzle-orm";
import { getRecentCountersForUser } from "@/lib/usage";
import SyncSubButton from "./_components/SyncSubButton";

export const metadata: Metadata = { title: "Admin · Customer" };
export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { id } = await params;
  const { ok, error } = await searchParams;
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

  const customPlans = await db
    .select()
    .from(schema.pricingPlans)
    .where(eq(schema.pricingPlans.customForUserId, user.id))
    .orderBy(asc(schema.pricingPlans.sortOrder));

  return (
    <>
      <Link
        href="/admin/customers"
        style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)", textDecoration: "none" }}
      >
        ← Customers
      </Link>
      <h1 style={{ marginTop: 14 }}>{user.name ?? user.email.split("@")[0]}</h1>
      {ok && <div className="form-success" style={{ marginBottom: 16, maxWidth: 920 }}>{ok}</div>}
      {error && <div className="form-error" style={{ marginBottom: 16, maxWidth: 920 }}>{error}</div>}
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

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginTop: 32,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h2 style={{ margin: 0 }}>Custom plans</h2>
        <Link
          href={`/admin/pricing/new?customForUserId=${user.id}`}
          className="btn btn-solid"
          style={{ padding: "8px 14px", fontSize: 13 }}
        >
          + Create custom plan
        </Link>
      </div>
      <p style={{ color: "var(--muted)", fontSize: 13, margin: "6px 0 16px" }}>
        Plans tailored only for this customer. They appear in their dashboard but never on the
        public site. Combine n8n + SaaS in one plan if you want — set the category to whatever
        makes sense.
      </p>
      {customPlans.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No custom plans for this customer yet.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Plan</th>
              <th style={{ width: 110 }}>Category</th>
              <th style={{ width: 110, textAlign: "right" }}>Monthly</th>
              <th style={{ width: 110, textAlign: "right" }}>Yearly</th>
              <th style={{ width: 110 }}>Status</th>
              <th style={{ width: 110, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customPlans.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link href={`/admin/pricing/${p.id}`} style={{ color: "var(--ink)", textDecoration: "none" }}>
                    <strong>{p.name}</strong>
                    <br />
                    <span style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 12 }}>
                      {p.slug}
                    </span>
                  </Link>
                </td>
                <td><span className="pill">{p.category}</span></td>
                <td style={{ textAlign: "right", fontFamily: "var(--mono)" }}>${p.priceMonthlyUsd}</td>
                <td style={{ textAlign: "right", fontFamily: "var(--mono)" }}>${p.priceYearlyUsd}</td>
                <td>
                  {p.visible ? <span className="pill live">Live</span> : <span className="pill hidden">Hidden</span>}
                </td>
                <td style={{ textAlign: "right" }}>
                  <Link
                    href={`/admin/pricing/${p.id}`}
                    className="btn btn-outline"
                    style={{ padding: "6px 10px", fontSize: 12 }}
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

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
              <th style={{ width: 200, fontFamily: "var(--mono)", fontSize: 10 }}>Razorpay ID</th>
              <th style={{ width: 130, textAlign: "right" }}>Actions</th>
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
                <td style={{ textAlign: "right" }}>
                  {sub.razorpaySubscriptionId && (
                    <SyncSubButton subscriptionId={sub.id} />
                  )}
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
              <th style={{ width: 130 }}>Date</th>
              <th>Plan</th>
              <th style={{ width: 180, fontFamily: "var(--mono)", fontSize: 10 }}>Razorpay ID</th>
              <th style={{ width: 100 }}>Status</th>
              <th style={{ width: 130, textAlign: "right" }}>Amount</th>
              <th style={{ width: 110, textAlign: "right" }}>Invoice</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(({ inv, plan }) => (
              <tr key={inv.id}>
                <td style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)" }}>
                  {new Date(inv.createdAt).toLocaleDateString()}
                </td>
                <td>{plan?.name ?? "—"}</td>
                <td style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>
                  {inv.razorpayInvoiceId ?? "—"}
                </td>
                <td>
                  <span className={`pill ${inv.status === "paid" ? "live" : "draft"}`}>
                    {inv.status}
                  </span>
                </td>
                <td style={{ textAlign: "right", fontFamily: "var(--mono)" }}>
                  {inv.currency === "INR" ? "₹" : "$"}
                  {(inv.amountCents / 100).toFixed(2)} {inv.currency}
                </td>
                <td style={{ textAlign: "right" }}>
                  {inv.razorpayShortUrl ? (
                    <a
                      href={inv.razorpayShortUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline"
                      style={{ padding: "5px 10px", fontSize: 11 }}
                    >
                      Open ↗
                    </a>
                  ) : (
                    <span style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 11 }}>—</span>
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

import type { Metadata } from "next";
import Link from "next/link";
import { db, schema } from "@/lib/db";
import { desc, eq, sql, gte, and } from "drizzle-orm";
import { formatMoneyCents as fmtMoney } from "@/lib/format";

export const metadata: Metadata = { title: "Admin · Invoices" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function AdminInvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const status = sp.status ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  // Build where: search by customer email/name or razorpay id; optional status filter
  let where = sql`true`;
  if (q) {
    where = sql`(
      ${schema.invoices.razorpayInvoiceId} ILIKE ${"%" + q + "%"}
      OR EXISTS (
        SELECT 1 FROM ${schema.users}
        WHERE ${schema.users.id} = ${schema.invoices.userId}
          AND (${schema.users.email} ILIKE ${"%" + q + "%"} OR ${schema.users.name} ILIKE ${"%" + q + "%"})
      )
    )`;
  }
  if (status && ["pending", "paid", "failed", "refunded"].includes(status)) {
    where = sql`${where} AND ${schema.invoices.status} = ${status}`;
  }

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [rows, [{ total }], [paidThisMonth], [paidAllTime], manualRows] =
    await Promise.all([
      db
        .select({
          inv: schema.invoices,
          user: schema.users,
          plan: schema.pricingPlans,
        })
        .from(schema.invoices)
        .leftJoin(schema.users, eq(schema.users.id, schema.invoices.userId))
        .leftJoin(schema.subscriptions, eq(schema.subscriptions.id, schema.invoices.subscriptionId))
        .leftJoin(schema.pricingPlans, eq(schema.pricingPlans.id, schema.subscriptions.planId))
        .where(where)
        .orderBy(desc(schema.invoices.createdAt))
        .limit(PAGE_SIZE)
        .offset(offset),
      db.select({ total: sql<number>`count(*)::int` }).from(schema.invoices).where(where),
      db
        .select({ cents: sql<number>`COALESCE(SUM(${schema.invoices.amountCents}),0)::int` })
        .from(schema.invoices)
        .where(
          and(eq(schema.invoices.status, "paid"), gte(schema.invoices.paidAt, monthStart)),
        ),
      db
        .select({ cents: sql<number>`COALESCE(SUM(${schema.invoices.amountCents}),0)::int` })
        .from(schema.invoices)
        .where(eq(schema.invoices.status, "paid")),
      // Manual (admin-generated) invoices — shown in their own section, latest 50.
      db
        .select()
        .from(schema.manualInvoices)
        .orderBy(desc(schema.manualInvoices.createdAt))
        .limit(50),
    ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h1 style={{ margin: 0 }}>Invoices</h1>
        <Link
          href="/admin/invoices/new"
          className="btn btn-solid"
          style={{ padding: "9px 16px", fontSize: 13 }}
        >
          + Generate invoice
        </Link>
      </div>
      <p className="admin-subtitle">
        Subscription invoices settle automatically through Razorpay. Use
        <strong> Generate invoice</strong> for one-off billing — consulting,
        setup fees, custom work.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 32,
        }}
      >
        <Stat label="This month (paid)" value={fmtMoney(paidThisMonth.cents, "USD")} accent="var(--c-cyan)" />
        <Stat label="All time (paid)" value={fmtMoney(paidAllTime.cents, "USD")} accent="var(--c-magenta)" />
        <Stat label="Invoices on file" value={total.toLocaleString()} accent="var(--c-yellow)" />
      </div>

      {/* Manual invoices — admin-generated, one-off. */}
      {manualRows.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ marginBottom: 8 }}>Manual invoices</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 120 }}>Date</th>
                <th style={{ width: 170 }}>Invoice #</th>
                <th>Buyer</th>
                <th style={{ width: 100 }}>Status</th>
                <th style={{ width: 130, textAlign: "right" }}>Amount</th>
                <th style={{ width: 100, textAlign: "right" }}>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {manualRows.map((m) => (
                <tr key={m.id}>
                  <td style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)" }}>
                    {new Date(m.issuedAt).toLocaleDateString()}
                  </td>
                  <td>
                    <Link
                      href={`/admin/invoices/manual/${m.id}`}
                      style={{
                        color: "var(--ink)",
                        textDecoration: "none",
                        fontFamily: "var(--mono)",
                        fontSize: 12,
                      }}
                    >
                      {m.invoiceNumber}
                    </Link>
                  </td>
                  <td>
                    <strong>{m.buyerName}</strong>
                    {m.buyerEmail && (
                      <>
                        <br />
                        <span style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 12 }}>
                          {m.buyerEmail}
                        </span>
                      </>
                    )}
                  </td>
                  <td>
                    <span className={`pill ${m.status === "paid" ? "live" : "draft"}`}>
                      {m.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right", fontFamily: "var(--mono)" }}>
                    {fmtMoney(m.amountCents, m.currency)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <Link
                      href={`/admin/invoices/manual/${m.id}`}
                      className="btn btn-outline"
                      style={{ padding: "5px 10px", fontSize: 11 }}
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {rows.length > 0 || q || status ? (
        <h2 style={{ marginBottom: 8 }}>Subscription invoices</h2>
      ) : null}

      <form
        action="/admin/invoices"
        method="GET"
        style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}
      >
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by customer email, name, or Razorpay invoice id…"
          style={{
            flex: 1,
            minWidth: 260,
            padding: "10px 14px",
            border: "1px solid var(--line)",
            borderRadius: 10,
            fontFamily: "var(--sans)",
            fontSize: 14,
            background: "rgba(255,255,255,0.6)",
          }}
        />
        <select
          name="status"
          defaultValue={status}
          style={{
            padding: "10px 14px",
            border: "1px solid var(--line)",
            borderRadius: 10,
            fontFamily: "var(--sans)",
            fontSize: 14,
            background: "rgba(255,255,255,0.6)",
          }}
        >
          <option value="">All statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <button type="submit" className="btn btn-outline">
          Filter
        </button>
        {(q || status) && (
          <Link href="/admin/invoices" className="btn btn-ghost">
            Clear
          </Link>
        )}
      </form>

      {rows.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>
          {q || status ? "No matches." : "No invoices yet. They appear after the first successful charge."}
        </p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: 120 }}>Date</th>
              <th>Customer</th>
              <th>Plan</th>
              <th style={{ width: 180 }}>Invoice #</th>
              <th style={{ width: 100 }}>Status</th>
              <th style={{ width: 130, textAlign: "right" }}>Amount</th>
              <th style={{ width: 100, textAlign: "right" }}>Invoice</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ inv, user, plan }) => (
              <tr key={inv.id}>
                <td style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)" }}>
                  {new Date(inv.createdAt).toLocaleDateString()}
                </td>
                <td>
                  {user ? (
                    <Link
                      href={`/admin/customers/${user.id}`}
                      style={{ color: "var(--ink)", textDecoration: "none" }}
                    >
                      <strong>{user.name ?? user.email.split("@")[0]}</strong>
                      <br />
                      <span style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 12 }}>
                        {user.email}
                      </span>
                    </Link>
                  ) : (
                    <span style={{ color: "var(--muted)" }}>—</span>
                  )}
                </td>
                <td>{plan?.name ?? "—"}</td>
                <td>
                  <Link
                    href={`/admin/invoices/${inv.id}`}
                    style={{
                      color: "var(--ink)",
                      textDecoration: "none",
                      fontFamily: "var(--mono)",
                      fontSize: 12,
                    }}
                  >
                    {inv.invoiceNumber ?? <span style={{ color: "var(--muted)" }}>—</span>}
                  </Link>
                  {inv.razorpayInvoiceId && (
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
                      rzp: {inv.razorpayInvoiceId}
                    </div>
                  )}
                </td>
                <td>
                  <span className={`pill ${inv.status === "paid" ? "live" : inv.status === "failed" ? "hidden" : "draft"}`}>
                    {inv.status}
                  </span>
                </td>
                <td style={{ textAlign: "right", fontFamily: "var(--mono)" }}>
                  {fmtMoney(inv.amountCents, inv.currency)}
                </td>
                <td style={{ textAlign: "right" }}>
                  <Link
                    href={`/admin/invoices/${inv.id}`}
                    className="btn btn-outline"
                    style={{ padding: "5px 10px", fontSize: 11 }}
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 18,
            color: "var(--muted)",
            fontSize: 13,
          }}
        >
          <span>
            Page {page} of {totalPages} · {total.toLocaleString()} total
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            {page > 1 && (
              <Link
                href={`/admin/invoices?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ""}${status ? `&status=${status}` : ""}`}
                className="btn btn-outline"
                style={{ padding: "6px 12px", fontSize: 12 }}
              >
                ← Newer
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/invoices?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ""}${status ? `&status=${status}` : ""}`}
                className="btn btn-outline"
                style={{ padding: "6px 12px", fontSize: 12 }}
              >
                Older →
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
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
      <div style={{ fontFamily: "var(--serif)", fontSize: 28, color: "var(--ink)" }}>{value}</div>
    </div>
  );
}

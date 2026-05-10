import type { Metadata } from "next";
import Link from "next/link";
import { db, schema } from "@/lib/db";
import { desc, isNull, eq, and, sql } from "drizzle-orm";
import { inviteCustomer, resendInvite, deleteCustomer } from "./_actions";

export const metadata: Metadata = { title: "Admin · Customers" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string; q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const { error, ok } = sp;
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const baseWhere = and(
    eq(schema.users.role, "customer"),
    isNull(schema.users.deletedAt),
  );
  const where = q
    ? and(
        baseWhere,
        sql`(${schema.users.email} ILIKE ${"%" + q + "%"} OR ${schema.users.name} ILIKE ${"%" + q + "%"})`,
      )
    : baseWhere;

  const [customers, [{ total }]] = await Promise.all([
    db
      .select()
      .from(schema.users)
      .where(where)
      .orderBy(desc(schema.users.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db.select({ total: sql<number>`count(*)::int` }).from(schema.users).where(where),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <h1>Customers</h1>
      <p className="admin-subtitle">
        Invite customers by email. They&apos;ll receive a link to set a password and access their
        dashboard. Sepnexus is invitation-only.
      </p>

      {ok && (
        <div className="form-success" style={{ marginBottom: 20, maxWidth: 920 }}>
          {ok}
        </div>
      )}
      {error && (
        <div className="form-error" style={{ marginBottom: 20, maxWidth: 920 }}>
          {error}
        </div>
      )}

      <h2 style={{ marginTop: 0 }}>Invite a new customer</h2>
      <form action={inviteCustomer} className="admin-form" style={{ marginBottom: 40 }}>
        <div className="grid-2">
          <label>
            Email
            <input type="email" name="email" required placeholder="customer@example.com" />
          </label>
          <label>
            Name (optional)
            <input type="text" name="name" placeholder="Jane Doe" />
          </label>
        </div>
        <div className="actions">
          <button type="submit" className="btn btn-solid">
            Send invite →
          </button>
          <span style={{ fontFamily: "var(--sans)", fontSize: 13, color: "var(--muted)" }}>
            Token expires in 7 days. They click the link, set a password, and they&apos;re in.
          </span>
        </div>
      </form>

      <h2>All customers</h2>
      <form
        action="/admin/customers"
        method="GET"
        style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}
      >
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by email or name…"
          style={{
            flex: 1,
            minWidth: 240,
            padding: "10px 14px",
            border: "1px solid var(--line)",
            borderRadius: 10,
            fontFamily: "var(--sans)",
            fontSize: 14,
            background: "rgba(255,255,255,0.6)",
          }}
        />
        <button type="submit" className="btn btn-outline">
          Search
        </button>
        {q && (
          <Link href="/admin/customers" className="btn btn-ghost">
            Clear
          </Link>
        )}
      </form>
      {customers.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No customers yet.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th style={{ width: 130 }}>Status</th>
              <th style={{ width: 160 }}>Invited</th>
              <th style={{ width: 160 }}>Last login</th>
              <th style={{ width: 240, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => {
              const status = c.inviteAcceptedAt
                ? "active"
                : c.invitedAt
                  ? "invited"
                  : "pending";
              return (
                <tr key={c.id}>
                  <td>
                    <strong style={{ color: "var(--ink)" }}>{c.name ?? c.email.split("@")[0]}</strong>
                    <br />
                    <span style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 12 }}>
                      {c.email}
                    </span>
                  </td>
                  <td>
                    {status === "active" && <span className="pill live">Active</span>}
                    {status === "invited" && <span className="pill draft">Invited</span>}
                    {status === "pending" && <span className="pill draft">Pending</span>}
                  </td>
                  <td style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)" }}>
                    {c.invitedAt ? new Date(c.invitedAt).toLocaleDateString() : "—"}
                  </td>
                  <td style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)" }}>
                    {c.lastLoginAt ? new Date(c.lastLoginAt).toLocaleDateString() : "—"}
                  </td>
                  <td>
                    <div className="row-actions">
                      {!c.inviteAcceptedAt && (
                        <form action={resendInvite}>
                          <input type="hidden" name="id" value={c.id} />
                          <button
                            type="submit"
                            className="btn btn-outline"
                            style={{ padding: "6px 10px", fontSize: 12 }}
                          >
                            Resend invite
                          </button>
                        </form>
                      )}
                      <form action={deleteCustomer}>
                        <input type="hidden" name="id" value={c.id} />
                        <button
                          type="submit"
                          className="btn btn-outline"
                          style={{
                            padding: "6px 10px",
                            fontSize: 12,
                            color: "var(--c-red)",
                            borderColor: "var(--c-red)",
                          }}
                        >
                          Remove
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
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
                href={`/admin/customers?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className="btn btn-outline"
                style={{ padding: "6px 12px", fontSize: 12 }}
              >
                ← Newer
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/customers?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
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

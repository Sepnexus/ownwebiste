import type { Metadata } from "next";
import Link from "next/link";
import { db, schema } from "@/lib/db";
import { desc, isNull, eq, and, sql, inArray, notInArray } from "drizzle-orm";
import { inviteCustomer, resendInvite, deleteCustomer } from "./_actions";
import ConfirmDelete from "../_components/ConfirmDelete";
import SubmitButton from "../_components/SubmitButton";

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

  // Live (non-terminal) subscriptions per customer on this page. "Remove" only
  // soft-deletes the user; it doesn't cancel anything in Razorpay, so the
  // confirm dialog warns when there's something still billing.
  const liveSubRows =
    customers.length === 0
      ? []
      : await db
          .select({
            userId: schema.subscriptions.userId,
            n: sql<number>`count(*)::int`,
          })
          .from(schema.subscriptions)
          .where(
            and(
              inArray(
                schema.subscriptions.userId,
                customers.map((c) => c.id),
              ),
              notInArray(schema.subscriptions.status, [
                "cancelled",
                "expired",
                "completed",
                "halted",
              ]),
            ),
          )
          .groupBy(schema.subscriptions.userId);
  const liveSubs = new Map(liveSubRows.map((r) => [r.userId, r.n]));

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
          <SubmitButton className="btn btn-solid" pendingLabel="Sending invite…">
            Send invite →
          </SubmitButton>
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
          aria-label="Search customers by email or name"
          style={{
            flex: 1,
            minWidth: 240,
            padding: "10px 14px",
            border: "1px solid var(--line)",
            borderRadius: 10,
            fontFamily: "var(--sans)",
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
        <p style={{ color: "var(--muted)" }}>
          {q ? `No matches for “${q}”.` : "No customers yet."}
        </p>
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
              const liveSubCount = liveSubs.get(c.id) ?? 0;
              return (
                <tr key={c.id}>
                  <td>
                    <Link
                      href={`/admin/customers/${c.id}`}
                      style={{ color: "var(--ink)", textDecoration: "none" }}
                    >
                      <strong style={{ color: "var(--ink)" }}>
                        {c.name ?? c.email.split("@")[0]}
                      </strong>
                      <br />
                      <span style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 12 }}>
                        {c.email}
                      </span>
                    </Link>
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
                          <SubmitButton
                            className="btn btn-outline"
                            style={{ padding: "6px 10px", fontSize: 12 }}
                            pendingLabel="Sending…"
                          >
                            Resend invite
                          </SubmitButton>
                        </form>
                      )}
                      <ConfirmDelete
                        action={deleteCustomer}
                        fields={{ id: c.id }}
                        triggerLabel="Remove"
                        triggerStyle={{ padding: "6px 10px", fontSize: 12 }}
                        title={`Remove customer “${c.name?.trim() || c.email}”?`}
                        confirmLabel="Remove customer"
                        pendingLabel="Removing…"
                      >
                        {c.email} will no longer be able to sign in, and they drop off this
                        list. There&apos;s no undo for this in the admin.{" "}
                        {liveSubCount > 0 ? (
                          <>
                            <strong>
                              {liveSubCount === 1
                                ? "Removing doesn’t cancel their live subscription."
                                : `Removing doesn’t cancel their ${liveSubCount} live subscriptions.`}
                            </strong>{" "}
                            If billing should stop, cancel in Razorpay first.
                          </>
                        ) : (
                          "They have no live subscriptions."
                        )}
                      </ConfirmDelete>
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

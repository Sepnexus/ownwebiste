import type { Metadata } from "next";
import { db, schema } from "@/lib/db";
import { desc, isNull, eq, and } from "drizzle-orm";
import { inviteCustomer, resendInvite, deleteCustomer } from "./_actions";

export const metadata: Metadata = { title: "Admin · Customers" };
export const dynamic = "force-dynamic";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { error, ok } = await searchParams;

  const customers = await db
    .select()
    .from(schema.users)
    .where(
      and(eq(schema.users.role, "customer"), isNull(schema.users.deletedAt)),
    )
    .orderBy(desc(schema.users.createdAt));

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
    </>
  );
}

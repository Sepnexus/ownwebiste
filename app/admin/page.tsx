import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { desc, sql, isNull } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await currentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin") redirect("/dashboard");

  const [recentContacts, [{ openCount }], [{ totalCount }]] = await Promise.all([
    db
      .select()
      .from(schema.contacts)
      .orderBy(desc(schema.contacts.createdAt))
      .limit(10),
    db
      .select({ openCount: sql<number>`count(*)::int` })
      .from(schema.contacts)
      .where(isNull(schema.contacts.handledAt)),
    db
      .select({ totalCount: sql<number>`count(*)::int` })
      .from(schema.contacts),
  ]);

  return (
    <main className="page">
      <div className="page-narrow">
        <span className="page-eyebrow">Admin</span>
        <h1 className="page-title">
          The <em>control plane.</em>
        </h1>
        <p className="page-lede">
          Phase 1 ships the contact inbox. Customer accounts, pricing CRUD, portfolio CRUD and
          subscription management arrive in the next phases.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: 32,
          }}
        >
          {[
            { k: "Open contacts", v: openCount.toString(), accent: "var(--c-magenta)" },
            { k: "Total submissions", v: totalCount.toString(), accent: "var(--c-cyan)" },
            { k: "You", v: user.email, accent: "var(--c-yellow)" },
          ].map((row) => (
            <div
              key={row.k}
              style={{
                border: "1px solid var(--line)",
                borderRadius: 16,
                padding: 24,
                background: "rgba(255,255,255,0.6)",
                borderTop: `2px solid ${row.accent}`,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  marginBottom: 8,
                }}
              >
                {row.k}
              </div>
              <div style={{ fontSize: 22, color: "var(--ink)", fontFamily: "var(--serif)" }}>
                {row.v}
              </div>
            </div>
          ))}
        </div>

        <h2
          style={{
            fontFamily: "var(--serif)",
            fontWeight: 400,
            fontSize: 32,
            letterSpacing: "-0.015em",
            margin: "0 0 16px",
            color: "var(--ink)",
          }}
        >
          Recent inbox
        </h2>
        {recentContacts.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No submissions yet.</p>
        ) : (
          <div
            style={{
              border: "1px solid var(--line)",
              borderRadius: 16,
              overflow: "hidden",
              background: "rgba(255,255,255,0.6)",
            }}
          >
            {recentContacts.map((c, i) => (
              <Link
                key={c.id}
                href={`/admin/contacts/${c.id}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px 1fr auto",
                  gap: 16,
                  padding: "16px 20px",
                  borderTop: i === 0 ? "none" : "1px solid var(--line)",
                  color: "var(--ink-2)",
                  textDecoration: "none",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 11,
                    color: c.handledAt ? "var(--muted)" : "var(--c-magenta)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {c.type.replaceAll("_", " ")}
                </span>
                <span>
                  <strong style={{ color: "var(--ink)" }}>{c.name}</strong>{" "}
                  <span style={{ color: "var(--muted)" }}>· {c.email}</span>
                </span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)" }}>
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        )}

        <form action="/api/logout" method="POST" style={{ marginTop: 40 }}>
          <button type="submit" className="btn btn-outline">
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { db, schema } from "@/lib/db";
import { desc, sql, isNull, and, gte, lt } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Admin · Inbox",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const last24h = new Date(Date.now() - 1000 * 60 * 60 * 24);

  const [recent, [openCounts], [totalCounts], [todayCounts]] = await Promise.all([
    db
      .select()
      .from(schema.contacts)
      .orderBy(desc(schema.contacts.createdAt))
      .limit(20),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.contacts)
      .where(isNull(schema.contacts.handledAt)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.contacts),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.contacts)
      .where(and(gte(schema.contacts.createdAt, last24h), lt(schema.contacts.createdAt, new Date()))),
  ]);

  return (
    <>
      <h1>Inbox</h1>
      <p className="admin-subtitle">
        Contact form submissions, access requests, project inquiries.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 14,
          marginBottom: 32,
        }}
      >
        <Stat label="Open" value={openCounts.count.toString()} accent="var(--c-magenta)" />
        <Stat label="Last 24h" value={todayCounts.count.toString()} accent="var(--c-yellow)" />
        <Stat label="All time" value={totalCounts.count.toString()} accent="var(--c-cyan)" />
      </div>

      <h2 style={{ marginTop: 0 }}>Recent submissions</h2>
      {recent.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No submissions yet.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: 130 }}>Type</th>
              <th>From</th>
              <th style={{ width: 120 }}>Status</th>
              <th style={{ width: 150 }}>When</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((c) => (
              <tr key={c.id}>
                <td>
                  <span className="pill">{c.type.replaceAll("_", " ")}</span>
                </td>
                <td>
                  <Link
                    href={`/admin/contacts/${c.id}`}
                    style={{ color: "var(--ink)", textDecoration: "none" }}
                  >
                    <strong>{c.name}</strong>{" "}
                    <span style={{ color: "var(--muted)" }}>· {c.email}</span>
                  </Link>
                </td>
                <td>
                  {c.handledAt ? (
                    <span className="pill draft">handled</span>
                  ) : (
                    <span className="pill live">open</span>
                  )}
                </td>
                <td style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)" }}>
                  {new Date(c.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
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
          fontSize: 32,
          letterSpacing: "-0.01em",
          color: "var(--ink)",
        }}
      >
        {value}
      </div>
    </div>
  );
}

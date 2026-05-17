import type { Metadata } from "next";
import Link from "next/link";
import { db, schema } from "@/lib/db";
import { desc, sql, like } from "drizzle-orm";

export const metadata: Metadata = { title: "Admin · Audit log" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const where = q
    ? sql`(
        ${schema.auditLogs.action} ILIKE ${"%" + q + "%"}
        OR ${schema.auditLogs.actorEmail} ILIKE ${"%" + q + "%"}
        OR ${schema.auditLogs.targetType} ILIKE ${"%" + q + "%"}
        OR ${schema.auditLogs.targetId} ILIKE ${"%" + q + "%"}
      )`
    : sql`true`;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(schema.auditLogs)
      .where(where)
      .orderBy(desc(schema.auditLogs.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(schema.auditLogs)
      .where(where),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <h1>Audit log</h1>
      <p className="admin-subtitle">
        Append-only log of consequential actions — admin edits, customer subscriptions and
        cancellations, account deletions, 2FA events.
      </p>

      <form
        action="/admin/audit-log"
        method="GET"
        style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}
      >
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search action, actor email, target id…"
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
        <button type="submit" className="btn btn-outline">
          Search
        </button>
        {q && (
          <Link href="/admin/audit-log" className="btn btn-ghost">
            Clear
          </Link>
        )}
      </form>

      {rows.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>
          {q ? "No matches." : "No actions recorded yet."}
        </p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: 160 }}>When</th>
              <th style={{ width: 200 }}>Action</th>
              <th>Actor</th>
              <th>Target</th>
              <th style={{ width: 120 }}>IP</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)" }}>
                  {new Date(r.createdAt).toLocaleString()}
                </td>
                <td style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{r.action}</td>
                <td style={{ fontSize: 13 }}>
                  {r.actorEmail ?? <span style={{ color: "var(--muted)" }}>—</span>}
                </td>
                <td style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)" }}>
                  {r.targetType ? `${r.targetType}/${(r.targetId ?? "").slice(0, 8)}` : "—"}
                </td>
                <td style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>
                  {r.ipAddress ?? "—"}
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
                href={`/admin/audit-log?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className="btn btn-outline"
                style={{ padding: "6px 12px", fontSize: 12 }}
              >
                ← Newer
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/audit-log?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
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

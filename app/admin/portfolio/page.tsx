import type { Metadata } from "next";
import Link from "next/link";
import { db, schema } from "@/lib/db";
import { asc } from "drizzle-orm";
import { deleteEntry, togglePublished } from "./_actions";

export const metadata: Metadata = { title: "Admin · Portfolio" };
export const dynamic = "force-dynamic";

export default async function AdminPortfolioPage() {
  const entries = await db
    .select()
    .from(schema.portfolioEntries)
    .orderBy(asc(schema.portfolioEntries.sortOrder));

  return (
    <>
      <div className="toolbar">
        <div>
          <h1 style={{ marginBottom: 4 }}>Portfolio</h1>
          <p className="admin-subtitle" style={{ margin: 0 }}>
            Case studies on the public /portfolio page. Drafts stay private until published.
          </p>
        </div>
        <Link href="/admin/portfolio/new" className="btn btn-solid">
          + New entry
        </Link>
      </div>

      {entries.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No portfolio entries yet.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th style={{ width: 140 }}>Client</th>
              <th style={{ width: 80 }}>Year</th>
              <th style={{ width: 100 }}>Status</th>
              <th style={{ width: 240, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id}>
                <td>
                  <Link
                    href={`/admin/portfolio/${e.id}`}
                    style={{ color: "var(--ink)", textDecoration: "none" }}
                  >
                    <strong>{e.title}</strong>{" "}
                    <span style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 12 }}>
                      {e.slug}
                    </span>
                  </Link>
                </td>
                <td style={{ color: "var(--muted)" }}>{e.client ?? "—"}</td>
                <td style={{ fontFamily: "var(--mono)", color: "var(--muted)" }}>
                  {e.year ?? "—"}
                </td>
                <td>
                  {e.published ? (
                    <span className="pill live">Published</span>
                  ) : (
                    <span className="pill draft">Draft</span>
                  )}
                </td>
                <td>
                  <div className="row-actions">
                    <form action={togglePublished}>
                      <input type="hidden" name="id" value={e.id} />
                      <button type="submit" className="btn btn-outline" style={{ padding: "6px 10px", fontSize: 12 }}>
                        {e.published ? "Unpublish" : "Publish"}
                      </button>
                    </form>
                    <Link
                      href={`/admin/portfolio/${e.id}`}
                      className="btn btn-outline"
                      style={{ padding: "6px 10px", fontSize: 12 }}
                    >
                      Edit
                    </Link>
                    <form action={deleteEntry}>
                      <input type="hidden" name="id" value={e.id} />
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
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

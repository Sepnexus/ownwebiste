import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Contact",
};

export const dynamic = "force-dynamic";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  const { id } = await params;
  const [c] = await db
    .select()
    .from(schema.contacts)
    .where(eq(schema.contacts.id, id))
    .limit(1);
  if (!c) notFound();

  const adminId = user.id;
  async function markHandled() {
    "use server";
    const { db: _db, schema: _s } = await import("@/lib/db");
    const { eq: _eq } = await import("drizzle-orm");
    await _db
      .update(_s.contacts)
      .set({ handledAt: new Date(), handledByUserId: adminId })
      .where(_eq(_s.contacts.id, id));
    const { redirect: _redirect } = await import("next/navigation");
    _redirect("/admin");
  }

  return (
    <main className="page">
      <div className="page-narrow">
        <Link
          href="/admin"
          style={{
            fontFamily: "var(--mono)",
            fontSize: 12,
            color: "var(--muted)",
            textDecoration: "none",
          }}
        >
          ← Back to inbox
        </Link>
        <h1 className="page-title" style={{ marginTop: 24 }}>
          {c.name}
        </h1>
        <p className="page-lede" style={{ marginBottom: 0 }}>
          <a href={`mailto:${c.email}`}>{c.email}</a>
          {c.company ? <span style={{ color: "var(--muted)" }}> · {c.company}</span> : null}
        </p>
        <p
          style={{
            fontFamily: "var(--mono)",
            fontSize: 12,
            color: "var(--muted)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            margin: "8px 0 32px",
          }}
        >
          {c.type.replaceAll("_", " ")} · {new Date(c.createdAt).toLocaleString()}
          {c.handledAt ? ` · handled ${new Date(c.handledAt).toLocaleDateString()}` : " · open"}
        </p>

        <div
          style={{
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: 28,
            background: "rgba(255,255,255,0.6)",
            whiteSpace: "pre-wrap",
            lineHeight: 1.65,
            fontSize: 16,
            color: "var(--ink-2)",
          }}
        >
          {c.message}
        </div>

        {c.metadata != null && (
          <details style={{ marginTop: 24 }}>
            <summary
              style={{
                cursor: "pointer",
                color: "var(--muted)",
                fontFamily: "var(--mono)",
                fontSize: 12,
                letterSpacing: "0.06em",
              }}
            >
              metadata
            </summary>
            <pre
              style={{
                background: "rgba(0,0,0,0.04)",
                padding: 16,
                borderRadius: 12,
                fontSize: 12,
                marginTop: 12,
                overflow: "auto",
              }}
            >
              {JSON.stringify(c.metadata, null, 2)}
            </pre>
          </details>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
          <a href={`mailto:${c.email}`} className="btn btn-solid">
            Reply via email
          </a>
          {!c.handledAt && (
            <form action={markHandled}>
              <button type="submit" className="btn btn-outline">
                Mark as handled
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

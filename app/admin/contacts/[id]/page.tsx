import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Admin · Contact",
};

export const dynamic = "force-dynamic";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireAdmin();
  const { id } = await params;
  const [c] = await db
    .select()
    .from(schema.contacts)
    .where(eq(schema.contacts.id, id))
    .limit(1);
  if (!c) notFound();

  const adminId = admin.id;
  async function markHandled() {
    "use server";
    const { db: _db, schema: _s } = await import("@/lib/db");
    const { eq: _eq } = await import("drizzle-orm");
    await _db
      .update(_s.contacts)
      .set({ handledAt: new Date(), handledByUserId: adminId })
      .where(_eq(_s.contacts.id, id));
    redirect("/admin");
  }

  async function reopen() {
    "use server";
    const { db: _db, schema: _s } = await import("@/lib/db");
    const { eq: _eq } = await import("drizzle-orm");
    await _db
      .update(_s.contacts)
      .set({ handledAt: null, handledByUserId: null })
      .where(_eq(_s.contacts.id, id));
    redirect(`/admin/contacts/${id}`);
  }

  return (
    <>
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
      <h1 style={{ marginTop: 14 }}>{c.name}</h1>
      <p className="admin-subtitle">
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
          margin: "0 0 28px",
        }}
      >
        {c.type.replaceAll("_", " ")} · {new Date(c.createdAt).toLocaleString()}
        {c.handledAt ? ` · handled ${new Date(c.handledAt).toLocaleDateString()}` : " · open"}
      </p>

      <div
        style={{
          border: "1px solid var(--line)",
          borderRadius: 12,
          padding: 24,
          background: "rgba(255,255,255,0.6)",
          whiteSpace: "pre-wrap",
          lineHeight: 1.65,
          fontSize: 15,
          color: "var(--ink-2)",
        }}
      >
        {c.message}
      </div>

      {c.metadata != null && (
        <details style={{ marginTop: 20 }}>
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
              padding: 14,
              borderRadius: 10,
              fontSize: 12,
              marginTop: 10,
              overflow: "auto",
            }}
          >
            {JSON.stringify(c.metadata, null, 2)}
          </pre>
        </details>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 28, flexWrap: "wrap" }}>
        <a href={`mailto:${c.email}`} className="btn btn-solid">
          Reply via email
        </a>
        {c.handledAt ? (
          <form action={reopen}>
            <button type="submit" className="btn btn-outline">
              Reopen
            </button>
          </form>
        ) : (
          <form action={markHandled}>
            <button type="submit" className="btn btn-outline">
              Mark as handled
            </button>
          </form>
        )}
      </div>
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import EntryForm from "../_components/EntryForm";
import { updateEntry } from "../_actions";

export const metadata: Metadata = { title: "Admin · Edit portfolio" };
export const dynamic = "force-dynamic";

export default async function EditEntryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const [entry] = await db
    .select()
    .from(schema.portfolioEntries)
    .where(eq(schema.portfolioEntries.id, id))
    .limit(1);
  if (!entry) notFound();

  return (
    <>
      <Link
        href="/admin/portfolio"
        style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)", textDecoration: "none" }}
      >
        ← Portfolio
      </Link>
      <h1 style={{ marginTop: 14 }}>Edit · {entry.title}</h1>
      <p className="admin-subtitle">
        Last updated {new Date(entry.updatedAt).toLocaleString()}
      </p>
      <EntryForm entry={entry} action={updateEntry} error={error} />
    </>
  );
}

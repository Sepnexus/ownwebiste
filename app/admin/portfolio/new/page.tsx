import type { Metadata } from "next";
import Link from "next/link";
import EntryForm from "../_components/EntryForm";
import { createEntry } from "../_actions";

export const metadata: Metadata = { title: "Admin · New portfolio entry" };
export const dynamic = "force-dynamic";

export default async function NewEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <>
      <Link
        href="/admin/portfolio"
        style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)", textDecoration: "none" }}
      >
        ← Portfolio
      </Link>
      <h1 style={{ marginTop: 14 }}>New portfolio entry</h1>
      <p className="admin-subtitle">Drafts are saved as unpublished and only appear publicly when you flip the toggle.</p>
      <EntryForm action={createEntry} error={error} />
    </>
  );
}

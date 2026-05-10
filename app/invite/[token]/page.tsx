import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { peekAuthToken } from "@/lib/auth";
import AcceptForm from "./_components/AcceptForm";

export const metadata: Metadata = { title: "Accept invite" };
export const dynamic = "force-dynamic";

export default async function InviteAcceptPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error } = await searchParams;

  const peek = await peekAuthToken({ plain: token, kind: "invite" });
  if (!peek) {
    return (
      <main className="login-shell">
        <div className="login-card">
          <h1>Link expired.</h1>
          <p className="sub">
            This invite is invalid, used, or expired. Ask the admin who invited you to send a new
            one.
          </p>
          <Link href="/" className="btn btn-outline" style={{ marginTop: 8 }}>
            ← Back to sepnexus.com
          </Link>
        </div>
      </main>
    );
  }

  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, peek.userId))
    .limit(1);
  if (!user) {
    return (
      <main className="login-shell">
        <div className="login-card">
          <h1>Account not found.</h1>
          <p className="sub">The invite was issued for an account that no longer exists.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="login-shell">
      <div className="login-card">
        <h1>Welcome to Sepnexus.</h1>
        <p className="sub">
          You&apos;re accepting an invite for <strong>{user.email}</strong>. Set a password to
          finish.
        </p>
        <Suspense fallback={null}>
          <AcceptForm token={token} email={user.email} initialError={error ?? null} />
        </Suspense>
      </div>
    </main>
  );
}

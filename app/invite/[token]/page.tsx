import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { peekAuthToken } from "@/lib/auth";
import AuthBrand from "@/app/login/_components/AuthBrand";
import AcceptForm from "./_components/AcceptForm";

export const metadata: Metadata = { title: "Accept invite" };
export const dynamic = "force-dynamic";

const actionsRow: React.CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  alignItems: "center",
};

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
      <main id="main" className="login-shell">
        <AuthBrand />
        <div className="login-card">
          <h1>Link expired.</h1>
          <p className="sub">
            This invite link doesn&apos;t work any more. Invites last 7 days and can only be
            used once. If you&apos;ve already set your password, just sign in. Otherwise, ask
            us for a new invite.
          </p>
          <div style={actionsRow}>
            <Link href="/login" className="btn btn-solid">
              Sign in
            </Link>
            <Link href="/contact?type=request_access" className="btn btn-outline">
              Ask for a new invite
            </Link>
          </div>
          <p style={{ marginTop: 18, fontSize: 13, color: "var(--muted)" }}>
            <Link href="/" style={{ color: "var(--ink)" }}>
              <span aria-hidden="true">←</span> Back to sepnexus.com
            </Link>
          </p>
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
      <main id="main" className="login-shell">
        <AuthBrand />
        <div className="login-card">
          <h1>Account not found.</h1>
          <p className="sub">
            This invite was made for an account that no longer exists. Ask us for a new invite,
            or contact support if you think this is a mistake.
          </p>
          <div style={actionsRow}>
            <Link href="/contact?type=request_access" className="btn btn-solid">
              Ask for a new invite
            </Link>
            <Link href="/contact?type=support" className="btn btn-outline">
              Contact support
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main id="main" className="login-shell">
      <AuthBrand />
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

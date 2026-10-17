import type { Metadata } from "next";
import Link from "next/link";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { peekAuthToken } from "@/lib/auth";
import AuthBrand from "@/app/login/_components/AuthBrand";
import ResetForm from "./_components/ResetForm";

export const metadata: Metadata = { title: "Reset password" };
export const dynamic = "force-dynamic";

const actionsRow: React.CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  alignItems: "center",
};

export default async function ResetPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const peek = await peekAuthToken({ plain: token, kind: "password_reset" });
  if (!peek) {
    return (
      <main id="main" className="login-shell">
        <AuthBrand />
        <div className="login-card">
          <h1>Link expired.</h1>
          <p className="sub">
            This reset link doesn&apos;t work any more. It may have expired, been used already,
            or been copied incompletely. Reset links work once and last for 1 hour. Ask for a
            new one and we&apos;ll email it to you straight away.
          </p>
          <div style={actionsRow}>
            <Link href="/forgot" className="btn btn-solid">
              Send a new link
            </Link>
            <Link href="/contact?type=support" className="btn btn-outline">
              Contact support
            </Link>
          </div>
          <p style={{ marginTop: 18, fontSize: 13, color: "var(--muted)" }}>
            Remembered it?{" "}
            <Link href="/login" style={{ color: "var(--ink)" }}>
              Sign in
            </Link>
          </p>
        </div>
      </main>
    );
  }

  const [user] = await db
    .select({ email: schema.users.email })
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
            This reset link belongs to an account that no longer exists. If you use a
            different email with us, send a new link to that one. If you think this is a
            mistake, contact support and we&apos;ll sort it out.
          </p>
          <div style={actionsRow}>
            <Link href="/forgot" className="btn btn-solid">
              Send a new link
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
        <h1>Reset password</h1>
        <p className="sub">
          Choose a new password for <strong>{user.email}</strong>.
        </p>
        <ResetForm token={token} email={user.email} />
      </div>
    </main>
  );
}

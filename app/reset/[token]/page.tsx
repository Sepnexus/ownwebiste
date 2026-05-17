import type { Metadata } from "next";
import Link from "next/link";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { peekAuthToken } from "@/lib/auth";
import ResetForm from "./_components/ResetForm";

export const metadata: Metadata = { title: "Reset password" };
export const dynamic = "force-dynamic";

export default async function ResetPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const peek = await peekAuthToken({ plain: token, kind: "password_reset" });
  if (!peek) {
    return (
      <main className="login-shell">
        <div className="login-card">
          <h1>Link expired.</h1>
          <p className="sub">
            This reset link is invalid, used, or expired. Request a new one below.
          </p>
          <Link href="/forgot" className="btn btn-outline">
            ← Request new link
          </Link>
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
      <main className="login-shell">
        <div className="login-card">
          <h1>Account not found.</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="login-shell">
      <div className="login-card">
        <h1>Reset password</h1>
        <p className="sub">
          Choose a new password for <strong>{user.email}</strong>.
        </p>
        <ResetForm token={token} />
      </div>
    </main>
  );
}

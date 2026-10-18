import type { Metadata } from "next";
import Link from "next/link";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { peekAuthToken } from "@/lib/auth";
import AuthLayout, { ACTIONS_ROW as actionsRow, CardHead } from "@/app/login/_components/AuthLayout";
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
      <AuthLayout>
        <CardHead title="Link expired.">
          This reset link doesn&apos;t work any more. It may have expired, been used already, or
          been copied incompletely. Reset links work once and last for 1 hour. Ask for a new one
          and we&apos;ll email it to you straight away.
        </CardHead>
        <div style={actionsRow}>
          <Link href="/forgot" className="btn">
            Send a new link
          </Link>
          <Link href="/contact?type=support" className="btn btn-ghost">
            Contact support
          </Link>
        </div>
        <p className="fine">
          Remembered it? <Link href="/login">Sign in</Link>
        </p>
      </AuthLayout>
    );
  }

  const [user] = await db
    .select({ email: schema.users.email })
    .from(schema.users)
    .where(eq(schema.users.id, peek.userId))
    .limit(1);
  if (!user) {
    return (
      <AuthLayout>
        <CardHead title="Account not found.">
          This reset link belongs to an account that no longer exists. If you use a different
          email with us, send a new link to that one. If you think this is a mistake, contact
          support and we&apos;ll sort it out.
        </CardHead>
        <div style={actionsRow}>
          <Link href="/forgot" className="btn">
            Send a new link
          </Link>
          <Link href="/contact?type=support" className="btn btn-ghost">
            Contact support
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <CardHead title="Reset password">
        Choose a new password for <strong style={{ color: "#f5f5f7" }}>{user.email}</strong>.
      </CardHead>
      <ResetForm token={token} email={user.email} />
    </AuthLayout>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { peekAuthToken } from "@/lib/auth";
import AuthLayout, { ACTIONS_ROW as actionsRow, CardHead } from "@/app/login/_components/AuthLayout";
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
      <AuthLayout>
        <CardHead title="Link expired.">
          This invite link doesn&apos;t work any more. Invites last 7 days and can only be used
          once. If you&apos;ve already set your password, just sign in. Otherwise, ask us for a
          new invite.
        </CardHead>
        <div style={actionsRow}>
          <Link href="/login" className="btn">
            Sign in
          </Link>
          <Link href="/contact?type=request_access" className="btn btn-ghost">
            Ask for a new invite
          </Link>
        </div>
        <p className="fine">
          <Link href="/">
            <span aria-hidden="true">←</span> Back to sepnexus.com
          </Link>
        </p>
      </AuthLayout>
    );
  }

  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, peek.userId))
    .limit(1);
  if (!user) {
    return (
      <AuthLayout>
        <CardHead title="Account not found.">
          This invite was made for an account that no longer exists. Ask us for a new invite, or
          contact support if you think this is a mistake.
        </CardHead>
        <div style={actionsRow}>
          <Link href="/contact?type=request_access" className="btn">
            Ask for a new invite
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
      <CardHead title="Welcome to Sepnexus.">
        You&apos;re accepting an invite for{" "}
        <strong style={{ color: "#f5f5f7" }}>{user.email}</strong>. Set a password to finish.
      </CardHead>
      <AcceptForm token={token} email={user.email} initialError={error ?? null} />
    </AuthLayout>
  );
}

import { eq, desc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GDPR-style data export. Returns a JSON dump of everything we hold for the
 * authenticated user. Triggers an audit log so we have a record of the request.
 */
export async function GET() {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in first." }, { status: 401 });

  const [subs, invoices, counters, contacts] = await Promise.all([
    db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.userId, user.id))
      .orderBy(desc(schema.subscriptions.createdAt)),
    db
      .select()
      .from(schema.invoices)
      .where(eq(schema.invoices.userId, user.id))
      .orderBy(desc(schema.invoices.createdAt)),
    db
      .select()
      .from(schema.usageCounters)
      .where(eq(schema.usageCounters.userId, user.id))
      .orderBy(desc(schema.usageCounters.periodStart)),
    db
      .select()
      .from(schema.contacts)
      .where(eq(schema.contacts.email, user.email))
      .orderBy(desc(schema.contacts.createdAt)),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    schemaVersion: 1,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      invitedAt: user.invitedAt,
      inviteAcceptedAt: user.inviteAcceptedAt,
      // Deliberately exclude password_hash, totp_secret, totp_recovery_codes.
    },
    subscriptions: subs,
    invoices,
    usage_counters: counters,
    contact_submissions: contacts,
  };

  void audit({
    actor: { userId: user.id, email: user.email },
    action: "account.data_export",
  });

  const filename = `sepnexus-export-${user.email}-${new Date().toISOString().slice(0, 10)}.json`;
  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}

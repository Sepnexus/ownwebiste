import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { clearSessionCookie, currentUser, verifyPassword } from "@/lib/auth";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  password: z.string().min(1),
  confirm: z.literal("delete my account"),
});

/**
 * Soft-deletes the current customer account. We don't hard-delete because
 * Razorpay still holds invoice/subscription records and we may need to
 * reconcile. The deleted row stops appearing in admin lists, login is
 * blocked, and any recurring subscriptions should be cancelled separately
 * before this call lands (we surface that in the dashboard UI).
 */
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in first." }, { status: 401 });
  if (user.role === "admin") {
    return Response.json(
      { error: "Admin accounts can't self-delete from this endpoint." },
      { status: 403 },
    );
  }
  if (!user.passwordHash) {
    return Response.json({ error: "No password set on this account." }, { status: 400 });
  }

  let parsed: z.infer<typeof Body>;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return Response.json(
      { error: "Type the confirmation phrase exactly: delete my account" },
      { status: 400 },
    );
  }

  const ok = await verifyPassword(parsed.password, user.passwordHash);
  if (!ok) return Response.json({ error: "Wrong password." }, { status: 401 });

  await db
    .update(schema.users)
    .set({
      deletedAt: new Date(),
      // Scrub auth materials so the row is unusable as a login.
      passwordHash: null,
      totpSecret: null,
      totpEnabled: false,
      totpRecoveryCodes: null,
      updatedAt: new Date(),
    })
    .where(eq(schema.users.id, user.id));

  void audit({
    actor: { userId: user.id, email: user.email },
    action: "account.deleted",
    targetType: "user",
    targetId: user.id,
  });

  await clearSessionCookie();
  return Response.json({ ok: true });
}

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { currentUser, verifyPassword } from "@/lib/auth";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ password: z.string().min(1) });

/**
 * Disable 2FA. We require the account password as a re-auth gate so a stolen
 * cookie alone can't strip the second factor.
 */
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in first." }, { status: 401 });
  if (!user.passwordHash) {
    return Response.json({ error: "No password set." }, { status: 400 });
  }
  let parsed: z.infer<typeof Body>;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }
  const ok = await verifyPassword(parsed.password, user.passwordHash);
  if (!ok) return Response.json({ error: "Wrong password." }, { status: 401 });

  await db
    .update(schema.users)
    .set({
      totpEnabled: false,
      totpSecret: null,
      totpEnabledAt: null,
      totpRecoveryCodes: null,
      updatedAt: new Date(),
    })
    .where(eq(schema.users.id, user.id));

  void audit({
    actor: { userId: user.id, email: user.email },
    action: "auth.2fa.disabled",
  });

  return Response.json({ ok: true });
}

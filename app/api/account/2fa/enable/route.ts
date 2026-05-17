import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { verifyTotpCode, generateRecoveryCodes } from "@/lib/totp";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ code: z.string().trim().min(6).max(10) });

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in first." }, { status: 401 });
  if (!user.totpSecret) {
    return Response.json(
      { error: "Run /setup first to generate a secret." },
      { status: 400 },
    );
  }

  let parsed: z.infer<typeof Body>;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return Response.json({ error: "Invalid code" }, { status: 400 });
  }

  const ok = verifyTotpCode({ secret: user.totpSecret, code: parsed.code });
  if (!ok) {
    return Response.json({ error: "Wrong code. Try again." }, { status: 400 });
  }

  // Issue 8 single-use recovery codes for the user. Plain codes are returned
  // ONCE (this response); only sha-256 hashes go into the DB.
  const { plain, hashed } = generateRecoveryCodes(8);

  await db
    .update(schema.users)
    .set({
      totpEnabled: true,
      totpEnabledAt: new Date(),
      totpRecoveryCodes: hashed,
      updatedAt: new Date(),
    })
    .where(eq(schema.users.id, user.id));

  void audit({
    actor: { userId: user.id, email: user.email },
    action: "auth.2fa.enabled",
  });

  return Response.json({ ok: true, recoveryCodes: plain });
}

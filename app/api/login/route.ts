import { z } from "zod";
import { eq } from "drizzle-orm";
import { authenticate, setSessionCookie } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { rateLimit, clientIp, tooManyResponse } from "@/lib/rate-limit";
import { verifyTotpCode, consumeRecoveryCode } from "@/lib/totp";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
  /** TOTP code or recovery code, sent on the second login step when 2FA is on. */
  code: z.string().trim().max(40).optional(),
});

export async function POST(req: Request) {
  // 10 login attempts per IP per 10 minutes — generous for humans, painful
  // for brute force. Per-account 2FA layered on top.
  const ip = clientIp(req);
  const rl = rateLimit({ key: `${ip}:login`, limit: 10, windowMs: 10 * 60_000 });
  if (!rl.allowed) return tooManyResponse(rl);

  let parsed: z.infer<typeof Body>;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return Response.json({ error: "Invalid email or password" }, { status: 400 });
  }
  const user = await authenticate(parsed.email, parsed.password);
  if (!user) {
    return Response.json({ error: "Invalid email or password" }, { status: 401 });
  }
  if (user.role !== "admin" && user.role !== "customer") {
    return Response.json({ error: "Account role not permitted" }, { status: 403 });
  }

  // Second factor — required if the user has TOTP enabled.
  if (user.totpEnabled && user.totpSecret) {
    if (!parsed.code) {
      return Response.json({ requires2fa: true }, { status: 200 });
    }
    const submitted = parsed.code.trim().replace(/\s+/g, "");
    let factorOk = verifyTotpCode({ secret: user.totpSecret, code: submitted });

    // Recovery code fallback
    if (!factorOk && submitted.length >= 8) {
      const stored = (user.totpRecoveryCodes ?? []) as string[];
      const remaining = consumeRecoveryCode(stored, submitted);
      if (remaining) {
        await db
          .update(schema.users)
          .set({ totpRecoveryCodes: remaining, updatedAt: new Date() })
          .where(eq(schema.users.id, user.id));
        factorOk = true;
        void audit({
          actor: {
            userId: user.id,
            email: user.email,
            ipAddress: ip,
            userAgent: req.headers.get("user-agent"),
          },
          action: "auth.2fa.recovery_used",
          details: { remainingCodes: remaining.length },
        });
      }
    }

    if (!factorOk) {
      return Response.json({ error: "Wrong 2FA code." }, { status: 401 });
    }
  }

  await setSessionCookie({ uid: user.id, role: user.role });
  void audit({
    actor: {
      userId: user.id,
      email: user.email,
      ipAddress: ip,
      userAgent: req.headers.get("user-agent"),
    },
    action: "auth.login.success",
  });
  return Response.json({ ok: true, role: user.role });
}

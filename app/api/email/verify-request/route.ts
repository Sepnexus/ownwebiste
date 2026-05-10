import { z } from "zod";
import { issueOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email-templates";
import { rateLimit, clientIp, tooManyResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  email: z.string().trim().email().max(254),
  purpose: z.enum(["checkout", "login", "verify"]).optional(),
});

export async function POST(req: Request) {
  // 10 OTP requests per IP per hour. Stops attackers cycling emails to
  // spam-send OTPs from our domain. Per-email cooldown is enforced separately
  // by issueOtp().
  const rl = rateLimit({ key: `${clientIp(req)}:otp-req`, limit: 10, windowMs: 60 * 60_000 });
  if (!rl.allowed) return tooManyResponse(rl);

  let parsed: z.infer<typeof Body>;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }

  const ipAddress =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    null;

  let issued: { code: string; expiresAt: Date };
  try {
    issued = await issueOtp({
      email: parsed.email,
      purpose: parsed.purpose ?? "checkout",
      ipAddress,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not issue code.";
    return Response.json({ error: msg }, { status: 429 });
  }

  const sent = await sendOtpEmail({ to: parsed.email, code: issued.code });
  if (!sent.ok) {
    // Don't leak the code to the API caller in any case.
    console.error("[verify-request] email send failed:", sent.error);
    return Response.json(
      { error: "Could not send code. Please try again or contact support." },
      { status: 502 },
    );
  }

  return Response.json({
    ok: true,
    expiresAt: issued.expiresAt.toISOString(),
  });
}

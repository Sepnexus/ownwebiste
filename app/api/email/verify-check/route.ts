import { z } from "zod";
import { verifyOtp } from "@/lib/otp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  email: z.string().trim().email().max(254),
  code: z.string().trim().length(6),
  purpose: z.enum(["checkout", "login", "verify"]).optional(),
});

export async function POST(req: Request) {
  let parsed: z.infer<typeof Body>;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }

  const result = await verifyOtp({
    email: parsed.email,
    code: parsed.code,
    purpose: parsed.purpose ?? "checkout",
  });
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 400 });
  }
  return Response.json({ ok: true, ticket: result.ticket });
}

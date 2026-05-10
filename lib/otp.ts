import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { eq, and, gt, isNull, sql } from "drizzle-orm";
import { db, schema } from "./db";

const TTL_MS = 10 * 60 * 1000; // 10 minutes
const TICKET_TTL_S = 30 * 60; // 30 minutes (gives time to complete payment)
const MAX_ATTEMPTS = 5;
const COOL_DOWN_MS = 60 * 1000; // 1 OTP per email per minute

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    throw new Error("AUTH_SECRET must be set and at least 32 chars");
  }
  return new TextEncoder().encode(s);
}

function hash(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

/** Random 6-digit numeric code. Pads short numbers to keep visual width consistent. */
export function generateOtpCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/**
 * Issue a fresh OTP for an email + purpose. Throws if the email has already
 * received a code in the last cool-down window — caller surfaces this as a
 * 429-style "wait a moment" message.
 */
export async function issueOtp(args: {
  email: string;
  purpose?: "checkout" | "login" | "verify";
  ipAddress?: string | null;
}): Promise<{ code: string; expiresAt: Date }> {
  const email = args.email.trim().toLowerCase();

  const [recent] = await db
    .select({ createdAt: schema.emailVerifications.createdAt })
    .from(schema.emailVerifications)
    .where(
      and(
        eq(schema.emailVerifications.email, email),
        eq(schema.emailVerifications.purpose, args.purpose ?? "checkout"),
        gt(schema.emailVerifications.createdAt, new Date(Date.now() - COOL_DOWN_MS)),
      ),
    )
    .orderBy(sql`${schema.emailVerifications.createdAt} DESC`)
    .limit(1);
  if (recent) {
    throw new Error(
      "Please wait a minute before requesting another code.",
    );
  }

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + TTL_MS);

  await db.insert(schema.emailVerifications).values({
    email,
    codeHash: hash(code),
    purpose: args.purpose ?? "checkout",
    attemptsRemaining: MAX_ATTEMPTS,
    expiresAt,
    ipAddress: args.ipAddress ?? null,
  });

  return { code, expiresAt };
}

/**
 * Verify a submitted OTP. Decrements attempts on bad guesses, marks
 * verified on the first successful match. Returns a signed JWT ticket
 * the client should pass to subsequent endpoints (e.g. checkout-public).
 */
export async function verifyOtp(args: {
  email: string;
  code: string;
  purpose?: "checkout" | "login" | "verify";
}): Promise<{ ok: true; ticket: string } | { ok: false; error: string }> {
  const email = args.email.trim().toLowerCase();
  const code = args.code.trim();
  if (!/^\d{6}$/.test(code)) {
    return { ok: false, error: "Code must be 6 digits." };
  }

  // Newest unconsumed unexpired record for this email + purpose.
  const [row] = await db
    .select()
    .from(schema.emailVerifications)
    .where(
      and(
        eq(schema.emailVerifications.email, email),
        eq(schema.emailVerifications.purpose, args.purpose ?? "checkout"),
        isNull(schema.emailVerifications.consumedAt),
        gt(schema.emailVerifications.expiresAt, sql`now()`),
      ),
    )
    .orderBy(sql`${schema.emailVerifications.createdAt} DESC`)
    .limit(1);

  if (!row) {
    return { ok: false, error: "No active code. Request a new one." };
  }
  if (row.attemptsRemaining <= 0) {
    return { ok: false, error: "Too many attempts. Request a new code." };
  }

  const expected = Buffer.from(row.codeHash, "hex");
  const provided = Buffer.from(hash(code), "hex");
  const matches =
    expected.length === provided.length && timingSafeEqual(expected, provided);

  if (!matches) {
    await db
      .update(schema.emailVerifications)
      .set({ attemptsRemaining: row.attemptsRemaining - 1 })
      .where(eq(schema.emailVerifications.id, row.id));
    const left = row.attemptsRemaining - 1;
    return {
      ok: false,
      error: left > 0 ? `Wrong code. ${left} attempts left.` : "Too many attempts. Request a new code.",
    };
  }

  await db
    .update(schema.emailVerifications)
    .set({ verifiedAt: new Date(), consumedAt: new Date() })
    .where(eq(schema.emailVerifications.id, row.id));

  const ticket = await new SignJWT({ email, purpose: args.purpose ?? "checkout" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TICKET_TTL_S}s`)
    .sign(secret());
  return { ok: true, ticket };
}

/**
 * Verify a ticket against an expected email/purpose. Returns true if the
 * ticket is signed correctly, not expired, and the embedded email matches.
 * The ticket is single-use only by virtue of its 30-minute expiry — we do
 * not persist consumed tickets server-side. (Replay within 30 minutes for
 * the same email is benign — they've already proved they own the address.)
 */
export async function verifyOtpTicket(args: {
  ticket: string;
  expectedEmail: string;
  expectedPurpose?: "checkout" | "login" | "verify";
}): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(args.ticket, secret());
    if (typeof payload.email !== "string") return false;
    if (payload.email !== args.expectedEmail.trim().toLowerCase()) return false;
    if (
      args.expectedPurpose &&
      payload.purpose !== args.expectedPurpose
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db, schema } from "./db";
import { eq, isNull, and, gt, sql } from "drizzle-orm";
import {
  scrypt as _scrypt,
  randomBytes,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { promisify } from "node:util";
import { redirect } from "next/navigation";

const scrypt = promisify<string, Buffer, number, Buffer>(_scrypt as never);

const COOKIE_NAME = "sn_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    throw new Error("AUTH_SECRET must be set and at least 32 chars");
  }
  return new TextEncoder().encode(s);
}

export type SessionPayload = { uid: string; role: "admin" | "customer" };

export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(plain, salt, 64);
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  if (!stored.startsWith("scrypt$")) return false;
  const [, saltHex, hashHex] = stored.split("$");
  if (!saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const derived = await scrypt(plain, salt, expected.length);
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${COOKIE_MAX_AGE}s`)
    .sign(secret());
}

export async function verifySessionToken(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.uid !== "string") return null;
    if (payload.role !== "admin" && payload.role !== "customer") return null;
    return { uid: payload.uid, role: payload.role };
  } catch {
    return null;
  }
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = await createSessionToken(payload);
  const c = await cookies();
  c.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const c = await cookies();
  c.delete(COOKIE_NAME);
}

export async function currentSession(): Promise<SessionPayload | null> {
  const c = await cookies();
  return verifySessionToken(c.get(COOKIE_NAME)?.value);
}

export async function currentUser() {
  const session = await currentSession();
  if (!session) return null;
  const [row] = await db
    .select()
    .from(schema.users)
    .where(and(eq(schema.users.id, session.uid), isNull(schema.users.deletedAt)))
    .limit(1);
  return row ?? null;
}

export async function authenticate(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  const [row] = await db
    .select()
    .from(schema.users)
    .where(and(eq(schema.users.email, normalized), isNull(schema.users.deletedAt)))
    .limit(1);
  if (!row || !row.passwordHash) return null;
  const ok = await verifyPassword(password, row.passwordHash);
  if (!ok) return null;
  await db
    .update(schema.users)
    .set({ lastLoginAt: new Date(), updatedAt: new Date() })
    .where(eq(schema.users.id, row.id));
  return row;
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;

/* ============================================================
   Authorization helpers — call from server components / actions.
   ============================================================ */

export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await currentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}

/* ============================================================
   Single-use tokens for invites and password resets.
   The plaintext token is returned ONCE (sent in email).
   The DB stores only a sha256 hash so a leak doesn't expose
   active links.
   ============================================================ */

export type TokenKind = "invite" | "password_reset";

const TOKEN_TTL_MS = {
  invite: 1000 * 60 * 60 * 24 * 7, // 7 days
  password_reset: 1000 * 60 * 60, // 1 hour
} as const;

function hashToken(plain: string): string {
  return createHash("sha256").update(plain).digest("hex");
}

export async function issueAuthToken(args: {
  userId: string;
  kind: TokenKind;
}): Promise<{ plain: string; expiresAt: Date }> {
  const plain = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS[args.kind]);
  await db.insert(schema.authTokens).values({
    userId: args.userId,
    kind: args.kind,
    tokenHash: hashToken(plain),
    expiresAt,
  });
  return { plain, expiresAt };
}

export async function consumeAuthToken(args: {
  plain: string;
  kind: TokenKind;
}): Promise<{ userId: string; tokenId: string } | null> {
  const tokenHash = hashToken(args.plain);
  const [row] = await db
    .select()
    .from(schema.authTokens)
    .where(
      and(
        eq(schema.authTokens.tokenHash, tokenHash),
        eq(schema.authTokens.kind, args.kind),
        isNull(schema.authTokens.usedAt),
        gt(schema.authTokens.expiresAt, sql`now()`),
      ),
    )
    .limit(1);
  if (!row) return null;
  await db
    .update(schema.authTokens)
    .set({ usedAt: new Date() })
    .where(eq(schema.authTokens.id, row.id));
  return { userId: row.userId, tokenId: row.id };
}

export async function peekAuthToken(args: {
  plain: string;
  kind: TokenKind;
}): Promise<{ userId: string; expiresAt: Date } | null> {
  const tokenHash = hashToken(args.plain);
  const [row] = await db
    .select()
    .from(schema.authTokens)
    .where(
      and(
        eq(schema.authTokens.tokenHash, tokenHash),
        eq(schema.authTokens.kind, args.kind),
        isNull(schema.authTokens.usedAt),
        gt(schema.authTokens.expiresAt, sql`now()`),
      ),
    )
    .limit(1);
  if (!row) return null;
  return { userId: row.userId, expiresAt: row.expiresAt };
}

export async function setUserPassword(userId: string, plain: string) {
  const passwordHash = await hashPassword(plain);
  await db
    .update(schema.users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(schema.users.id, userId));
}

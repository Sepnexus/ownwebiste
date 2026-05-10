import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db, schema } from "./db";
import { eq, isNull, and } from "drizzle-orm";
import { scrypt as _scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

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

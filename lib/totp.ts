import { authenticator } from "otplib";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import QRCode from "qrcode";

/* TOTP defaults: 30-second step, 6 digits, SHA-1. Compatible with every
   authenticator app (Google Authenticator, 1Password, Authy, Microsoft, …). */
authenticator.options = { window: 1 };

const ISSUER = "Sepnexus";

export function generateTotpSecret(): string {
  return authenticator.generateSecret();
}

/** otpauth:// URL — encode into a QR code for the user to scan. */
export function totpAuthUri(args: { email: string; secret: string }): string {
  return authenticator.keyuri(args.email, ISSUER, args.secret);
}

export async function totpQrPng(args: { email: string; secret: string }): Promise<string> {
  const uri = totpAuthUri(args);
  return QRCode.toDataURL(uri, { margin: 1, width: 256 });
}

export function verifyTotpCode(args: { secret: string; code: string }): boolean {
  return authenticator.check(args.code.replace(/\s+/g, ""), args.secret);
}

/* ============== Recovery codes ============== */
/* When a user enables 2FA, we issue 8 single-use recovery codes. We store
   sha-256 hashes of each and let the user redeem one to log in if they've
   lost access to their authenticator. */

export function generateRecoveryCodes(count = 8): {
  plain: string[];
  hashed: string[];
} {
  const plain: string[] = [];
  for (let i = 0; i < count; i++) {
    const raw = randomBytes(5).toString("hex"); // 10 chars
    const formatted = `${raw.slice(0, 5)}-${raw.slice(5)}`; // xxxxx-xxxxx
    plain.push(formatted);
  }
  const hashed = plain.map((p) =>
    createHash("sha256").update(p.toLowerCase()).digest("hex"),
  );
  return { plain, hashed };
}

/**
 * Try to consume a recovery code. Returns the new array of remaining hashes
 * if the code matched, or null if it didn't.
 */
export function consumeRecoveryCode(
  hashed: string[],
  submitted: string,
): string[] | null {
  const trial = createHash("sha256")
    .update(submitted.trim().replace(/\s+/g, "").toLowerCase())
    .digest();
  const remaining: string[] = [];
  let consumed = false;
  for (const h of hashed) {
    if (consumed) {
      remaining.push(h);
      continue;
    }
    const stored = Buffer.from(h, "hex");
    if (stored.length === trial.length && timingSafeEqual(stored, trial)) {
      consumed = true;
      continue; // skip — this code is used up
    }
    remaining.push(h);
  }
  return consumed ? remaining : null;
}

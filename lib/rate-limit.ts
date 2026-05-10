/**
 * In-memory token-bucket rate limiter. Single-instance only — fine for the
 * current single-VPS deployment. Swap to Redis-backed if we go multi-replica.
 *
 * Usage:
 *   const r = await rateLimit({ key: ip + ":login", limit: 10, windowMs: 60_000 });
 *   if (!r.allowed) return Response.json({ error: "Too many requests" }, { status: 429 });
 */

type Bucket = { tokens: number; resetAt: number };

const _buckets = new Map<string, Bucket>();

// Periodic cleanup of expired buckets so the Map doesn't leak.
let _gc: ReturnType<typeof setInterval> | null = null;
function ensureGc() {
  if (_gc) return;
  _gc = setInterval(() => {
    const now = Date.now();
    for (const [k, v] of _buckets) {
      if (v.resetAt < now) _buckets.delete(k);
    }
  }, 60_000);
  // Don't keep the process alive solely on the GC.
  if (typeof _gc.unref === "function") _gc.unref();
}

export type RateLimitArgs = {
  /** Stable per-actor key, e.g. `${ip}:login` or `${ip}:contact`. */
  key: string;
  /** Max requests allowed per window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
};

export function rateLimit(args: RateLimitArgs): RateLimitResult {
  ensureGc();
  const now = Date.now();
  const existing = _buckets.get(args.key);
  if (!existing || existing.resetAt < now) {
    _buckets.set(args.key, { tokens: args.limit - 1, resetAt: now + args.windowMs });
    return {
      allowed: true,
      remaining: args.limit - 1,
      resetAt: now + args.windowMs,
      retryAfterSeconds: 0,
    };
  }
  if (existing.tokens <= 0) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }
  existing.tokens -= 1;
  return {
    allowed: true,
    remaining: existing.tokens,
    resetAt: existing.resetAt,
    retryAfterSeconds: 0,
  };
}

/**
 * Extract a best-effort client IP from a Next.js Request. Falls back to
 * `unknown` if the proxy headers aren't present (which is fine — rate
 * limit applies per client; an attacker spoofing IPs is the proxy's
 * concern).
 */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

export function tooManyResponse(r: RateLimitResult, message?: string): Response {
  return Response.json(
    { error: message ?? "Too many requests. Please slow down." },
    {
      status: 429,
      headers: {
        "retry-after": String(r.retryAfterSeconds),
        "x-ratelimit-reset": String(r.resetAt),
      },
    },
  );
}

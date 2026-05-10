/**
 * Minimal Razorpay REST client. We only need a handful of endpoints —
 * plans, subscriptions, and webhook signature verification — so a fetch
 * wrapper is simpler than pulling in the official SDK.
 *
 * All amounts use the smallest currency unit (cents for USD, paise for INR).
 */

import { createHmac, timingSafeEqual } from "node:crypto";

const RAZORPAY_BASE = "https://api.razorpay.com/v1";

export class RazorpayError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public raw?: unknown,
  ) {
    super(message);
    this.name = "RazorpayError";
  }
}

function authHeader(): string {
  const id = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!id || !secret) {
    throw new Error("RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET not configured");
  }
  return `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`;
}

async function rzp<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
): Promise<T> {
  const r = await fetch(`${RAZORPAY_BASE}${path}`, {
    method,
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const text = await r.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }

  if (!r.ok) {
    const e = (json as { error?: { code?: string; description?: string } }).error;
    throw new RazorpayError(
      r.status,
      e?.code ?? "unknown",
      e?.description ?? `Razorpay ${method} ${path} failed (${r.status})`,
      json,
    );
  }
  return json as T;
}

/* ============== Plans ============== */

export type RzpPlanPeriod = "daily" | "weekly" | "monthly" | "yearly";

export type RzpPlan = {
  id: string;
  entity: "plan";
  interval: number;
  period: RzpPlanPeriod;
  item: {
    id: string;
    name: string;
    amount: number; // smallest unit
    currency: string;
    description?: string;
  };
  notes?: Record<string, string>;
  created_at: number;
};

export async function createPlan(args: {
  period: RzpPlanPeriod;
  interval?: number;
  name: string;
  amountCents: number;
  currency?: "USD" | "INR";
  description?: string;
  notes?: Record<string, string>;
}): Promise<RzpPlan> {
  return rzp<RzpPlan>("POST", "/plans", {
    period: args.period,
    interval: args.interval ?? 1,
    item: {
      name: args.name,
      amount: args.amountCents,
      currency: args.currency ?? "USD",
      description: args.description,
    },
    notes: args.notes,
  });
}

export async function fetchPlan(planId: string): Promise<RzpPlan> {
  return rzp<RzpPlan>("GET", `/plans/${planId}`);
}

/* ============== Subscriptions ============== */

export type RzpSubscriptionStatus =
  | "created"
  | "authenticated"
  | "active"
  | "pending"
  | "halted"
  | "cancelled"
  | "completed"
  | "expired"
  | "paused"
  | "resumed";

export type RzpSubscription = {
  id: string;
  entity: "subscription";
  plan_id: string;
  customer_id?: string;
  status: RzpSubscriptionStatus;
  current_start: number | null;
  current_end: number | null;
  ended_at: number | null;
  charge_at: number | null;
  start_at: number | null;
  end_at: number | null;
  auth_attempts: number;
  total_count: number;
  paid_count: number;
  customer_notify: boolean;
  short_url: string | null;
  has_scheduled_changes: boolean;
  notes: Record<string, string>;
  created_at: number;
};

export async function createSubscription(args: {
  planId: string;
  totalCount: number; // e.g. 120 for "long subscription" 10 years monthly
  customerNotify?: boolean;
  notes?: Record<string, string>;
  // optional pre-existing customer
  customerId?: string;
}): Promise<RzpSubscription> {
  const body: Record<string, unknown> = {
    plan_id: args.planId,
    total_count: args.totalCount,
    customer_notify: args.customerNotify ? 1 : 0,
    notes: args.notes ?? {},
  };
  if (args.customerId) body.customer_id = args.customerId;
  return rzp<RzpSubscription>("POST", "/subscriptions", body);
}

export async function fetchSubscription(id: string): Promise<RzpSubscription> {
  return rzp<RzpSubscription>("GET", `/subscriptions/${id}`);
}

export async function cancelSubscription(
  id: string,
  { atCycleEnd }: { atCycleEnd: boolean },
): Promise<RzpSubscription> {
  return rzp<RzpSubscription>("POST", `/subscriptions/${id}/cancel`, {
    cancel_at_cycle_end: atCycleEnd ? 1 : 0,
  });
}

/* ============== Webhook signature verification ============== */

/**
 * Razorpay signs webhook bodies with HMAC SHA256 using the webhook secret
 * configured in their dashboard. We re-compute and constant-time-compare.
 *
 * `body` MUST be the raw request body string (not the parsed JSON).
 */
export function verifyWebhookSignature(args: {
  body: string;
  signature: string | null;
  secret: string;
}): boolean {
  if (!args.signature || !args.secret) return false;
  const expected = createHmac("sha256", args.secret).update(args.body).digest("hex");
  const a = Buffer.from(expected, "hex");
  let b: Buffer;
  try {
    b = Buffer.from(args.signature, "hex");
  } catch {
    return false;
  }
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

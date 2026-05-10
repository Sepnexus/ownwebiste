"use client";

import { useState, useTransition } from "react";
import Script from "next/script";

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => { open: () => void };
  }
}

type RazorpayCheckoutOptions = {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  prefill?: { name?: string; email?: string };
  theme?: { color?: string };
  handler?: (resp: {
    razorpay_payment_id: string;
    razorpay_subscription_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: { ondismiss?: () => void };
};

type Stage = "details" | "code" | "verified";

function symbolFor(currency: string): string {
  if (currency === "INR") return "₹";
  return "$";
}

export default function SubscribeForm({
  planId,
  planName,
  period,
  amountUsd,
  currency,
}: {
  planId: string;
  planName: string;
  period: "monthly" | "yearly";
  amountUsd: number;
  currency: string;
}) {
  const [stage, setStage] = useState<Stage>("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);

  const [code, setCode] = useState("");
  const [ticket, setTicket] = useState<string | null>(null);

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);

  function requestCode() {
    setError(null);
    setInfo(null);
    startTransition(async () => {
      try {
        const r = await fetch("/api/email/verify-request", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: email.trim().toLowerCase(), purpose: "checkout" }),
        });
        const body = (await r.json()) as { ok?: boolean; error?: string };
        if (!r.ok || !body.ok) {
          setError(body.error ?? "Could not send code.");
          return;
        }
        setInfo(`We just sent a 6-digit code to ${email}. Enter it below within 10 minutes.`);
        setStage("code");
      } catch {
        setError("Network error. Please try again.");
      }
    });
  }

  function verifyCode() {
    setError(null);
    setInfo(null);
    startTransition(async () => {
      try {
        const r = await fetch("/api/email/verify-check", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            code: code.trim(),
            purpose: "checkout",
          }),
        });
        const body = (await r.json()) as { ok?: boolean; ticket?: string; error?: string };
        if (!r.ok || !body.ok || !body.ticket) {
          setError(body.error ?? "Verification failed.");
          return;
        }
        setTicket(body.ticket);
        setStage("verified");
        setInfo("Email verified. Continue to payment.");
      } catch {
        setError("Network error. Please try again.");
      }
    });
  }

  function pay() {
    if (!ticket) return;
    setError(null);
    setInfo(null);
    startTransition(async () => {
      try {
        const r = await fetch("/api/billing/checkout-public", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            name: name.trim() || null,
            planId,
            period,
            verificationTicket: ticket,
          }),
        });
        const body = (await r.json()) as {
          ok?: boolean;
          razorpaySubscriptionId?: string;
          razorpayKeyId?: string;
          shortUrl?: string | null;
          error?: string;
          customer?: { name: string; email: string };
        };
        if (!r.ok || !body.ok || !body.razorpaySubscriptionId || !body.razorpayKeyId) {
          setError(body.error ?? "We couldn't start checkout. Please try again.");
          return;
        }

        if (typeof window === "undefined" || !window.Razorpay) {
          if (body.shortUrl) {
            window.location.href = body.shortUrl;
            return;
          }
          setError("Razorpay Checkout failed to load. Please reload and try again.");
          return;
        }

        const rzp = new window.Razorpay({
          key: body.razorpayKeyId,
          subscription_id: body.razorpaySubscriptionId,
          name: "Sepnexus",
          description: `${planName} (${period})`,
          prefill: {
            name: body.customer?.name || name,
            email: body.customer?.email || email,
          },
          theme: { color: "#14110f" },
          handler: () => setPaid(true),
          modal: { ondismiss: () => {} },
        });
        rzp.open();
      } catch {
        setError("Network error. Please try again.");
      }
    });
  }

  if (paid) {
    return (
      <div
        style={{
          border: "1px solid var(--c-cyan)",
          background: "rgba(43,182,224,0.06)",
          color: "var(--ink-2)",
          padding: "20px 22px",
          borderRadius: 14,
          fontSize: 14,
          lineHeight: 1.6,
        }}
      >
        <div
          style={{
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            fontSize: 22,
            color: "var(--ink)",
            marginBottom: 8,
          }}
        >
          Payment authorised.
        </div>
        We&apos;ve sent a setup link to <strong>{email}</strong>. Click it to set your password
        and access your dashboard. Welcome to Sepnexus.
      </div>
    );
  }

  const sym = symbolFor(currency);

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div
        className="contact-form"
        style={{ gap: 14 }}
        onSubmit={(e) => e.preventDefault()}
      >
        {/* Step 1 — Details */}
        <label>
          Your full name
          <input
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            disabled={stage !== "details"}
          />
        </label>
        <label>
          Work email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            disabled={stage !== "details"}
          />
        </label>

        {stage === "details" && (
          <>
            <label className="check-row">
              <input
                type="checkbox"
                required
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span>
                I authorise Sepnexus to create my account on this email. I&apos;ll receive a
                one-time link to set my password after payment is authorised.
              </span>
            </label>
            {error && <p className="form-msg error">{error}</p>}
            <button
              type="button"
              className="btn btn-solid"
              disabled={pending || !email || !name || !consent}
              onClick={requestCode}
              style={{ marginTop: 6 }}
            >
              {pending ? "Sending code…" : "Send verification code →"}
            </button>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4, lineHeight: 1.6 }}>
              We&apos;ll send a 6-digit code to confirm you own that email — it never travels
              outside our system, and we don&apos;t open Razorpay until it&apos;s verified.
            </p>
          </>
        )}

        {/* Step 2 — Enter code */}
        {stage === "code" && (
          <>
            <label>
              6-digit code
              <input
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                autoFocus
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 22,
                  letterSpacing: "0.4em",
                  textAlign: "center",
                }}
              />
            </label>
            {info && <p className="form-msg ok">{info}</p>}
            {error && <p className="form-msg error">{error}</p>}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn btn-solid"
                onClick={verifyCode}
                disabled={pending || code.length !== 6}
              >
                {pending ? "Verifying…" : "Verify code"}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setStage("details");
                  setCode("");
                  setError(null);
                  setInfo(null);
                }}
              >
                Edit details
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={requestCode}
                disabled={pending}
                style={{ fontSize: 12 }}
              >
                Resend code
              </button>
            </div>
          </>
        )}

        {/* Step 3 — Verified, ready to pay */}
        {stage === "verified" && (
          <>
            {info && <p className="form-msg ok">{info}</p>}
            {error && <p className="form-msg error">{error}</p>}
            <button
              type="button"
              className="btn btn-solid"
              onClick={pay}
              disabled={pending}
              style={{ marginTop: 6 }}
            >
              {pending
                ? "Opening checkout…"
                : `Pay ${sym}${amountUsd.toLocaleString()} & subscribe →`}
            </button>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
              You&apos;ll be charged via Razorpay. After payment authorises, we&apos;ll email
              you a one-time link to set a password.
            </p>
          </>
        )}
      </div>
    </>
  );
}

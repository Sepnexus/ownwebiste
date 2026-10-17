"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import Script from "next/script";
import { currencySymbol as symbolFor } from "@/lib/format";

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
type Field = "name" | "email" | "consent" | "code";

const EMAIL_RE = /^\S+@\S+\.\S+$/;

/** Each step is its own <form>, laid out like the `.contact-form` grid it sits in. */
const stepForm: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  gap: 14,
  minWidth: 0,
};

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
  const [invalid, setInvalid] = useState<Field | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);

  const errorId = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const payButtonRef = useRef<HTMLButtonElement>(null);
  const paidHeadingRef = useRef<HTMLHeadingElement>(null);
  const prevStage = useRef<Stage>(stage);

  // Move focus along with the steps so keyboard and screen-reader users
  // aren't dropped when the button they pressed disappears. (The code step
  // focuses its own input via autoFocus.)
  useEffect(() => {
    if (prevStage.current === stage) return;
    prevStage.current = stage;
    if (stage === "details") nameRef.current?.focus();
    if (stage === "verified") payButtonRef.current?.focus();
  }, [stage]);

  useEffect(() => {
    if (paid) paidHeadingRef.current?.focus();
  }, [paid]);

  function fail(message: string, field: Field | null = null) {
    setError(message);
    setInvalid(field);
    if (field) {
      const refs = { name: nameRef, email: emailRef, consent: consentRef, code: codeRef };
      refs[field].current?.focus();
    }
  }

  function fieldA11y(field: Field) {
    return invalid === field
      ? { "aria-invalid": true as const, "aria-describedby": errorId }
      : {};
  }

  function clearMessages() {
    setError(null);
    setInvalid(null);
    setInfo(null);
  }

  function requestCode(target: string = email) {
    clearMessages();
    startTransition(async () => {
      try {
        const r = await fetch("/api/email/verify-request", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: target.trim().toLowerCase(), purpose: "checkout" }),
        });
        const body = (await r.json()) as { ok?: boolean; error?: string };
        if (!r.ok || !body.ok) {
          setError(body.error ?? "Could not send code.");
          return;
        }
        setInfo(`We just sent a 6-digit code to ${target.trim()}. Enter it below within 10 minutes.`);
        setStage("code");
      } catch {
        setError("Network error. Please try again.");
      }
    });
  }

  function verifyCode(submitted: string) {
    clearMessages();
    startTransition(async () => {
      try {
        const r = await fetch("/api/email/verify-check", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            code: submitted,
            purpose: "checkout",
          }),
        });
        const body = (await r.json()) as { ok?: boolean; ticket?: string; error?: string };
        if (!r.ok || !body.ok || !body.ticket) {
          setError(body.error ?? "Verification failed.");
          setInvalid("code");
          codeRef.current?.focus();
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
    clearMessages();
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

  /* Step 1 — validate details, then email a code. */
  function onDetailsSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    clearMessages();

    // Read the inputs directly: autofill doesn't always fire input events.
    const nameVal = nameRef.current?.value ?? name;
    const emailVal = emailRef.current?.value ?? email;
    const consentVal = consentRef.current?.checked ?? consent;
    setName(nameVal);
    setEmail(emailVal);
    setConsent(consentVal);

    if (!nameVal.trim()) return fail("Enter your full name.", "name");
    if (!emailVal.trim()) return fail("Enter your work email.", "email");
    if (!EMAIL_RE.test(emailVal.trim())) {
      return fail("That email address doesn't look right. Check it and try again.", "email");
    }
    if (!consentVal) {
      return fail("Tick the box to let us create your account on this email.", "consent");
    }
    requestCode(emailVal);
  }

  /* Step 2 — check the emailed code. */
  function onCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    const digits = (codeRef.current?.value ?? code).replace(/\D/g, "").slice(0, 6);
    setCode(digits);
    if (!digits) {
      clearMessages();
      return fail("Enter the 6-digit code we emailed you.", "code");
    }
    if (digits.length !== 6) {
      clearMessages();
      return fail("The code should be 6 digits. Check the email and try again.", "code");
    }
    verifyCode(digits);
  }

  /* Step 3 — open Razorpay. */
  function onPaySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    pay();
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
        <h2
          ref={paidHeadingRef}
          tabIndex={-1}
          style={{
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 22,
            lineHeight: 1.3,
            letterSpacing: "normal",
            color: "var(--ink)",
            margin: "0 0 8px",
            outline: "none",
          }}
        >
          Payment authorised.
        </h2>
        We&apos;ve sent a setup link to <strong>{email}</strong>. Click it to set your password
        and access your dashboard. Welcome to Sepnexus.
      </div>
    );
  }

  const sym = symbolFor(currency);

  const errorMsg = error && (
    <p id={errorId} className="form-msg error" role="alert">
      {error}
    </p>
  );
  const infoMsg = info && (
    <p className="form-msg ok" role="status">
      {info}
    </p>
  );

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="contact-form" style={{ gap: 14 }}>
        {/* Step 1 — Details */}
        <form onSubmit={onDetailsSubmit} noValidate style={stepForm}>
          <label>
            Your full name
            <input
              ref={nameRef}
              type="text"
              name="name"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              disabled={stage !== "details"}
              {...fieldA11y("name")}
            />
          </label>
          <label>
            Work email
            <input
              ref={emailRef}
              type="email"
              name="email"
              required
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              disabled={stage !== "details"}
              {...fieldA11y("email")}
            />
          </label>

          {stage === "details" && (
            <>
              <label className="check-row">
                <input
                  ref={consentRef}
                  type="checkbox"
                  name="consent"
                  required
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  {...fieldA11y("consent")}
                />
                <span>
                  I authorise Sepnexus to create my account on this email. I&apos;ll receive a
                  one-time link to set my password after payment is authorised.
                </span>
              </label>
              {errorMsg}
              <button
                type="submit"
                className="btn btn-solid"
                disabled={pending}
                style={{ marginTop: 6 }}
              >
                {pending ? (
                  "Sending code…"
                ) : (
                  <>
                    Send verification code <span aria-hidden="true">→</span>
                  </>
                )}
              </button>
              <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4, lineHeight: 1.6 }}>
                We&apos;ll send a 6-digit code to confirm you own that email — it never travels
                outside our system, and we don&apos;t open Razorpay until it&apos;s verified.
              </p>
            </>
          )}
        </form>

        {/* Step 2 — Enter code */}
        {stage === "code" && (
          <form onSubmit={onCodeSubmit} noValidate style={stepForm}>
            <label>
              6-digit code
              {/* No maxLength: a pasted "123 456" must survive until spaces are stripped. */}
              <input
                ref={codeRef}
                type="text"
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                spellCheck={false}
                autoFocus
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 22,
                  letterSpacing: "0.4em",
                  textAlign: "center",
                }}
                {...fieldA11y("code")}
              />
            </label>
            {infoMsg}
            {errorMsg}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="submit" className="btn btn-solid" disabled={pending}>
                {pending ? "Verifying…" : "Verify code"}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setStage("details");
                  setCode("");
                  clearMessages();
                }}
              >
                Edit details
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => requestCode()}
                disabled={pending}
                style={{ fontSize: 12 }}
              >
                Resend code
              </button>
            </div>
          </form>
        )}

        {/* Step 3 — Verified, ready to pay */}
        {stage === "verified" && (
          <form onSubmit={onPaySubmit} noValidate style={stepForm}>
            {infoMsg}
            {errorMsg}
            <button
              ref={payButtonRef}
              type="submit"
              className="btn btn-solid"
              disabled={pending}
              style={{ marginTop: 6 }}
            >
              {pending ? (
                "Opening checkout…"
              ) : (
                <>
                  {`Pay ${sym}${amountUsd.toLocaleString()} & subscribe`}{" "}
                  <span aria-hidden="true">→</span>
                </>
              )}
            </button>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
              You&apos;ll be charged via Razorpay. After payment authorises, we&apos;ll email
              you a one-time link to set a password.
            </p>
          </form>
        )}
      </div>
    </>
  );
}

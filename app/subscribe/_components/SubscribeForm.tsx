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

export default function SubscribeForm({
  planId,
  planName,
  period,
  amountUsd,
}: {
  planId: string;
  planName: string;
  period: "monthly" | "yearly";
  amountUsd: number;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
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
          handler: () => {
            setPaid(true);
          },
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
        We&apos;ve sent a setup link to <strong>{email}</strong>. Click the link to set your
        password and access your dashboard. Welcome to Sepnexus.
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <form onSubmit={onSubmit} className="contact-form" style={{ gap: 14 }}>
        <label>
          Your full name
          <input
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
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
          />
        </label>
        <label className="check-row">
          <input
            type="checkbox"
            required
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          <span>
            I authorise Sepnexus to create my account on this email. I&apos;ll receive a one-time
            link to set my password after payment is authorised.
          </span>
        </label>
        {error && <p className="form-msg error">{error}</p>}
        <button
          type="submit"
          className="btn btn-solid"
          disabled={pending || !email || !name || !consent}
          style={{ marginTop: 6 }}
        >
          {pending ? "Opening checkout…" : `Pay $${amountUsd.toLocaleString()} & subscribe →`}
        </button>
      </form>
    </>
  );
}

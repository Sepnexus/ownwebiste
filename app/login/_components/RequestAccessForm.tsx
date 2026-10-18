"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { EMAIL_RE, FormError, Honeypot, invalidProps } from "./formUi";

type Field = "name" | "email";

/**
 * The design's Request access form on the sign-in page. Sends the same
 * request_access enquiry as the contact page (POST /api/contact).
 *
 * The design asks only for name, email and company, but the endpoint needs a
 * message of 10+ characters, so the request carries a fixed one that says what
 * the person asked for. It is quoted back in their confirmation email.
 */
const REQUEST_MESSAGE = "Requesting access to the Sepnexus client dashboard.";

export default function RequestAccessForm({
  autoFocus = false,
  onSent,
}: {
  /** Focus the first field on mount (when the form replaced the link the person clicked). */
  autoFocus?: boolean;
  onSent: () => void;
}) {
  const errorId = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invalid, setInvalid] = useState<Field | null>(null);

  function fail(message: string, field: Field | null = null) {
    setError(message);
    setInvalid(field);
    if (field === "name") nameRef.current?.focus();
    if (field === "email") emailRef.current?.focus();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setInvalid(null);

    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const company = String(data.get("company") ?? "").trim();

    if (!name) return fail("Enter your name.", "name");
    if (!email) return fail("Enter your work email.", "email");
    if (!EMAIL_RE.test(email)) {
      return fail("That email address doesn't look right. Check it and try again.", "email");
    }

    setSubmitting(true);
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type: "request_access",
          name,
          email,
          company: company || null,
          message: REQUEST_MESSAGE,
          // Given by sending: the line under the button says what we keep and why.
          consent: true,
          meta: { source: "sign-in page" },
          website: String(data.get("website") ?? ""),
        }),
      });
      if (!r.ok) {
        const body = (await r.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? "Something went wrong. Please try again.");
        return;
      }
      onSent();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      method="post"
      noValidate
      onSubmit={onSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "20px" }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <h2 className="h-s">Request access</h2>
        <p className="muted" style={{ margin: "0", fontSize: "15px" }}>
          For existing clients and partners. We’ll confirm within 48 hours.
        </p>
      </div>
      <div className="field">
        <label htmlFor="r-name">Name</label>
        <input
          ref={nameRef}
          id="r-name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Your name"
          required
          maxLength={120}
          autoFocus={autoFocus}
          {...invalidProps(invalid === "name", errorId)}
        />
      </div>
      <div className="field">
        <label htmlFor="r-email">Work email</label>
        <input
          ref={emailRef}
          id="r-email"
          name="email"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="you@company.com"
          required
          maxLength={254}
          {...invalidProps(invalid === "email", errorId)}
        />
      </div>
      <div className="field">
        <label htmlFor="r-co">Company</label>
        <input
          id="r-co"
          name="company"
          type="text"
          autoComplete="organization"
          placeholder="Company name"
          maxLength={160}
        />
      </div>
      <Honeypot />
      {error && <FormError id={errorId}>{error}</FormError>}
      <button type="submit" className="btn btn-full" disabled={submitting}>
        {submitting ? "Sending…" : "Request access"}
      </button>
      <p className="fine">
        Your details are only used to set up and answer your request. By sending, you agree to us
        storing them for that — see our <Link href="/legal/privacy">Privacy policy</Link>.
      </p>
      <p className="fine">
        New to Sepnexus? <Link href="/contact">Start a project</Link> instead.
      </p>
    </form>
  );
}

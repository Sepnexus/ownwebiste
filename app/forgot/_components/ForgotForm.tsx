"use client";

import { useEffect, useId, useRef, useState } from "react";

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export default function ForgotForm() {
  const errorId = useId();
  const emailRef = useRef<HTMLInputElement>(null);
  const doneHeadingRef = useRef<HTMLHeadingElement>(null);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** True when the error is about the email field itself (not a server/network problem). */
  const [emailInvalid, setEmailInvalid] = useState(false);

  // The confirmation replaces the form; move focus to it so keyboard and
  // screen-reader users don't get dropped at the top of the page.
  useEffect(() => {
    if (done) doneHeadingRef.current?.focus();
  }, [done]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setEmailInvalid(false);

    const emailVal = (emailRef.current?.value ?? email).trim();
    setEmail(emailVal);
    if (!emailVal || !EMAIL_RE.test(emailVal)) {
      setEmailInvalid(true);
      setError(
        emailVal
          ? "That email address doesn't look right. Check it and try again."
          : "Enter the email address you sign in with.",
      );
      emailRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const r = await fetch("/api/password/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: emailVal }),
      });
      // The server answers "ok" whether or not the account exists, so a
      // non-OK status here is a real problem (bad email, server error).
      if (!r.ok) {
        setEmailInvalid(r.status === 400);
        setError(
          r.status === 400
            ? "That email address doesn't look right. Check it and try again."
            : "Something went wrong on our side. Please try again in a minute.",
        );
        return;
      }
      setDone(true);
    } catch {
      setError("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div>
        <h2
          ref={doneHeadingRef}
          tabIndex={-1}
          style={{
            fontFamily: "var(--serif)",
            fontWeight: 400,
            fontSize: 22,
            margin: "0 0 8px",
            color: "var(--ink)",
            outline: "none",
          }}
        >
          Check your inbox.
        </h2>
        <p style={{ color: "var(--ink-2)", lineHeight: 1.6, fontSize: 14, margin: 0 }}>
          If an account with that email exists, a reset link is on its way. Check your inbox in a
          minute (and your spam folder, just in case).
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="contact-form" style={{ gap: 14 }}>
      <label>
        Email
        <input
          ref={emailRef}
          type="email"
          name="email"
          required
          autoFocus
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={emailInvalid || undefined}
          aria-describedby={emailInvalid && error ? errorId : undefined}
        />
      </label>
      {error && (
        <p id={errorId} className="form-msg error" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="btn btn-solid"
        disabled={submitting}
        style={{ marginTop: 8 }}
      >
        {submitting ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}

"use client";

import { useEffect, useId, useRef, useState } from "react";
import { DoneRing, EMAIL_RE, FormError, invalidProps } from "@/app/login/_components/formUi";

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
      <div className="done" role="status">
        <DoneRing />
        <h2 ref={doneHeadingRef} tabIndex={-1} className="h-s" style={{ outline: "none" }}>
          Check your inbox.
        </h2>
        <p className="muted" style={{ margin: "0", maxWidth: "320px", lineHeight: "1.5" }}>
          If an account with that email exists, a reset link is on its way. Check your inbox in a
          minute (and your spam folder, just in case).
        </p>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "20px" }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <h2 className="h-s">Forgot password</h2>
        <p className="muted" style={{ margin: "0", fontSize: "15px" }}>
          Enter your email and we&apos;ll send a reset link. Valid for 1 hour.
        </p>
      </div>
      <div className="field">
        <label htmlFor="f-email">Email</label>
        <input
          ref={emailRef}
          id="f-email"
          type="email"
          name="email"
          required
          autoFocus
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          {...invalidProps(emailInvalid && !!error, errorId)}
        />
      </div>
      {error && <FormError id={errorId}>{error}</FormError>}
      <button type="submit" className="btn btn-full" disabled={submitting}>
        {submitting ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";

export default function ForgotForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await fetch("/api/password/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <p style={{ color: "var(--ink-2)", lineHeight: 1.6, fontSize: 14 }}>
        If an account with that email exists, a reset link is on its way. Check your inbox in a
        minute (and your spam folder, just in case).
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="contact-form" style={{ gap: 14 }}>
      <label>
        Email
        <input
          type="email"
          required
          autoFocus
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <button
        type="submit"
        className="btn btn-solid"
        disabled={submitting || !email}
        style={{ marginTop: 8 }}
      >
        {submitting ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch("/api/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!r.ok) {
        const body = (await r.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? "Sign in failed.");
        return;
      }
      const body = (await r.json()) as { role: "admin" | "customer" };
      const next = sp.get("next");
      if (next?.startsWith("/")) {
        router.push(next);
      } else {
        router.push(body.role === "admin" ? "/admin" : "/dashboard");
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
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
      <label>
        Password
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      {error && <p className="form-msg error">{error}</p>}
      <button
        type="submit"
        className="btn btn-solid"
        disabled={submitting || !email || !password}
        style={{ marginTop: 8 }}
      >
        {submitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

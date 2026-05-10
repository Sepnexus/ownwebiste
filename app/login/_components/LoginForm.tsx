"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [needs2fa, setNeeds2fa] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload: Record<string, string> = { email, password };
      if (needs2fa) payload.code = code;

      const r = await fetch("/api/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await r.json().catch(() => ({}))) as {
        ok?: boolean;
        role?: "admin" | "customer";
        requires2fa?: boolean;
        error?: string;
      };
      if (!r.ok) {
        setError(body.error ?? "Sign in failed.");
        return;
      }
      // 2FA required — server sent { requires2fa: true } on first call.
      if (body.requires2fa && !needs2fa) {
        setNeeds2fa(true);
        return;
      }
      if (!body.ok || !body.role) {
        setError(body.error ?? "Sign in failed.");
        return;
      }
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
          autoFocus={!needs2fa}
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={needs2fa}
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
          disabled={needs2fa}
        />
      </label>
      {needs2fa && (
        <label>
          2FA code
          <input
            type="text"
            inputMode="numeric"
            autoFocus
            required
            placeholder="123456 or recovery code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={20}
            style={{
              fontFamily: "var(--mono)",
              fontSize: 18,
              letterSpacing: "0.3em",
              textAlign: "center",
            }}
          />
          <span className="help" style={{ textTransform: "none", letterSpacing: 0, fontFamily: "var(--sans)", fontSize: 12 }}>
            6-digit code from your authenticator app, or one of your recovery codes.
          </span>
        </label>
      )}
      {error && <p className="form-msg error">{error}</p>}
      <button
        type="submit"
        className="btn btn-solid"
        disabled={
          submitting ||
          !email ||
          !password ||
          (needs2fa && code.length < 6)
        }
        style={{ marginTop: 8 }}
      >
        {submitting
          ? "Signing in…"
          : needs2fa
            ? "Verify code"
            : "Sign in"}
      </button>
    </form>
  );
}

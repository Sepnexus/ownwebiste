"use client";

import { useId, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Field = "email" | "password" | "code";

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export default function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const errorId = useId();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [needs2fa, setNeeds2fa] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invalid, setInvalid] = useState<Field | null>(null);

  /** Show an error, mark the field it belongs to (if any) and move focus there. */
  function fail(message: string, field: Field | null = null) {
    setError(message);
    setInvalid(field);
    if (field) {
      const refs = { email: emailRef, password: passwordRef, code: codeRef };
      refs[field].current?.focus();
    }
  }

  /** aria props for a field: invalid + pointed at the error message when it's the culprit. */
  function fieldA11y(field: Field) {
    return invalid === field
      ? { "aria-invalid": true as const, "aria-describedby": errorId }
      : {};
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setInvalid(null);

    // Read what's actually in the inputs: some password managers fill fields
    // without firing input events, so state can lag behind the DOM.
    const emailVal = (emailRef.current?.value ?? email).trim();
    const passwordVal = passwordRef.current?.value ?? password;
    const codeVal = (codeRef.current?.value ?? code).trim();
    setEmail(emailVal);
    setPassword(passwordVal);

    if (!emailVal) return fail("Enter your email address.", "email");
    if (!EMAIL_RE.test(emailVal)) {
      return fail("That email address doesn't look right. Check it and try again.", "email");
    }
    if (!passwordVal) return fail("Enter your password.", "password");
    if (needs2fa && !codeVal) {
      return fail(
        "Enter the 6-digit code from your authenticator app, or one of your recovery codes.",
        "code",
      );
    }

    setSubmitting(true);
    try {
      const payload: Record<string, string> = { email: emailVal, password: passwordVal };
      if (needs2fa) payload.code = codeVal;

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
        if (needs2fa) setInvalid("code");
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
    <form onSubmit={onSubmit} noValidate className="contact-form" style={{ gap: 14 }}>
      <label>
        Email
        <input
          ref={emailRef}
          type="email"
          name="email"
          required
          autoFocus={!needs2fa}
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={needs2fa}
          {...fieldA11y("email")}
        />
      </label>
      <label>
        Password
        <input
          ref={passwordRef}
          type="password"
          name="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={needs2fa}
          {...fieldA11y("password")}
        />
      </label>
      {needs2fa && (
        <label>
          2FA code
          {/* Not inputMode="numeric": recovery codes are letters + digits with a hyphen. */}
          <input
            ref={codeRef}
            type="text"
            name="code"
            inputMode="text"
            autoComplete="one-time-code"
            autoCapitalize="none"
            spellCheck={false}
            autoFocus
            required
            placeholder="123456 or recovery code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={40}
            style={{
              fontFamily: "var(--mono)",
              fontSize: 18,
              letterSpacing: "0.3em",
              textAlign: "center",
            }}
            {...fieldA11y("code")}
          />
          <span className="help" style={{ textTransform: "none", letterSpacing: 0, fontFamily: "var(--sans)", fontSize: 12 }}>
            6-digit code from your authenticator app, or one of your recovery codes (like
            a1b2c-3d4e5).
          </span>
        </label>
      )}
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
        {submitting
          ? "Signing in…"
          : needs2fa
            ? "Verify code"
            : "Sign in"}
      </button>
    </form>
  );
}

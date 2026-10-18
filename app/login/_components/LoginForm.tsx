"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EMAIL_RE, FormError, invalidProps } from "./formUi";

type Field = "email" | "password" | "code";

/** Only follow same-site paths: "/x" yes, "//evil.com" or "/\evil.com" no. */
function safeNext(next: string | null): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return null;
  }
  return next;
}

/**
 * Sign in, in the design's "Welcome back" form. Same flow as before the
 * redesign: POST /api/login, a second step for the 2FA code when the account
 * has it on, then `?next=` or the dashboard for the role.
 */
export default function LoginForm({
  next,
  autoFocus = true,
  onRequestAccess,
}: {
  /** The `?next=` query value, read by the page. */
  next: string | null;
  /** Focus the email field on mount (off when the Sign in switch brought the form back). */
  autoFocus?: boolean;
  /** Switches the card to Request access (the "Don't have an account?" link). */
  onRequestAccess: () => void;
}) {
  const router = useRouter();
  const errorId = useId();
  const hintId = useId();
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
      const target = safeNext(next);
      if (target) {
        router.push(target);
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
    // method="post": if someone submits before the page has hydrated, the
    // browser posts instead of putting the password in the URL.
    <form
      method="post"
      noValidate
      onSubmit={onSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "20px" }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <h2 className="h-s">Welcome back</h2>
        <p className="muted" style={{ margin: "0", fontSize: "15px" }}>
          Sign in to your Sepnexus dashboard.
        </p>
      </div>
      <div className="field">
        <label htmlFor="s-email">Email</label>
        <input
          ref={emailRef}
          id="s-email"
          type="email"
          name="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="you@company.com"
          required
          autoFocus={autoFocus && !needs2fa}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={needs2fa}
          {...invalidProps(invalid === "email", errorId)}
        />
      </div>
      <div className="field">
        <div className="row-between">
          <label htmlFor="s-pass">Password</label>
          <Link href="/forgot" style={{ fontSize: "13px" }}>
            Forgot password?
          </Link>
        </div>
        <input
          ref={passwordRef}
          id="s-pass"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={needs2fa}
          {...invalidProps(invalid === "password", errorId)}
        />
      </div>
      {needs2fa && (
        <div className="field">
          <label htmlFor="s-code">2FA code</label>
          {/* Not inputMode="numeric": recovery codes are letters + digits with a hyphen. */}
          <input
            ref={codeRef}
            id="s-code"
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
            {...invalidProps(invalid === "code", errorId, {
              fontFamily: "var(--font-mono), 'Geist Mono', ui-monospace, monospace",
              fontSize: 18,
              letterSpacing: "0.3em",
              textAlign: "center",
            })}
            aria-describedby={invalid === "code" ? `${hintId} ${errorId}` : hintId}
          />
          <span id={hintId} className="fine">
            6-digit code from your authenticator app, or one of your recovery codes (like
            a1b2c-3d4e5).
          </span>
        </div>
      )}
      {error && <FormError id={errorId}>{error}</FormError>}
      <button type="submit" className="btn btn-full" disabled={submitting}>
        {submitting ? "Signing in…" : needs2fa ? "Verify code" : "Sign in"}
      </button>
      <p className="fine">
        Don’t have an account?{" "}
        <Link
          href="/login?mode=request"
          onClick={(e) => {
            e.preventDefault();
            onRequestAccess();
          }}
        >
          Request access
        </Link>
      </p>
    </form>
  );
}

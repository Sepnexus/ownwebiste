"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Field = "password" | "confirm";

export default function ResetForm({ token, email }: { token: string; email?: string }) {
  const router = useRouter();
  const errorId = useId();
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invalid, setInvalid] = useState<Field | null>(null);

  function fail(message: string, field: Field | null = null) {
    setError(message);
    setInvalid(field);
    if (field === "password") passwordRef.current?.focus();
    if (field === "confirm") confirmRef.current?.focus();
  }

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

    // Password managers can fill fields without firing input events.
    const passwordVal = passwordRef.current?.value ?? password;
    const confirmVal = confirmRef.current?.value ?? confirm;
    setPassword(passwordVal);
    setConfirm(confirmVal);

    if (!passwordVal) return fail("Enter a new password.", "password");
    if (passwordVal.length < 8) {
      return fail("Password must be at least 8 characters.", "password");
    }
    if (!confirmVal) return fail("Type the new password again to confirm it.", "confirm");
    if (passwordVal !== confirmVal) return fail("Passwords don't match.", "confirm");

    setSubmitting(true);
    try {
      const r = await fetch("/api/password/reset", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, password: passwordVal }),
      });
      if (!r.ok) {
        const body = (await r.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? "Couldn't reset. Please request a new link.");
        return;
      }
      const body = (await r.json()) as { role: "admin" | "customer" };
      router.push(body.role === "admin" ? "/admin" : "/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="contact-form" style={{ gap: 14 }}>
      {/* Hidden username so password managers save the new password against
          the right account. Not shown: the page already says which email. */}
      {email && (
        <input
          type="email"
          name="email"
          autoComplete="username"
          value={email}
          readOnly
          hidden
        />
      )}
      <label>
        New password
        <input
          ref={passwordRef}
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          {...fieldA11y("password")}
        />
      </label>
      <label>
        Confirm new password
        <input
          ref={confirmRef}
          type="password"
          name="confirm"
          required
          minLength={8}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          {...fieldA11y("confirm")}
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
        {submitting ? "Setting…" : "Set new password"}
      </button>
    </form>
  );
}

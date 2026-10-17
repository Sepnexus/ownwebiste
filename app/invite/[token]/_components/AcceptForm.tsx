"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Field = "password" | "confirm";

export default function AcceptForm({
  token,
  email,
  initialError,
}: {
  token: string;
  email: string;
  initialError: string | null;
}) {
  const router = useRouter();
  const errorId = useId();
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
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

    if (!passwordVal) return fail("Choose a password.", "password");
    if (passwordVal.length < 8) {
      return fail("Password must be at least 8 characters.", "password");
    }
    if (!confirmVal) return fail("Type the password again to confirm it.", "confirm");
    if (passwordVal !== confirmVal) return fail("Passwords don't match.", "confirm");

    setSubmitting(true);
    try {
      const r = await fetch("/api/invite/accept", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, name: name.trim() || null, password: passwordVal }),
      });
      if (!r.ok) {
        const body = (await r.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? "Couldn't accept invite. Please try again.");
        return;
      }
      router.push("/dashboard");
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
        {/* readOnly (not disabled) so password managers pick it up as the username. */}
        <input
          type="email"
          name="email"
          autoComplete="username"
          value={email}
          readOnly
          style={{ color: "var(--muted)", cursor: "default" }}
        />
      </label>
      <label>
        Your name (optional)
        <input
          type="text"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Doe"
        />
      </label>
      <label>
        Password
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
        Confirm password
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
        {submitting ? "Setting up…" : "Accept invite & sign in"}
      </button>
    </form>
  );
}

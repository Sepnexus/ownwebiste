"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FormError, invalidProps } from "@/app/login/_components/formUi";

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
    // method="post": a submit before hydration posts instead of putting the
    // password in the URL.
    <form
      method="post"
      noValidate
      onSubmit={onSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "20px" }}
    >
      <div className="field">
        <label htmlFor="i-email">Email</label>
        {/* readOnly (not disabled) so password managers pick it up as the username. */}
        <input
          id="i-email"
          type="email"
          name="email"
          autoComplete="username"
          value={email}
          readOnly
          style={{ color: "#a1a1a6", cursor: "default" }}
        />
      </div>
      <div className="field">
        <label htmlFor="i-name">Your name (optional)</label>
        <input
          id="i-name"
          type="text"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Doe"
        />
      </div>
      <div className="field">
        <label htmlFor="i-pass">Password</label>
        <input
          ref={passwordRef}
          id="i-pass"
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          {...invalidProps(invalid === "password", errorId)}
        />
      </div>
      <div className="field">
        <label htmlFor="i-confirm">Confirm password</label>
        <input
          ref={confirmRef}
          id="i-confirm"
          type="password"
          name="confirm"
          required
          minLength={8}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          {...invalidProps(invalid === "confirm", errorId)}
        />
      </div>
      {error && <FormError id={errorId}>{error}</FormError>}
      <button type="submit" className="btn btn-full" disabled={submitting}>
        {submitting ? "Setting up…" : "Accept invite & sign in"}
      </button>
    </form>
  );
}

"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";

type Stage = "idle" | "setup" | "verify" | "saved";

const fieldLabel: React.CSSProperties = {
  display: "grid",
  gap: 4,
  fontSize: 12,
  color: "var(--muted)",
};

export default function TwoFactor({
  enabled,
  enabledAt,
}: {
  enabled: boolean;
  enabledAt: Date | null;
}) {
  const [stage, setStage] = useState<Stage>("idle");
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Disable flow
  const [disablePassword, setDisablePassword] = useState("");
  const [disableError, setDisableError] = useState<string | null>(null);

  const codeId = useId();
  const codeErrorId = useId();
  const disableErrorId = useId();
  const setupButtonRef = useRef<HTMLButtonElement>(null);
  const verifyIntroRef = useRef<HTMLParagraphElement>(null);
  const savedHeadingRef = useRef<HTMLHeadingElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const disablePasswordRef = useRef<HTMLInputElement>(null);
  const prevStage = useRef<Stage>(stage);

  // Keep keyboard / screen-reader users in place as the panel swaps views.
  useEffect(() => {
    if (prevStage.current === stage) return;
    prevStage.current = stage;
    if (stage === "verify") verifyIntroRef.current?.focus();
    if (stage === "saved") savedHeadingRef.current?.focus();
    if (stage === "idle") setupButtonRef.current?.focus();
  }, [stage]);

  async function startSetup() {
    setError(null);
    startTransition(async () => {
      try {
        const r = await fetch("/api/account/2fa/setup", { method: "POST" });
        const body = (await r.json()) as {
          ok?: boolean;
          qrDataUrl?: string;
          secret?: string;
          error?: string;
        };
        if (!r.ok || !body.ok || !body.qrDataUrl) {
          setError(body.error ?? "Could not start 2FA setup.");
          return;
        }
        setQr(body.qrDataUrl);
        setSecret(body.secret ?? null);
        setStage("verify");
      } catch {
        setError("We couldn't reach the server. Check your connection and try again.");
      }
    });
  }

  async function confirmCode(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setError(null);
    const digits = (codeRef.current?.value ?? code).replace(/\D/g, "").slice(0, 6);
    setCode(digits);
    if (digits.length !== 6) {
      setError(
        digits
          ? "The code should be 6 digits. Check your authenticator app and try again."
          : "Enter the 6-digit code from your authenticator app.",
      );
      codeRef.current?.focus();
      return;
    }
    startTransition(async () => {
      try {
        const r = await fetch("/api/account/2fa/enable", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ code: digits }),
        });
        const body = (await r.json()) as {
          ok?: boolean;
          recoveryCodes?: string[];
          error?: string;
        };
        if (!r.ok || !body.ok || !body.recoveryCodes) {
          setError(body.error ?? "Could not enable 2FA.");
          codeRef.current?.focus();
          return;
        }
        setRecoveryCodes(body.recoveryCodes);
        setStage("saved");
      } catch {
        setError("We couldn't reach the server. Check your connection and try again.");
      }
    });
  }

  async function disable(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setDisableError(null);
    const passwordVal = disablePasswordRef.current?.value ?? disablePassword;
    setDisablePassword(passwordVal);
    if (!passwordVal) {
      setDisableError("Enter your current password to confirm.");
      disablePasswordRef.current?.focus();
      return;
    }
    startTransition(async () => {
      try {
        const r = await fetch("/api/account/2fa/disable", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ password: passwordVal }),
        });
        const body = (await r.json()) as { ok?: boolean; error?: string };
        if (!r.ok || !body.ok) {
          setDisableError(body.error ?? "Could not disable 2FA.");
          return;
        }
        window.location.reload();
      } catch {
        setDisableError("We couldn't reach the server. Check your connection and try again.");
      }
    });
  }

  if (enabled) {
    return (
      <div
        style={{
          border: "1px solid var(--c-cyan)",
          background: "rgba(43,182,224,0.06)",
          borderRadius: 12,
          padding: 18,
          maxWidth: 720,
        }}
      >
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--c-cyan-ink)",
            marginBottom: 8,
          }}
        >
          <span aria-hidden="true">✓</span> Two-factor authentication is on
        </div>
        <div style={{ color: "var(--ink-2)", fontSize: 14, marginBottom: 14, lineHeight: 1.6 }}>
          Enabled {enabledAt ? new Date(enabledAt).toLocaleDateString() : ""}. You'll be asked
          for a 6-digit code from your authenticator app every time you sign in.
        </div>

        <details style={{ marginTop: 8 }}>
          <summary
            style={{
              cursor: "pointer",
              color: "var(--c-red-ink)",
              fontFamily: "var(--mono)",
              fontSize: 12,
              letterSpacing: "0.06em",
            }}
          >
            Disable 2FA
          </summary>
          <form
            onSubmit={disable}
            noValidate
            style={{ marginTop: 14, display: "grid", gap: 10, maxWidth: 380 }}
          >
            <label style={fieldLabel}>
              Current password
              <input
                ref={disablePasswordRef}
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="Current password to confirm"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                aria-invalid={disableError ? true : undefined}
                aria-describedby={disableError ? disableErrorId : undefined}
                style={{
                  fontFamily: "var(--sans)",
                  padding: "10px 12px",
                  border: "1px solid var(--line)",
                  borderRadius: 10,
                }}
              />
            </label>
            {disableError && (
              <p id={disableErrorId} className="form-msg error" role="alert">
                {disableError}
              </p>
            )}
            <button
              type="submit"
              className="btn btn-outline"
              disabled={pending}
              style={{
                color: "var(--c-red-ink)",
                borderColor: "var(--c-red)",
                width: "fit-content",
              }}
            >
              {pending ? "Disabling…" : "Disable 2FA"}
            </button>
          </form>
        </details>
      </div>
    );
  }

  if (stage === "saved") {
    return (
      <div
        style={{
          border: "1px solid var(--c-cyan)",
          background: "rgba(43,182,224,0.04)",
          borderRadius: 12,
          padding: 22,
          maxWidth: 720,
        }}
      >
        <h3
          ref={savedHeadingRef}
          tabIndex={-1}
          style={{
            fontFamily: "var(--serif)",
            fontWeight: 400,
            fontSize: 22,
            margin: "0 0 8px",
            outline: "none",
          }}
        >
          2FA enabled. Save these recovery codes.
        </h3>
        <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6, margin: "0 0 16px" }}>
          You can use any one of these codes <strong>once</strong> to sign in if you lose your
          authenticator device. Store them somewhere safe right now — they won't be shown again.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            background: "rgba(20,17,16,0.04)",
            padding: 14,
            borderRadius: 10,
            fontFamily: "var(--mono)",
            fontSize: 14,
          }}
        >
          {recoveryCodes.map((c) => (
            <code key={c} style={{ color: "var(--ink)" }}>
              {c}
            </code>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              navigator.clipboard
                ?.writeText(recoveryCodes.join("\n"))
                .then(() => setCopied(true))
                .catch(() => setCopied(false));
            }}
          >
            Copy all codes
          </button>
          <span
            role="status"
            style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--c-cyan-ink)" }}
          >
            {copied ? "Copied to clipboard." : ""}
          </span>
        </div>
        <p style={{ marginTop: 14, fontSize: 13, color: "var(--muted)" }}>
          <a href="/admin/account" style={{ color: "var(--ink)" }}>
            Back to account <span aria-hidden="true">→</span>
          </a>
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        border: "1px solid var(--line)",
        borderRadius: 12,
        padding: 22,
        background: "rgba(255,255,255,0.6)",
        maxWidth: 720,
      }}
    >
      <h3
        style={{
          fontFamily: "var(--serif)",
          fontWeight: 400,
          fontSize: 22,
          margin: "0 0 6px",
        }}
      >
        Two-factor authentication
      </h3>
      <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6, margin: "0 0 18px" }}>
        Add a second layer to your sign-in. After entering your password, you&apos;ll need a
        6-digit code from an authenticator app (Google Authenticator, 1Password, Authy…).
      </p>

      {stage === "idle" && (
        <>
          <button
            ref={setupButtonRef}
            type="button"
            className="btn btn-solid"
            onClick={startSetup}
            disabled={pending}
          >
            {pending ? (
              "Generating…"
            ) : (
              <>
                Set up 2FA <span aria-hidden="true">→</span>
              </>
            )}
          </button>
          {error && (
            <p className="form-msg error" role="alert" style={{ marginTop: 12 }}>
              {error}
            </p>
          )}
        </>
      )}

      {stage === "verify" && qr && (
        <form onSubmit={confirmCode} noValidate style={{ display: "grid", gap: 16 }}>
          <p
            ref={verifyIntroRef}
            tabIndex={-1}
            style={{ margin: 0, color: "var(--ink-2)", fontSize: 14, outline: "none" }}
          >
            1. Scan this QR with your authenticator app.
          </p>
          <img
            src={qr}
            alt="QR code for adding Sepnexus to your authenticator app"
            style={{ width: 200, height: 200, borderRadius: 10, border: "1px solid var(--line)" }}
          />
          {secret && (
            <div style={{ display: "grid", gap: 6 }}>
              <p style={{ margin: 0, color: "var(--muted)", fontSize: 13 }}>
                Can&apos;t scan? Enter this key in your app instead:
              </p>
              <code
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 15,
                  letterSpacing: "0.12em",
                  color: "var(--ink)",
                  background: "rgba(20,17,16,0.04)",
                  padding: "8px 12px",
                  borderRadius: 8,
                  width: "fit-content",
                  maxWidth: "100%",
                  wordBreak: "break-all",
                  userSelect: "all",
                }}
              >
                {secret}
              </code>
            </div>
          )}
          <label
            htmlFor={codeId}
            style={{ margin: 0, color: "var(--ink-2)", fontSize: 14 }}
          >
            2. Enter the 6-digit code it shows you.
          </label>
          {/* No maxLength: a pasted "123 456" must survive until spaces are stripped. */}
          <input
            ref={codeRef}
            id={codeId}
            type="text"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            spellCheck={false}
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? codeErrorId : undefined}
            style={{
              fontFamily: "var(--mono)",
              fontSize: 20,
              letterSpacing: "0.4em",
              textAlign: "center",
              padding: "12px 14px",
              border: "1px solid var(--line)",
              borderRadius: 10,
              maxWidth: 240,
            }}
          />
          {error && (
            <p id={codeErrorId} className="form-msg error" role="alert">
              {error}
            </p>
          )}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="submit" className="btn btn-solid" disabled={pending}>
              {pending ? "Verifying…" : "Confirm & enable"}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setStage("idle");
                setQr(null);
                setSecret(null);
                setCode("");
                setError(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

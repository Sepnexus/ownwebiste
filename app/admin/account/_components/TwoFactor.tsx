"use client";

import { useState, useTransition } from "react";

export default function TwoFactor({
  enabled,
  enabledAt,
}: {
  enabled: boolean;
  enabledAt: Date | null;
}) {
  const [stage, setStage] = useState<"idle" | "setup" | "verify" | "saved">("idle");
  const [qr, setQr] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Disable flow
  const [disablePassword, setDisablePassword] = useState("");
  const [disableError, setDisableError] = useState<string | null>(null);

  async function startSetup() {
    setError(null);
    startTransition(async () => {
      const r = await fetch("/api/account/2fa/setup", { method: "POST" });
      const body = (await r.json()) as { ok?: boolean; qrDataUrl?: string; error?: string };
      if (!r.ok || !body.ok || !body.qrDataUrl) {
        setError(body.error ?? "Could not start 2FA setup.");
        return;
      }
      setQr(body.qrDataUrl);
      setStage("verify");
    });
  }

  async function confirmCode() {
    setError(null);
    startTransition(async () => {
      const r = await fetch("/api/account/2fa/enable", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const body = (await r.json()) as { ok?: boolean; recoveryCodes?: string[]; error?: string };
      if (!r.ok || !body.ok || !body.recoveryCodes) {
        setError(body.error ?? "Could not enable 2FA.");
        return;
      }
      setRecoveryCodes(body.recoveryCodes);
      setStage("saved");
    });
  }

  async function disable() {
    setDisableError(null);
    startTransition(async () => {
      const r = await fetch("/api/account/2fa/disable", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password: disablePassword }),
      });
      const body = (await r.json()) as { ok?: boolean; error?: string };
      if (!r.ok || !body.ok) {
        setDisableError(body.error ?? "Could not disable 2FA.");
        return;
      }
      window.location.reload();
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
            color: "var(--c-cyan)",
            marginBottom: 8,
          }}
        >
          ✓ Two-factor authentication is on
        </div>
        <div style={{ color: "var(--ink-2)", fontSize: 14, marginBottom: 14, lineHeight: 1.6 }}>
          Enabled {enabledAt ? new Date(enabledAt).toLocaleDateString() : ""}. You'll be asked
          for a 6-digit code from your authenticator app every time you sign in.
        </div>

        <details style={{ marginTop: 8 }}>
          <summary
            style={{
              cursor: "pointer",
              color: "var(--c-red)",
              fontFamily: "var(--mono)",
              fontSize: 12,
              letterSpacing: "0.06em",
            }}
          >
            Disable 2FA
          </summary>
          <div style={{ marginTop: 14, display: "grid", gap: 10, maxWidth: 380 }}>
            <input
              type="password"
              placeholder="Current password to confirm"
              value={disablePassword}
              onChange={(e) => setDisablePassword(e.target.value)}
              style={{
                fontFamily: "var(--sans)",
                fontSize: 14,
                padding: "10px 12px",
                border: "1px solid var(--line)",
                borderRadius: 10,
              }}
            />
            {disableError && <p className="form-msg error">{disableError}</p>}
            <button
              type="button"
              className="btn btn-outline"
              onClick={disable}
              disabled={pending || !disablePassword}
              style={{
                color: "var(--c-red)",
                borderColor: "var(--c-red)",
                width: "fit-content",
              }}
            >
              {pending ? "Disabling…" : "Disable 2FA"}
            </button>
          </div>
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
          style={{
            fontFamily: "var(--serif)",
            fontWeight: 400,
            fontSize: 22,
            margin: "0 0 8px",
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
        <button
          type="button"
          className="btn btn-outline"
          style={{ marginTop: 16 }}
          onClick={() => {
            navigator.clipboard?.writeText(recoveryCodes.join("\n"));
          }}
        >
          Copy all codes
        </button>
        <p style={{ marginTop: 14, fontSize: 13, color: "var(--muted)" }}>
          <a href="/admin/account" style={{ color: "var(--ink)" }}>
            Back to account →
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
        <button
          type="button"
          className="btn btn-solid"
          onClick={startSetup}
          disabled={pending}
        >
          {pending ? "Generating…" : "Set up 2FA →"}
        </button>
      )}

      {stage === "verify" && qr && (
        <div style={{ display: "grid", gap: 16 }}>
          <p style={{ margin: 0, color: "var(--ink-2)", fontSize: 14 }}>
            1. Scan this QR with your authenticator app.
          </p>
          <img
            src={qr}
            alt="TOTP QR"
            style={{ width: 200, height: 200, borderRadius: 10, border: "1px solid var(--line)" }}
          />
          <p style={{ margin: 0, color: "var(--ink-2)", fontSize: 14 }}>
            2. Enter the 6-digit code it shows you.
          </p>
          <input
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
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
          {error && <p className="form-msg error">{error}</p>}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              className="btn btn-solid"
              onClick={confirmCode}
              disabled={pending || code.length !== 6}
            >
              {pending ? "Verifying…" : "Confirm & enable"}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setStage("idle");
                setQr(null);
                setCode("");
                setError(null);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

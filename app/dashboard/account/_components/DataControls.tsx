"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function DataControls() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const panelId = useId();
  const errorId = useId();

  // Delete flow
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [phraseInvalid, setPhraseInvalid] = useState(false);

  function exportData() {
    window.location.href = "/api/account/export";
  }

  function deleteAccount() {
    setError(null);
    setPhraseInvalid(false);
    if (confirmPhrase !== "delete my account") {
      setError("Type the phrase exactly: delete my account");
      setPhraseInvalid(true);
      return;
    }
    startTransition(async () => {
      try {
        const r = await fetch("/api/account/delete", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ password, confirm: confirmPhrase }),
        });
        const body = (await r.json()) as { ok?: boolean; error?: string };
        if (!r.ok || !body.ok) {
          setError(body.error ?? "Could not delete account.");
          return;
        }
        router.push("/");
        router.refresh();
      } catch {
        setError("We couldn't reach the server. Check your connection and try again.");
      }
    });
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <h2 style={{ marginTop: 32 }}>Your data</h2>
      <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6, margin: "0 0 16px" }}>
        Sepnexus respects your right to access and remove your data. You can download every
        record we hold for you, or close your account permanently.
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
        <button type="button" className="btn btn-outline" onClick={exportData}>
          Download my data (JSON) <span aria-hidden="true">↓</span>
        </button>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          style={{ color: "var(--c-red-ink)", borderColor: "var(--c-red)" }}
        >
          {open ? "Cancel" : "Delete my account"}
        </button>
      </div>

      {open && (
        <div
          id={panelId}
          style={{
            border: "1px solid var(--c-red)",
            background: "rgba(232,74,79,0.06)",
            borderRadius: 12,
            padding: 18,
            display: "grid",
            gap: 12,
          }}
        >
          <p style={{ margin: 0, color: "var(--ink-2)", fontSize: 14, lineHeight: 1.6 }}>
            <strong>This is permanent.</strong> Cancel any active Razorpay subscription first
            from your dashboard. After deletion, you&apos;ll lose access to your data and can&apos;t
            log in. Razorpay will retain invoices for legal/tax compliance.
          </p>
          <label style={{ display: "grid", gap: 4, fontSize: 12, color: "var(--muted)" }}>
            Current password
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                fontFamily: "var(--sans)",
                padding: "10px 12px",
                border: "1px solid var(--line)",
                borderRadius: 10,
              }}
            />
          </label>
          <label style={{ display: "grid", gap: 4, fontSize: 12, color: "var(--muted)" }}>
            Type <code style={{ color: "var(--c-red-ink)" }}>delete my account</code> to confirm
            <input
              type="text"
              name="confirm-phrase"
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={confirmPhrase}
              onChange={(e) => setConfirmPhrase(e.target.value)}
              aria-invalid={phraseInvalid || undefined}
              aria-describedby={phraseInvalid && error ? errorId : undefined}
              style={{
                fontFamily: "var(--mono)",
                padding: "10px 12px",
                border: "1px solid var(--line)",
                borderRadius: 10,
              }}
            />
          </label>
          {error && (
            <p id={errorId} className="form-msg error" role="alert">
              {error}
            </p>
          )}
          <button
            type="button"
            className="btn btn-solid"
            onClick={deleteAccount}
            disabled={pending || !password || !confirmPhrase}
            style={{ background: "var(--c-red)", borderColor: "var(--c-red)", width: "fit-content" }}
          >
            {pending ? "Deleting…" : "Permanently delete account"}
          </button>
        </div>
      )}
    </div>
  );
}

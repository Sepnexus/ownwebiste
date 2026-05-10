"use client";

import { useState, useTransition } from "react";

export default function SyncRazorpay({ planId }: { planId: string }) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function onClick() {
    setMsg(null);
    startTransition(async () => {
      try {
        const r = await fetch("/api/admin/billing/sync-plan", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ planId }),
        });
        const body = (await r.json()) as { ok?: boolean; error?: string };
        if (!r.ok || !body.ok) {
          setMsg({ ok: false, text: body.error ?? "Sync failed." });
          return;
        }
        setMsg({ ok: true, text: "Synced." });
        // Soft refresh after a moment so the new IDs render.
        setTimeout(() => window.location.reload(), 600);
      } catch {
        setMsg({ ok: false, text: "Network error." });
      }
    });
  }

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
      <button
        type="button"
        className="btn btn-outline"
        style={{ padding: "6px 10px", fontSize: 12 }}
        onClick={onClick}
        disabled={pending}
      >
        {pending ? "Syncing…" : "Sync to Razorpay"}
      </button>
      {msg && (
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: 10,
            color: msg.ok ? "var(--c-cyan)" : "var(--c-red)",
            maxWidth: 200,
            textAlign: "right",
          }}
        >
          {msg.text}
        </span>
      )}
    </div>
  );
}

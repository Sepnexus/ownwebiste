"use client";

import { useState, useTransition } from "react";

export default function ResendReceiptButton({ invoiceId }: { invoiceId: string }) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function resend() {
    setMsg(null);
    startTransition(async () => {
      const r = await fetch(`/api/admin/invoices/${invoiceId}/resend-receipt`, {
        method: "POST",
      });
      const body = (await r.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!r.ok || !body.ok) {
        setMsg({ ok: false, text: body.error ?? "Failed to resend." });
        return;
      }
      setMsg({ ok: true, text: "Receipt re-sent ✓" });
    });
  }

  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        gap: 4,
        alignItems: "flex-end",
      }}
    >
      <button
        type="button"
        onClick={resend}
        disabled={pending}
        className="btn btn-outline"
        style={{ padding: "8px 14px", fontSize: 13 }}
      >
        {pending ? "Sending…" : "Re-send receipt"}
      </button>
      {msg && (
        <span
          style={{
            fontSize: 11,
            color: msg.ok ? "var(--c-cyan)" : "crimson",
            fontFamily: "var(--mono)",
          }}
        >
          {msg.text}
        </span>
      )}
    </div>
  );
}

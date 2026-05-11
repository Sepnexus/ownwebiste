"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function SyncSubButton({ subscriptionId }: { subscriptionId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function sync() {
    setMsg(null);
    startTransition(async () => {
      const r = await fetch("/api/billing/sync", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ subscriptionId }),
      });
      const body = (await r.json()) as {
        ok?: boolean;
        status?: string;
        invoicesSynced?: number;
        changed?: boolean;
        error?: string;
      };
      if (!r.ok || !body.ok) {
        setMsg({ ok: false, text: body.error ?? "Sync failed." });
        return;
      }
      setMsg({
        ok: true,
        text: body.changed
          ? `→ ${body.status} (+${body.invoicesSynced ?? 0} inv)`
          : `${body.status} (no change)`,
      });
      router.refresh();
    });
  }

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
      <button
        type="button"
        onClick={sync}
        disabled={pending}
        className="btn btn-outline"
        style={{ padding: "6px 10px", fontSize: 11 }}
      >
        {pending ? "Syncing…" : "↻ Sync"}
      </button>
      {msg && (
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: 10,
            color: msg.ok ? "var(--c-cyan)" : "var(--c-red)",
            maxWidth: 160,
            textAlign: "right",
            lineHeight: 1.3,
          }}
        >
          {msg.text}
        </span>
      )}
    </div>
  );
}

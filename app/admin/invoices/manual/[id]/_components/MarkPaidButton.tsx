"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function MarkPaidButton({
  invoiceId,
  status,
}: {
  invoiceId: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isPaid = status === "paid";

  function flip(next: "paid" | "unpaid") {
    if (
      next === "unpaid" &&
      !confirm("Mark this invoice back to unpaid?")
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const r = await fetch(`/api/admin/invoices/manual/${invoiceId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const body = (await r.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!r.ok || !body.ok) {
        setError(body.error ?? "Update failed.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: 4 }}>
      {isPaid ? (
        <button
          type="button"
          onClick={() => flip("unpaid")}
          disabled={pending}
          className="btn btn-ghost"
          style={{ padding: "8px 14px", fontSize: 13 }}
        >
          {pending ? "Updating…" : "Mark unpaid"}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => flip("paid")}
          disabled={pending}
          className="btn btn-solid"
          style={{ padding: "8px 14px", fontSize: 13 }}
        >
          {pending ? "Updating…" : "Mark as paid"}
        </button>
      )}
      {error && (
        <span style={{ fontSize: 11, color: "var(--c-red)", fontFamily: "var(--mono)" }}>
          {error}
        </span>
      )}
    </div>
  );
}

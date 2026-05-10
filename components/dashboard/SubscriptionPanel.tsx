"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function SubscriptionPanel({
  subscriptionId,
  status,
  planName,
  period,
  amountUsd,
  currency,
  nextBillingDate,
  cancelAtPeriodEnd,
}: {
  subscriptionId: string;
  status: string;
  planName: string;
  period: string;
  amountUsd: number;
  currency: string;
  nextBillingDate: string | null;
  cancelAtPeriodEnd: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function cancel() {
    if (!confirm("Cancel at the end of the current billing period?")) return;
    setErr(null);
    startTransition(async () => {
      const r = await fetch("/api/billing/cancel", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ subscriptionId, atPeriodEnd: true }),
      });
      const body = (await r.json()) as { ok?: boolean; error?: string };
      if (!r.ok || !body.ok) {
        setErr(body.error ?? "Cancel failed.");
        return;
      }
      router.refresh();
    });
  }

  function resume() {
    setErr(null);
    startTransition(async () => {
      const r = await fetch("/api/billing/resume", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ subscriptionId }),
      });
      const body = (await r.json()) as { ok?: boolean; error?: string };
      if (!r.ok || !body.ok) {
        setErr(body.error ?? "Resume failed.");
        return;
      }
      router.refresh();
    });
  }

  const live = ["authenticated", "active"].includes(status);
  const closed = ["cancelled", "expired", "completed", "halted"].includes(status);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.6)",
        border: "1px solid var(--line)",
        borderRadius: 18,
        padding: 32,
        maxWidth: 720,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: 6,
            }}
          >
            Current plan
          </div>
          <div
            style={{
              fontFamily: "var(--serif)",
              fontStyle: "italic",
              fontSize: 32,
              color: "var(--ink)",
              letterSpacing: "-0.01em",
            }}
          >
            {planName}
          </div>
          <div style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>
            {currency === "INR" ? "₹" : "$"}{amountUsd.toLocaleString()} / {period} · {currency}
          </div>
        </div>
        <span
          className={`pill ${
            live ? "live" : closed ? "hidden" : "draft"
          }`}
          style={{ fontSize: 11 }}
        >
          {status}
        </span>
      </div>

      {nextBillingDate && live && (
        <div
          style={{
            paddingTop: 18,
            borderTop: "1px solid var(--line)",
            display: "flex",
            justifyContent: "space-between",
            color: "var(--muted)",
            fontSize: 13,
            fontFamily: "var(--mono)",
          }}
        >
          <span>{cancelAtPeriodEnd ? "ENDS ON" : "RENEWS ON"}</span>
          <span>{nextBillingDate}</span>
        </div>
      )}

      {err && (
        <p
          style={{
            color: "var(--c-red)",
            fontSize: 13,
            fontFamily: "var(--mono)",
            marginTop: 16,
          }}
        >
          {err}
        </p>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
        {live && !cancelAtPeriodEnd && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={cancel}
            disabled={pending}
            style={{ color: "var(--c-red)", borderColor: "var(--c-red)" }}
          >
            {pending ? "Cancelling…" : "Cancel subscription"}
          </button>
        )}
        {cancelAtPeriodEnd && (
          <>
            <span style={{ color: "var(--c-red)", fontSize: 13, fontFamily: "var(--mono)" }}>
              Cancellation scheduled for end of period.
            </span>
            <button
              type="button"
              className="btn btn-outline"
              onClick={resume}
              disabled={pending}
            >
              {pending ? "Resuming…" : "Resume subscription"}
            </button>
          </>
        )}
        {live && (
          <a
            href="/dashboard/change-plan"
            className="btn btn-outline"
            style={{ marginLeft: cancelAtPeriodEnd ? 0 : "auto" }}
          >
            Change plan
          </a>
        )}
      </div>
    </div>
  );
}

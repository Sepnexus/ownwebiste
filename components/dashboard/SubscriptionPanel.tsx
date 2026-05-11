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
  shortUrl,
}: {
  subscriptionId: string;
  status: string;
  planName: string;
  period: string;
  amountUsd: number;
  currency: string;
  nextBillingDate: string | null;
  cancelAtPeriodEnd: boolean;
  shortUrl?: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  function cancel() {
    if (!confirm("Cancel at the end of the current billing period?")) return;
    setErr(null);
    setInfo(null);
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
    setInfo(null);
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

  function refresh() {
    setErr(null);
    setInfo(null);
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
        setErr(body.error ?? "Sync failed.");
        return;
      }
      setInfo(
        body.changed
          ? `Status updated to ${body.status}. ${body.invoicesSynced ?? 0} invoice(s) synced.`
          : `Status: ${body.status}. ${body.invoicesSynced ?? 0} invoice(s) on file.`,
      );
      router.refresh();
    });
  }

  const live = ["authenticated", "active"].includes(status);
  const pendingPayment = ["created", "pending"].includes(status);
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

      {pendingPayment && (
        <div
          style={{
            marginTop: 18,
            paddingTop: 18,
            borderTop: "1px solid var(--line)",
            background: "rgba(242, 180, 58, 0.06)",
            margin: "18px -32px 0",
            padding: "16px 32px",
            color: "var(--ink-2)",
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          <strong>Payment authorisation pending.</strong> Razorpay confirms in a few seconds.
          {shortUrl && (
            <>
              {" "}If you closed the checkout window,{" "}
              <a href={shortUrl} target="_blank" rel="noreferrer" style={{ color: "var(--ink)" }}>
                complete payment here
              </a>
              .
            </>
          )}{" "}
          Already paid? Click <em>Refresh status</em> below.
        </div>
      )}

      {info && (
        <p
          style={{
            color: "var(--c-cyan)",
            fontSize: 13,
            fontFamily: "var(--mono)",
            marginTop: 16,
          }}
        >
          {info}
        </p>
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

      <div
        style={{
          display: "flex",
          gap: 10,
          marginTop: 24,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {/* Refresh — useful for everyone, especially pre-active states. */}
        {!closed && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={refresh}
            disabled={pending}
            style={{ padding: "8px 14px", fontSize: 13 }}
          >
            {pending ? "Refreshing…" : "↻ Refresh status"}
          </button>
        )}
        {(live || pendingPayment) && !cancelAtPeriodEnd && (
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
              Cancellation scheduled.
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
        {(live || pendingPayment) && (
          <a
            href="/dashboard/change-plan"
            className="btn btn-outline"
            style={{ marginLeft: "auto" }}
          >
            Change plan
          </a>
        )}
      </div>
    </div>
  );
}

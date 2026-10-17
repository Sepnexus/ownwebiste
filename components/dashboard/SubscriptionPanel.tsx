"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { currencySymbol } from "@/lib/format";

type PanelAction = "refresh" | "cancel" | "resume";

type SyncResponse = {
  ok?: boolean;
  status?: string;
  invoicesSynced?: number;
  changed?: boolean;
  error?: string;
};

/** Razorpay hasn't confirmed the first payment yet. */
const AWAITING = ["created", "pending"];
/** After checkout, ask /api/billing/sync this often, for at most this long. */
const POLL_INTERVAL_MS = 3_000;
const POLL_WINDOW_MS = 60_000;

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
  autoRefresh = false,
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
  /**
   * Set right after checkout. While the status is created/pending, poll the
   * (idempotent) sync endpoint every 3 s for up to 60 s and re-render the
   * page when Razorpay reports a change.
   */
  autoRefresh?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  // Which button started the in-flight request, so only that one relabels.
  // Every button is still disabled while anything is in flight.
  const [lastAction, setLastAction] = useState<PanelAction | null>(null);
  const busy: PanelAction | null = pending ? lastAction : null;
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pollDone, setPollDone] = useState(false);
  const pollStartedAt = useRef<number | null>(null);

  const pendingPayment = AWAITING.includes(status);
  const polling = autoRefresh && pendingPayment && !pollDone;

  useEffect(() => {
    // Pause while a button's request is in flight so the two don't overlap.
    if (!polling || pending) return;
    if (pollStartedAt.current === null) pollStartedAt.current = Date.now();
    const startedAt = pollStartedAt.current;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function tick() {
      if (cancelled) return;
      if (Date.now() - startedAt >= POLL_WINDOW_MS) {
        setPollDone(true);
        return;
      }
      try {
        const r = await fetch("/api/billing/sync", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ subscriptionId }),
        });
        const body = (await r.json()) as SyncResponse;
        if (cancelled) return;
        // Any error (incl. a future 429): stop quietly; the button still works.
        if (!r.ok || !body.ok) {
          setPollDone(true);
          return;
        }
        const stillAwaiting = AWAITING.includes(body.status ?? "");
        if (body.changed || !stillAwaiting) router.refresh();
        if (!stillAwaiting) {
          setPollDone(true);
          return;
        }
      } catch {
        if (!cancelled) setPollDone(true);
        return;
      }
      if (!cancelled) timer = setTimeout(tick, POLL_INTERVAL_MS);
    }

    timer = setTimeout(tick, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [polling, pending, subscriptionId, router]);

  function cancel() {
    if (!confirm("Cancel at the end of the current billing period?")) return;
    setErr(null);
    setInfo(null);
    setLastAction("cancel");
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
    setLastAction("resume");
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
    setLastAction("refresh");
    startTransition(async () => {
      const r = await fetch("/api/billing/sync", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ subscriptionId }),
      });
      const body = (await r.json()) as SyncResponse;
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
            {currencySymbol(currency)}{amountUsd.toLocaleString()} / {period} · {currency}
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
          {polling ? (
            <span role="status">Checking with Razorpay automatically…</span>
          ) : (
            <>Already paid? Click <em>Refresh status</em> below.</>
          )}
        </div>
      )}

      {info && (
        <p
          style={{
            color: "var(--c-cyan-ink)",
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
            color: "var(--c-red-ink)",
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
            {busy === "refresh" ? "Refreshing…" : "↻ Refresh status"}
          </button>
        )}
        {(live || pendingPayment) && !cancelAtPeriodEnd && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={cancel}
            disabled={pending}
            style={{ color: "var(--c-red-ink)", borderColor: "var(--c-red)" }}
          >
            {busy === "cancel" ? "Cancelling…" : "Cancel subscription"}
          </button>
        )}
        {cancelAtPeriodEnd && (
          <>
            <span style={{ color: "var(--c-red-ink)", fontSize: 13, fontFamily: "var(--mono)" }}>
              Cancellation scheduled.
            </span>
            <button
              type="button"
              className="btn btn-outline"
              onClick={resume}
              disabled={pending}
            >
              {busy === "resume" ? "Resuming…" : "Resume subscription"}
            </button>
          </>
        )}
        {(live || pendingPayment) && (
          <a
            href={`/dashboard/change-plan?subscriptionId=${subscriptionId}`}
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

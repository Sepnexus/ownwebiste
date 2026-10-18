import { formatMoneyCents, formatPrice } from "@/lib/format";
import { toMinorUnits } from "@/lib/currencies";

type Props = {
  used: number;
  included: number;
  /** Overage rate per 1,000 executions, in the plan currency's major unit. */
  overageUsdPer1k: number | null;
  /** The plan's ISO currency, e.g. "USD", "INR", "EUR". */
  currency: string;
  periodStart: Date;
  periodEnd: Date;
  lastEventAt: Date | null;
};

function fmtDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function UsagePanel({
  used,
  included,
  overageUsdPer1k,
  currency,
  periodStart,
  periodEnd,
  lastEventAt,
}: Props) {
  const hasLimit = included > 0;
  const pct = hasLimit ? Math.min(used / included, 2) : 0;
  const widthPct = Math.min(100, pct * 100);
  const over = Math.max(0, used - included);
  // Billed in whole 1,000-execution buckets, rounded up (see lib/usage.ts).
  const projectedMajor =
    over > 0 && overageUsdPer1k != null
      ? Math.ceil(over / 1_000) * overageUsdPer1k
      : 0;
  const isOver = over > 0;
  const at80 = hasLimit && used / included >= 0.8 && !isOver;

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.6)",
        border: "1px solid var(--line)",
        borderRadius: 18,
        padding: 28,
        maxWidth: 720,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 14,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--muted)",
          }}
        >
          Executions this period
        </div>
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: 12,
            color: "var(--muted)",
          }}
        >
          {fmtDate(periodStart)} → {fmtDate(periodEnd)}
        </div>
      </div>

      <div
        style={{
          fontFamily: "var(--serif)",
          fontSize: 36,
          letterSpacing: "-0.015em",
          color: "var(--ink)",
          lineHeight: 1.05,
        }}
      >
        <em>{used.toLocaleString()}</em>
        {hasLimit && (
          <span style={{ color: "var(--muted)", fontStyle: "normal", fontSize: 22 }}>
            {" "}
            / {included.toLocaleString()}
          </span>
        )}
      </div>

      {hasLimit && (
        <div
          style={{
            marginTop: 14,
            height: 8,
            background: "rgba(20,17,16,0.06)",
            borderRadius: 999,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              width: `${widthPct}%`,
              height: "100%",
              background: isOver
                ? "linear-gradient(90deg, var(--c-yellow), var(--c-red))"
                : at80
                  ? "linear-gradient(90deg, var(--c-cyan), var(--c-yellow))"
                  : "linear-gradient(90deg, var(--c-magenta), var(--c-cyan))",
              transition: "width 0.4s ease",
            }}
          />
        </div>
      )}

      <div style={{ marginTop: 14, fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
        {!hasLimit && (
          <span>Unlimited executions on this plan. Use as many as you need.</span>
        )}
        {hasLimit && !isOver && !at80 && (
          <span>
            {Math.max(0, included - used).toLocaleString()} executions remaining this cycle.
          </span>
        )}
        {hasLimit && at80 && (
          <span style={{ color: "var(--c-orange-ink)" }}>
            You’re at {Math.round((used / included) * 100)}% of your allowance. Consider
            upgrading if you expect another big batch.
          </span>
        )}
        {isOver && overageUsdPer1k != null && (
          <span style={{ color: "var(--c-red-ink)" }}>
            Over by <strong>{over.toLocaleString()}</strong> · projected overage on next invoice:{" "}
            <strong>{formatMoneyCents(toMinorUnits(projectedMajor, currency), currency)}</strong>{" "}
            ({formatPrice(overageUsdPer1k, currency)} per 1,000)
          </span>
        )}
        {isOver && overageUsdPer1k == null && (
          <span style={{ color: "var(--muted)" }}>
            Over allowance. No overage configured for this plan.
          </span>
        )}
      </div>

      {lastEventAt && (
        <div
          style={{
            marginTop: 12,
            fontFamily: "var(--mono)",
            fontSize: 11,
            color: "var(--muted)",
            letterSpacing: "0.04em",
          }}
        >
          Last execution: {new Date(lastEventAt).toLocaleString()}
        </div>
      )}
    </div>
  );
}

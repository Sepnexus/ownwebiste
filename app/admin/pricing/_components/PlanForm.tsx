import type { PricingPlan } from "@/lib/db/schema";
import { currencyOptions } from "@/lib/currencies";
import SubmitButton from "../../_components/SubmitButton";
import Link from "next/link";

type Props = {
  plan?: PricingPlan;
  action: (formData: FormData) => Promise<void>;
  error?: string;
  /**
   * If set, the plan being created/edited is custom for this user.
   * The form pins the customForUserId via a hidden input and shows a banner.
   */
  customForUserId?: string | null;
  customForUserEmail?: string | null;
};

export default function PlanForm({ plan, action, error, customForUserId, customForUserEmail }: Props) {
  const features = Array.isArray(plan?.features) ? (plan.features as string[]).join("\n") : "";
  const pinnedCustomFor = customForUserId ?? plan?.customForUserId ?? null;

  return (
    <form action={action} className="admin-form">
      {plan && <input type="hidden" name="id" value={plan.id} />}
      {pinnedCustomFor && <input type="hidden" name="customForUserId" value={pinnedCustomFor} />}

      {pinnedCustomFor && (
        <div
          style={{
            padding: "12px 16px",
            background: "linear-gradient(90deg, rgba(177,73,153,0.06), rgba(43,182,224,0.06))",
            border: "1px solid var(--line)",
            borderRadius: 12,
            fontFamily: "var(--sans)",
            textTransform: "none",
            letterSpacing: 0,
            color: "var(--ink-2)",
            fontSize: 13,
          }}
        >
          <strong>Custom plan</strong> — this plan will be visible only to{" "}
          {customForUserEmail ?? pinnedCustomFor}. It won&apos;t appear on the public /pricing page.
        </div>
      )}

      {error && <div className="form-error">{error}</div>}

      <div className="grid-2">
        <label>
          Slug
          <input
            type="text"
            name="slug"
            required
            defaultValue={plan?.slug ?? ""}
            placeholder="e.g. n8n-pro"
            pattern="[a-z0-9-]+"
          />
          <span className="help">URL-safe identifier. Lowercase letters, numbers, dashes.</span>
        </label>
        <label>
          Category
          <input
            type="text"
            name="category"
            required
            defaultValue={plan?.category ?? ""}
            placeholder="e.g. n8n, saas, hosting"
          />
        </label>
      </div>

      <label>
        Plan name
        <input
          type="text"
          name="name"
          required
          defaultValue={plan?.name ?? ""}
          placeholder="e.g. Pro"
        />
      </label>

      <label>
        Tagline
        <input
          type="text"
          name="tagline"
          defaultValue={plan?.tagline ?? ""}
          placeholder="One-line pitch for this plan."
        />
      </label>

      <label>
        Currency
        <select name="currency" defaultValue={plan?.currency ?? "USD"}>
          <optgroup label="Common">
            {currencyOptions()
              .filter((c) => c.pinned)
              .map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
          </optgroup>
          <optgroup label="All Razorpay currencies">
            {currencyOptions()
              .filter((c) => !c.pinned)
              .map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
          </optgroup>
        </select>
        <span className="help">
          Any currency Razorpay supports. The price fields below are in this
          currency&apos;s major unit (e.g. dollars, euros, yen — not cents).
          Razorpay settles everything to your account in INR.
        </span>
      </label>

      <div className="grid-2">
        <label>
          Monthly price
          <input
            type="number"
            name="priceMonthlyUsd"
            required
            min={0}
            step={1}
            defaultValue={plan?.priceMonthlyUsd ?? 0}
          />
        </label>
        <label>
          Yearly price
          <input
            type="number"
            name="priceYearlyUsd"
            required
            min={0}
            step={1}
            defaultValue={plan?.priceYearlyUsd ?? 0}
          />
        </label>
      </div>

      <div className="grid-2">
        <label>
          Executions included / month
          <input
            type="number"
            name="executionsIncluded"
            min={0}
            step={1}
            defaultValue={plan?.executionsIncluded ?? ""}
            placeholder="Leave empty if not metered"
          />
        </label>
        <label>
          Overage per 1,000 (plan currency)
          <input
            type="number"
            name="overageUsdPer1k"
            min={0}
            step={1}
            defaultValue={plan?.overageUsdPer1k ?? ""}
            placeholder="Leave empty if no overage"
          />
        </label>
      </div>

      <label>
        Features (one per line)
        <textarea name="features" rows={8} required defaultValue={features} />
        <span className="help">
          Each line becomes a checkmark on the public pricing card.
        </span>
      </label>

      {/*
        Razorpay plan IDs are no longer entered by hand — saving the form
        auto-syncs the plan to Razorpay and stores the IDs. This block is
        read-only status. If a price/currency changes, the IDs are cleared
        on save so they re-create at the new price.
      */}
      <div
        style={{
          border: "1px solid var(--line)",
          borderRadius: 10,
          padding: "12px 14px",
          background: "rgba(0,0,0,0.02)",
          fontSize: 13,
        }}
      >
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: 10,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: 8,
          }}
        >
          Razorpay sync
        </div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div>
            <span style={{ color: "var(--muted)" }}>Monthly: </span>
            {plan?.razorpayPlanIdMonthly ? (
              <code>{plan.razorpayPlanIdMonthly}</code>
            ) : (
              <em style={{ color: "var(--muted)" }}>syncs on save</em>
            )}
          </div>
          <div>
            <span style={{ color: "var(--muted)" }}>Yearly: </span>
            {plan?.razorpayPlanIdYearly ? (
              <code>{plan.razorpayPlanIdYearly}</code>
            ) : (
              <em style={{ color: "var(--muted)" }}>syncs on save</em>
            )}
          </div>
        </div>
        <p style={{ color: "var(--muted)", margin: "8px 0 0", fontSize: 12 }}>
          Saving this plan creates/updates it in Razorpay automatically — no
          manual IDs needed. Razorpay can&apos;t edit a live plan&apos;s price,
          so changing the price or currency here re-creates the Razorpay plan.
        </p>
      </div>

      <label>
        Sort order
        <input
          type="number"
          name="sortOrder"
          step={1}
          defaultValue={plan?.sortOrder ?? 10}
        />
        <span className="help">Lower numbers appear first within a category.</span>
      </label>

      <label className="row">
        <input type="checkbox" name="highlight" defaultChecked={plan?.highlight ?? false} />
        Featured plan (highlighted with darker border)
      </label>
      <label className="row">
        <input type="checkbox" name="visible" defaultChecked={plan?.visible ?? true} />
        Visible on public pricing page
      </label>

      <div className="actions">
        {/* Saving also syncs to Razorpay, which can take a few seconds. */}
        <SubmitButton
          className="btn btn-solid"
          pendingLabel={plan ? "Saving and syncing…" : "Creating and syncing…"}
        >
          {plan ? "Save changes" : "Create plan"}
        </SubmitButton>
        <Link href="/admin/pricing" className="btn btn-outline">
          Cancel
        </Link>
      </div>
    </form>
  );
}

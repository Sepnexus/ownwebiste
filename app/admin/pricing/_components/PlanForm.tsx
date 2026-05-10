import type { PricingPlan } from "@/lib/db/schema";

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
          <option value="USD">USD — US Dollars ($)</option>
          <option value="INR">INR — Indian Rupees (₹)</option>
        </select>
        <span className="help">
          Pick USD for international customers, INR for Indian. The price fields below are in
          this currency&apos;s major unit ($ or ₹).
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
          Overage per 1,000 (USD)
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

      <div className="grid-2">
        <label>
          Razorpay plan ID (monthly)
          <input
            type="text"
            name="razorpayPlanIdMonthly"
            defaultValue={plan?.razorpayPlanIdMonthly ?? ""}
            placeholder="plan_xxx (set during Phase 4)"
          />
        </label>
        <label>
          Razorpay plan ID (yearly)
          <input
            type="text"
            name="razorpayPlanIdYearly"
            defaultValue={plan?.razorpayPlanIdYearly ?? ""}
            placeholder="plan_xxx (set during Phase 4)"
          />
        </label>
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
        <button type="submit" className="btn btn-solid">
          {plan ? "Save changes" : "Create plan"}
        </button>
        <a href="/admin/pricing" className="btn btn-outline">
          Cancel
        </a>
      </div>
    </form>
  );
}

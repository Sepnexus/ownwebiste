import type { PortfolioEntry } from "@/lib/db/schema";
import SubmitButton from "../../_components/SubmitButton";
import Link from "next/link";

type Metric = { label: string; value: string };

type Props = {
  entry?: PortfolioEntry;
  action: (formData: FormData) => Promise<void>;
  error?: string;
};

export default function EntryForm({ entry, action, error }: Props) {
  const tagsCsv = Array.isArray(entry?.tags) ? (entry.tags as string[]).join(", ") : "";
  const metricsCsv = Array.isArray(entry?.metrics)
    ? (entry.metrics as Metric[]).map((m) => `${m.label}: ${m.value}`).join(", ")
    : "";

  return (
    <form action={action} className="admin-form">
      {entry && <input type="hidden" name="id" value={entry.id} />}
      {error && <div className="form-error">{error}</div>}

      <div className="grid-2">
        <label>
          Slug
          <input
            type="text"
            name="slug"
            required
            defaultValue={entry?.slug ?? ""}
            placeholder="e.g. acme-finance-bot"
            pattern="[a-z0-9-]+"
          />
        </label>
        <label>
          Year
          <input
            type="number"
            name="year"
            min={2000}
            max={2100}
            defaultValue={entry?.year ?? new Date().getFullYear()}
          />
        </label>
      </div>

      <label>
        Title
        <input
          type="text"
          name="title"
          required
          defaultValue={entry?.title ?? ""}
          placeholder="Headline for the case study"
        />
      </label>

      <label>
        Client name
        <input
          type="text"
          name="client"
          defaultValue={entry?.client ?? ""}
          placeholder="Leave blank if confidential"
        />
      </label>

      <label>
        Summary
        <textarea
          name="summary"
          rows={3}
          defaultValue={entry?.summary ?? ""}
          placeholder="One-paragraph executive summary."
          style={{ fontFamily: "var(--sans)" }}
        />
      </label>

      <label>
        Body (long-form, plain text or HTML)
        <textarea
          name="body"
          rows={12}
          defaultValue={entry?.body ?? ""}
          placeholder="Detailed write-up. Optional."
          style={{ fontFamily: "var(--sans)" }}
        />
      </label>

      <label>
        Cover image URL
        <input
          type="url"
          name="coverImageUrl"
          defaultValue={entry?.coverImageUrl ?? ""}
          placeholder="https://… (optional)"
        />
      </label>

      <label>
        Tags
        <input
          type="text"
          name="tags"
          defaultValue={tagsCsv}
          placeholder="agents, automation, fintech (comma-separated)"
        />
        <span className="help">Comma-separated. Shown as pills on the public page.</span>
      </label>

      <label>
        Metrics
        <input
          type="text"
          name="metrics"
          defaultValue={metricsCsv}
          placeholder="ROI: 3.2x, Time saved: 14 hrs/week"
        />
        <span className="help">Comma-separated label:value pairs.</span>
      </label>

      <label>
        Sort order
        <input
          type="number"
          name="sortOrder"
          step={1}
          defaultValue={entry?.sortOrder ?? 10}
        />
      </label>

      <label className="row">
        <input type="checkbox" name="published" defaultChecked={entry?.published ?? false} />
        Published (visible on public /portfolio page)
      </label>

      <div className="actions">
        <SubmitButton className="btn btn-solid" pendingLabel={entry ? "Saving…" : "Creating…"}>
          {entry ? "Save changes" : "Create entry"}
        </SubmitButton>
        <Link href="/admin/portfolio" className="btn btn-outline">
          Cancel
        </Link>
      </div>
    </form>
  );
}

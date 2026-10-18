/** "2026-05-10" → "May 10, 2026" (fixed to UTC so it never shifts by a day). */
function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** The design's `.doc-head`: "Last updated …" line plus the document title. */
export default function DocHead({ title, updated }: { title: string; updated: string }) {
  return (
    <div className="doc-head">
      <span className="mono" style={{ color: "#86868b" }}>
        Last updated <time dateTime={updated}>{formatDate(updated)}</time>
      </span>
      <h2>{title}</h2>
    </div>
  );
}

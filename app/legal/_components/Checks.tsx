/**
 * Short fact lists in the legal documents, using the site's `.checks` list
 * (same markup as the Services page). The design's documents have no list
 * style of their own, and `.checks` matches `.doc p` type size and colour.
 */
export default function Checks({ items }: { items: readonly string[] }) {
  return (
    <ul className="checks">
      {items.map((item) => (
        <li key={item}>
          <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

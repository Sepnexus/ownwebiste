"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// The design's tab list (Legal.dc.html → TABS), as real links to the four
// legal routes. The current one gets the design's `on` state.
const DOCS = [
  { href: "/legal/privacy", label: "Privacy Policy" },
  { href: "/legal/terms", label: "Terms of Service" },
  { href: "/legal/security", label: "Security" },
  { href: "/legal/dpa", label: "Data Processing (DPA)" },
] as const;

export default function LegalToc() {
  const pathname = usePathname();
  return (
    <nav className="toc" aria-label="Legal documents">
      {DOCS.map((d) => {
        const on = pathname === d.href;
        return (
          <Link
            key={d.href}
            href={d.href}
            className={on ? "on" : undefined}
            aria-current={on ? "page" : undefined}
          >
            {d.label}
          </Link>
        );
      })}
    </nav>
  );
}

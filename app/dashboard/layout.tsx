import type { Viewport } from "next";

// Keeps the original cream design (styles/legacy.css, fenced to .legacy) until
// this area is redesigned. The marketing pages use the new dark design (.sx).
export const viewport: Viewport = { themeColor: "#f6f3ec", colorScheme: "light" };

export default function LegacyLayout({ children }: { children: React.ReactNode }) {
  return <div className="legacy">{children}</div>;
}

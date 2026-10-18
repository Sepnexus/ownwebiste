import type { CSSProperties, ReactNode } from "react";
import MotionSwitch from "./MotionSwitch";

export type SitePage =
  | "home"
  | "services"
  | "work"
  | "hosting"
  | "about"
  | "contact"
  | "signin"
  | "legal";

/**
 * Root of every page in the new design. Mirrors the design's
 * `<div class="sx {{motionClass}}" style="--accent: …">`:
 * - `sx` fences the design's stylesheet (styles/site/*.css) to this subtree
 * - `pg-<page>` switches on that page's own rules
 * - `m-on` / `m-off` is the design's "motion" prop. Motion also turns off for
 *   prefers-reduced-motion (in CSS) and via `?motion=off` (see MotionSwitch).
 */
export default function SiteShell({
  page,
  motion = true,
  accent = "#0a72b5",
  children,
}: {
  page: SitePage;
  motion?: boolean;
  accent?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`sx pg-${page} ${motion ? "m-on" : "m-off"}`}
      style={{ "--accent": accent } as CSSProperties}
    >
      <MotionSwitch />
      {children}
    </div>
  );
}

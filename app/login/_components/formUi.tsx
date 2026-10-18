import type { CSSProperties, ReactNode } from "react";

/**
 * Small pieces shared by the forms on the new-design pages (contact, sign in,
 * forgot, reset, invite). The design has no error state, so errors reuse the
 * design's `.fine` text with a red that reads on the form card (#111113, ~6.7:1).
 */

export const EMAIL_RE = /^\S+@\S+\.\S+$/;

const ERROR_RED = "#ff6961";

/** Inline style for a field marked aria-invalid (overrides the design's grey border). */
export const INVALID_FIELD: CSSProperties = { borderColor: ERROR_RED };

/** aria + style props for a field: invalid and pointed at the error message when it's the culprit. */
export function invalidProps(isInvalid: boolean, errorId: string, style?: CSSProperties) {
  return isInvalid
    ? {
        "aria-invalid": true as const,
        "aria-describedby": errorId,
        style: { ...style, ...INVALID_FIELD },
      }
    : { style };
}

/** The form's error message. Announced by screen readers as soon as it appears. */
export function FormError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="fine" role="alert" style={{ color: ERROR_RED }}>
      {children}
    </p>
  );
}

/**
 * Spam trap for POST /api/contact (`website`). Hidden from people (visually and
 * from screen readers, and out of the tab order); bots that fill every field
 * trip it and the server quietly drops the message.
 */
export function Honeypot() {
  return (
    <div className="sr" aria-hidden="true">
      <label htmlFor="hp-website">Leave this field empty</label>
      <input id="hp-website" type="text" name="website" tabIndex={-1} autoComplete="off" />
    </div>
  );
}

/** The green tick ring from the design's done states. */
export function DoneRing() {
  return (
    <span className="done-ring">
      <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}

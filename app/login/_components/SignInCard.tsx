"use client";

import { useEffect, useRef, useState } from "react";
import LoginForm from "./LoginForm";
import RequestAccessForm from "./RequestAccessForm";
import { DoneRing } from "./formUi";

export type AuthMode = "in" | "req";

/**
 * The form card of SignIn.dc.html: the Sign in / Request access switch, the
 * two forms and the "Request sent" state. Signing in goes straight to the
 * dashboard, so only Request access ends on the done state.
 */
export default function SignInCard({
  initialMode,
  next,
}: {
  initialMode: AuthMode;
  next: string | null;
}) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [done, setDone] = useState(false);
  // Focus the first field when a form appears in place of what was clicked
  // (page load, the "Request access" link, "Back"), but not when the switch
  // itself is used: focus stays on the switch then.
  const [focusFirst, setFocusFirst] = useState(true);
  const doneHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (done) doneHeadingRef.current?.focus();
  }, [done]);

  function go(m: AuthMode, focus = false) {
    setMode(m);
    setDone(false);
    setFocusFirst(focus);
  }

  const isIn = mode === "in";

  return (
    <>
      <div className="seg" role="group" aria-label="Account">
        <button
          type="button"
          className={isIn ? "on" : undefined}
          aria-pressed={isIn}
          onClick={() => go("in")}
        >
          Sign in
        </button>
        <button
          type="button"
          className={isIn ? undefined : "on"}
          aria-pressed={!isIn}
          onClick={() => go("req")}
        >
          Request access
        </button>
      </div>

      {done && (
        <div className="done" role="status">
          <DoneRing />
          <h2 ref={doneHeadingRef} tabIndex={-1} className="h-s" style={{ outline: "none" }}>
            Request sent
          </h2>
          <p className="muted" style={{ margin: "0", maxWidth: "320px", lineHeight: "1.5" }}>
            Thanks — we’ll confirm your access within 48 hours.
          </p>
          <button type="button" className="btn btn-ghost" onClick={() => go(mode, true)}>
            Back
          </button>
        </div>
      )}

      {!done && isIn && (
        <LoginForm next={next} autoFocus={focusFirst} onRequestAccess={() => go("req", true)} />
      )}

      {!done && !isIn && (
        <RequestAccessForm autoFocus={focusFirst} onSent={() => setDone(true)} />
      )}
    </>
  );
}

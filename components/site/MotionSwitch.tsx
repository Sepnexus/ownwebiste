"use client";

import { useEffect } from "react";

const KEY = "sn-motion";

/**
 * A way to switch the design's motion off without the OS setting:
 * visit any page with `?motion=off` (remembered in this browser) and
 * `?motion=on` to turn it back on. Swaps `m-on` ↔ `m-off` on the `.sx` root.
 */
export default function MotionSwitch() {
  useEffect(() => {
    let pref: string | null = null;
    try {
      const fromUrl = new URLSearchParams(window.location.search).get("motion");
      if (fromUrl === "on" || fromUrl === "off") window.localStorage.setItem(KEY, fromUrl);
      pref = window.localStorage.getItem(KEY);
    } catch {
      // Storage can be unavailable (private mode, blocked site data): keep the default.
    }
    if (pref !== "off") return;
    document.querySelectorAll(".sx.m-on").forEach((el) => el.classList.replace("m-on", "m-off"));
  }, []);
  return null;
}

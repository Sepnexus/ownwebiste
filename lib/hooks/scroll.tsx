"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const _bus = { listeners: new Set<() => void>(), queued: false };
function _flush() {
  _bus.queued = false;
  _bus.listeners.forEach((fn) => fn());
}
function _onScrollGlobal() {
  if (_bus.queued) return;
  _bus.queued = true;
  requestAnimationFrame(_flush);
}
if (typeof window !== "undefined") {
  window.addEventListener("scroll", _onScrollGlobal, { passive: true });
  window.addEventListener("resize", _onScrollGlobal);
}

export function subscribeScroll(fn: () => void): () => void {
  _bus.listeners.add(fn);
  fn();
  return () => {
    _bus.listeners.delete(fn);
  };
}

export function useReveal(rootRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root: ParentNode = rootRef.current ?? document;
    const els = root.querySelectorAll(".reveal, .reveal-line");
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -10% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [rootRef]);
}

export function useScrollProgress(ref: React.RefObject<HTMLElement | null>): number {
  const [p, setP] = useState(0);
  const last = useRef(-1);
  useEffect(() => {
    if (!ref.current) return;
    return subscribeScroll(() => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height + vh;
      const traveled = vh - rect.top;
      const v = Math.max(0, Math.min(1, traveled / total));
      const q = Math.round(v * 250) / 250;
      if (q !== last.current) {
        last.current = q;
        setP(q);
      }
    });
  }, [ref]);
  return p;
}

export function usePinProgress(containerRef: React.RefObject<HTMLElement | null>): number {
  const [p, setP] = useState(0);
  const last = useRef(-1);
  useEffect(() => {
    if (!containerRef.current) return;
    return subscribeScroll(() => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const scrollable = rect.height - vh;
      let v: number;
      if (scrollable <= 0) v = rect.top < 0 ? 1 : 0;
      else v = Math.max(0, Math.min(1, -rect.top / scrollable));
      const q = Math.round(v * 250) / 250;
      if (q !== last.current) {
        last.current = q;
        setP(q);
      }
    });
  }, [containerRef]);
  return p;
}

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

export function RL({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const cls = `reveal-line ${className} ${delay ? "d" + delay : ""}`.trim();
  return (
    <span className={cls}>
      <span>{children}</span>
    </span>
  );
}

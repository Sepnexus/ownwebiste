"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Services", href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // While the phone menu is open: lock page scroll, keep keyboard focus inside the
  // header (the page behind is inert), and let Escape close it.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const behind = Array.from(document.querySelectorAll<HTMLElement>("#main, footer"));
    behind.forEach((el) => (el.inert = true));
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      behind.forEach((el) => (el.inert = false));
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Close the menu if the window grows past the phone layout.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 961px)");
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <nav
      aria-label="Main"
      className={`nav ${scrolled ? "scrolled" : ""} ${open ? "menu-open" : ""}`}
    >
      <Link href="/" className="nav-brand" onClick={() => setOpen(false)}>
        <Image src="/assets/sepnexus-mark.png" alt="" width={28} height={28} priority />
        <span className="word">Sepnexus</span>
      </Link>

      <div className="nav-links" id="site-menu" data-open={open}>
        {NAV_LINKS.map((l) => (
          <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
            {l.label}
          </Link>
        ))}
        <div className="nav-mobile-actions">
          <Link
            href="/contact?type=project_inquiry"
            className="btn btn-solid"
            onClick={() => setOpen(false)}
          >
            Start a project
          </Link>
          <Link href="/login" className="btn btn-outline" onClick={() => setOpen(false)}>
            Sign in
          </Link>
        </div>
      </div>

      <div className="nav-cta">
        <Link href="/login" className="btn btn-ghost">
          Sign in
        </Link>
        <Link href="/contact?type=project_inquiry" className="btn btn-solid">
          Start a project
          <svg className="arrow" viewBox="0 0 14 14" fill="none">
            <path
              d="M3 11L11 3M11 3H4M11 3V10"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>

      <button
        type="button"
        className="nav-toggle"
        ref={toggleRef}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
      </button>
    </nav>
  );
}

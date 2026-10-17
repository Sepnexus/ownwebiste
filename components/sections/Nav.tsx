"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <nav className={`nav ${scrolled ? "scrolled" : ""} ${open ? "menu-open" : ""}`}>
      <Link href="/" className="nav-brand" onClick={() => setOpen(false)}>
        <Image src="/assets/sepnexus-mark.png" alt="" width={28} height={28} priority />
        <span className="word">Sepnexus</span>
      </Link>

      <div className="nav-links" data-open={open}>
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
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
      </button>
    </nav>
  );
}

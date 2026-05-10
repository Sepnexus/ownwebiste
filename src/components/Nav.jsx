import { useEffect, useState } from "react";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
      <a href="#top" className="nav-brand">
        <img src="/assets/sepnexus-mark.png" alt="" />
        <span className="word">Sepnexus</span>
      </a>
      <div className="nav-links">
        <a href="#services">Services</a>
        <a href="/pricing.html">Pricing</a>
        <a href="#process">Process</a>
        <a href="#platform">Platform</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </div>
      <div className="nav-cta">
        <a href="/auth.html" className="btn btn-ghost">Sign in</a>
        <a href="/auth.html?mode=request" className="btn btn-solid">
          Request access
          <svg className="arrow" viewBox="0 0 14 14" fill="none">
            <path d="M3 11L11 3M11 3H4M11 3V10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
    </nav>
  );
}

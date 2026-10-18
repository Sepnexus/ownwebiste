import Image from "next/image";
import Link from "next/link";
import { BUSINESS } from "@/lib/business";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Image src="/assets/sepnexus-mark.png" alt="" width={36} height={36} />
          <span className="word">Sepnexus</span>
          <p>
            AI agents, automation and custom software for real estate investors and growing
            businesses.
          </p>
        </div>
        <div className="footer-col">
          <h4>Services</h4>
          <Link href="/services#estate360">Estate 360 agents</Link>
          <Link href="/services#automation">Automation</Link>
          <Link href="/services#deals">Deal tools</Link>
          <Link href="/services#hosting">Hosting</Link>
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <Link href="/about">About</Link>
          <Link href="/portfolio">Work</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div className="footer-col">
          <h4>Account</h4>
          <Link href="/login">Sign in</Link>
          <Link href="/contact?type=request_access">Request access</Link>
          <Link href="/dashboard">Dashboard</Link>
        </div>
        <div className="footer-col">
          <h4>Legal</h4>
          <Link href="/legal/privacy">Privacy</Link>
          <Link href="/legal/terms">Terms</Link>
          <Link href="/legal/security">Security</Link>
          <Link href="/legal/dpa">DPA</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} {BUSINESS.legalName}
        </span>
        <span>Crafted for systems that think.</span>
      </div>
    </footer>
  );
}

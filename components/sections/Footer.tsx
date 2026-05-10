import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Image src="/assets/sepnexus-mark.png" alt="" width={36} height={36} />
          <span className="word">Sepnexus</span>
          <p>
            Agentic systems, automation and managed cloud for teams who refuse the status quo.
          </p>
        </div>
        <div className="footer-col">
          <h4>Practice</h4>
          <Link href="/services#agents">Agents</Link>
          <Link href="/services#automation">Automation</Link>
          <Link href="/services#data">Data</Link>
          <Link href="/services#hosting">Cloud</Link>
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <Link href="/about">About</Link>
          <Link href="/portfolio">Portfolio</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/pricing">Pricing</Link>
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
        <span>© {new Date().getFullYear()} Sepnexus, Inc.</span>
        <span>Crafted for systems that think.</span>
      </div>
    </footer>
  );
}

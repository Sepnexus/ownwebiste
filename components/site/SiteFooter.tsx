import Image from "next/image";
import Link from "next/link";
import { BUSINESS } from "@/lib/business";

const LEGAL = [
  { label: "Privacy", href: "/legal/privacy" },
  { label: "Terms", href: "/legal/terms" },
  { label: "Security", href: "/legal/security" },
  { label: "DPA", href: "/legal/dpa" },
];

/**
 * The design's footer.
 * - `full` (default): every page except home and sign-in
 * - `home`: adds "Open source" and the registration line, brand links to #top
 * - `minimal`: the sign-in page's one-line footer
 */
export default function SiteFooter({ variant = "full" }: { variant?: "full" | "home" | "minimal" }) {
  const year = new Date().getFullYear();

  if (variant === "minimal") {
    return (
      <footer className="foot" style={{ padding: "28px 0" }}>
        <div className="wrap">
          <div className="foot-b" style={{ margin: 0, padding: 0, border: 0 }}>
            <span>
              © {year} {BUSINESS.legalName}
            </span>
            <span>
              <Link href="/legal/privacy" style={{ color: "#a1a1a6" }}>
                Privacy
              </Link>{" "}
              ·{" "}
              <Link href="/legal/terms" style={{ color: "#a1a1a6" }}>
                Terms
              </Link>{" "}
              ·{" "}
              <Link href="/legal/security" style={{ color: "#a1a1a6" }}>
                Security
              </Link>
            </span>
          </div>
        </div>
      </footer>
    );
  }

  const home = variant === "home";
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-g">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Link className="brand" href={home ? "#top" : "/"} aria-label="Sepnexus home">
              <Image
                src="/assets/sepnexus-logo-light.png"
                alt="Sepnexus"
                width={327}
                height={65}
                style={
                  home ? { height: 30, width: "auto", display: "block" } : { height: 30, width: "auto" }
                }
              />
            </Link>
            <p style={{ margin: 0, maxWidth: 320, lineHeight: 1.5 }}>
              AI agents, automation and custom software for real estate investors and growing
              businesses.{home ? " Registered in Chandigarh, India." : ""}
            </p>
          </div>
          <div>
            <h4>Services</h4>
            <ul>
              <li>
                <Link href="/services#estate">Estate 360 agents</Link>
              </li>
              <li>
                <Link href="/services#automation">Automation</Link>
              </li>
              <li>
                <Link href="/services#deal-tools">Deal tools</Link>
              </li>
              <li>
                <Link href="/hosting">Hosting</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li>
                <Link href="/portfolio">Work</Link>
              </li>
              <li>
                <Link href="/about">About</Link>
              </li>
              {home && (
                <li>
                  <Link href="#stack">Open source</Link>
                </li>
              )}
              <li>
                <Link href="/contact">Contact</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Account</h4>
            <ul>
              <li>
                <Link href="/login">Sign in</Link>
              </li>
              <li>
                <Link href="/login?mode=request">Request access</Link>
              </li>
              <li>
                <Link href="/dashboard">Dashboard</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Legal</h4>
            <ul>
              {LEGAL.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="foot-b">
          <span>
            © {year} {BUSINESS.legalName}
          </span>
          <span>Crafted for systems that think.</span>
        </div>
      </div>
    </footer>
  );
}

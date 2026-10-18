import Image from "next/image";
import Link from "next/link";

export type NavKey = "services" | "work" | "hosting" | "about" | "contact";

const LINKS: { key: NavKey; label: string; href: string; opt?: boolean }[] = [
  { key: "services", label: "Services", href: "/services" },
  { key: "work", label: "Work", href: "/portfolio" },
  { key: "hosting", label: "Hosting", href: "/hosting", opt: true },
  { key: "about", label: "About", href: "/about", opt: true },
  { key: "contact", label: "Contact", href: "/contact" },
];

/**
 * The design's sticky header. `opt` links drop out below 1060px and all links
 * (plus Sign in) below 700px, leaving the logo and "Start a project".
 * `variant="home"` reproduces the homepage's markup (brand → #top, inline-styled
 * sign-in link); `signIn={false}` is the sign-in page, which has no sign-in link.
 */
export default function SiteNav({
  current,
  variant = "page",
  signIn = true,
}: {
  current?: NavKey;
  variant?: "page" | "home";
  signIn?: boolean;
}) {
  const home = variant === "home";
  return (
    <header className="nav">
      <div className="wrap nav-in">
        <Link className="brand" href={home ? "#top" : "/"} aria-label="Sepnexus home">
          <Image
            src="/assets/sepnexus-logo-light.png"
            alt="Sepnexus"
            width={327}
            height={65}
            priority
            style={home ? { height: 26, width: "auto", display: "block" } : undefined}
          />
        </Link>
        <nav className="nav-links" aria-label="Primary">
          {LINKS.map((l) => {
            const on = l.key === current;
            const cls = [l.opt ? "opt" : "", on ? "on" : ""].filter(Boolean).join(" ");
            return (
              <Link
                key={l.key}
                href={l.href}
                className={cls || undefined}
                aria-current={on ? "page" : undefined}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        {signIn &&
          (home ? (
            <Link
              className="opt-signin"
              href="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                minHeight: 44,
                padding: "0 6px",
                fontSize: 13,
                color: "#d2d2d7",
              }}
            >
              Sign in
            </Link>
          ) : (
            <Link className="nav-signin" href="/login">
              Sign in
            </Link>
          ))}
        <Link className="btn btn-sm" href="/contact">
          Start a project
        </Link>
      </div>
    </header>
  );
}

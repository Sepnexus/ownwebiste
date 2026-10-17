import Link from "next/link";
import Image from "next/image";

/**
 * Small Sepnexus logo link back to the homepage. Used on the sign-in style
 * pages (login, forgot, reset, invite) where the site nav is hidden, so
 * people always have a way home. Sits in the top-left corner of
 * `.login-shell`, lined up with where the site nav's logo normally is.
 */
export default function AuthBrand() {
  return (
    <Link
      href="/"
      className="nav-brand"
      aria-label="Sepnexus home"
      style={{
        position: "absolute",
        top: "calc(18px + env(safe-area-inset-top, 0px))",
        left: "max(var(--pad), env(safe-area-inset-left, 0px))",
        color: "var(--ink)",
      }}
    >
      <Image src="/assets/sepnexus-mark.png" alt="" width={28} height={28} />
      <span className="word">Sepnexus</span>
    </Link>
  );
}

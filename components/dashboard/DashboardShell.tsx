import Link from "next/link";
import Image from "next/image";
import DashboardSignOut from "./DashboardSignOut";

export default function DashboardShell({
  user,
  children,
}: {
  user: { email: string; name: string | null };
  children: React.ReactNode;
}) {
  return (
    <>
      <nav className="dash-nav">
        <Link href="/dashboard" className="dash-brand">
          <Image src="/assets/sepnexus-mark.png" alt="" width={24} height={24} />
          <span>Sepnexus</span>
          <span className="tag">Customer</span>
        </Link>
        <div className="dash-nav-links">
          <Link href="/dashboard">Overview</Link>
          <Link href="/dashboard/billing">Billing</Link>
          <Link href="/dashboard/account">Account</Link>
        </div>
        <div className="dash-nav-cta">
          <span className="dash-user">{user.name ?? user.email}</span>
          <DashboardSignOut />
        </div>
      </nav>
      <main id="main" className="dash-main">{children}</main>
    </>
  );
}

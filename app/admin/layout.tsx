import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import AdminSignOut from "./_components/AdminSignOut";

export const dynamic = "force-dynamic";

const NAV: { label: string; href: string; section: "main" | "system" }[] = [
  { label: "Overview", href: "/admin", section: "main" },
  { label: "Inbox", href: "/admin/inbox", section: "main" },
  { label: "Customers", href: "/admin/customers", section: "main" },
  { label: "Subscriptions", href: "/admin/subscriptions", section: "main" },
  { label: "Usage", href: "/admin/usage", section: "main" },
  { label: "Pricing", href: "/admin/pricing", section: "main" },
  { label: "Portfolio", href: "/admin/portfolio", section: "main" },
  { label: "Audit log", href: "/admin/audit-log", section: "system" },
  { label: "Account", href: "/admin/account", section: "system" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin") redirect("/dashboard");

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <Link href="/admin" className="admin-brand">
          <span className="serif-italic">Sepnexus</span>
          <span className="tag">admin</span>
        </Link>

        <nav className="admin-nav">
          {NAV.filter((n) => n.section === "main").map((n) => (
            <Link key={n.href} href={n.href}>
              {n.label}
            </Link>
          ))}
          <div className="admin-nav-divider" />
          {NAV.filter((n) => n.section === "system").map((n) => (
            <Link key={n.href} href={n.href}>
              {n.label}
            </Link>
          ))}
          <Link href="/" target="_blank" rel="noreferrer">
            View site ↗
          </Link>
          <AdminSignOut />
        </nav>

        <div className="admin-user">
          <div className="admin-user-name">{user.name ?? user.email}</div>
          <div className="admin-user-email">{user.email}</div>
        </div>
      </aside>

      <main className="admin-main">{children}</main>
    </div>
  );
}

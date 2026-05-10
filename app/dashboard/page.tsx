import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { currentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Dashboard",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/login?next=/dashboard");
  if (user.role === "admin") redirect("/admin");

  return (
    <main className="page">
      <div className="page-narrow">
        <span className="page-eyebrow">Dashboard</span>
        <h1 className="page-title">
          Welcome back,
          <br />
          <em>{user.name ?? user.email.split("@")[0]}.</em>
        </h1>
        <p className="page-lede">
          Your full customer dashboard — plan, usage, billing, support — ships next phase. For now,
          your account is active and your invitation is on file.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {[
            { k: "Account", v: user.email },
            { k: "Status", v: "Active" },
            { k: "Plan", v: "Not subscribed" },
          ].map((row) => (
            <div
              key={row.k}
              style={{
                border: "1px solid var(--line)",
                borderRadius: 16,
                padding: 24,
                background: "rgba(255,255,255,0.6)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  marginBottom: 8,
                }}
              >
                {row.k}
              </div>
              <div style={{ fontSize: 16, color: "var(--ink)" }}>{row.v}</div>
            </div>
          ))}
        </div>

        <form action="/api/logout" method="POST" style={{ marginTop: 32 }}>
          <button type="submit" className="btn btn-outline">
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}

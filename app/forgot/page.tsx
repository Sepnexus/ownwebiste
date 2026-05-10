import type { Metadata } from "next";
import Link from "next/link";
import ForgotForm from "./_components/ForgotForm";

export const metadata: Metadata = { title: "Forgot password" };
export const dynamic = "force-dynamic";

export default function ForgotPage() {
  return (
    <main className="login-shell">
      <div className="login-card">
        <h1>Forgot password</h1>
        <p className="sub">
          Enter your email and we&apos;ll send a reset link. Valid for 1 hour.
        </p>
        <ForgotForm />
        <p
          style={{
            marginTop: 28,
            fontSize: 13,
            color: "var(--muted)",
            paddingTop: 18,
            borderTop: "1px solid var(--line)",
          }}
        >
          <Link href="/login" style={{ color: "var(--ink)" }}>
            ← Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

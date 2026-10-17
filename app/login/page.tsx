import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "./_components/LoginForm";
import AuthBrand from "./_components/AuthBrand";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Sepnexus account.",
};

export default function LoginPage() {
  return (
    <main id="main" className="login-shell">
      <AuthBrand />
      <div className="login-card">
        <h1>Welcome back.</h1>
        <p className="sub">Sign in with your Sepnexus account.</p>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
        <p
          style={{
            marginTop: 18,
            fontSize: 13,
            color: "var(--muted)",
            textAlign: "right",
          }}
        >
          <a href="/forgot" style={{ color: "var(--ink-2)" }}>
            Forgot password?
          </a>
        </p>
        <p
          style={{
            marginTop: 18,
            fontSize: 13,
            color: "var(--muted)",
            paddingTop: 18,
            borderTop: "1px solid var(--line)",
          }}
        >
          New to Sepnexus? Accounts are set up by our team —{" "}
          <a href="/contact?type=request_access" style={{ color: "var(--ink)" }}>
            request access <span aria-hidden="true">→</span>
          </a>
        </p>
      </div>
    </main>
  );
}

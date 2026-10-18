import type { Metadata } from "next";
import AuthLayout from "./_components/AuthLayout";
import SignInCard from "./_components/SignInCard";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Sepnexus dashboard.",
  alternates: { canonical: "/login" },
};

function first(v: string | string[] | undefined): string | null {
  return (Array.isArray(v) ? v[0] : v) ?? null;
}

// Ported from the Claude Design file SignIn.dc.html. Markup, classes and wording
// match the design; styles live in styles/site/base.css + signin.css.
//
// The query is read here rather than with useSearchParams so the card renders
// in the right mode straight away: `?mode=request` opens Request access (the
// footer links there) and `?next=` is where to go after signing in.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string | string[]; next?: string | string[] }>;
}) {
  const sp = await searchParams;
  const mode = first(sp.mode) === "request" ? "req" : "in";
  return (
    <AuthLayout>
      <SignInCard key={mode} initialMode={mode} next={first(sp.next)} />
    </AuthLayout>
  );
}

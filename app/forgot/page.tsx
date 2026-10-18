import type { Metadata } from "next";
import Link from "next/link";
import AuthLayout from "@/app/login/_components/AuthLayout";
import ForgotForm from "./_components/ForgotForm";

export const metadata: Metadata = { title: "Forgot password" };
export const dynamic = "force-dynamic";

export default function ForgotPage() {
  return (
    <AuthLayout>
      <ForgotForm />
      <p className="fine">
        <Link href="/login">
          <span aria-hidden="true">←</span> Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

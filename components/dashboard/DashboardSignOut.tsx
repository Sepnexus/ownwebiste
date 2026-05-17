"use client";

import { useRouter } from "next/navigation";

export default function DashboardSignOut() {
  const router = useRouter();
  async function signOut() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }
  return (
    <button type="button" className="btn btn-outline" style={{ padding: "8px 14px", fontSize: 12 }} onClick={signOut}>
      Sign out
    </button>
  );
}

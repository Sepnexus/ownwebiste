"use client";

import { useRouter } from "next/navigation";

export default function AdminSignOut() {
  const router = useRouter();
  async function signOut() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }
  return (
    <button type="button" className="admin-signout" onClick={signOut}>
      Sign out
    </button>
  );
}

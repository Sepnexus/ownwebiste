import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { z } from "zod";

export const metadata: Metadata = { title: "Account" };
export const dynamic = "force-dynamic";

const PasswordInput = z.object({
  current: z.string().min(1),
  next: z.string().min(8).max(200),
  confirm: z.string().min(1),
});
const ProfileInput = z.object({ name: z.string().trim().max(120).optional() });

async function changePassword(formData: FormData) {
  "use server";
  const { currentUser: _u, hashPassword: _h, verifyPassword: _v } = await import(
    "@/lib/auth"
  );
  const user = await _u();
  if (!user) {
    const { redirect: _r } = await import("next/navigation");
    _r("/login");
    return;
  }
  const parsed = PasswordInput.safeParse({
    current: formData.get("current"),
    next: formData.get("next"),
    confirm: formData.get("confirm"),
  });
  const { redirect: _r } = await import("next/navigation");
  if (!parsed.success) _r(`/dashboard/account?error=${encodeURIComponent("Password must be at least 8 characters.")}`);
  if (parsed.data!.next !== parsed.data!.confirm)
    _r(`/dashboard/account?error=${encodeURIComponent("New passwords don't match.")}`);
  if (!user.passwordHash) _r(`/dashboard/account?error=${encodeURIComponent("Password not set yet.")}`);
  const valid = await _v(parsed.data!.current, user.passwordHash!);
  if (!valid) _r(`/dashboard/account?error=${encodeURIComponent("Current password is incorrect.")}`);

  const { db: _db, schema: _s } = await import("@/lib/db");
  const { eq: _eq } = await import("drizzle-orm");
  const passwordHash = await _h(parsed.data!.next);
  await _db
    .update(_s.users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(_eq(_s.users.id, user.id));
  _r(`/dashboard/account?ok=${encodeURIComponent("Password updated.")}`);
}

async function updateProfile(formData: FormData) {
  "use server";
  const { currentUser: _u } = await import("@/lib/auth");
  const user = await _u();
  if (!user) return;
  const parsed = ProfileInput.safeParse({ name: formData.get("name") });
  const { redirect: _r } = await import("next/navigation");
  if (!parsed.success) _r(`/dashboard/account?error=${encodeURIComponent("Couldn't update profile.")}`);
  const { db: _db, schema: _s } = await import("@/lib/db");
  const { eq: _eq } = await import("drizzle-orm");
  await _db
    .update(_s.users)
    .set({ name: parsed.data!.name?.trim() || null, updatedAt: new Date() })
    .where(_eq(_s.users.id, user.id));
  _r(`/dashboard/account?ok=${encodeURIComponent("Profile updated.")}`);
}

export default async function CustomerAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/login?next=/dashboard/account");
  if (user.role === "admin") redirect("/admin/account");
  const { error, ok } = await searchParams;

  return (
    <DashboardShell user={{ email: user.email, name: user.name }}>
      <h1>Account</h1>
      <p className="lede-row">Update your profile or change your password.</p>

      {ok && <div className="form-success" style={{ marginBottom: 24, maxWidth: 640 }}>{ok}</div>}
      {error && <div className="form-error" style={{ marginBottom: 24, maxWidth: 640 }}>{error}</div>}

      <h2>Profile</h2>
      <form action={updateProfile} className="admin-form">
        <label>
          Name
          <input type="text" name="name" defaultValue={user.name ?? ""} />
        </label>
        <label>
          Email
          <input type="email" defaultValue={user.email} disabled />
          <span className="help">Reach out to akshay@sepnexus.com to change your email.</span>
        </label>
        <div className="actions">
          <button type="submit" className="btn btn-solid">Save profile</button>
        </div>
      </form>

      <h2>Change password</h2>
      <form action={changePassword} className="admin-form">
        <label>
          Current password
          <input type="password" name="current" required autoComplete="current-password" />
        </label>
        <label>
          New password
          <input type="password" name="next" required minLength={8} autoComplete="new-password" />
        </label>
        <label>
          Confirm new password
          <input type="password" name="confirm" required minLength={8} autoComplete="new-password" />
        </label>
        <div className="actions">
          <button type="submit" className="btn btn-solid">Update password</button>
        </div>
      </form>
    </DashboardShell>
  );
}

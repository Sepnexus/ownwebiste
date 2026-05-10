import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { changePassword, updateProfile } from "./_actions";

export const metadata: Metadata = { title: "Admin · Account" };
export const dynamic = "force-dynamic";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const admin = await requireAdmin();
  const { error, ok } = await searchParams;

  return (
    <>
      <h1>Your account</h1>
      <p className="admin-subtitle">Update your profile or rotate your password.</p>

      {ok && <div className="form-success" style={{ marginBottom: 24, maxWidth: 720 }}>{ok}</div>}
      {error && <div className="form-error" style={{ marginBottom: 24, maxWidth: 720 }}>{error}</div>}

      <h2 style={{ marginTop: 0 }}>Profile</h2>
      <form action={updateProfile} className="admin-form">
        <label>
          Name
          <input type="text" name="name" defaultValue={admin.name ?? ""} />
        </label>
        <label>
          Email (read-only)
          <input type="email" defaultValue={admin.email} disabled />
          <span className="help">Email is fixed for now. Reach out if you need to change it.</span>
        </label>
        <div className="actions">
          <button type="submit" className="btn btn-solid">
            Save profile
          </button>
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
          <span className="help">At least 8 characters. Avoid keyboard patterns.</span>
        </label>
        <label>
          Confirm new password
          <input type="password" name="confirm" required minLength={8} autoComplete="new-password" />
        </label>
        <div className="actions">
          <button type="submit" className="btn btn-solid">
            Update password
          </button>
        </div>
      </form>
    </>
  );
}

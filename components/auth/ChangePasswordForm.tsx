"use client";
import { useState } from "react";
import { useAuth } from '@/lib/hooks/useAuth';
import { tryGetFirebaseAuth } from '@/lib/firebase/config';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

export default function ChangePasswordForm() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!user || !user.email) {
      setError("No user is logged in.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      // Re-authenticate user
      const auth = tryGetFirebaseAuth();
      if (!auth) throw new Error("Auth not available");
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleChangePassword}>
      <div>
        <label className="block text-sm font-medium text-gray-700">Current Password</label>
        <input
          type="password"
          className="mt-1 block w-full border rounded px-3 py-2"
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">New Password</label>
        <input
          type="password"
          className="mt-1 block w-full border rounded px-3 py-2"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
        <input
          type="password"
          className="mt-1 block w-full border rounded px-3 py-2"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      {error && <div className="text-red-600">{error}</div>}
      {success && <div className="text-green-600">{success}</div>}
      <button
        type="submit"
        className="btn-primary w-full"
        disabled={loading}
      >
        {loading ? "Changing..." : "Change Password"}
      </button>
    </form>
  );
}

"use client";

import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AddUserPage() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    role: 'student',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (authLoading) return null;
  if (!user || role !== 'admin') {
    router.replace('/');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      // Add user to Firestore (not Auth)
      const { addUserToDb } = await import('@/lib/firebase/firestore');
      await addUserToDb(form);
      setSuccess('User added successfully!');
      setForm({ displayName: '', email: '', role: 'student' });
    } catch (err: any) {
      setError(err.message || 'Failed to add user.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="max-w-lg mx-auto mt-10 bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Add New User</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Name</label>
            <input
              type="text"
              name="displayName"
              value={form.displayName}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="student">Student</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {error && <div className="text-red-600">{error}</div>}
          {success && <div className="text-green-600">{success}</div>}
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={submitting}
          >
            {submitting ? 'Adding...' : 'Add User'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}

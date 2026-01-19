"use client";

import DashboardLayout from '@/components/layout/DashboardLayout';
import { useUsers } from '@/lib/hooks/useUsers';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function UsersPage() {
  const { users, loading } = useUsers();
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/');
      return;
    }
    if (role !== 'admin') {
      router.push('/dashboard/student');
    }
  }, [authLoading, role, router, user]);

  const handleEdit = (userObj: any) => {
    router.push(`/users/${userObj.id}/edit`);
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    const { deleteUser } = await import('@/lib/firebase/firestore');
    await deleteUser(userId);
    window.location.reload();
  };

  if (authLoading) {
    return (
      <DashboardLayout role={role ?? 'student'}>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!user || role !== 'admin') return null;

  return (
    <DashboardLayout role={role ?? 'student'}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Users Management</h1>
            <p className="text-gray-600">Manage library users and permissions</p>
          </div>
          <button className="btn-primary" onClick={() => router.push('/users/add')}>
            Add User
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading users...</p>
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Email</th>
                  <th className="text-left py-3 px-4 font-semibold">Role</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{user.displayName}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : user.role === 'staff' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800" onClick={() => handleEdit(user)}>
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-800" onClick={() => handleDelete(user.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
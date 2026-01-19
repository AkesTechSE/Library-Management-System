'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/lib/hooks/useAuth'
import { useUsers } from '@/lib/hooks/useUsers'

export default function EditUserPage() {
  const params = useParams()
  const userId = params.id as string
  const router = useRouter()
  const { user: currentUser, role, loading: authLoading } = useAuth()
  const { fetchUserById, editUser } = useUsers()

  const [form, setForm] = useState({
    displayName: '',
    email: '',
    role: 'student',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!currentUser) {
      router.push('/')
      return
    }
    if (role !== 'admin') {
      router.push('/dashboard/student')
    }
  }, [authLoading, currentUser, role, router])

  useEffect(() => {
    const loadUser = async () => {
      setError(null)
      setLoading(true)
      try {
        const userData = await fetchUserById(userId)
        if (!userData) {
          setError('User not found.')
          return
        }
        setForm({
          displayName: userData.displayName ?? '',
          email: userData.email ?? '',
          role: userData.role ?? 'student',
        })
      } catch (err: any) {
        setError(err?.message || 'Failed to load user.')
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      loadUser()
    }
  }, [fetchUserById, userId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await editUser(userId, form)
      setSuccess('User updated successfully!')
    } catch (err: any) {
      setError(err?.message || 'Failed to update user.')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading) {
    return (
      <DashboardLayout role="student">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!currentUser || role !== 'admin') return null

  return (
    <DashboardLayout role="admin">
      <div className="max-w-lg mx-auto mt-10 bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Edit User</h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading user...</p>
          </div>
        ) : (
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

            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex-1" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                className="btn-secondary flex-1"
                onClick={() => router.push(`/users/${userId}`)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  )
}

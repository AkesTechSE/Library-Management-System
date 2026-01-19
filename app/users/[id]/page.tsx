'use client'

import { useParams } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useUsers } from '@/lib/hooks/useUsers'
import { useAuth } from '@/lib/hooks/useAuth'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils/helpers'
import { sendPasswordResetEmail } from 'firebase/auth'
import { tryGetFirebaseAuth } from '@/lib/firebase/config'

export default function UserDetailPage() {
  const params = useParams()
  const userId = params.id as string
  const { fetchUserById, editUser } = useUsers()
  const { user: currentUser, role, loading: authLoading } = useAuth()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

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

  // Fetch user data
  useEffect(() => {
    const loadUser = async () => {
      const userData = await fetchUserById(userId)
      setUser(userData)
      setLoading(false)
    }
    loadUser()
  }, [fetchUserById, userId])

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

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading user details...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return (
      <DashboardLayout role="admin">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">👤</div>
          <h3 className="text-xl font-semibold mb-2">User Not Found</h3>
          <p className="text-gray-600 mb-4">The requested user does not exist</p>
          <a href="/users" className="btn-primary">
            Back to Users
          </a>
        </div>
      </DashboardLayout>
    )
  }

  const handleResetPassword = async () => {
    if (!user?.email) return
    setActionError(null)
    setActionSuccess(null)
    setActionLoading(true)

    try {
      const auth = tryGetFirebaseAuth()
      if (!auth) throw new Error('Firebase auth is not configured.')
      await sendPasswordResetEmail(auth, user.email)
      setActionSuccess('Password reset email sent.')
    } catch (err: any) {
      setActionError(err?.message || 'Failed to send password reset email.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSuspendToggle = async () => {
    if (!user?.id) return
    setActionError(null)
    setActionSuccess(null)
    setActionLoading(true)

    try {
      const nextBanned = !user.banned
      await editUser(user.id, {
        banned: nextBanned,
        bannedAt: nextBanned ? new Date() : null,
        banReason: nextBanned ? 'Suspended by admin' : null,
      })
      setUser({
        ...user,
        banned: nextBanned,
        bannedAt: nextBanned ? new Date() : null,
        banReason: nextBanned ? 'Suspended by admin' : null,
      })
      setActionSuccess(nextBanned ? 'User suspended.' : 'User unsuspended.')
    } catch (err: any) {
      setActionError(err?.message || 'Failed to update user status.')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* User Avatar */}
            <div>
              <div className="bg-gray-100 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">👤</span>
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold">{user.displayName}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>

            {/* User Details */}
            <div className="md:col-span-2 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm text-gray-500">Role</h4>
                  <p className="font-medium">{user.role}</p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500">Status</h4>
                  <p className={`font-medium ${user.banned ? 'text-red-600' : 'text-green-600'}`}>
                    {user.banned ? 'Suspended' : 'Active'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500">Member Since</h4>
                  <p className="font-medium">{user.createdAt ? formatDate(user.createdAt) : 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500">Last Login</h4>
                  <p className="font-medium">{user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500">Fine Amount</h4>
                  <p className="font-medium">${user.fineAmount || 0}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Currently Borrowed Books</h3>
                {user.borrowedBooks && user.borrowedBooks.length > 0 ? (
                  <div className="space-y-2">
                    {user.borrowedBooks.slice(0, 3).map((bookId: string) => (
                      <div key={bookId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>Book #{bookId}</span>
                        <button className="text-blue-600 text-sm">View</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No books currently borrowed</p>
                )}
              </div>

              {actionError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                  {actionError}
                </div>
              )}
              {actionSuccess && (
                <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                  {actionSuccess}
                </div>
              )}

              <div className="flex space-x-4">
                <a href={`/users/${userId}/edit`} className="btn-primary">Edit User</a>
                <button className="btn-secondary" onClick={handleResetPassword} disabled={actionLoading}>
                  {actionLoading ? 'Working…' : 'Reset Password'}
                </button>
                <button
                  className={`btn-secondary ${user.banned ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200'}`}
                  onClick={handleSuspendToggle}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Working…' : user.banned ? 'Unsuspend User' : 'Suspend User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
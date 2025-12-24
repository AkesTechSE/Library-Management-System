'use client'

import { useParams } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useUsers } from '@/lib/hooks/useUsers'
import { useAuth } from '@/lib/hooks/useAuth'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UserDetailPage() {
  const params = useParams()
  const userId = params.id as string
  const { fetchUserById } = useUsers()
  const { user: currentUser, role, loading: authLoading } = useAuth()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
                  <h4 className="text-sm text-gray-500">Member Since</h4>
                  <p className="font-medium">{user.createdAt || 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500">Last Login</h4>
                  <p className="font-medium">{user.lastLoginAt || 'Not specified'}</p>
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

              <div className="flex space-x-4">
                <button className="btn-primary">Edit User</button>
                <button className="btn-secondary">Reset Password</button>
                <button className="btn-secondary text-red-600 border-red-200">Suspend User</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
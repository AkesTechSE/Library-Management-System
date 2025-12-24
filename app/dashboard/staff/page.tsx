'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import StatsCard from '@/components/charts/StatsCard'
import BookTable from '@/components/books/BookTable'
import { useBooks } from '@/lib/hooks/useBooks'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function StaffDashboard() {
  const { books, loading } = useBooks()
  const { user, role, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/')
      return
    }
    if (!role) return
    if (role !== 'staff' && role !== 'admin') {
      router.push('/dashboard/student')
    }
  }, [authLoading, role, router, user])

  if (authLoading || (user && !role)) {
    return (
      <DashboardLayout role="student">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!user || (role !== 'staff' && role !== 'admin')) return null

  return (
    <DashboardLayout role={role === 'admin' ? 'admin' : 'staff'}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Staff Dashboard</h1>
          <p className="text-gray-600">Manage books and borrowing requests</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard 
            title="Pending Requests" 
            value="12" 
            change="+3"
            icon="📋"
          />
          <StatsCard 
            title="Books to Shelve" 
            value="8" 
            change="-2"
            icon="📚"
          />
          <StatsCard 
            title="Overdue Notices" 
            value="5" 
            change="+1"
            icon="⏰"
          />
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">{"Today's Tasks"}</h2>
            <button className="btn-primary">View All</button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <h3 className="font-medium">Approve borrowing requests</h3>
                <p className="text-sm text-gray-600">5 pending approvals</p>
              </div>
              <button className="btn-primary text-sm px-3 py-1">
                Process
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div>
                <h3 className="font-medium">Check overdue books</h3>
                <p className="text-sm text-gray-600">Send reminder emails</p>
              </div>
              <button className="btn-secondary text-sm px-3 py-1">
                View
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Recently Added Books</h2>
          {loading ? (
            <div className="text-center py-8">Loading books...</div>
          ) : (
            <BookTable books={books.slice(0, 3)} />
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
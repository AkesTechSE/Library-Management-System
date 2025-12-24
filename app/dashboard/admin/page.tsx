'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import StatsCard from '@/components/charts/StatsCard'
import BorrowChart from '@/components/charts/BorrowChart'
import BookTable from '@/components/books/BookTable'
import { useBooks } from '@/lib/hooks/useBooks'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminDashboard() {
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
    if (role !== 'admin') {
      router.push(role === 'staff' ? '/dashboard/staff' : '/dashboard/student')
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

  if (!user || role !== 'admin') return null

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600">Manage library system and analytics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard 
            title="Total Books" 
            value={books.length} 
            change="+12%"
            icon="📚"
          />
          <StatsCard 
            title="Active Users" 
            value="342" 
            change="+5%"
            icon="👥"
          />
          <StatsCard 
            title="Borrowed Books" 
            value="89" 
            change="-2%"
            icon="📖"
          />
          <StatsCard 
            title="Overdue Books" 
            value="7" 
            change="+1"
            icon="⏰"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Borrowing Trends</h2>
            <BorrowChart />
          </div>
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-4">
              <button className="w-full btn-primary py-3">
                Add New Book
              </button>
              <button className="w-full btn-secondary py-3">
                Manage Users
              </button>
              <button className="w-full btn-secondary py-3">
                Generate Reports
              </button>
            </div>
          </div>
        </div>

        {/* Books Table */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Recent Books</h2>
            <a href="/books/add" className="btn-primary">
              Add Book
            </a>
          </div>
          {loading ? (
            <div className="text-center py-8">Loading books...</div>
          ) : (
            <BookTable books={books.slice(0, 5)} />
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
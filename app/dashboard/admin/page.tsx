'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import StatsCard from '@/components/charts/StatsCard'
import BorrowChart from '@/components/charts/BorrowChart'
import BookTable from '@/components/books/BookTable'
import { useBooks } from '@/lib/hooks/useBooks'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AdminDashboardPage() {
  const { books, loading } = useBooks();
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/')
      return
    }
    if (role && role !== 'admin') {
      router.push('/dashboard/student')
    }
  }, [authLoading, role, router, user])

  if (authLoading || !user || !role) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (role !== 'admin') return null



  const borrowedCount = books.filter(book => book.status === 'borrowed').length
  const availableCount = books.filter(book => book.status !== 'borrowed').length

  return (
    <DashboardLayout role={role}>
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
            title="Currently Borrowed" 
            value={borrowedCount} 
            change=""
            icon="📖"
          />
          <StatsCard 
            title="Not Borrowed" 
            value={availableCount} 
            change=""
            icon="✅"
          />
          {/* <StatsCard 
            title="Active Users" 
            value="342" 
            change="+5%"
            icon="👥"
          /> */}
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
              <button
                className="w-full btn-primary py-3"
                onClick={() => window.location.href = '/books/add'}
              >
                Add New Book
              </button>
              <button
                className="w-full btn-secondary py-3"
                onClick={() => window.location.href = '/users'}
              >
                Manage Users
              </button>
              <button
                className="w-full btn-secondary py-3"
                onClick={() => window.location.href = '/dashboard/analytics'}
              >
                Generate Reports
              </button>
            </div>
          </div>
        </div>

        {/* Books Table with Search */}
        <div className="card">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-2">
            <h2 className="text-xl font-semibold">Recent Books</h2>
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full md:w-auto justify-end items-center">
              <input
                type="text"
                placeholder="Search by title, author, or ISBN..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="border rounded px-3 py-2 w-full md:w-64"
              />
              <a href="/books/add" className="btn-primary">
                Add Book
              </a>
            </div>
          </div>
          {loading ? (
            <div className="text-center py-8">Loading books...</div>
          ) : (
            <BookTable
              books={books.filter(book => {
                const q = search.toLowerCase();
                return (
                  book.title?.toLowerCase().includes(q) ||
                  book.author?.toLowerCase().includes(q) ||
                  book.isbn?.toLowerCase().includes(q)
                );
              })}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
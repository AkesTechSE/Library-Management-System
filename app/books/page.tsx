'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import BookCard from '@/components/books/BookCard'
import BookTable from '@/components/books/BookTable'
import { useBooks } from '@/lib/hooks/useBooks'
import { useAuth } from '@/lib/hooks/useAuth'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function BooksPage() {
  const { books, loading } = useBooks()
  const { user, role, loading: authLoading } = useAuth()
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  const isAdminOrStaff = role === 'admin' || role === 'staff'

  useEffect(() => {
    if (authLoading) return
    if (!user) router.push('/')
  }, [authLoading, router, user])

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

  if (!user) return null

  return (
    <DashboardLayout role={role ?? 'student'}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Library Books</h1>
            <p className="text-gray-600">Browse and manage books in the library</p>
          </div>
          <div className="flex space-x-4">
            <div className="flex border rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : ''}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : ''}`}
              >
                Table
              </button>
            </div>
            {isAdminOrStaff && (
              <a href="/books/add" className="btn-primary">
                Add Book
              </a>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading books...</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="card">
            <BookTable books={books} />
          </div>
        )}

        {books.length === 0 && !loading && (
          <div className="text-center py-12 card">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">No Books Available</h3>
            <p className="text-gray-600 mb-4">Start by adding books to the library</p>
            {isAdminOrStaff && (
              <a href="/books/add" className="btn-primary">
                Add First Book
              </a>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
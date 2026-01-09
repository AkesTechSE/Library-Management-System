'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import BookCard from '@/components/books/BookCard'
import { useBooks } from '@/lib/hooks/useBooks'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { getActiveBorrowForUser, returnBook } from '@/lib/firebase/firestore'
import { formatDate } from '@/lib/utils/helpers'

export default function StudentDashboard() {
  const { books, loading, fetchBooks, fetchBookById } = useBooks()
  const { user, role, loading: authLoading } = useAuth()
  const router = useRouter()
  const [activeBorrow, setActiveBorrow] = useState<
    | (Awaited<ReturnType<typeof getActiveBorrowForUser>>)
    | null
  >(null)
  const [borrowedBook, setBorrowedBook] = useState<any | null>(null)
  const [borrowLoading, setBorrowLoading] = useState(false)
  const [borrowError, setBorrowError] = useState<string | null>(null)

  const availableBooks = useMemo(() => {
    const filtered = borrowedBook ? books.filter((b) => b.id !== borrowedBook.id) : books
    return filtered.slice(0, 8)
  }, [books, borrowedBook])

  const dueDateInfo = useMemo(() => {
    const dueAt: any = (activeBorrow as any)?.dueAt
    const dueDate: Date | null = dueAt?.toDate ? dueAt.toDate() : dueAt ? new Date(dueAt) : null
    if (!dueDate) return { dueDate: null as Date | null, daysRemaining: null as number | null, isOverdue: false }

    const msLeft = dueDate.getTime() - Date.now()
    const daysRemaining = Math.ceil(msLeft / (1000 * 60 * 60 * 24))
    return {
      dueDate,
      daysRemaining,
      isOverdue: daysRemaining < 0,
    }
  }, [activeBorrow])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/')
      return
    }
    if (!role) return
    if (role === 'admin') {
      router.push('/dashboard/admin')
      return
    }
    if (role === 'staff') {
      router.push('/dashboard/staff')
      return
    }
  }, [authLoading, role, router, user])

  useEffect(() => {
    if (authLoading) return
    if (!user) return
    if (!role) return
    if (role !== 'student') return

    const loadActiveBorrow = async () => {
      setBorrowError(null)
      setBorrowLoading(true)

      try {
        const record = await getActiveBorrowForUser(user.uid)
        setActiveBorrow(record)

        if (record?.bookId) {
          const book = await fetchBookById(record.bookId)
          setBorrowedBook(book)
        } else {
          setBorrowedBook(null)
        }
      } catch (err: any) {
        setActiveBorrow(null)
        setBorrowedBook(null)
        setBorrowError(err?.message || 'Failed to load borrowed book.')
      } finally {
        setBorrowLoading(false)
      }
    }

    loadActiveBorrow()
  }, [authLoading, fetchBookById, role, user])

  const handleReturn = async () => {
    if (!user || !borrowedBook?.id) return
    setBorrowError(null)
    setBorrowLoading(true)

    try {
      await returnBook(user.uid, borrowedBook.id)
      setActiveBorrow(null)
      setBorrowedBook(null)
      await fetchBooks({ force: true })
    } catch (err: any) {
      setBorrowError(err?.message || 'Failed to return the book.')
    } finally {
      setBorrowLoading(false)
    }
  }

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

  if (!user) return null

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Student Dashboard</h1>
          <p className="text-gray-600">Browse and read books online</p>
        </div>

        {/* Borrowed Books */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Currently Borrowed</h2>
          {borrowError && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {borrowError}
            </div>
          )}

          {borrowLoading ? (
            <div className="text-center py-8 text-gray-500">Loading borrowed book…</div>
          ) : !borrowedBook ? (
            <div className="text-center py-8 text-gray-500">
              {"You haven't borrowed any books yet."}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BookCard key={borrowedBook.id} book={borrowedBook} />
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="text-sm text-gray-600">
                  Due: <span className="font-medium">{formatDate((activeBorrow as any)?.dueAt)}</span>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/books/${borrowedBook.id}`}
                    className="btn-secondary px-4 py-2 text-center"
                  >
                    View Details
                  </a>
                  <button
                    onClick={handleReturn}
                    disabled={borrowLoading}
                    className="btn-primary px-4 py-2"
                  >
                    {borrowLoading ? 'Returning…' : 'Return'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Available Books */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Available Books</h2>
            <a href="/books" className="text-blue-600 hover:underline">
              View All
            </a>
          </div>
          {loading ? (
            <div className="text-center py-8">Loading books...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {availableBooks.map(book => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card text-center">
            <div className="text-3xl font-bold text-blue-600">{borrowedBook ? 1 : 0}</div>
            <div className="text-gray-600">Books Borrowed</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-green-600">
              {borrowedBook && typeof dueDateInfo.daysRemaining === 'number'
                ? Math.max(dueDateInfo.daysRemaining, 0)
                : 0}
            </div>
            <div className="text-gray-600">Days Remaining</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-red-600">
              {borrowedBook && dueDateInfo.isOverdue ? 1 : 0}
            </div>
            <div className="text-gray-600">Overdue Books</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
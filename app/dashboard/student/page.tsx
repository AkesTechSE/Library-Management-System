'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import BookCard from '@/components/books/BookCard'
import { useBooks } from '@/lib/hooks/useBooks'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { borrowBook, getActiveBorrowForUser, returnBook } from '@/lib/firebase/firestore'
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
  const [borrowFetchLoading, setBorrowFetchLoading] = useState(false)
  const [borrowError, setBorrowError] = useState<string | null>(null)

  const activeBorrowBookId = activeBorrow?.bookId
  const hasActiveBorrow = !!activeBorrowBookId

  const availableBooks = useMemo(() => {
    const filtered = activeBorrowBookId ? books.filter((b) => b.id !== activeBorrowBookId) : books
    return filtered
  }, [activeBorrowBookId, books])

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

<<<<<<< HEAD
  // Client-side role-based redirects removed; handled by middleware
=======
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
>>>>>>> ad8761762d6b071a9fda3037f23dba115bc51026

  useEffect(() => {
    if (authLoading) return
    if (!user) return
    if (!role) return
    if (role !== 'student') return

    const loadActiveBorrow = async () => {
      setBorrowError(null)
      setBorrowFetchLoading(true)

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
        setBorrowFetchLoading(false)
      }
    }

    loadActiveBorrow()
  }, [authLoading, fetchBookById, role, user])

  const handleReturn = async () => {
    const targetBookId = borrowedBook?.id ?? activeBorrowBookId
    if (!user || !targetBookId) return
    setBorrowError(null)
    setBorrowLoading(true)

    try {
      await returnBook(user.uid, targetBookId)
      setActiveBorrow(null)
      setBorrowedBook(null)
      await fetchBooks({ force: true })
    } catch (err: any) {
      setBorrowError(err?.message || 'Failed to return the book.')
    } finally {
      setBorrowLoading(false)
    }
  }

  const handleBorrow = async (bookId: string) => {
    if (!user) return
    setBorrowError(null)
    setBorrowLoading(true)

    try {
      await borrowBook(user.uid, bookId)
      const record = await getActiveBorrowForUser(user.uid)
      setActiveBorrow(record)
      if (record?.bookId) {
        const book = await fetchBookById(record.bookId)
        setBorrowedBook(book)
      }
      await fetchBooks({ force: true })
    } catch (err: any) {
      setBorrowError(err?.message || 'Failed to borrow the book.')
    } finally {
      setBorrowLoading(false)
    }
  }

  const isReady = !!user && role === 'student'

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        {!isReady && (
          <div className="card">
            <div className="text-center py-6">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading your dashboard...</p>
            </div>
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Student Dashboard</h1>
          <p className="text-gray-600">Browse and read books online</p>
        </div>

        {isReady && borrowError && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {borrowError}
          </div>
        )}

        {isReady && borrowFetchLoading ? (
          <div className="card">
            <div className="text-sm text-gray-600">Loading borrowed book...</div>
          </div>
        ) : isReady && hasActiveBorrow ? (
          <div className="card">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Borrowed Book</h2>
                <p className="text-gray-700 mt-1">
                  {borrowedBook ? (
                    <>
                      <span className="font-medium">{borrowedBook.title}</span> by {borrowedBook.author}
                    </>
                  ) : (
                    <span className="text-gray-600">Book details are unavailable.</span>
                  )}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Due: <span className={`font-medium ${dueDateInfo.isOverdue ? 'text-red-600' : ''}`}>
                    {dueDateInfo.dueDate ? formatDate(dueDateInfo.dueDate) : 'N/A'}
                  </span>
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                {borrowedBook ? (
                  <a href={`/books/${borrowedBook.id}/read`} className="btn-primary">
                    Read Online
                  </a>
                ) : (
                  <a href={`/books/${activeBorrowBookId}/read`} className="btn-primary">
                    Read Online
                  </a>
                )}
                <button
                  onClick={handleReturn}
                  disabled={borrowLoading}
                  className="btn-secondary"
                >
                  {borrowLoading ? 'Returning…' : 'Return Book'}
                </button>
              </div>
            </div>
          </div>
        ) : isReady ? (
          <div className="card">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">No Active Borrow</h2>
                <p className="text-gray-600">Borrow a book to read it online.</p>
              </div>
            </div>
          </div>
        ) : null}


        {/* Available Books */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Available Books</h2>
            <a href="/books" className="text-blue-600 hover:underline">
              View All
            </a>
          </div>
          {isReady && loading && books.length === 0 ? (
            <div className="text-center py-8">Loading books...</div>
          ) : isReady ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {availableBooks.map(book => (
                <BookCard
                  key={book.id}
                  book={book}
                  isBorrowed={borrowedBook && book.id === borrowedBook.id}
                  onReturn={borrowedBook && book.id === borrowedBook.id ? handleReturn : undefined}
                  onBorrow={!hasActiveBorrow ? handleBorrow : undefined}
                  returnLoading={borrowLoading}
                />
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-600">Loading books...</div>
          )}
        </div>


        {/* Quick Stats removed as requested */}
      </div>
    </DashboardLayout>
  )
}
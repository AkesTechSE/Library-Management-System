'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/lib/hooks/useAuth'
import { useBooks } from '@/lib/hooks/useBooks'
import { getActiveBorrowForUser, returnBook } from '@/lib/firebase/firestore'
import { formatDate } from '@/lib/utils/helpers'

export default function MyBooksPage() {
  const { user, role, loading: authLoading } = useAuth()
  const { fetchBooks, fetchBookById } = useBooks()
  const router = useRouter()
  const [activeBorrow, setActiveBorrow] = useState<
    | (Awaited<ReturnType<typeof getActiveBorrowForUser>>)
    | null
  >(null)
  const [borrowedBook, setBorrowedBook] = useState<any | null>(null)
  const [borrowFetchLoading, setBorrowFetchLoading] = useState(false)
  const [returnLoading, setReturnLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const layoutRole = (role ?? 'student') as 'admin' | 'staff' | 'student'

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/')
      return
    }
    if (!role) return

    const loadActiveBorrow = async () => {
      setError(null)
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
        setError(err?.message || 'Failed to load your borrowed books.')
      } finally {
        setBorrowFetchLoading(false)
      }
    }

    loadActiveBorrow()
  }, [authLoading, fetchBookById, role, router, user])

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

  const handleReturn = async () => {
    const targetBookId = borrowedBook?.id ?? activeBorrow?.bookId
    if (!user || !targetBookId) return
    setError(null)
    setReturnLoading(true)

    try {
      await returnBook(user.uid, targetBookId)
      setActiveBorrow(null)
      setBorrowedBook(null)
      await fetchBooks({ force: true })
    } catch (err: any) {
      setError(err?.message || 'Failed to return the book.')
    } finally {
      setReturnLoading(false)
    }
  }

  const isReady = !!user && !!role

  return (
    <DashboardLayout role={layoutRole}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Books</h1>
          <p className="text-gray-600">View your active borrowed book and due date.</p>
        </div>

        {!isReady && (
          <div className="card">
            <div className="text-center py-6">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading your books...</p>
            </div>
          </div>
        )}

        {isReady && error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {isReady && borrowFetchLoading ? (
          <div className="card">
            <div className="text-sm text-gray-600">Loading borrowed book...</div>
          </div>
        ) : isReady && activeBorrow ? (
          <div className="card">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Active Borrow</h2>
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
                  Due:{' '}
                  <span className={`font-medium ${dueDateInfo.isOverdue ? 'text-red-600' : ''}`}>
                    {dueDateInfo.dueDate ? formatDate(dueDateInfo.dueDate) : 'N/A'}
                  </span>
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href={`/books/${borrowedBook?.id ?? activeBorrow.bookId}/read`}
                  className="btn-primary"
                >
                  Read Online
                </a>
                <button
                  onClick={handleReturn}
                  disabled={returnLoading}
                  className="btn-secondary"
                >
                  {returnLoading ? 'Returning…' : 'Return Book'}
                </button>
              </div>
            </div>
          </div>
        ) : isReady ? (
          <div className="card">
            <h2 className="text-xl font-semibold">No Active Borrow</h2>
            <p className="text-gray-600 mt-1">You have not borrowed any books yet.</p>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  )
}

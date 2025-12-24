'use client'

import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useBooks } from '@/lib/hooks/useBooks'
import { useAuth } from '@/lib/hooks/useAuth'
import { useEffect, useState } from 'react'
import type { Book } from '@/types'
import { formatDate } from '@/lib/utils/helpers'
import { borrowBook, getActiveBorrowForUser, returnBook } from '@/lib/firebase/firestore'

type BookRecord = Partial<Book> & { id: string }

export default function BookDetailPage() {
  const params = useParams<{ id: string }>()
  const bookId = params.id
  const { fetchBookById } = useBooks()
  const { user, role, loading: authLoading } = useAuth()
  const router = useRouter()
  const [book, setBook] = useState<BookRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeBorrow, setActiveBorrow] = useState<
    | (Awaited<ReturnType<typeof getActiveBorrowForUser>>)
    | null
  >(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const isAdminOrStaff = role === 'admin' || role === 'staff'

  useEffect(() => {
    if (authLoading) return
    if (!user) router.push('/')
  }, [authLoading, router, user])

  // Fetch book data
  useEffect(() => {
    if (!bookId) return
    const loadBook = async () => {
      const bookData = await fetchBookById(bookId)
      setBook(bookData as BookRecord | null)
      setLoading(false)
    }
    loadBook()
  }, [bookId, fetchBookById])

  // Fetch user's active borrow (students only)
  useEffect(() => {
    if (authLoading) return
    if (!user) return
    if (isAdminOrStaff) return

    const loadBorrow = async () => {
      try {
        const record = await getActiveBorrowForUser(user.uid)
        setActiveBorrow(record)
      } catch {
        // Keep UI usable even if Firestore is temporarily unavailable.
        setActiveBorrow(null)
      }
    }

    loadBorrow()
  }, [authLoading, isAdminOrStaff, user])

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

  const reloadBook = async () => {
    const bookData = await fetchBookById(bookId)
    setBook(bookData as BookRecord | null)
  }

  const reloadActiveBorrow = async () => {
    if (!user || isAdminOrStaff) return
    try {
      const record = await getActiveBorrowForUser(user.uid)
      setActiveBorrow(record)
    } catch {
      setActiveBorrow(null)
    }
  }

  const handleBorrow = async () => {
    if (!user) return
    setActionError(null)

    try {
      setActionLoading(true)
      await borrowBook(user.uid, bookId)
      await Promise.all([reloadBook(), reloadActiveBorrow()])
    } catch (err: any) {
      setActionError(err?.message || 'Failed to borrow this book.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReturn = async () => {
    if (!user) return
    setActionError(null)

    try {
      setActionLoading(true)
      await returnBook(user.uid, bookId)
      await Promise.all([reloadBook(), reloadActiveBorrow()])
    } catch (err: any) {
      setActionError(err?.message || 'Failed to return this book.')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout role={role ?? 'student'}>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading book details...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!book) {
    return (
      <DashboardLayout role={role ?? 'student'}>
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="text-xl font-semibold mb-2">Book Not Found</h3>
          <p className="text-gray-600 mb-4">The requested book does not exist</p>
          <a href="/books" className="btn-primary">
            Back to Books
          </a>
        </div>
      </DashboardLayout>
    )
  }

  const status = book.status ?? 'available'
  const hasActiveBorrow = !!activeBorrow
  const hasThisBookBorrowed = activeBorrow?.bookId === bookId
  const canBorrowThisBook = !hasActiveBorrow && status === 'available'

  return (
    <DashboardLayout role={role ?? 'student'}>
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Book Cover */}
            <div>
              <div className="bg-gray-100 rounded-lg aspect-[3/4] flex items-center justify-center mb-4">
                <span className="text-6xl">📚</span>
              </div>
              {!isAdminOrStaff && (
                <div className="space-y-3">
                  {actionError && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      {actionError}
                    </div>
                  )}

                  {hasThisBookBorrowed ? (
                    <>
                      <button
                        onClick={handleReturn}
                        disabled={actionLoading}
                        className="w-full btn-primary py-3"
                      >
                        {actionLoading ? 'Returning…' : 'Return Book'}
                      </button>
                      <div className="text-sm text-gray-600">
                        Due: <span className="font-medium">{formatDate((activeBorrow as any)?.dueAt)}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleBorrow}
                        disabled={actionLoading || !canBorrowThisBook}
                        className="w-full btn-primary py-3"
                      >
                        {actionLoading ? 'Starting…' : 'Read Online'}
                      </button>
                      {hasActiveBorrow && activeBorrow?.bookId !== bookId && (
                        <div className="text-sm text-gray-600">
                          You already have a borrowed book. Return it before borrowing another.
                        </div>
                      )}
                      {!hasActiveBorrow && status !== 'available' && (
                        <div className="text-sm text-gray-600">
                          This book is not currently available.
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
              {isAdminOrStaff && (
                <div className="space-y-2">
                  <button className="w-full btn-secondary py-2">
                    Edit Book
                  </button>
                  <button className="w-full btn-secondary py-2 text-red-600 border-red-200">
                    Delete Book
                  </button>
                </div>
              )}
            </div>

            {/* Book Details */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{book.title}</h1>
                <p className="text-xl text-gray-600">by {book.author}</p>
              </div>

              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full ${status === 'available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
                <span className="text-gray-600">ISBN: {book.isbn}</span>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-700">{book.description || 'No description available.'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm text-gray-500">Category</h4>
                  <p className="font-medium">{book.category || 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500">Publisher</h4>
                  <p className="font-medium">{book.publisher || 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500">Published Date</h4>
                  <p className="font-medium">{book.publishedDate ? formatDate(book.publishedDate) : 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500">Total Copies</h4>
                  <p className="font-medium">{book.totalCopies || 1}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
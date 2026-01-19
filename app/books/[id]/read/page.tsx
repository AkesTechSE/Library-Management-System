'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/lib/hooks/useAuth'
import { useBooks } from '@/lib/hooks/useBooks'
import { getActiveBorrowForUser, returnBook } from '@/lib/firebase/firestore'
import { getFirebaseStorage } from '@/lib/firebase/config'
import { getDownloadURL, ref } from 'firebase/storage'
import { formatDate } from '@/lib/utils/helpers'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'


export default function ReadBookPage() {
  const params = useParams<{ id: string }>()
  const bookId = params.id
  const router = useRouter()

  const { user, role, loading: authLoading } = useAuth()
  const { fetchBookById } = useBooks()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [book, setBook] = useState<any>(null)
  const [activeBorrow, setActiveBorrow] = useState<
    | (Awaited<ReturnType<typeof getActiveBorrowForUser>>)
    | null
  >(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const isAdminOrStaff = role === 'admin' || role === 'staff'

  const iframeSrc = useMemo(() => {
    if (!pdfUrl) return null
    // Hide built-in viewer controls where supported.
    const hash = '#toolbar=0&navpanes=0&scrollbar=0'
    return pdfUrl.includes('#') ? pdfUrl : `${pdfUrl}${hash}`
  }, [pdfUrl])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/')
      return
    }

    const load = async () => {
      setError(null)
      setLoading(true)

      try {
        const bookData = await fetchBookById(bookId)
        setBook(bookData)
        const url = (bookData as any)?.pdfUrl as string | undefined

        if (!url) {
          setPdfUrl(null)
          setError('This book does not have a PDF available for online reading.')
          return
        }

        if (!isAdminOrStaff) {
          const active = await getActiveBorrowForUser(user.uid)
          setActiveBorrow(active)
          if (!active || active.bookId !== bookId) {
            setPdfUrl(null)
            setError('You must borrow this book before you can read it online.')
            return
          }
        }

        if (url.startsWith('http://') || url.startsWith('https://')) {
          setPdfUrl(url)
        } else {
          const storage = getFirebaseStorage()
          const downloadUrl = await getDownloadURL(ref(storage, url))
          setPdfUrl(downloadUrl)
        }
      } catch (err: any) {
        setPdfUrl(null)
        setError(err?.message || 'Failed to load book reader.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [authLoading, bookId, fetchBookById, isAdminOrStaff, router, user])

  if (authLoading || loading) {
    return (
      <DashboardLayout role={role ?? 'student'}>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading reader...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) return null


  const hasThisBookBorrowed = activeBorrow?.bookId === bookId

  const handleReturn = async () => {
    if (!user || !hasThisBookBorrowed) return
    setActionError(null)
    setActionLoading(true)

    try {
      await returnBook(user.uid, bookId)
      const active = await getActiveBorrowForUser(user.uid)
      setActiveBorrow(active)
    } catch (err: any) {
      setActionError(err?.message || 'Failed to return this book.')
    } finally {
      setActionLoading(false)
    }
  }

  if (error || !iframeSrc) {
    return (
      <DashboardLayout role={role ?? 'student'}>
        <div className="max-w-3xl mx-auto card">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Read Online</h1>
          <p className="text-gray-600 mb-6">{error || 'Reader unavailable.'}</p>
          {isAdminOrStaff && !pdfUrl && (
            <p className="text-sm text-gray-500 mb-4">
              Add a PDF URL to enable online reading.
            </p>
          )}
          <div className="flex gap-3">
            <a href={`/books/${bookId}`} className="btn-primary">
              Back to Book
            </a>
            {isAdminOrStaff && (
              <a href={`/books/${bookId}/edit`} className="btn-secondary">
                Edit Book
              </a>
            )}
            <a href="/books" className="btn-secondary">
              Browse Books
            </a>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role={role ?? 'student'}>
      <div className="max-w-4xl mx-auto mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Book Visual */}
          <div className="md:w-1/3 flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 p-6">
            {book?.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={book.title}
                className="rounded-lg shadow-lg w-40 h-60 object-cover border-4 border-white mb-4"
              />
            ) : (
              <div className="w-40 h-60 flex items-center justify-center bg-gray-200 rounded-lg mb-4 text-6xl">📚</div>
            )}
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">{book?.title}</h2>
            <p className="text-lg text-gray-600 text-center">by {book?.author}</p>
          </div>
          {/* Book Content */}
          <div className="md:w-2/3 p-8 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-800">Read Online</h1>
              <div className="flex gap-2">
                {/* Use anchor with download attribute for best PDF reader experience */}
                {pdfUrl && (
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    download
                    title="Open in your default PDF reader"
                  >
                    Open in PDF Reader
                  </a>
                )}
                {!isAdminOrStaff && hasThisBookBorrowed && (
                  <button
                    onClick={handleReturn}
                    disabled={actionLoading}
                    className="btn-secondary"
                  >
                    {actionLoading ? 'Returning…' : 'Return Book'}
                  </button>
                )}
                <a href={`/books/${bookId}`} className="btn-secondary">
                  Back
                </a>
              </div>
            </div>
            {actionError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
                {actionError}
              </div>
            )}
            {!isAdminOrStaff && hasThisBookBorrowed && (
              <div className="text-sm text-gray-600 mb-3">
                Due: <span className="font-medium">{formatDate((activeBorrow as any)?.dueAt)}</span>
              </div>
            )}
            <div
              className="card p-0 overflow-hidden mb-4 flex justify-center items-center bg-gray-50"
              style={{ minHeight: '70vh', minWidth: 0 }}
              onContextMenu={(e) => {
                e.preventDefault()
              }}
            >
              <div className="flex justify-center items-center w-full h-full" style={{ minHeight: '70vh', minWidth: 0 }}>
                <iframe
                  src={iframeSrc}
                  title="Book PDF"
                  className="w-full max-w-3xl h-[70vh] mx-auto rounded shadow-lg border"
                  referrerPolicy="no-referrer"
                  style={{ background: 'white', display: 'block', margin: '0 auto' }}
                />
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Online reading is provided without a download button. Note: fully preventing downloads is not possible in a web browser if a user can access the PDF URL.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

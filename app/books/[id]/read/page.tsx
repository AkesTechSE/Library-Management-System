'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/lib/hooks/useAuth'
import { useBooks } from '@/lib/hooks/useBooks'
import { getActiveBorrowForUser } from '@/lib/firebase/firestore'
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
        const book = await fetchBookById(bookId)
        const url = (book as any)?.pdfUrl as string | undefined

        if (!url) {
          setPdfUrl(null)
          setError('This book does not have a PDF available for online reading.')
          return
        }

        if (!isAdminOrStaff) {
          const active = await getActiveBorrowForUser(user.uid)
          if (!active || active.bookId !== bookId) {
            setPdfUrl(null)
            setError('You must borrow this book before you can read it online.')
            return
          }
        }

        setPdfUrl(url)
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

  if (error || !iframeSrc) {
    return (
      <DashboardLayout role={role ?? 'student'}>
        <div className="max-w-3xl mx-auto card">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Read Online</h1>
          <p className="text-gray-600 mb-6">{error || 'Reader unavailable.'}</p>
          <div className="flex gap-3">
            <a href={`/books/${bookId}`} className="btn-primary">
              Back to Book
            </a>
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Read Online</h1>
          <a href={`/books/${bookId}`} className="btn-secondary">
            Back
          </a>
        </div>

        <div
          className="card p-0 overflow-hidden"
          onContextMenu={(e) => {
            e.preventDefault()
          }}
        >
          <iframe
            src={iframeSrc}
            title="Book PDF"
            className="w-full h-[80vh]"
            referrerPolicy="no-referrer"
          />
        </div>

        <p className="text-sm text-gray-600">
          Online reading is provided without a download button. Note: fully preventing downloads is not possible in a web browser if a user can access the PDF URL.
        </p>
      </div>
    </DashboardLayout>
  )
}

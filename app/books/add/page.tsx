'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import AddBookForm from '@/components/books/AddBookForm'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useEffect } from 'react'

export default function AddBookPage() {
  const router = useRouter()
  const { user, role, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push('/')
      return
    }

    if (role !== 'admin' && role !== 'staff') {
      router.push('/dashboard/student')
    }
  }, [loading, role, router, user])

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!user || (role !== 'admin' && role !== 'staff')) return null

  const handleSuccess = () => {
    router.push('/books')
  }

  return (
    <DashboardLayout role={role}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Add New Book</h1>
          <p className="text-gray-600">Add a new book to the library collection</p>
        </div>
        
        <div className="card">
          <AddBookForm onSuccess={handleSuccess} />
        </div>
      </div>
    </DashboardLayout>
  )
}
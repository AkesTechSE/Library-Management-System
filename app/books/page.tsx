'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import BookCard from '@/components/books/BookCard'
import BookTable from '@/components/books/BookTable'
import { useBooks } from '@/lib/hooks/useBooks'
import { useAuth } from '@/lib/hooks/useAuth'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function BooksPage() {
  const { books, loading } = useBooks();
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const isAdminOrStaff = role === 'admin' || role === 'staff';

  useEffect(() => {
    if (authLoading) return;
    if (!user) router.push('/');
  }, [authLoading, router, user]);

  const handleEdit = (book: any) => {
    router.push(`/books/${book.id}`);
  };

  const handleDelete = async (bookId: string) => {
    setDeleteError(null);
    setDeleteSuccess(null);
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      const { deleteBook } = await import('@/lib/firebase/firestore');
      await deleteBook(bookId);
      setDeleteSuccess('Book deleted successfully.');
      router.refresh();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete book.');
    }
  };

  if (authLoading) {
    return (
      <DashboardLayout role={role ?? undefined}>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) return null;

  return (
    <DashboardLayout role={role}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Library Books</h1>
            <p className="text-gray-600">Browse and manage books in the library</p>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search by title, author, or ISBN..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border rounded px-3 py-2 w-full md:w-64"
            />
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

        {deleteError && <div className="text-red-600 mb-2">{deleteError}</div>}
        {deleteSuccess && <div className="text-green-600 mb-2">{deleteSuccess}</div>}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading books...</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books
              .filter(book => {
                const q = search.toLowerCase();
                return (
                  book.title?.toLowerCase().includes(q) ||
                  book.author?.toLowerCase().includes(q) ||
                  book.isbn?.toLowerCase().includes(q)
                );
              })
              .map(book => (
                <BookCard key={book.id} book={book} />
              ))}
          </div>
        ) : (
          <div className="card">
            <BookTable
              books={books.filter(book => {
                const q = search.toLowerCase();
                return (
                  book.title?.toLowerCase().includes(q) ||
                  book.author?.toLowerCase().includes(q) ||
                  book.isbn?.toLowerCase().includes(q)
                );
              })}
              {...(isAdminOrStaff ? { onEdit: handleEdit, onDelete: handleDelete } : {})}
            />
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
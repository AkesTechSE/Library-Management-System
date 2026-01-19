"use client";

import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useBooks } from '@/lib/hooks/useBooks';
import { useAuth } from '@/lib/hooks/useAuth';
import { useEffect, useState } from 'react';

export default function EditBookPage() {
  const params = useParams<{ id: string }>();
  const bookId = params.id;
  const { fetchBookById } = useBooks();
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const isAdminOrStaff = role === 'admin' || role === 'staff';

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdminOrStaff) {
      router.replace('/');
      return;
    }
    const loadBook = async () => {
      try {
        const bookData = await fetchBookById(bookId);
        setForm(bookData);
      } catch {
        setError('Failed to load book.');
      } finally {
        setLoading(false);
      }
    };
    loadBook();
  }, [authLoading, user, isAdminOrStaff, bookId, fetchBookById, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const { updateBook } = await import('@/lib/firebase/firestore');
      await updateBook(bookId, form);
      setSuccess('Book updated successfully!');
      setTimeout(() => router.push(`/books/${bookId}`), 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to update book.');
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout role="student">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!form) return null;

  return (
    <DashboardLayout role={role ?? 'student'}>
      <div className="max-w-xl mx-auto mt-10 bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Edit Book</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Title</label>
            <input
              type="text"
              name="title"
              value={form.title || ''}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Author</label>
            <input
              type="text"
              name="author"
              value={form.author || ''}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">ISBN</label>
            <input
              type="text"
              name="isbn"
              value={form.isbn || ''}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Category</label>
            <input
              type="text"
              name="category"
              value={form.category || ''}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              name="description"
              value={form.description || ''}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              rows={3}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Cover Image URL</label>
            <input
              type="text"
              name="coverUrl"
              value={form.coverUrl || ''}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">PDF URL (for online reading)</label>
            <input
              type="text"
              name="pdfUrl"
              value={form.pdfUrl || ''}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="https://.../book.pdf"
            />
          </div>
          {error && <div className="text-red-600">{error}</div>}
          {success && <div className="text-green-600">{success}</div>}
          <button
            type="submit"
            className="btn-primary w-full"
          >
            Update Book
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}

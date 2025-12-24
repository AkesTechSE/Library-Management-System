'use client'

import { useState } from 'react'
import { useBooks } from '@/lib/hooks/useBooks'

interface AddBookFormProps {
  onSuccess?: () => void
}

export default function AddBookForm({ onSuccess }: AddBookFormProps) {
  const { createBook } = useBooks()
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    description: '',
    category: '',
    totalCopies: 1,
    publisher: '',
    publishedDate: '',
    coverUrl: '',
    pdfUrl: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalCopies' ? parseInt(value) || 1 : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    // Validation
    if (!formData.title.trim()) {
      setError('Title is required')
      setLoading(false)
      return
    }

    if (!formData.author.trim()) {
      setError('Author is required')
      setLoading(false)
      return
    }

    try {
      await createBook({
        title: formData.title.trim(),
        author: formData.author.trim(),
        isbn: formData.isbn.trim(),
        description: formData.description.trim(),
        category: formData.category,
        totalCopies: formData.totalCopies,
        publisher: formData.publisher.trim(),
        publishedDate: formData.publishedDate,
        coverUrl: formData.coverUrl.trim() || undefined,
        pdfUrl: formData.pdfUrl.trim() || undefined,
      })

      setSuccess('Book added successfully!')
      setFormData({
        title: '',
        author: '',
        isbn: '',
        description: '',
        category: '',
        totalCopies: 1,
        publisher: '',
        publishedDate: '',
        coverUrl: '',
        pdfUrl: '',
      })
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add book')
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    'Fiction',
    'Non-Fiction',
    'Science',
    'Technology',
    'History',
    'Biography',
    'Self-Help',
    'Education'
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="input-field"
            required
            placeholder="Book Title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Author *
          </label>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleChange}
            className="input-field"
            required
            placeholder="Author Name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ISBN
          </label>
          <input
            type="text"
            name="isbn"
            value={formData.isbn}
            onChange={handleChange}
            className="input-field"
            placeholder="978-3-16-148410-0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="input-field"
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Copies *
          </label>
          <input
            type="number"
            name="totalCopies"
            value={formData.totalCopies}
            onChange={handleChange}
            className="input-field"
            required
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Publisher
          </label>
          <input
            type="text"
            name="publisher"
            value={formData.publisher}
            onChange={handleChange}
            className="input-field"
            placeholder="Publisher Name"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Published Date
        </label>
        <input
          type="date"
          name="publishedDate"
          value={formData.publishedDate}
          onChange={handleChange}
          className="input-field"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cover Image URL
        </label>
        <input
          type="url"
          name="coverUrl"
          value={formData.coverUrl}
          onChange={handleChange}
          className="input-field"
          placeholder="https://..."
        />
        {formData.coverUrl.trim() && (
          <div className="mt-3">
            <div className="text-sm text-gray-600 mb-2">Preview</div>
            <div className="bg-gray-100 rounded-lg aspect-[3/4] max-w-[180px] overflow-hidden">
              <img
                src={formData.coverUrl}
                alt="Cover preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          PDF URL (for online reading)
        </label>
        <input
          type="url"
          name="pdfUrl"
          value={formData.pdfUrl}
          onChange={handleChange}
          className="input-field"
          placeholder="https://.../book.pdf"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="input-field min-h-[100px]"
          placeholder="Book description..."
          rows={4}
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => onSuccess && onSuccess()}
          className="px-6 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Book'}
        </button>
      </div>
    </form>
  )
}
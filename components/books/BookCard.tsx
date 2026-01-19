'use client'

import { memo } from 'react'

const statusColors = {
  available: 'bg-green-100 text-green-800',
  borrowed: 'bg-yellow-100 text-yellow-800',
  reserved: 'bg-blue-100 text-blue-800',
  lost: 'bg-red-100 text-red-800'
} as const

const statusText = {
  available: 'Available',
  borrowed: 'Borrowed',
  reserved: 'Reserved',
  lost: 'Lost'
} as const

interface BookCardProps {
  book: any
  onBorrow?: (bookId: string) => void
  isBorrowed?: boolean
  onReturn?: (bookId: string) => void
  returnLoading?: boolean
}

function BookCard({ book, onBorrow, isBorrowed, onReturn, returnLoading }: BookCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden">
      {book.coverUrl ? (
        <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
          <img
            src={book.coverUrl}
            alt={book.title + ' cover'}
            className="object-cover w-full h-full"
          />
        </div>
      ) : (
        <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
          <span className="text-5xl">📚</span>
        </div>
      )}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 truncate flex items-center gap-2">
              {book.title}
              {isBorrowed && (
                <span title="You have borrowed this book" className="inline-block align-middle text-yellow-500 text-lg ml-1">📚</span>
              )}
            </h3>
            <p className="text-gray-600 text-sm mt-1">by {book.author}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs ${statusColors[book.status as keyof typeof statusColors]}`}>
            {statusText[book.status as keyof typeof statusText]}
          </span>
        </div>
        {book.status === 'borrowed' && !isBorrowed && (
          <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-1 mb-3">
            Borrowed by another student
          </p>
        )}

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <span className="w-20 font-medium">ISBN:</span>
            <span>{book.isbn || 'N/A'}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="w-20 font-medium">Category:</span>
            <span>{book.category || 'General'}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="w-20 font-medium">Copies:</span>
            <span>{book.availableCopies || 0} of {book.totalCopies || 1} available</span>
          </div>
        </div>

        <div className="flex space-x-2">
          <a
            href={`/books/${book.id}`}
            className="flex-1 text-center py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
          >
            View Details
          </a>
          {isBorrowed && onReturn ? (
            <button
              onClick={() => onReturn(book.id)}
              className="flex-1 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
              disabled={returnLoading}
            >
              {returnLoading ? 'Returning...' : 'Return Book'}
            </button>
          ) : book.status === 'available' && onBorrow ? (
            <button
              onClick={() => onBorrow(book.id)}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Read Online
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default memo(BookCard)
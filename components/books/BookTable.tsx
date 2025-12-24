'use client'

interface BookTableProps {
  books: any[]
  onEdit?: (book: any) => void
  onDelete?: (bookId: string) => void
}

export default function BookTable({ books, onEdit, onDelete }: BookTableProps) {
  const statusColors = {
    available: 'bg-green-100 text-green-800',
    borrowed: 'bg-yellow-100 text-yellow-800',
    reserved: 'bg-blue-100 text-blue-800',
    lost: 'bg-red-100 text-red-800'
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-semibold">Title</th>
            <th className="text-left py-3 px-4 font-semibold">Author</th>
            <th className="text-left py-3 px-4 font-semibold">ISBN</th>
            <th className="text-left py-3 px-4 font-semibold">Category</th>
            <th className="text-left py-3 px-4 font-semibold">Status</th>
            <th className="text-left py-3 px-4 font-semibold">Copies</th>
            {onEdit && <th className="text-left py-3 px-4 font-semibold">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {books.map(book => (
            <tr key={book.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4">
                <a href={`/books/${book.id}`} className="text-blue-600 hover:underline">
                  {book.title}
                </a>
              </td>
              <td className="py-3 px-4">{book.author}</td>
              <td className="py-3 px-4">{book.isbn || 'N/A'}</td>
              <td className="py-3 px-4">{book.category || 'General'}</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded-full text-xs ${statusColors[book.status as keyof typeof statusColors]}`}>
                  {book.status}
                </span>
              </td>
              <td className="py-3 px-4">
                {book.availableCopies || 0}/{book.totalCopies || 1}
              </td>
              {onEdit && (
                <td className="py-3 px-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(book)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    {onDelete && (
                      <button
                        onClick={() => onDelete(book.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
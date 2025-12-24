export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePassword = (password: string): string[] => {
  const errors: string[] = []
  if (password.length < 6) errors.push('Password must be at least 6 characters')
  if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter')
  if (!/[0-9]/.test(password)) errors.push('Password must contain at least one number')
  return errors
}

export const validateBook = (book: any): string[] => {
  const errors: string[] = []
  if (!book.title?.trim()) errors.push('Title is required')
  if (!book.author?.trim()) errors.push('Author is required')
  if (book.totalCopies <= 0) errors.push('Total copies must be greater than 0')
  return errors
}

export const validateBorrowRequest = (userBooks: number, bookStatus: string): string[] => {
  const errors: string[] = []
  if (userBooks >= 3) errors.push('You can only borrow 3 books at a time')
  if (bookStatus !== 'available') errors.push('Book is not available for borrowing')
  return errors
}
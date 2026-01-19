export const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  STUDENT: 'student',
} as const

export const BOOK_STATUS = {
  AVAILABLE: 'available',
  BORROWED: 'borrowed',
  RESERVED: 'reserved',
  LOST: 'lost',
} as const

export const BORROW_DURATION_DAYS = 20
export const MAX_BOOKS_PER_USER = 3
export const LATE_RETURN_MAX_STRIKES = 3
export const FINE_PER_DAY = 1

export const CATEGORIES = [
  'Fiction',
  'Non-Fiction',
  'Science',
  'Technology',
  'History',
  'Biography',
  'Self-Help',
  'Education',
  'Arts',
  'Literature'
]
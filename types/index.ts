export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'staff' | 'student';
  photoURL?: string;
  createdAt: Date;
  lastLoginAt: Date;
  borrowedBooks: string[];
  fineAmount: number;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  description: string;
  category: string[];
  status: 'available' | 'borrowed' | 'reserved' | 'lost';
  totalCopies: number;
  availableCopies: number;
  coverUrl?: string;
  pdfUrl?: string;
  publishedDate: Date;
  publisher: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BorrowRecord {
  id: string;
  bookId: string;
  userId: string;
  borrowedAt: Date;
  dueDate: Date;
  returnedAt?: Date;
  status: 'active' | 'returned' | 'overdue';
  fineAmount: number;
}

export interface Stats {
  totalBooks: number;
  totalUsers: number;
  activeBorrows: number;
  overdueBooks: number;
}
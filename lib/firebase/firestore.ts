// Delete user by id
export const deleteUser = async (id: string) => {
  const docRef = doc(getDbOrThrow(), "users", id);
  await deleteDoc(docRef);
};
// Add user to Firestore (admin only, does not create Auth user)
export const addUserToDb = async (data: { displayName: string; email: string; role: UserRole }) => {
  const db = getDbOrThrow();
  // Generate a random ID for the user doc (not linked to Auth)
  const docRef = await addDoc(usersCollection(), {
    displayName: data.displayName,
    email: data.email,
    role: data.role,
    createdAt: Timestamp.now(),
    status: 'active',
  });
  return docRef.id;
};
"use strict";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  runTransaction,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  Firestore
} from "firebase/firestore";
import { getFirebaseConfigErrorMessage, tryGetFirebaseDb } from "./config";
import { BORROW_DURATION_DAYS, LATE_RETURN_MAX_STRIKES, MAX_BOOKS_PER_USER } from "@/lib/utils/constants";

export type UserRole = 'admin' | 'staff' | 'student';

export type UserProfile = {
  id: string;
  email?: string;
  displayName?: string;
  role: UserRole;
  photoURL?: string;
  createdAt?: any;
  lastLoginAt?: any;
  lateStrikes?: number;
  banned?: boolean;
  bannedAt?: any;
  banReason?: string;
};

export type BorrowStatus = 'active' | 'returned';

export type BorrowRecord = {
  id: string;
  userId: string;
  bookId: string;
  status: BorrowStatus;
  borrowedAt: any;
  dueAt: any;
  returnedAt?: any;
  isLate?: boolean;
};

const getDbOrThrow = (): Firestore => {
  const db = tryGetFirebaseDb();
  if (!db) throw new Error(getFirebaseConfigErrorMessage());
  return db;
};

const booksCollection = () => collection(getDbOrThrow(), "books");
const usersCollection = () => collection(getDbOrThrow(), "users");
const borrowCollection = () => collection(getDbOrThrow(), "borrows");
const userDoc = (uid: string) => doc(getDbOrThrow(), 'users', uid);
const bookDoc = (bookId: string) => doc(getDbOrThrow(), 'books', bookId);

// Book functions
export const getBooks = async () => {
  const snapshot = await getDocs(booksCollection());
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getBookById = async (id: string) => {
  const docRef = doc(getDbOrThrow(), "books", id);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

export const addBook = async (data: any) => {
  const docRef = await addDoc(booksCollection(), {
    ...data,
    status: "available",
    availableCopies: data.totalCopies,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
};

export const updateBook = async (id: string, data: any) => {
  const docRef = doc(getDbOrThrow(), "books", id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

export const deleteBook = async (id: string) => {
  const docRef = doc(getDbOrThrow(), "books", id);
  await deleteDoc(docRef);
};

// User functions
export const getUsers = async () => {
  const snapshot = await getDocs(usersCollection());
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getUserById = async (id: string) => {
  const docRef = doc(getDbOrThrow(), "users", id);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const profile = await getUserById(uid);
  if (!profile) return null;
  const role = (profile as any).role as UserRole | undefined;
  return {
    ...(profile as any),
    id: uid,
    role: role ?? 'student',
  };
};

export const upsertUserProfile = async (
  uid: string,
  data: Partial<Omit<UserProfile, 'id'>> & { role?: UserRole },
): Promise<void> => {
  const docRef = doc(getDbOrThrow(), 'users', uid);
  const updateData: any = {
    ...data,
    updatedAt: Timestamp.now(),
  };
  if (typeof data.role !== 'undefined') {
    updateData.role = data.role;
  }
  await setDoc(docRef, updateData, { merge: true });
};

export const updateUser = async (id: string, data: any) => {
  const docRef = doc(getDbOrThrow(), "users", id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

// Borrow functions
export const getActiveBorrowForUser = async (uid: string): Promise<BorrowRecord | null> => {
  const q = query(
    borrowCollection(),
    where('userId', '==', uid),
  );
  const snapshot = await getDocs(q);
  const records = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as BorrowRecord[];
  const active = records.filter((r) => r.status === 'active');
  if (!active.length) return null;
  active.sort((a, b) => {
    const aTime = (a.borrowedAt as any)?.toMillis ? (a.borrowedAt as any).toMillis() : new Date(a.borrowedAt as any).getTime();
    const bTime = (b.borrowedAt as any)?.toMillis ? (b.borrowedAt as any).toMillis() : new Date(b.borrowedAt as any).getTime();
    return bTime - aTime;
  });
  return active[0] ?? null;
};

export const getBorrowStatsSince = async (since: Date) => {
  const q = query(borrowCollection(), where('borrowedAt', '>=', Timestamp.fromDate(since)));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
};

export const borrowBook = async (uid: string, bookId: string): Promise<string> => {
  const db = getDbOrThrow();
  const now = Timestamp.now();
  const dueAt = Timestamp.fromDate(new Date(Date.now() + BORROW_DURATION_DAYS * 24 * 60 * 60 * 1000));

  const activeQuery = query(
    borrowCollection(),
    where('userId', '==', uid),
    where('status', '==', 'active'),
    limit(MAX_BOOKS_PER_USER),
  );
  const activeSnap = await getDocs(activeQuery);
  if (activeSnap.size >= MAX_BOOKS_PER_USER) {
    throw new Error('You can only borrow one book at a time.');
  }

  const borrowId = await runTransaction(db, async (tx) => {
    const userRef = userDoc(uid);
    const bookRef = bookDoc(bookId);
    const userSnap = await tx.get(userRef);
    const userData = (userSnap.exists() ? userSnap.data() : {}) as any;
    if (userData?.banned) {
      throw new Error('You are banned from borrowing books.');
    }
    const bookSnap = await tx.get(bookRef);
    if (!bookSnap.exists()) {
      throw new Error('Book not found.');
    }
    const bookData = bookSnap.data() as any;
    const available = Number(bookData.availableCopies ?? 0);
    if (available <= 0 || bookData.status !== 'available') {
      throw new Error('This book is not currently available.');
    }
    tx.update(bookRef, {
      availableCopies: available - 1,
      status: available - 1 > 0 ? 'available' : 'borrowed',
      updatedAt: now,
    });
    const borrowRef = doc(borrowCollection());
    tx.set(borrowRef, {
      userId: uid,
      bookId,
      status: 'active',
      borrowedAt: now,
      dueAt,
      createdAt: now,
      updatedAt: now,
    });
    return borrowRef.id;
  });
  return borrowId;
};

export const returnBook = async (uid: string, bookId: string): Promise<void> => {
  const db = getDbOrThrow();
  const now = Timestamp.now();
  const q = query(
    borrowCollection(),
    where('userId', '==', uid),
    where('bookId', '==', bookId),
    where('status', '==', 'active'),
    limit(1),
  );
  const borrowSnap = await getDocs(q);
  const borrowDocSnap = borrowSnap.docs[0];
  if (!borrowDocSnap) {
    throw new Error('No active borrow found for this book.');
  }
  const borrowRef = doc(db, 'borrows', borrowDocSnap.id);
  const borrowData = borrowDocSnap.data() as any;
  await runTransaction(db, async (tx) => {
    const bookRef = bookDoc(bookId);
    const bookSnap = await tx.get(bookRef);
    if (!bookSnap.exists()) {
      throw new Error('Book not found.');
    }
    const bookData = bookSnap.data() as any;
    const userRef = userDoc(uid);
    const userSnap = await tx.get(userRef);
    const userData = (userSnap.exists() ? userSnap.data() : {}) as any;
    const dueAt = borrowData?.dueAt;
    const dueMillis = dueAt?.toMillis ? dueAt.toMillis() : 0;
    const isLate = dueMillis > 0 ? now.toMillis() > dueMillis : false;
    tx.update(borrowRef, {
      status: 'returned',
      returnedAt: now,
      isLate,
      updatedAt: now,
    });
    const currentAvailable = Number(bookData.availableCopies ?? 0);
    const totalCopies = Number(bookData.totalCopies ?? currentAvailable + 1);
    const nextAvailable = Math.min(currentAvailable + 1, totalCopies);
    tx.update(bookRef, {
      availableCopies: nextAvailable,
      status: 'available',
      updatedAt: now,
    });
    if (isLate) {
      const currentStrikes = Number(userData.lateStrikes ?? 0);
      const nextStrikes = currentStrikes + 1;
      const updates: any = {
        lateStrikes: nextStrikes,
        updatedAt: now,
      };
      if (nextStrikes >= LATE_RETURN_MAX_STRIKES) {
        updates.banned = true;
        updates.bannedAt = now;
        updates.banReason = `Late returns (${nextStrikes}/${LATE_RETURN_MAX_STRIKES})`;
      }
      tx.set(userRef, updates, { merge: true });
    }
  });
};

export const getBorrowRecords = async () => {
  const snapshot = await getDocs(borrowCollection());
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
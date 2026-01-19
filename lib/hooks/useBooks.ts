'use client'

import { useState, useEffect, useCallback } from 'react'
import { getBooks, getBookById, addBook, updateBook, deleteBook } from '@/lib/firebase/firestore'

let booksCache: any[] | null = null
let booksCacheAt = 0
let booksInFlight: Promise<any[]> | null = null
const BOOKS_CACHE_TTL_MS = 30_000

export const useBooks = () => {
  const [books, setBooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBooks = useCallback(async (options?: { force?: boolean }) => {
    const force = options?.force ?? false

    try {
      const now = Date.now()
      const cacheFresh = !force && booksCache && now - booksCacheAt < BOOKS_CACHE_TTL_MS

      if (cacheFresh) {
        setBooks(booksCache ?? [])
        setLoading(false)
        return
      }

      if (!booksInFlight) {
        booksInFlight = getBooks()
      }

      const hasLocalBooks = (booksCache && booksCache.length > 0) || books.length > 0
      if (!booksCache && !hasLocalBooks) {
        setLoading(true)
      }

      const booksData = await booksInFlight
      booksCache = booksData
      booksCacheAt = Date.now()
      setBooks(booksData)
    } catch (err: any) {
      setError(err.message)
    } finally {
      booksInFlight = null
      setLoading(false)
    }
  }, [books])

  const fetchBookById = useCallback(async (id: string) => {
    try {
      return await getBookById(id)
    } catch (err: any) {
      setError(err.message)
      return null
    }
  }, [])

  const createBook = useCallback(async (bookData: any) => {
    try {
      const id = await addBook(bookData)
      booksCache = null
      booksCacheAt = 0
      await fetchBooks({ force: true })
      return id
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [fetchBooks])

  const editBook = useCallback(async (id: string, bookData: any) => {
    try {
      await updateBook(id, bookData)
      booksCache = null
      booksCacheAt = 0
      await fetchBooks({ force: true })
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [fetchBooks])

  const removeBook = useCallback(async (id: string) => {
    try {
      await deleteBook(id)
      booksCache = null
      booksCacheAt = 0
      await fetchBooks({ force: true })
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [fetchBooks])

  useEffect(() => {
    fetchBooks()
  }, [])

  return {
    books,
    loading,
    error,
    fetchBooks,
    fetchBookById,
    createBook,
    editBook,
    removeBook,
  }
}
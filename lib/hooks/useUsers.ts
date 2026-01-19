'use client'

import { useState, useEffect, useCallback } from 'react'
import { getUsers, getUserById, updateUser } from '@/lib/firebase/firestore'

let usersCache: any[] | null = null
let usersCacheAt = 0
let usersInFlight: Promise<any[]> | null = null
const USERS_CACHE_TTL_MS = 30_000

export const useUsers = () => {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async (options?: { force?: boolean }) => {
    const force = options?.force ?? false

    try {
      const now = Date.now()
      const cacheFresh = !force && usersCache && now - usersCacheAt < USERS_CACHE_TTL_MS

      if (cacheFresh) {
        setUsers(usersCache)
        setLoading(false)
        return
      }

      if (!usersInFlight) {
        usersInFlight = getUsers()
      }

      if (!usersCache) {
        setLoading(true)
      }

      const usersData = await usersInFlight
      usersCache = usersData
      usersCacheAt = Date.now()
      setUsers(usersData)
    } catch (err: any) {
      setError(err.message)
    } finally {
      usersInFlight = null
      setLoading(false)
    }
  }, [])

  const fetchUserById = useCallback(async (id: string) => {
    try {
      return await getUserById(id)
    } catch (err: any) {
      setError(err.message)
      return null
    }
  }, [])

  const editUser = useCallback(async (id: string, userData: any) => {
    try {
      await updateUser(id, userData)
      usersCache = null
      usersCacheAt = 0
      await fetchUsers({ force: true })
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [fetchUsers])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return {
    users,
    loading,
    error,
    fetchUsers,
    fetchUserById,
    editUser,
  }
}
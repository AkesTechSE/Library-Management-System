'use client'

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { tryGetFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase/config'
import {
  getUserProfile,
  upsertUserProfile,
  type UserProfile,
  type UserRole,
} from '@/lib/firebase/firestore'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  role: UserRole | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  role: null,
  loading: true,
})

export function useAuthContext() {
  return useContext(AuthContext)
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setUser(null)
      setProfile(null)
      setLoading(false)
      return
    }

    const auth = tryGetFirebaseAuth()
    if (!auth) {
      setUser(null)
      setProfile(null)
      setLoading(false)
      return
    }
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser)

      if (!nextUser) {
        setProfile(null)
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const existing = await getUserProfile(nextUser.uid)

        if (!existing) {
          const createdAt = new Date().toISOString()
          const nextProfile: UserProfile = {
            id: nextUser.uid,
            email: nextUser.email ?? undefined,
            displayName: nextUser.displayName ?? undefined,
            photoURL: (nextUser as any).photoURL ?? undefined,
            role: 'student',
            createdAt,
            lastLoginAt: createdAt,
          }

          // Optimistic local profile to keep UX snappy.
          setProfile(nextProfile)

          // Best-effort persistence; don't block rendering/navigation.
          try {
            await upsertUserProfile(nextUser.uid, nextProfile)
          } catch {
            // Ignore (offline / permissions) and keep optimistic profile.
          }
        } else {
          setProfile(existing)

          // Best-effort last-login update.
          void upsertUserProfile(nextUser.uid, {
            lastLoginAt: new Date().toISOString(),
          })
        }
      } catch (err: any) {
        const message = String(err?.message ?? '')
        if (message.toLowerCase().includes('client is offline')) {
          setProfile({ id: nextUser.uid, role: 'student' } as UserProfile)
        } else {
          setProfile(null)
        }
      } finally {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [])

  const value = useMemo<AuthContextType>(
    () => ({ user, profile, role: profile?.role ?? null, loading }),
    [user, profile, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
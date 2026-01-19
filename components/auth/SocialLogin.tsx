'use client'

import { useState } from 'react'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { getFirebaseConfigErrorMessage, tryGetFirebaseAuth, tryGetFirebaseDb } from '@/lib/firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import Cookies from 'js-cookie'
import type { UserRole } from '@/lib/firebase/firestore'
import { useRouter } from 'next/navigation'

export default function SocialLogin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const persistRole = (uid: string, role: UserRole) => {
    sessionStorage.setItem(`userRole:${uid}`, role)
    Cookies.set('userRole', role, { sameSite: 'lax' })
  }

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)

    try {
      const auth = tryGetFirebaseAuth()
      if (!auth) {
        setError(getFirebaseConfigErrorMessage())
        return
      }

      const provider = new GoogleAuthProvider()
      const credential = await signInWithPopup(auth, provider)
      const user = credential.user

      const db = tryGetFirebaseDb()
      if (db && user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        const userData = userDoc.data()
        const role = (userData?.role as UserRole) ?? 'student'
        persistRole(user.uid, role)
        if (role === 'admin') {
          router.push('/dashboard/admin')
        } else if (role === 'staff') {
          router.push('/dashboard/staff')
        } else {
          router.push('/dashboard/student')
        }
      } else {
        if (user) {
          persistRole(user.uid, 'student')
        }
        router.push('/dashboard/student')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login with Google')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 transition"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {loading ? 'Signing in...' : 'Continue with Google'}
      </button>

      {error && (
        <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
    </>
  )
}
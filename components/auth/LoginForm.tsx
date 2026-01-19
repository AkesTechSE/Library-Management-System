'use client'

import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { getFirebaseConfigErrorMessage, tryGetFirebaseAuth, tryGetFirebaseDb } from '@/lib/firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import Cookies from 'js-cookie'
import type { UserRole } from '@/lib/firebase/firestore'
import SocialLogin from './SocialLogin'
import { useRouter } from 'next/navigation'
import { getUserProfile } from '@/lib/firebase/firestore'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const persistRole = (uid: string, role: UserRole) => {
    sessionStorage.setItem(`userRole:${uid}`, role)
    Cookies.set('userRole', role, { sameSite: 'lax' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const auth = tryGetFirebaseAuth()
      if (!auth) {
        setError(getFirebaseConfigErrorMessage())
        setLoading(false)
        return
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password)
<<<<<<< HEAD
      const user = userCredential.user

      // Fetch user role from Firestore, persist it, and redirect accordingly
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
=======
      
      // Get user profile to determine role
      const profile = await getUserProfile(userCredential.user.uid)
      const role = profile?.role || 'student'
      
      // Navigate based on role
      if (role === 'admin') {
        router.push('/dashboard/admin')
      } else if (role === 'staff') {
        router.push('/dashboard/staff')
      } else {
>>>>>>> ad8761762d6b071a9fda3037f23dba115bc51026
        router.push('/dashboard/student')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            required
            placeholder="admin@library.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            required
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-3"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-4">
          <SocialLogin />
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Need an account?{' '}
          <a href="/register" className="text-blue-600 hover:underline font-medium">
            Sign up
          </a>
        </p>
      </div>
    </div>
  )
}
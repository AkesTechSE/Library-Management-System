'use client'

import { User } from 'firebase/auth'
import { signOut } from 'firebase/auth'
import { isFirebaseConfigured, tryGetFirebaseAuth } from '@/lib/firebase/config'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  user: User
}

export default function Header({ user }: HeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      if (!isFirebaseConfigured()) {
        router.push('/')
        return
      }

      const auth = tryGetFirebaseAuth()
      if (!auth) {
        router.push('/')
        return
      }

      await signOut(auth)
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-800">Library Management</h1>
          <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Welcome, {user.displayName || user.email}</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold">
                {user.displayName?.[0] || user.email?.[0] || 'U'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{user.displayName || 'User'}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
'use client'

import { useEffect, useState, ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { logout } from '@/lib/firebase/auth'
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  BookOpenIcon,
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'

interface DashboardLayoutProps {
  children: ReactNode
  role: 'admin' | 'staff' | 'student'
}

const navigation = {
  admin: [
    { name: 'Dashboard', href: '/dashboard/admin', icon: HomeIcon },
    { name: 'Books', href: '/books', icon: BookOpenIcon },
    { name: 'Users', href: '/users', icon: UserGroupIcon },
    { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
    { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
  ],
  staff: [
    { name: 'Dashboard', href: '/dashboard/staff', icon: HomeIcon },
    { name: 'Books', href: '/books', icon: BookOpenIcon },
    { name: 'Users', href: '/users', icon: UserGroupIcon },
    { name: 'Borrow Records', href: '#', icon: ChartBarIcon },
  ],
  student: [
    { name: 'Dashboard', href: '/dashboard/student', icon: HomeIcon },
    { name: 'Browse Books', href: '/books', icon: BookOpenIcon },
    { name: 'My Books', href: '/books/my-books', icon: BookOpenIcon },
  ],
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [photoError, setPhotoError] = useState(false)
  const { user } = useAuth()
  const router = useRouter()



  const dashboardHref = role === 'admin' ? '/dashboard/admin' : role === 'staff' ? '/dashboard/staff' : '/dashboard/student'

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  useEffect(() => {
    setPhotoError(false)
  }, [user?.photoURL])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-56 flex-col bg-white">
          <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
            <div className="flex items-center">
              <BookOpenIcon className="h-8 w-8 text-blue-600" />
             
            </div>
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-4 py-4">
            {role && navigation[role] ? (
              navigation[role].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 cursor-pointer" />
                  {item.name}
                </Link>
              ))
            ) : null}
          </nav>
          {/* Profile option removed from sidebar footer as requested */}
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-56 lg:flex-col">
        <div className="flex flex-1 flex-col border-r border-gray-200 bg-white">
          <div className="flex h-16 flex-shrink-0 items-center border-b border-gray-200 px-4">
            <div className="flex items-center">
              <BookOpenIcon className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">LibraFlow</span>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-4 py-4">
            {role && navigation[role] ? (
              navigation[role].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400" />
                  {item.name}
                </Link>
              ))
            ) : null}
          </nav>
          {/* Profile/user info block removed from static sidebar as requested */}
        </div>
      </div>

      {/* Mobile top header */}
      <div className="lg:pl-56">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-white/10 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 bg-white">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-white/90 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            {/* Brand removed from header as requested */}
            <div className="flex flex-1 items-center"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="hidden lg:block">
                <div className="flex items-center gap-x-2">
                  <div className="flex-shrink-0">
                    {user?.photoURL && !photoError ? (
                      <img
                        className="h-8 w-8 rounded-full"
                        src={user.photoURL}
                        alt={user.displayName ?? user.email ?? 'User'}
                        onError={() => setPhotoError(true)}
                      />
                    ) : (
                      <UserCircleIcon className="h-8 w-8 text-black/70" />
                    )}
                  </div>
                  {/* Always show name/email next to photo */}
                  <div>
                    <p className="text-sm font-medium text-black">{user?.displayName || user?.email || 'User'}</p>
                    <p className="text-xs text-black/70 capitalize">{role}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-black/80 hover:text-black cursor-pointer"
                title="Logout"
              >
                <ArrowRightOnRectangleIcon className="h-8 w-8 cursor-pointer" />
              </button>
            </div>
          </div>
        </div>

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
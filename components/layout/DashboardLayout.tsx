'use client'

import { useState, ReactNode } from 'react'
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
    { name: 'Analytics', href: '#', icon: ChartBarIcon },
    { name: 'Settings', href: '#', icon: Cog6ToothIcon },
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
    { name: 'My Books', href: '#', icon: BookOpenIcon },
  ],
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-56 flex-col bg-white">
          <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
            <div className="flex items-center">
              <BookOpenIcon className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">LibraFlow</span>
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
            {navigation[role].map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="group flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400" />
                {item.name}
              </a>
            ))}
          </nav>
          {role !== 'student' && (
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {user?.photoURL ? (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={user.photoURL}
                      alt={user.displayName ?? user.email ?? 'User'}
                    />
                  ) : (
                    <UserCircleIcon className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{user?.displayName || user?.email || 'User'}</p>
                  <p className="text-xs text-gray-500 capitalize">{role}</p>
                </div>
              </div>
            </div>
          )}
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
            {navigation[role].map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="group flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400" />
                {item.name}
              </a>
            ))}
          </nav>
          {role !== 'student' && (
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {user?.photoURL ? (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={user.photoURL}
                      alt={user.displayName ?? user.email ?? 'User'}
                    />
                  ) : (
                    <UserCircleIcon className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{user?.displayName || user?.email || 'User'}</p>
                  <p className="text-xs text-gray-500 capitalize">{role}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile top header */}
      <div className="lg:pl-56">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-white/10 bg-gradient-to-r from-blue-700 to-blue-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-white/90 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <a href={dashboardHref} className="flex items-center gap-x-2">
                <BookOpenIcon className="h-6 w-6 text-white" />
                <span className="text-base font-semibold text-white">LibraFlow</span>
              </a>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="hidden lg:block">
                <div className="flex items-center gap-x-2">
                  <div className="flex-shrink-0">
                    {user?.photoURL ? (
                      <img
                        className="h-8 w-8 rounded-full"
                        src={user.photoURL}
                        alt={user.displayName ?? user.email ?? 'User'}
                      />
                    ) : (
                      <UserCircleIcon className="h-8 w-8 text-white/70" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{user?.displayName || user?.email || 'User'}</p>
                    <p className="text-xs text-white/70 capitalize">{role}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-white/80 hover:text-white"
                title="Logout"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
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
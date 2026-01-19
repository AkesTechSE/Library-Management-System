'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  role: 'admin' | 'staff' | 'student'
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  
  const adminNav = [
    { name: 'Dashboard', href: '/dashboard/admin', icon: '📊' },
    { name: 'Books', href: '/books', icon: '📚' },
    { name: 'Users', href: '/users', icon: '👥' },
    { name: 'Reports', href: '/reports', icon: '📈' },
    { name: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
  ]
  
  const staffNav = [
    { name: 'Dashboard', href: '/dashboard/staff', icon: '📊' },
    { name: 'Books', href: '/books', icon: '📚' },
    { name: 'Manage Borrows', href: '/borrows', icon: '🔄' },
    { name: 'Shelving', href: '/shelving', icon: '📦' },
  ]
  
  const studentNav = [
    { name: 'Dashboard', href: '/dashboard/student', icon: '📊' },
    { name: 'Browse Books', href: '/books', icon: '📚' },
    { name: 'My Books', href: '/books/my-books', icon: '📖' },
    { name: 'History', href: '/history', icon: '📜' },
  ]
  
  const navigation = role === 'admin' ? adminNav : role === 'staff' ? staffNav : studentNav

  return (
    <aside className="w-64 bg-gradient-to-b from-blue-700 to-blue-500 min-h-[calc(100vh-4rem)] hidden md:block shadow-lg">
      <nav className="p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${isActive ? 'bg-white text-blue-700 font-bold shadow' : 'text-white hover:bg-blue-600 hover:text-yellow-300'}`}
                >
                  <span className="mr-3 text-xl">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
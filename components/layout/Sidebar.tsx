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
    { name: 'My Books', href: '/my-books', icon: '📖' },
    { name: 'History', href: '/history', icon: '📜' },
  ]
  
  const navigation = role === 'admin' ? adminNav : role === 'staff' ? staffNav : studentNav

  return (
    <aside className="w-64 bg-white border-r min-h-[calc(100vh-4rem)] hidden md:block">
      <nav className="p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg transition ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <span className="mr-3">{item.icon}</span>
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
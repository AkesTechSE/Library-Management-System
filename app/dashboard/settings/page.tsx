"use client"
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/lib/hooks/useAuth'
import ChangePasswordForm from '@/components/auth/ChangePasswordForm'

export default function SettingsPage() {
  const { role } = useAuth()
  return (
    <DashboardLayout role={role ?? 'student'}>
      <div className="max-w-2xl mx-auto py-12">
        <h1 className="text-3xl font-bold mb-4">Change Password</h1>
        <p className="text-gray-600 mb-8">Update your account password below.</p>
        <div className="bg-white rounded-lg shadow p-6">
          <ChangePasswordForm />
        </div>
      </div>
    </DashboardLayout>
  )
}

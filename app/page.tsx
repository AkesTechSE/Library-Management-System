import LoginForm from '@/components/auth/LoginForm'
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

import Footer from '@/components/layout/Footer'



export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <header className="sticky top-0 z-10 border-b bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <span>Library Management System</span>
          </a>
          <nav className="flex items-center gap-3">
            <a
              href="/register"
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Create account
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div className="order-2 text-center lg:order-1 lg:text-left">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Manage your library with confidence
              </h1>
              <p className="mt-5 text-lg text-gray-600 sm:text-xl">
                Books, users, and borrowings in one place — with role-based access for admins, staff, and students, so your team works with confidence.
              </p>

              <div className="mt-8 grid max-w-xl gap-3 text-left mx-auto lg:mx-0">
                <div className="rounded-xl bg-white/70 border p-4">
                  <p className="font-semibold text-gray-900">Fast catalog management</p>
                  <p className="text-sm text-gray-600 mt-1">Add, update, and organize books with clean tables and search.</p>
                </div>
                <div className="rounded-xl bg-white/70 border p-4">
                  <p className="font-semibold text-gray-900">Role-based dashboards</p>
                  <p className="text-sm text-gray-600 mt-1">Each role sees the tools they need — nothing extra.</p>
                </div>
                <div className="rounded-xl bg-white/70 border p-4">
                  <p className="font-semibold text-gray-900">Borrow tracking</p>
                  <p className="text-sm text-gray-600 mt-1">Keep records consistent and easy to audit.</p>
                </div>
              </div>
            </div>

            <div className="order-1 mx-auto w-full max-w-md lg:order-2 lg:mx-0 lg:justify-self-end">
              <div className="relative">
                <div className="pointer-events-none absolute -inset-6 rounded-3xl bg-white/40 blur-xl" />

                <Card padding="lg" className="relative">
                  <CardHeader>
                    <CardTitle>Sign in</CardTitle>
                    <CardDescription>Continue to your role-based dashboard.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LoginForm />
                  </CardContent>
                </Card>

                <p className="mt-4 text-center text-sm text-gray-600">
                  Tip: Use your school/library email. You can create an account from the link above.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
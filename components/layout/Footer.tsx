export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
          <div className="text-gray-600 text-sm">
            © {new Date().getFullYear()} Library Management System
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
            <a href="#" className="hover:text-blue-600">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600">Terms of Service</a>
            <a href="https://github.com/AkesTechSE/library-management-system" target="_blank" rel="noreferrer" className="hover:text-blue-600">GitHub</a>
            <a href="https://personal-portfolio-three-omega-52.vercel.app/" target="_blank" rel="noreferrer" className="hover:text-blue-600">Website</a>
            <a href="mailto:akililuabera44@gmail.com" className="hover:text-blue-600">akililuabera44@gmail.com</a>
            <a href="tel:+251909630346" className="hover:text-blue-600">+251909630346</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
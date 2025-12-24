'use client'

interface StatsCardProps {
  title: string
  value: string | number
  change: string
  icon: string
}

export default function StatsCard({ title, value, change, icon }: StatsCardProps) {
  const isPositive = change.startsWith('+')
  const isNegative = change.startsWith('-')

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl">{icon}</div>
        <div className={`text-sm font-medium ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'}`}>
          {change}
        </div>
      </div>
      <div>
        <div className="text-3xl font-bold text-gray-800 mb-1">{value}</div>
        <div className="text-gray-600">{title}</div>
      </div>
    </div>
  )
}
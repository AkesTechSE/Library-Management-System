'use client'

import { memo, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type BorrowPoint = {
  name: string
  borrows: number
}

function BorrowChart() {
  const data: BorrowPoint[] = useMemo(
    () => [
      { name: 'Mon', borrows: 12 },
      { name: 'Tue', borrows: 18 },
      { name: 'Wed', borrows: 9 },
      { name: 'Thu', borrows: 22 },
      { name: 'Fri', borrows: 16 },
      { name: 'Sat', borrows: 28 },
      { name: 'Sun', borrows: 14 },
    ],
    [],
  )

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="borrows" stroke="#2563eb" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default memo(BorrowChart)
"use client"
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/lib/hooks/useAuth'
import { useEffect, useMemo, useState } from 'react';
import { getBorrowStatsSince } from '@/lib/firebase/firestore';
import { useBooks } from '@/lib/hooks/useBooks';
import { useUsers } from '@/lib/hooks/useUsers';
import BorrowChart from '@/components/charts/BorrowChart';
import UserGrowthChart, { UserGrowthPoint } from '@/components/charts/UserGrowthChart';

export default function AnalyticsPage() {
  const { role } = useAuth();
  const { books } = useBooks();
  const { users } = useUsers();
  const [borrowStats, setBorrowStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch borrowing stats for the last 7 days
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const since = new Date();
      since.setDate(since.getDate() - 6);
      const stats = await getBorrowStatsSince(since);
      setBorrowStats(stats);
      setLoading(false);
    };
    fetchStats();
  }, []);

  // Prepare borrowing trends data (group by day)
  const borrowTrends = useMemo(() => {
    const days: { [key: string]: number } = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      days[key] = 0;
    }
    borrowStats.forEach((b) => {
      const d = b.borrowedAt?.toDate ? b.borrowedAt.toDate() : b.borrowedAt?.seconds ? new Date(b.borrowedAt.seconds * 1000) : new Date(b.borrowedAt);
      const key = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (days[key] !== undefined) days[key]++;
    });
    return Object.entries(days).map(([name, borrows]) => ({ name, borrows }));
  }, [borrowStats]);

  // Prepare user growth data (group by day)
  const userGrowth: UserGrowthPoint[] = useMemo(() => {
    const days: { [key: string]: number } = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      days[key] = 0;
    }
    users.forEach((u) => {
      const d = u.createdAt?.toDate ? u.createdAt.toDate() : u.createdAt?.seconds ? new Date(u.createdAt.seconds * 1000) : new Date(u.createdAt);
      const key = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (days[key] !== undefined) days[key]++;
    });
    // Cumulative sum for growth
    let total = 0;
    return Object.entries(days).map(([name, count]) => {
      total += count;
      return { name, users: total };
    });
  }, [users]);

  // Calculate stats
  const totalBooks = books.length;
  const totalUsers = users.length;
  const booksBorrowedThisMonth = borrowStats.filter((b) => {
    const d = b.borrowedAt?.toDate ? b.borrowedAt.toDate() : b.borrowedAt?.seconds ? new Date(b.borrowedAt.seconds * 1000) : new Date(b.borrowedAt);
    return d.getMonth() === new Date().getMonth();
  }).length;
  const overdueBooks = books.filter((b) => b.status === 'borrowed').length;

  return (
    <DashboardLayout role={role ?? 'student'}>
      <div className="max-w-4xl mx-auto py-12">
        <h1 className="text-3xl font-bold mb-4">Analytics</h1>
        <p className="text-gray-600 mb-8">View system analytics and reports here.</p>
        <div className="bg-white rounded-lg shadow p-6 space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-2">Library Usage Overview</h2>
            <ul className="list-disc pl-6 text-gray-700">
              <li>Total Books: <span className="font-bold">{totalBooks}</span></li>
              <li>Total Users: <span className="font-bold">{totalUsers}</span></li>
              <li>Books Borrowed This Month: <span className="font-bold">{booksBorrowedThisMonth}</span></li>
              <li>Overdue Books: <span className="font-bold">{overdueBooks}</span></li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Borrowing Trends (Last 7 Days)</h2>
            <BorrowChart data={borrowTrends} />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">User Growth (Last 7 Days)</h2>
            <UserGrowthChart data={userGrowth} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

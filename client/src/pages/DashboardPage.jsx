import { useQuery } from '@tanstack/react-query';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

const STATUS_COLOURS = {
  backlog: '#6b7280',
  playing: '#3b82f6',
  completed: '#22c55e',
  dropped: '#ef4444',
  wishlist: '#a855f7',
};

function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await fetch('/api/v1/stats', { credentials: 'include' });
      return res.json();
    },
  });
}

function StatCard({ label, value }) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 text-center">
      <div className="text-3xl font-bold text-indigo-400 mb-1">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useStats();
  const stats = data?.stats;

  if (isLoading) return <p className="text-gray-400">Loading…</p>;
  if (!stats) return null;

  const totalGames = Object.values(stats.statusCounts).reduce((a, b) => a + b, 0);

  const statusData = Object.entries(stats.statusCounts)
    .filter(([, count]) => count > 0)
    .map(([name, value]) => ({ name, value, fill: STATUS_COLOURS[name] }));

  const genreData = stats.genreDistribution.slice(0, 8).map(g => ({
    name: g.genre,
    count: g.count,
  }));

  const topGamesData = stats.topGames.map(g => ({
    name: g.title.length > 18 ? `${g.title.slice(0, 18)}…` : g.title,
    rating: g.rating,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Games" value={totalGames} />
        <StatCard label="Completion Rate" value={`${stats.completionRate}%`} />
        <StatCard label="Hours Played" value={`${stats.totalHours}h`} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="font-semibold mb-4 text-gray-200">Status Breakdown</h2>
          {statusData.length === 0 ? (
            <p className="text-gray-500 text-sm">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                >
                  {statusData.map(entry => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: 'none' }}
                />
                <Legend
                  formatter={value => (
                    <span className="capitalize text-gray-300">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="font-semibold mb-4 text-gray-200">Top Genres</h2>
          {genreData.length === 0 ? (
            <p className="text-gray-500 text-sm">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={genreData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: 'none' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {topGamesData.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-6 col-span-2">
            <h2 className="font-semibold mb-4 text-gray-200">Top Rated Games</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topGamesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  type="number"
                  domain={[0, 10]}
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  width={120}
                />
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: 'none' }}
                />
                <Bar dataKey="rating" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

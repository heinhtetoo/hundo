import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import GameCard from '../components/GameCard.jsx';
import CompletionRing from '../components/ui/CompletionRing.jsx';

const LIBRARY_FILTERS = ['all', 'completed', 'playing', 'backlog'];

function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await apiFetch('/api/v1/stats');
      return res.json();
    },
  });
}

function useBacklog() {
  return useQuery({
    queryKey: ['backlog', { statuses: [], search: '', sort: 'created_at', order: 'desc' }],
    queryFn: async () => {
      const res = await apiFetch('/api/v1/backlog?sort=created_at&order=desc');
      return res.json();
    },
  });
}

function tierLabel(rate) {
  if (rate >= 75) return 'COMPLETIONIST+';
  if (rate >= 40) return 'COMPLETIONIST';
  return 'COLLECTOR';
}

function Tile({ children }) {
  return (
    <div className="px-3 py-1.5 rounded-lg bg-surface-card border border-edge text-sm text-content-muted">
      {children}
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [libFilter, setLibFilter] = useState('all');

  const { data: statsData, isLoading } = useStats();
  const { data: backlogData } = useBacklog();

  if (isLoading) return <p className="px-8 py-6 text-content-muted">Loading…</p>;
  const stats = statsData?.stats;
  if (!stats) return null;

  const counts = stats.statusCounts ?? {};
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const rate = stats.completionRate ?? 0;
  const topGenre = stats.genreDistribution?.[0]?.genre ?? '—';
  const entries = backlogData?.entries ?? [];

  const email = user?.email ?? '';
  const handle = email.split('@')[0] || 'player';
  const displayName =
    handle.charAt(0).toUpperCase() + handle.slice(1);
  const initials = handle.slice(0, 2).toUpperCase();
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
      })
    : null;

  const filteredEntries =
    libFilter === 'all'
      ? entries
      : entries.filter((e) => e.status === libFilter);

  function pillCls(active) {
    return [
      'px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors',
      active
        ? 'bg-brand text-brand-ink'
        : 'bg-surface-card text-content-muted hover:text-content',
    ].join(' ');
  }

  return (
    <div>
      <div className="relative px-4 md:px-8 lg:px-20 py-8 border-b border-edge-subtle overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, oklch(76% 0.19 55 / 0.065) 0%, transparent 100%)',
          }}
        />
        <div className="absolute inset-0 dot-grid pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
          <div
            className="w-[108px] h-[108px] rounded-full p-1 shrink-0 shadow-[0_0_36px_oklch(76%_0.19_55_/_0.2)]"
            style={{
              background: `conic-gradient(oklch(76% 0.19 55) ${rate}%, oklch(19% 0.022 265) 0)`,
            }}
          >
            <div className="w-full h-full rounded-full bg-surface flex items-center justify-center">
              <span className="text-3xl font-bold text-brand">{initials}</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {displayName}
              </h1>
              <span className="text-content-subtle">@{handle}</span>
              <span className="text-[10px] font-semibold tracking-wider text-brand border border-[oklch(76%_0.19_55_/_0.35)] rounded-full px-2.5 py-1">
                {tierLabel(rate)}
              </span>
            </div>
            {memberSince && (
              <p className="text-sm text-content-subtle mb-4">
                Member since {memberSince}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Tile>{total} games</Tile>
              <Tile>{stats.totalHours}h played</Tile>
              <Tile>
                ★ {stats.averageRating != null ? stats.averageRating : '—'} avg
              </Tile>
              <Tile>{topGenre} fan</Tile>
            </div>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <CompletionRing percent={rate} size={104} sublabel="complete" />
            <div className="flex flex-col gap-2 text-sm">
              <div>
                <span className="font-bold text-content">
                  {counts.completed ?? 0}
                </span>{' '}
                <span className="text-content-subtle">Done</span>
              </div>
              <div>
                <span className="font-bold text-content">
                  {counts.playing ?? 0}
                </span>{' '}
                <span className="text-content-subtle">Playing</span>
              </div>
              <div>
                <span className="font-bold text-content">
                  {counts.backlog ?? 0}
                </span>{' '}
                <span className="text-content-subtle">Backlog</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 lg:px-20 py-8">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <h2 className="text-lg font-bold mr-2">Library</h2>
          {LIBRARY_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setLibFilter(f)}
              className={pillCls(libFilter === f)}
            >
              {f === 'all' ? `All (${total})` : `${f} (${counts[f] ?? 0})`}
            </button>
          ))}
        </div>

        {filteredEntries.length === 0 ? (
          <p className="text-content-muted">No games in this view yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredEntries.map((entry) => (
              <GameCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

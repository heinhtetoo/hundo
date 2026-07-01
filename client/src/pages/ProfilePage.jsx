import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import GameCard from '../components/GameCard.jsx';
import ProfileSidebar from '../components/ProfileSidebar.jsx';

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

function Tile({ children, accent }) {
  return (
    <div
      className={[
        'px-3.5 py-1.5 rounded-full text-[13px] font-medium border',
        accent
          ? 'bg-brand/10 border-[oklch(76%_0.19_55_/_0.22)] text-brand'
          : 'bg-surface-input border-edge text-[oklch(72%_0.01_265)]',
      ].join(' ')}
    >
      {children}
    </div>
  );
}

function Count({ value, label, color }) {
  return (
    <div className="text-center">
      <div className={`text-[17px] font-bold leading-none ${color}`}>{value}</div>
      <div className="text-[10px] text-content-subtle mt-0.5">{label}</div>
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
  const genres = (stats.genreDistribution ?? []).slice(0, 4);
  const entries = backlogData?.entries ?? [];
  const playing = entries.filter((e) => e.status === 'playing');

  const email = user?.email ?? '';
  const handle = email.split('@')[0] || 'player';
  const displayName = handle.charAt(0).toUpperCase() + handle.slice(1);
  const initials = handle.slice(0, 2).toUpperCase();
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
      })
    : null;

  const filteredEntries =
    libFilter === 'all' ? entries : entries.filter((e) => e.status === libFilter);

  function libPillCls(active) {
    return [
      'px-3.5 py-1.5 rounded-md text-xs capitalize transition-colors',
      active
        ? 'bg-brand text-brand-ink font-semibold'
        : 'bg-surface-input border border-edge text-content-muted font-medium hover:text-content',
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

        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8 md:gap-[52px]">
          <div
            className="w-[108px] h-[108px] rounded-full p-1 shrink-0 shadow-[0_0_36px_oklch(76%_0.19_55_/_0.2)]"
            style={{
              background: `conic-gradient(oklch(76% 0.19 55) ${rate}%, oklch(19% 0.022 265) 0)`,
            }}
          >
            <div className="w-full h-full rounded-full bg-surface-raised flex items-center justify-center">
              <span className="text-[30px] font-bold text-brand tracking-[-0.04em]">
                {initials}
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1.5">
              <h1 className="text-[34px] font-bold tracking-[-0.03em]">
                {displayName}
              </h1>
              <span className="text-[11px] font-semibold tracking-[0.05em] text-brand bg-brand/10 border border-[oklch(76%_0.19_55_/_0.28)] rounded-full px-2.5 py-1">
                {tierLabel(rate)}
              </span>
            </div>
            {memberSince && (
              <p className="text-sm text-content-muted mb-4">
                Member since {memberSince}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Tile>{total} games</Tile>
              <Tile>{stats.totalHours}h played</Tile>
              <Tile accent>
                ★ {stats.averageRating != null ? stats.averageRating : '—'} avg
              </Tile>
              <Tile>{topGenre} fan</Tile>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 shrink-0">
            <div className="relative w-[122px] h-[122px]">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(oklch(76% 0.19 55) ${rate}%, oklch(14% 0.022 265) 0)`,
                }}
              />
              <div className="absolute inset-[13px] rounded-full bg-surface flex flex-col items-center justify-center">
                <span className="text-[26px] font-bold text-brand leading-none">
                  {Math.round(rate)}%
                </span>
                <span className="text-[9px] font-medium uppercase tracking-[0.1em] text-content-subtle mt-0.5">
                  complete
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3.5">
              <Count value={counts.completed ?? 0} label="Done" color="text-brand" />
              <div className="w-px h-6 bg-edge" />
              <Count value={counts.playing ?? 0} label="Playing" color="text-accent" />
              <div className="w-px h-6 bg-edge" />
              <Count value={counts.backlog ?? 0} label="Backlog" color="text-content-muted" />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 lg:px-20 py-6 flex gap-7">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-4">
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-content-subtle">
              Library
            </span>
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
              {LIBRARY_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setLibFilter(f)}
                  className={libPillCls(libFilter === f)}
                >
                  {f === 'all' ? `All (${total})` : `${f} (${counts[f] ?? 0})`}
                </button>
              ))}
            </div>
          </div>

          {filteredEntries.length === 0 ? (
            <p className="text-content-muted">No games in this view yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {filteredEntries.map((entry) => (
                <GameCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </div>

        <ProfileSidebar genres={genres} playing={playing} />
      </div>
    </div>
  );
}

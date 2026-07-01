import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api.js';
import GameCard from '../components/GameCard.jsx';
import BacklogSidebar, { STATUS_META } from '../components/BacklogSidebar.jsx';

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Date added' },
  { value: 'title', label: 'Title A–Z' },
  { value: 'rating', label: 'Rating' },
  { value: 'hours_played', label: 'Hours' },
];

const SECTION_ORDER = ['playing', 'completed', 'backlog', 'wishlist', 'dropped'];
const SECTION_LABEL = {
  playing: 'Now Playing',
  completed: 'Completed',
  backlog: 'Backlog',
  wishlist: 'Wishlist',
  dropped: 'Dropped',
};
const COUNT_COLOR = {
  completed: 'text-brand',
  playing: 'text-accent',
};

function useBacklog({ activeStatus, search, sort, order }) {
  return useQuery({
    queryKey: ['backlog', { activeStatus, search, sort, order }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeStatus) params.set('status', activeStatus);
      if (search.trim()) params.set('search', search.trim());
      if (sort) params.set('sort', sort);
      params.set('order', order);
      const res = await apiFetch(`/api/v1/backlog?${params}`);
      return res.json();
    },
  });
}

function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await apiFetch('/api/v1/stats');
      return res.json();
    },
  });
}

function Pill({ active, count, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        'shrink-0 rounded-full px-4 py-1.5 text-[13px] transition-colors whitespace-nowrap',
        active
          ? 'bg-brand text-brand-ink font-semibold'
          : 'border border-edge text-content-muted font-medium hover:border-edge-strong hover:text-content',
      ].join(' ')}
    >
      {children}
      {count != null && <span className="lg:hidden"> ({count})</span>}
    </button>
  );
}

function AddGhost() {
  return (
    <Link
      to="/discover"
      className="rounded-[10px] border border-dashed border-edge-strong flex flex-col
                 items-center justify-center gap-2 min-h-[134px] opacity-50
                 hover:opacity-100 hover:border-content-faint transition-all"
    >
      <span className="w-7 h-7 rounded-full border border-dashed border-edge-strong flex items-center justify-center text-lg font-light text-content-muted leading-none">
        +
      </span>
      <span className="text-[11px] font-medium text-content-faint">Add game</span>
    </Link>
  );
}

export default function BacklogPage() {
  const [activeStatus, setActiveStatus] = useState(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('created_at');
  const [order, setOrder] = useState('desc');
  const [view, setView] = useState('grid');

  const { data, isLoading } = useBacklog({ activeStatus, search, sort, order });
  const entries = data?.entries ?? [];

  const { data: statsData } = useStats();
  const stats = statsData?.stats ?? {};
  const counts = stats.statusCounts ?? {};
  const totalGames = Object.values(counts).reduce((a, b) => a + b, 0);
  const genres = (stats.genreDistribution ?? []).slice(0, 4);

  const sections = SECTION_ORDER.map((st) => ({
    st,
    items: entries.filter((e) => e.status === st),
  })).filter((s) => s.items.length > 0);

  const gridCls =
    view === 'list'
      ? 'grid grid-cols-1 gap-2.5'
      : 'grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5';

  const controlCls =
    'bg-surface-card text-content-muted rounded-[7px] border border-edge px-3 py-1.5 text-[13px] outline-none';

  return (
    <div className="flex">
      <BacklogSidebar
        completionRate={stats.completionRate ?? 0}
        totalGames={totalGames}
        totalHours={stats.totalHours ?? 0}
        counts={counts}
        genres={genres}
        activeStatus={activeStatus}
        onSelect={setActiveStatus}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center justify-between gap-4 px-5 md:px-8 py-4 border-b border-edge-subtle">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <Pill active={activeStatus === null} count={totalGames} onClick={() => setActiveStatus(null)}>
              All
            </Pill>
            {STATUS_META.map((s) => (
              <Pill
                key={s.key}
                active={activeStatus === s.key}
                count={counts[s.key] ?? 0}
                onClick={() => setActiveStatus(s.key)}
              >
                {s.label}
              </Pill>
            ))}
          </div>
          <div className="hidden lg:flex items-center gap-2.5">
            <input
              type="text"
              placeholder="Search titles…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${controlCls} w-44 text-content`}
            />
            <select value={sort} onChange={(e) => setSort(e.target.value)} className={`${controlCls} cursor-pointer`}>
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => setOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
              className={`${controlCls} cursor-pointer hover:text-content`}
              title={order === 'asc' ? 'Ascending' : 'Descending'}
            >
              {order === 'asc' ? '↑' : '↓'}
            </button>
            <div className="flex gap-0.5 rounded-[7px] border border-edge bg-surface-card p-1">
              <button
                onClick={() => setView('grid')}
                className={`px-[9px] py-[5px] rounded-[5px] transition-colors ${view === 'grid' ? 'bg-edge' : ''}`}
                title="Grid view"
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" className={view === 'grid' ? 'text-content/70' : 'text-content-subtle'}>
                  <rect x="1" y="1" width="5.5" height="5.5" rx="1.2" />
                  <rect x="9.5" y="1" width="5.5" height="5.5" rx="1.2" />
                  <rect x="1" y="9.5" width="5.5" height="5.5" rx="1.2" />
                  <rect x="9.5" y="9.5" width="5.5" height="5.5" rx="1.2" />
                </svg>
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-[9px] py-[5px] rounded-[5px] transition-colors ${view === 'list' ? 'bg-edge' : ''}`}
                title="List view"
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className={view === 'list' ? 'text-content/70' : 'text-content-subtle'}>
                  <rect x="1" y="2.5" width="14" height="2" rx="1" fill="currentColor" />
                  <rect x="1" y="7" width="14" height="2" rx="1" fill="currentColor" />
                  <rect x="1" y="11.5" width="14" height="2" rx="1" fill="currentColor" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 md:px-8 py-6 flex flex-col gap-6">
          {isLoading ? (
            <p className="text-content-muted">Loading…</p>
          ) : sections.length === 0 ? (
            <p className="text-content-muted">
              No games found. Search for a game in the navbar to add it.
            </p>
          ) : (
            sections.map(({ st, items }) => (
              <section key={st}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-content-faint mb-3">
                  {SECTION_LABEL[st]}
                  {st !== 'playing' && (
                    <span className={COUNT_COLOR[st] ?? 'text-content-muted'}> · {items.length}</span>
                  )}
                </p>
                {st === 'playing' ? (
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                    {items.map((e) => (
                      <GameCard key={e.id} entry={e} variant="featured" />
                    ))}
                  </div>
                ) : (
                  <div className={gridCls}>
                    {items.map((e) => (
                      <GameCard key={e.id} entry={e} />
                    ))}
                    {st === 'backlog' && view === 'grid' && <AddGhost />}
                  </div>
                )}
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api.js';
import GameCard from '../components/GameCard.jsx';
import CompletionRing from '../components/ui/CompletionRing.jsx';
import Input from '../components/ui/Input.jsx';

const STATUSES = ['backlog', 'playing', 'completed', 'dropped', 'wishlist'];
const SORT_OPTIONS = [
  { value: 'created_at', label: 'Date added' },
  { value: 'title', label: 'Title' },
  { value: 'rating', label: 'Rating' },
  { value: 'hours_played', label: 'Hours' },
];

function useBacklog({ statuses, search, sort, order }) {
  return useQuery({
    queryKey: ['backlog', { statuses, search, sort, order }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statuses.length > 0) params.set('status', statuses.join(','));
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

function FilterButton({ active, label, count, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        'flex items-center justify-between px-3 py-2 rounded-lg text-sm',
        'capitalize transition-colors text-left',
        active
          ? 'bg-[oklch(76%_0.19_55_/_0.12)] text-brand font-semibold'
          : 'text-content-muted hover:text-content hover:bg-surface-card',
      ].join(' ')}
    >
      <span>{label}</span>
      <span className="text-xs text-content-subtle">{count}</span>
    </button>
  );
}

export default function BacklogPage() {
  const [statuses, setStatuses] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('created_at');
  const [order, setOrder] = useState('desc');

  const { data, isLoading } = useBacklog({ statuses, search, sort, order });
  const entries = data?.entries ?? [];

  const { data: statsData } = useStats();
  const counts = statsData?.stats?.statusCounts ?? {};
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const completionRate = statsData?.stats?.completionRate ?? 0;

  function toggleStatus(s) {
    setStatuses((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }

  const selectCls =
    'bg-surface-input text-content rounded-lg border border-edge px-3 py-2 ' +
    'text-sm outline-none cursor-pointer';

  return (
    <div className="flex">
      <aside
        className="hidden lg:flex w-64 shrink-0 flex-col gap-7 p-6
                   border-r border-edge-subtle bg-surface-raised
                   min-h-[calc(100vh-64px)]"
      >
        <CompletionRing
          percent={completionRate}
          size={120}
          sublabel="complete"
          innerClassName="bg-surface-raised"
          className="mx-auto"
        />
        <nav className="flex flex-col gap-1">
          <FilterButton
            active={statuses.length === 0}
            label="All"
            count={total}
            onClick={() => setStatuses([])}
          />
          {STATUSES.map((s) => (
            <FilterButton
              key={s}
              active={statuses.includes(s)}
              label={s}
              count={counts[s] ?? 0}
              onClick={() => toggleStatus(s)}
            />
          ))}
        </nav>
      </aside>

      <div className="flex-1 min-w-0 px-4 md:px-8 py-6">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold mr-auto">My Backlog</h1>
          <Input
            type="text"
            placeholder="Search titles…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-auto py-2"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className={selectCls}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
            className={`${selectCls} text-content-muted hover:text-content`}
            title={order === 'asc' ? 'Ascending' : 'Descending'}
          >
            {order === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 mb-5">
          <button
            onClick={() => setStatuses([])}
            className={[
              'shrink-0 px-4 py-1.5 rounded-full text-xs font-medium capitalize',
              statuses.length === 0
                ? 'bg-brand text-brand-ink'
                : 'bg-surface-card text-content-muted',
            ].join(' ')}
          >
            All
          </button>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => toggleStatus(s)}
              className={[
                'shrink-0 px-4 py-1.5 rounded-full text-xs font-medium capitalize',
                statuses.includes(s)
                  ? 'bg-brand text-brand-ink'
                  : 'bg-surface-card text-content-muted',
              ].join(' ')}
            >
              {s}
            </button>
          ))}
        </div>

        {isLoading ? (
          <p className="text-content-muted">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="text-content-muted">
            No games found. Search for a game in the navbar to add it.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {entries.map((entry) => (
              <GameCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

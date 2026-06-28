import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api.js';

const STATUSES = ['backlog', 'playing', 'completed', 'dropped', 'wishlist'];
const SORT_OPTIONS = [
  { value: 'created_at', label: 'Date added' },
  { value: 'title', label: 'Title' },
  { value: 'rating', label: 'Rating' },
  { value: 'hours_played', label: 'Hours' },
];
const STATUS_COLOURS = {
  backlog: 'bg-gray-600',
  playing: 'bg-blue-600',
  completed: 'bg-green-600',
  dropped: 'bg-red-600',
  wishlist: 'bg-purple-600',
};

function GameCard({ entry }) {
  return (
    <Link
      to={`/games/${entry.rawg_id}`}
      className="bg-gray-800 rounded-xl overflow-hidden hover:ring-2
                 hover:ring-indigo-500 transition-all block"
    >
      {entry.cover_image_url ? (
        <img
          src={entry.cover_image_url}
          alt={entry.title}
          className="w-full h-36 object-cover"
        />
      ) : (
        <div className="w-full h-36 bg-gray-700 flex items-center justify-center">
          <span className="text-gray-500 text-xs">No image</span>
        </div>
      )}
      <div className="p-3">
        <h3 className="font-medium text-white text-sm mb-2 line-clamp-1">
          {entry.title}
        </h3>
        <div className="flex items-center justify-between">
          <span
            className={`text-xs px-2 py-0.5 rounded-full text-white capitalize
                        ${STATUS_COLOURS[entry.status]}`}
          >
            {entry.status}
          </span>
          <span className="text-xs text-gray-400">
            {entry.rating && `★ ${entry.rating}`}
            {entry.rating && entry.hours_played && ' · '}
            {entry.hours_played && `${Number(entry.hours_played)}h`}
          </span>
        </div>
      </div>
    </Link>
  );
}

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

export default function BacklogPage() {
  const [statuses, setStatuses] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('created_at');
  const [order, setOrder] = useState('desc');

  const { data, isLoading } = useBacklog({ statuses, search, sort, order });
  const entries = data?.entries ?? [];

  function toggleStatus(s) {
    setStatuses(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Backlog</h1>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-1 bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setStatuses([])}
            className={`px-3 py-1.5 rounded-md text-sm capitalize transition-colors
              ${statuses.length === 0
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-white'}`}
          >
            All
          </button>
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => toggleStatus(s)}
              className={`px-3 py-1.5 rounded-md text-sm capitalize transition-colors
                ${statuses.includes(s)
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:text-white'}`}
            >
              {s}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search titles…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-gray-800 text-white placeholder-gray-500 rounded-lg
                     px-4 py-2 text-sm outline-none focus:ring-2
                     focus:ring-indigo-500"
        />

        <div className="flex items-center gap-1">
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="bg-gray-800 text-white rounded-lg px-3 py-2 text-sm
                       outline-none cursor-pointer"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button
            onClick={() => setOrder(o => o === 'asc' ? 'desc' : 'asc')}
            className="bg-gray-800 text-gray-400 hover:text-white rounded-lg
                       px-3 py-2 text-sm transition-colors"
            title={order === 'asc' ? 'Ascending' : 'Descending'}
          >
            {order === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-gray-400">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="text-gray-400">
          No games found. Search for a game in the navbar to add it.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5
                        gap-4">
          {entries.map(entry => (
            <GameCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}

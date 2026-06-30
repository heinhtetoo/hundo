import { useState } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import GameCard from '../components/GameCard.jsx';
import Button from '../components/ui/Button.jsx';
import { apiFetch } from '../lib/api.js';

const SORT_OPTIONS = [
  { value: 'rating', label: 'Rating' },
  { value: 'released', label: 'Release date' },
  { value: 'name', label: 'Name' },
  { value: 'added', label: 'Popularity' },
];

function useGenres() {
  return useQuery({
    queryKey: ['genres'],
    queryFn: async () => {
      const res = await apiFetch('/api/v1/games/genres');
      return res.json();
    },
    staleTime: 24 * 60 * 60 * 1000,
  });
}

function usePlatforms() {
  return useQuery({
    queryKey: ['platforms'],
    queryFn: async () => {
      const res = await apiFetch('/api/v1/games/platforms');
      return res.json();
    },
    staleTime: 24 * 60 * 60 * 1000,
  });
}

function useBrowse({ genre, platform, year, sort, order }) {
  return useInfiniteQuery({
    queryKey: ['browse', { genre, platform, year, sort, order }],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({ sort, order, page: pageParam });
      if (genre) params.set('genre', genre);
      if (platform) params.set('platform', platform);
      if (year) params.set('year', year);
      const res = await apiFetch(`/api/v1/games/browse?${params}`);
      return res.json();
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasNext ? pages.length + 1 : undefined,
  });
}

export default function DiscoverPage() {
  const [genre, setGenre] = useState('');
  const [platform, setPlatform] = useState('');
  const [year, setYear] = useState('');
  const [sort, setSort] = useState('rating');
  const [order, setOrder] = useState('desc');

  const { data: genresData } = useGenres();
  const { data: platformsData } = usePlatforms();
  const {
    data: browseData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useBrowse({ genre, platform, year, sort, order });

  const games = browseData?.pages.flatMap((p) => p.results) ?? [];
  const genres = genresData?.genres ?? [];

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 30 }, (_, i) => currentYear - i);

  const selectCls =
    'bg-surface-input text-content rounded-lg border border-edge px-3 py-2 ' +
    'text-sm outline-none cursor-pointer';

  function pillCls(active) {
    return [
      'shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors',
      active
        ? 'bg-brand text-brand-ink'
        : 'bg-surface-card text-content-muted hover:text-content',
    ].join(' ');
  }

  return (
    <div className="px-4 md:px-8 lg:px-20 py-6">
      <div className="flex items-baseline gap-3 mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Discover</h1>
        <span className="text-sm text-content-subtle">Find your next game</span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
        <button onClick={() => setGenre('')} className={pillCls(!genre)}>
          All
        </button>
        {genres.map((g) => (
          <button
            key={g.id}
            onClick={() => setGenre(g.slug)}
            className={pillCls(genre === g.slug)}
          >
            {g.name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-8">
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className={selectCls}
        >
          <option value="">All platforms</option>
          {(platformsData?.platforms ?? []).map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className={selectCls}
        >
          <option value="">All years</option>
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
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

      {isLoading ? (
        <p className="text-content-muted">Loading…</p>
      ) : games.length === 0 ? (
        <p className="text-content-muted">No games found for these filters.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
          {hasNextPage && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? 'Loading…' : 'Load more'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

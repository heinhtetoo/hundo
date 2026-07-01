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
    'bg-surface-card text-content-muted rounded-[7px] border border-edge ' +
    'px-3 py-1.5 text-[13px] outline-none cursor-pointer';

  function pillCls(active) {
    return [
      'shrink-0 px-4 py-1.5 rounded-full text-xs transition-colors',
      active
        ? 'bg-brand text-brand-ink font-semibold'
        : 'border border-edge text-content-muted font-medium hover:border-edge-strong hover:text-content',
    ].join(' ');
  }

  function clearFilters() {
    setGenre('');
    setPlatform('');
    setYear('');
    setSort('rating');
    setOrder('desc');
  }

  const hasFilters = genre || platform || year || sort !== 'rating' || order !== 'desc';

  return (
    <div className="px-4 md:px-8 lg:px-20 py-6">
      <div className="flex items-baseline gap-3 mb-4">
        <h1 className="text-[30px] font-bold tracking-[-0.03em]">Discover</h1>
        <span className="text-sm text-content-faint">
          {games.length > 0
            ? `${games.length}${hasNextPage ? '+' : ''} games`
            : 'Find your next game'}
        </span>
      </div>

      <div className="flex gap-[7px] overflow-x-auto scrollbar-none pb-0.5 mb-3">
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

      <div className="flex items-center justify-between gap-3 pb-3.5 mb-6 border-b border-edge-subtle">
        <div className="flex flex-wrap items-center gap-2">
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
            className={`${selectCls} hover:text-content`}
            title={order === 'asc' ? 'Ascending' : 'Descending'}
          >
            {order === 'asc' ? '↑' : '↓'}
          </button>
          {games.length > 0 && (
            <span className="pl-1 text-[13px] text-content-faint">
              {games.length}
              {hasNextPage ? '+' : ''} results
            </span>
          )}
        </div>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="shrink-0 text-[13px] text-content-faint hover:text-content-muted"
          >
            Clear filters
          </button>
        )}
      </div>

      {isLoading ? (
        <p className="text-content-muted">Loading…</p>
      ) : games.length === 0 ? (
        <p className="text-content-muted">No games found for these filters.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
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

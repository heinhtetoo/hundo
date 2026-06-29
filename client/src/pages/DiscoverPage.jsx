import { useState } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import GameCard from '../components/GameCard.jsx';
import { apiFetch } from '../lib/api.js';

const SORT_OPTIONS = [
  { value: 'rating', label: 'Rating' },
  { value: 'released', label: 'Release date' },
  { value: 'name', label: 'Name' },
  { value: 'added', label: 'Popularity' },
];

function useDiscoverRows() {
  return useQuery({
    queryKey: ['discover'],
    queryFn: async () => {
      const res = await apiFetch('/api/v1/games/discover');
      return res.json();
    },
    staleTime: 10 * 60 * 1000,
  });
}

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

function CarouselRow({ title, games }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {games.map(game => (
          <div key={game.id} className="flex-none w-36">
            <GameCard game={game} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function DiscoverPage() {
  const [genre, setGenre] = useState('');
  const [platform, setPlatform] = useState('');
  const [year, setYear] = useState('');
  const [sort, setSort] = useState('rating');
  const [order, setOrder] = useState('desc');

  const hasFilter = genre || platform || year;

  const { data: discoverData, isLoading: rowsLoading } = useDiscoverRows();
  const { data: genresData } = useGenres();
  const { data: platformsData } = usePlatforms();
  const {
    data: browseData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: browseLoading,
  } = useBrowse({ genre, platform, year, sort, order });

  const browseGames = hasFilter
    ? browseData?.pages.flatMap(p => p.results) ?? []
    : [];

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Discover Games</h1>

      <div className="flex flex-wrap items-center gap-3 mb-8">
        <select
          value={genre}
          onChange={e => setGenre(e.target.value)}
          className="bg-gray-800 text-white rounded-lg px-3 py-2 text-sm
                     outline-none cursor-pointer"
        >
          <option value="">All genres</option>
          {(genresData?.genres ?? []).map(g => (
            <option key={g.id} value={g.slug}>{g.name}</option>
          ))}
        </select>

        <select
          value={platform}
          onChange={e => setPlatform(e.target.value)}
          className="bg-gray-800 text-white rounded-lg px-3 py-2 text-sm
                     outline-none cursor-pointer"
        >
          <option value="">All platforms</option>
          {(platformsData?.platforms ?? []).map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select
          value={year}
          onChange={e => setYear(e.target.value)}
          className="bg-gray-800 text-white rounded-lg px-3 py-2 text-sm
                     outline-none cursor-pointer"
        >
          <option value="">All years</option>
          {yearOptions.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

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

        {hasFilter && (
          <button
            onClick={() => { setGenre(''); setPlatform(''); setYear(''); }}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {hasFilter ? (
        <div>
          {browseLoading ? (
            <p className="text-gray-400">Loading…</p>
          ) : browseGames.length === 0 ? (
            <p className="text-gray-400">No games found for these filters.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4
                              xl:grid-cols-5 gap-4 mb-6">
                {browseGames.map(game => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
              {hasNextPage && (
                <div className="flex justify-center">
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50
                               text-white px-6 py-2 rounded-lg text-sm transition-colors"
                  >
                    {isFetchingNextPage ? 'Loading…' : 'Load more'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        rowsLoading ? (
          <p className="text-gray-400">Loading…</p>
        ) : (
          (discoverData?.rows ?? []).map(row => (
            <CarouselRow key={row.slug} title={row.title} games={row.games} />
          ))
        )
      )}
    </div>
  );
}

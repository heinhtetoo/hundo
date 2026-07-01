import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { apiFetch } from '../lib/api.js';
import BacklogEntryForm from '../components/BacklogEntryForm.jsx';
import GameScreenshots from '../components/GameScreenshots.jsx';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import CompletionRing from '../components/ui/CompletionRing.jsx';

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")";

const TABS = [
  { key: 'entry', label: 'Your Entry' },
  { key: 'overview', label: 'Overview' },
  { key: 'media', label: 'Media' },
];

function useGame(rawgId) {
  return useQuery({
    queryKey: ['game', rawgId],
    queryFn: async () => {
      const res = await apiFetch(`/api/v1/games/${rawgId}`);
      if (!res.ok) throw new Error('Game not found');
      return res.json();
    },
  });
}

function useBacklogEntry(rawgId) {
  return useQuery({
    queryKey: ['backlog', 'all'],
    queryFn: async () => {
      const res = await apiFetch('/api/v1/backlog');
      const data = await res.json();
      return data.entries ?? [];
    },
    select: (entries) => entries.find((e) => e.rawg_id === Number(rawgId)),
  });
}

function DetailCell({ label, children }) {
  return (
    <div className="flex flex-col gap-0.5 px-4 py-[13px] bg-surface-card">
      <span className="text-[10px] font-medium uppercase tracking-wider text-content-subtle">
        {label}
      </span>
      <span className="text-sm text-content">{children}</span>
    </div>
  );
}

export default function GameDetailPage() {
  const { id: rawgId } = useParams();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('entry');

  const { data: gameData, isLoading: gameLoading, error: gameError } =
    useGame(rawgId);
  const { data: entry } = useBacklogEntry(rawgId);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['backlog'] });

  const addMutation = useMutation({
    mutationFn: async ({ game, formData }) => {
      const res = await apiFetch('/api/v1/backlog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawgId: game.id,
          title: game.name,
          coverImageUrl: game.background_image,
          genres: game.genres,
          platforms: game.platforms,
          releaseYear: game.released
            ? new Date(game.released).getFullYear()
            : null,
          ...formData,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message ?? 'Failed to add game');
      }
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      toast.success('Added to backlog');
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ entryId, formData }) => {
      const res = await apiFetch(`/api/v1/backlog/${entryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to update entry');
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      toast.success('Entry saved');
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (entryId) => {
      const res = await apiFetch(`/api/v1/backlog/${entryId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to remove game');
    },
    onSuccess: () => {
      invalidate();
      toast.success('Removed from backlog');
    },
    onError: (e) => toast.error(e.message),
  });

  async function handleSave(formData) {
    const game = gameData.game;
    if (entry) {
      await updateMutation.mutateAsync({ entryId: entry.id, formData });
    } else {
      await addMutation.mutateAsync({ game, formData });
    }
  }

  if (gameLoading)
    return <p className="px-8 py-6 text-content-muted">Loading…</p>;
  if (gameError)
    return <p className="px-8 py-6 text-red-400">Game not found.</p>;

  const game = gameData.game;
  const developers = game.developers ?? [];
  const publishers = game.publishers ?? [];
  const completed = entry?.status === 'completed';
  const year = game.released ? game.released.slice(0, 4) : null;

  return (
    <div>
      <div className="relative h-[260px] md:h-[300px] overflow-hidden">
        {game.background_image ? (
          <img
            src={game.background_image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, oklch(16% 0.10 18), oklch(14% 0.06 240))',
            }}
          />
        )}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 3px)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.18] pointer-events-none"
          style={{ backgroundImage: NOISE, backgroundSize: '200px' }}
        />
        <div
          className="absolute inset-y-0 left-0 w-[520px] pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, oklch(7% 0.022 265 / 0.8) 0%, transparent 100%)',
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
          style={{
            background:
              'linear-gradient(0deg, oklch(7% 0.022 265) 0%, transparent 100%)',
          }}
        />

        <div className="absolute bottom-0 inset-x-0 px-4 md:px-8 lg:px-20 pb-6">
          <p className="text-[11px] tracking-wide text-content-subtle mb-3">
            <Link to="/backlog" className="hover:text-content-muted">
              Backlog
            </Link>
            <span className="mx-1.5 opacity-40">›</span>
            <span className="text-content-muted">{game.name}</span>
          </p>
          <div className="flex flex-wrap items-end gap-x-3 gap-y-2 mb-4">
            <div className="flex items-baseline gap-x-3">
              <h1 className="text-3xl md:text-[52px] leading-none font-bold tracking-[-0.035em] drop-shadow-lg">
                {game.name}
              </h1>
              {year && (
                <span className="text-base font-semibold text-content-muted">
                  ({year})
                </span>
              )}
            </div>
            {completed && (
              <Badge variant="completion">
                <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                100% COMPLETED
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {game.genres.map((g) => (
              <Badge key={g.id}>{g.name}</Badge>
            ))}
            {game.platforms.map((p) => (
              <Badge key={p.id}>{p.name}</Badge>
            ))}
            {(game.metacritic != null || game.rating > 0) && (
              <span className="w-px h-4 bg-white/10 mx-0.5" />
            )}
            {game.metacritic != null && (
              <Badge variant="metacritic" score={game.metacritic}>
                {game.metacritic} Metacritic
              </Badge>
            )}
            {game.rating > 0 && (
              <span className="text-sm text-content-muted">
                <span className="text-brand">★</span> {game.rating.toFixed(1)}
                <span className="text-content-subtle"> / 5 RAWG</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 lg:px-20 py-6 lg:py-8">
        <div className="lg:hidden flex border-b border-edge-subtle mb-5">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={[
                'flex-1 py-[11px] text-[12px] border-b-2 -mb-px transition-colors',
                tab === t.key
                  ? 'border-brand text-brand font-semibold'
                  : 'border-transparent text-content-faint font-medium',
              ].join(' ')}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-10">
          <div className="min-w-0 lg:space-y-8">
            <div className={`space-y-8 ${tab === 'overview' ? '' : 'hidden lg:block'}`}>
          {game.description_raw && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-content-subtle mb-3">
                About
              </p>
              <p className="text-sm leading-relaxed text-content-muted">
                {game.description_raw}
              </p>
            </div>
          )}

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-content-subtle mb-3">
              Details
            </p>
            <div className="grid grid-cols-2 gap-px bg-edge-subtle border border-edge-subtle rounded-[10px] overflow-hidden">
              {developers.length > 0 && (
                <DetailCell label="Developer">
                  {developers.join(', ')}
                </DetailCell>
              )}
              {publishers.length > 0 && (
                <DetailCell label="Publisher">
                  {publishers.join(', ')}
                </DetailCell>
              )}
              {game.released && (
                <DetailCell label="Released">{game.released}</DetailCell>
              )}
              {game.esrb_rating && (
                <DetailCell label="ESRB">{game.esrb_rating}</DetailCell>
              )}
              {game.playtime > 0 && (
                <DetailCell label="Avg Playtime">{game.playtime}h</DetailCell>
              )}
              {game.website && (
                <DetailCell label="Website">
                  <a
                    href={game.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent hover:text-accent-hover break-all"
                  >
                    {game.website} ↗
                  </a>
                </DetailCell>
              )}
            </div>
          </div>
            </div>

            <div className={tab === 'media' ? '' : 'hidden lg:block'}>
              <GameScreenshots rawgId={rawgId} />
            </div>
          </div>

          <div className={tab === 'entry' ? '' : 'hidden lg:block'}>
            <Card className="overflow-hidden lg:sticky lg:top-6">
            <div
              className="hidden lg:flex items-center justify-between px-[22px] py-4 border-b border-edge-subtle"
              style={{
                background:
                  'linear-gradient(180deg, oklch(12% 0.024 265) 0%, oklch(10% 0.022 265) 100%)',
              }}
            >
              <span className="text-sm font-bold text-content">
                {entry ? 'Your Entry' : 'Add to backlog'}
              </span>
              {completed && (
                <CompletionRing
                  percent={100}
                  size={38}
                  thickness={4}
                  label="100%"
                  labelSize={9}
                  innerClassName="bg-surface-card"
                />
              )}
            </div>
            <div className="p-[22px]">
              <BacklogEntryForm
                entry={entry}
                avgPlaytime={game.playtime}
                onSave={handleSave}
                onRemove={() => deleteMutation.mutate(entry.id)}
              />
            </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE } from '../lib/api.js';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const STATUSES = ['backlog', 'playing', 'completed', 'dropped', 'wishlist'];

const entrySchema = z.object({
  status: z.enum(STATUSES),
  rating: z.preprocess(
    v => (v === '' ? null : Number(v)),
    z.number().int().min(1).max(10).nullable(),
  ),
  hoursPlayed: z.preprocess(
    v => (v === '' ? null : Number(v)),
    z.number().min(0).nullable(),
  ),
  notes: z.string().max(2000),
});

function useGame(rawgId) {
  return useQuery({
    queryKey: ['game', rawgId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/v1/games/${rawgId}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Game not found');
      return res.json();
    },
  });
}

function useBacklogEntry(rawgId) {
  return useQuery({
    queryKey: ['backlog', 'all'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/v1/backlog`, { credentials: 'include' });
      const data = await res.json();
      return data.entries ?? [];
    },
    select: entries => entries.find(e => e.rawg_id === Number(rawgId)),
  });
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
}

function BacklogEntryForm({ game, entry, onSave, onRemove }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      status: entry?.status ?? 'backlog',
      rating: entry?.rating ?? '',
      hoursPlayed: entry?.hours_played ?? '',
      notes: entry?.notes ?? '',
    },
  });

  useEffect(() => {
    if (entry) {
      reset({
        status: entry.status,
        rating: entry.rating ?? '',
        hoursPlayed: entry.hours_played ?? '',
        notes: entry.notes ?? '',
      });
    }
  }, [entry, reset]);

  const inputCls = `w-full bg-gray-700 rounded-lg px-4 py-2.5 text-white
                    outline-none focus:ring-2 focus:ring-indigo-500`;

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <Field label="Status" error={errors.status?.message}>
        <select {...register('status')} className={inputCls}>
          {STATUSES.map(s => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Rating (1–10)" error={errors.rating?.message}>
          <input
            {...register('rating')}
            type="number"
            min="1"
            max="10"
            placeholder="—"
            className={inputCls}
          />
        </Field>
        <Field label="Hours played" error={errors.hoursPlayed?.message}>
          <input
            {...register('hoursPlayed')}
            type="number"
            min="0"
            step="0.5"
            placeholder="—"
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Notes" error={errors.notes?.message}>
        <textarea
          {...register('notes')}
          rows={3}
          placeholder="Your thoughts…"
          className={`${inputCls} resize-none`}
        />
      </Field>

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50
                     text-white font-medium py-2.5 rounded-lg transition-colors"
        >
          {entry ? 'Save changes' : 'Add to backlog'}
        </button>
        {entry && (
          <button
            type="button"
            onClick={onRemove}
            className="px-4 py-2.5 bg-gray-700 hover:bg-red-800 text-gray-300
                       hover:text-white rounded-lg transition-colors text-sm"
          >
            Remove
          </button>
        )}
      </div>
    </form>
  );
}

export default function GameDetailPage() {
  const { id: rawgId } = useParams();
  const queryClient = useQueryClient();

  const { data: gameData, isLoading: gameLoading, error: gameError } =
    useGame(rawgId);
  const { data: entry } = useBacklogEntry(rawgId);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['backlog'] });

  const addMutation = useMutation({
    mutationFn: async ({ game, formData }) => {
      const res = await fetch(`${API_BASE}/api/v1/backlog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ entryId, formData }) => {
      const res = await fetch(`${API_BASE}/api/v1/backlog/${entryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to update entry');
      return res.json();
    },
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: async entryId => {
      const res = await fetch(`${API_BASE}/api/v1/backlog/${entryId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to remove game');
    },
    onSuccess: invalidate,
  });

  async function handleSave(formData) {
    const game = gameData.game;
    if (entry) {
      await updateMutation.mutateAsync({ entryId: entry.id, formData });
    } else {
      await addMutation.mutateAsync({ game, formData });
    }
  }

  if (gameLoading) return <p className="text-gray-400">Loading…</p>;
  if (gameError) return <p className="text-red-400">Game not found.</p>;

  const game = gameData.game;
  const releaseYear = game.released
    ? new Date(game.released).getFullYear()
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        {game.background_image && (
          <img
            src={game.background_image}
            alt={game.name}
            className="w-full h-64 object-cover rounded-xl"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold mb-2">{game.name}</h1>
          <div className="flex flex-wrap gap-2 mb-4">
            {releaseYear && (
              <span className="text-sm text-gray-400">{releaseYear}</span>
            )}
            {game.rating > 0 && (
              <span className="text-sm text-gray-400">
                · ★ {game.rating.toFixed(1)} RAWG
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {game.genres.map(g => (
              <span
                key={g.id}
                className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full"
              >
                {g.name}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {game.platforms.map(p => (
              <span
                key={p.id}
                className="text-xs bg-gray-800 text-gray-400 px-3 py-1 rounded-full"
              >
                {p.name}
              </span>
            ))}
          </div>
          {game.description_raw && (
            <p className="text-gray-400 text-sm leading-relaxed line-clamp-6">
              {game.description_raw}
            </p>
          )}
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 h-fit">
        <h2 className="font-semibold text-lg mb-5">
          {entry ? 'Your entry' : 'Add to backlog'}
        </h2>
        <BacklogEntryForm
          game={game}
          entry={entry}
          onSave={handleSave}
          onRemove={() => deleteMutation.mutate(entry.id)}
        />
      </div>
    </div>
  );
}

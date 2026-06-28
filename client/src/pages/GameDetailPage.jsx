import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { apiFetch } from '../lib/api.js';
import BacklogEntryForm from '../components/BacklogEntryForm.jsx';
import GameMeta from '../components/GameMeta.jsx';
import GameScreenshots from '../components/GameScreenshots.jsx';

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
    select: entries => entries.find(e => e.rawg_id === Number(rawgId)),
  });
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
    onSuccess: () => { invalidate(); toast.success('Added to backlog'); },
    onError: e => toast.error(e.message),
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
    onSuccess: () => { invalidate(); toast.success('Entry saved'); },
    onError: e => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async entryId => {
      const res = await apiFetch(`/api/v1/backlog/${entryId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to remove game');
    },
    onSuccess: () => { invalidate(); toast.success('Removed from backlog'); },
    onError: e => toast.error(e.message),
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
          <h1 className="text-3xl font-bold mb-3">{game.name}</h1>
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
          <div className="flex flex-wrap gap-2 mb-5">
            {game.platforms.map(p => (
              <span
                key={p.id}
                className="text-xs bg-gray-800 text-gray-400 px-3 py-1 rounded-full"
              >
                {p.name}
              </span>
            ))}
          </div>
          <div className="mb-6">
            <GameMeta game={game} />
          </div>
          {game.description_raw && (
            <p className="text-gray-400 text-sm leading-relaxed line-clamp-6">
              {game.description_raw}
            </p>
          )}
        </div>
        <GameScreenshots rawgId={rawgId} />
      </div>

      <div className="bg-gray-800 rounded-xl p-6 h-fit">
        <h2 className="font-semibold text-lg mb-5">
          {entry ? 'Your entry' : 'Add to backlog'}
        </h2>
        <BacklogEntryForm
          entry={entry}
          onSave={handleSave}
          onRemove={() => deleteMutation.mutate(entry.id)}
        />
      </div>
    </div>
  );
}

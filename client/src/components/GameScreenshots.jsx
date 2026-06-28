import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api.js';

function useScreenshots(rawgId) {
  return useQuery({
    queryKey: ['screenshots', rawgId],
    queryFn: async () => {
      const res = await apiFetch(`/api/v1/games/${rawgId}/screenshots`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.screenshots ?? [];
    },
    staleTime: 5 * 60_000,
  });
}

export default function GameScreenshots({ rawgId }) {
  const { data: screenshots = [] } = useScreenshots(rawgId);

  if (screenshots.length === 0) return null;

  return (
    <div>
      <h2 className="font-semibold mb-3 text-gray-200">Screenshots</h2>
      <div className="grid grid-cols-2 gap-3">
        {screenshots.map(shot => (
          <img
            key={shot.id}
            src={shot.image}
            alt=""
            loading="lazy"
            className="w-full h-40 object-cover rounded-lg"
          />
        ))}
      </div>
    </div>
  );
}

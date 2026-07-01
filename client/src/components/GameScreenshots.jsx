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
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-content-subtle mb-3">
        Screenshots
      </p>
      <div className="grid grid-cols-3 gap-2">
        {screenshots.map(shot => (
          <img
            key={shot.id}
            src={shot.image}
            alt=""
            loading="lazy"
            className="w-full aspect-video object-cover rounded-lg"
          />
        ))}
      </div>
    </div>
  );
}

function metacriticColour(score) {
  if (score >= 75) return 'bg-green-600';
  if (score >= 50) return 'bg-yellow-600';
  return 'bg-red-600';
}

function MetaRow({ label, children }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-gray-500 w-24 shrink-0">{label}</span>
      <span className="text-gray-300">{children}</span>
    </div>
  );
}

export default function GameMeta({ game }) {
  const developers = game.developers ?? [];
  const publishers = game.publishers ?? [];

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3 mb-1">
        {game.metacritic != null && (
          <span
            className={`text-sm font-bold text-white px-2 py-0.5 rounded
                        ${metacriticColour(game.metacritic)}`}
          >
            {game.metacritic} Metacritic
          </span>
        )}
        {game.rating > 0 && (
          <span className="text-sm text-gray-400">
            ★ {game.rating.toFixed(1)} RAWG
            {game.rating_count != null && ` (${game.rating_count})`}
          </span>
        )}
      </div>

      {developers.length > 0 && (
        <MetaRow label="Developer">{developers.join(', ')}</MetaRow>
      )}
      {publishers.length > 0 && (
        <MetaRow label="Publisher">{publishers.join(', ')}</MetaRow>
      )}
      {game.esrb_rating && <MetaRow label="ESRB">{game.esrb_rating}</MetaRow>}
      {game.playtime > 0 && (
        <MetaRow label="Avg playtime">{game.playtime}h</MetaRow>
      )}
      {game.released && <MetaRow label="Released">{game.released}</MetaRow>}
      {game.website && (
        <MetaRow label="Website">
          <a
            href={game.website}
            target="_blank"
            rel="noreferrer"
            className="text-indigo-400 hover:text-indigo-300 break-all"
          >
            {game.website}
          </a>
        </MetaRow>
      )}
    </div>
  );
}

import { Link } from 'react-router-dom';
import Badge from './ui/Badge.jsx';

function Cover({ src, alt }) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className="w-full aspect-[16/10] object-cover"
      />
    );
  }
  return (
    <div className="w-full aspect-[16/10] bg-surface-input flex items-center justify-center">
      <span className="text-content-faint text-xs">No image</span>
    </div>
  );
}

export default function GameCard({ game, entry }) {
  const isEntry = !!entry;
  const to = isEntry ? `/games/${entry.rawg_id}` : `/games/${game.id}`;
  const title = isEntry ? entry.title : game.name;
  const cover = isEntry ? entry.cover_image_url : game.background_image;
  const year = !isEntry && game.released ? game.released.slice(0, 4) : null;
  const completed = isEntry && entry.status === 'completed';

  return (
    <Link
      to={to}
      className="group block bg-surface-card border border-edge rounded-xl
                 overflow-hidden transition-all hover:-translate-y-0.5
                 hover:border-[oklch(76%_0.19_55_/_0.4)]"
    >
      <div className="relative">
        <Cover src={cover} alt={title} />
        {completed && (
          <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-brand flex items-center justify-center shadow-lg">
            <span className="text-[9px] font-bold text-brand-ink">100%</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium text-content text-sm line-clamp-1">
          {title}
        </h3>
        {isEntry ? (
          <div className="flex items-center justify-between gap-2 mt-2">
            <Badge variant="status" status={entry.status} className="capitalize">
              {entry.status}
            </Badge>
            <span className="text-xs text-content-subtle whitespace-nowrap">
              {entry.rating ? `★ ${entry.rating}` : ''}
              {entry.rating && entry.hours_played ? ' · ' : ''}
              {entry.hours_played ? `${Number(entry.hours_played)}h` : ''}
            </span>
          </div>
        ) : (
          year && <p className="text-xs text-content-subtle mt-1">{year}</p>
        )}
      </div>
    </Link>
  );
}

import { Link } from 'react-router-dom';

const GRADIENTS = [
  'linear-gradient(135deg,oklch(12% 0.08 348),oklch(22% 0.14 8))',
  'linear-gradient(135deg,oklch(14% 0.07 262),oklch(22% 0.12 272))',
  'linear-gradient(135deg,oklch(14% 0.09 38),oklch(22% 0.15 18))',
  'linear-gradient(135deg,oklch(13% 0.09 222),oklch(21% 0.14 212))',
  'linear-gradient(135deg,oklch(10% 0.08 155),oklch(18% 0.12 162))',
  'linear-gradient(135deg,oklch(13% 0.07 28),oklch(20% 0.10 18))',
];

function gradientFor(seed) {
  const s = String(seed ?? '');
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}

function Hero({ cover, seed, className, children }) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={cover ? undefined : { background: gradientFor(seed) }}
    >
      {cover && (
        <img src={cover} alt="" className="absolute inset-0 w-full h-full object-cover" />
      )}
      {children}
    </div>
  );
}

function FeaturedCard({ entry }) {
  const hours = Number(entry.hours_played) || 0;
  return (
    <Link
      to={`/games/${entry.rawg_id}`}
      className="group block rounded-xl overflow-hidden bg-surface-card
                 border border-[oklch(62%_0.24_280_/_0.22)] transition-all
                 hover:-translate-y-0.5 hover:border-[oklch(62%_0.24_280_/_0.4)]"
    >
      <Hero cover={entry.cover_image_url} seed={entry.rawg_id} className="h-[90px] sm:h-[120px]">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-2.5 sm:bottom-3.5 left-3 sm:left-4 right-3 sm:right-4">
          <p className="text-[15px] sm:text-[22px] font-bold text-white tracking-[-0.025em] leading-none truncate drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]">
            {entry.title}
          </p>
        </div>
        <div className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 flex items-center gap-1.5 rounded-full border border-[oklch(62%_0.24_280_/_0.38)] bg-[oklch(62%_0.24_280_/_0.18)] px-2 sm:px-2.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_6px_oklch(62%_0.24_280)]" />
          <span className="text-[10px] font-semibold tracking-[0.06em] text-[oklch(70%_0.22_280)]">
            PLAYING
          </span>
        </div>
      </Hero>
      <div className="px-3 sm:px-4 py-2.5 sm:py-3.5 flex items-center justify-between">
        <div>
          <span className="text-base sm:text-lg font-bold text-content">{hours}</span>
          <span className="text-xs text-content-subtle">h played</span>
        </div>
        <span className="hidden sm:inline-block rounded-lg border border-[oklch(62%_0.24_280_/_0.28)] bg-[oklch(62%_0.24_280_/_0.12)] px-3.5 py-1.5 text-xs font-semibold text-accent">
          Update
        </span>
      </div>
    </Link>
  );
}

function CompactCard({ entry }) {
  const completed = entry.status === 'completed';
  const rating = entry.rating;
  const hours = entry.hours_played != null ? `${Number(entry.hours_played)}h` : null;
  return (
    <Link
      to={`/games/${entry.rawg_id}`}
      className={[
        'group block rounded-[10px] overflow-hidden bg-surface-card border transition-all hover:-translate-y-0.5',
        completed
          ? 'border-[oklch(76%_0.19_55_/_0.16)] hover:border-[oklch(76%_0.19_55_/_0.38)]'
          : 'border-edge hover:border-edge-strong',
      ].join(' ')}
    >
      <Hero cover={entry.cover_image_url} seed={entry.rawg_id} className="h-[72px]">
        {completed && (
          <div className="absolute top-[7px] right-[7px] w-7 h-7 rounded-full bg-brand flex items-center justify-center">
            <span className="text-[7px] font-bold text-brand-ink">100%</span>
          </div>
        )}
      </Hero>
      <div className="px-[11px] py-2.5">
        <p className="text-xs font-semibold text-content truncate mb-2">{entry.title}</p>
        {completed ? (
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-brand">
              {rating ? `★ ${rating}` : '★ —'}
            </span>
            <span className="text-[10px] text-content-subtle">{hours ?? ''}</span>
          </div>
        ) : (
          <span className="inline-block rounded text-[10px] font-medium capitalize text-content-muted bg-[oklch(44%_0.013_265_/_0.1)] px-[7px] py-0.5">
            ◦ {entry.status}
          </span>
        )}
      </div>
    </Link>
  );
}

const STATUS_BADGE = {
  completed: { label: '✓ Completed', cls: 'text-brand bg-[oklch(76%_0.19_55_/_0.12)]' },
  playing: { label: '▶ Playing', cls: 'text-accent bg-[oklch(62%_0.24_280_/_0.12)]' },
  backlog: { label: '◦ Backlog', cls: 'text-content-muted bg-[oklch(44%_0.013_265_/_0.1)]' },
  dropped: { label: '✕ Dropped', cls: 'text-[oklch(62%_0.2_25)] bg-[oklch(52%_0.22_25_/_0.12)]' },
  wishlist: { label: '♡ Wishlist', cls: 'text-[oklch(66%_0.14_222)] bg-[oklch(60%_0.14_222_/_0.12)]' },
};

function LibraryCard({ entry }) {
  const completed = entry.status === 'completed';
  const playing = entry.status === 'playing';
  const badge = STATUS_BADGE[entry.status] ?? STATUS_BADGE.backlog;
  const hours = entry.hours_played != null ? `${Number(entry.hours_played)}h` : null;
  const border = completed
    ? 'border-[oklch(76%_0.19_55_/_0.16)]'
    : playing
      ? 'border-[oklch(62%_0.24_280_/_0.2)]'
      : 'border-edge';
  return (
    <Link
      to={`/games/${entry.rawg_id}`}
      className={`group block rounded-[10px] overflow-hidden bg-surface-card border ${border} transition-all hover:-translate-y-0.5`}
    >
      <Hero cover={entry.cover_image_url} seed={entry.rawg_id} className="h-[54px]">
        {completed && (
          <div className="absolute top-2 right-2 w-[33px] h-[33px] rounded-full bg-brand flex items-center justify-center">
            <span className="text-[8px] font-bold text-brand-ink">100%</span>
          </div>
        )}
        {playing && (
          <span className="absolute top-2.5 right-2.5 w-[9px] h-[9px] rounded-full bg-accent shadow-[0_0_8px_oklch(62%_0.24_280_/_0.9)]" />
        )}
      </Hero>
      <div className="px-3 py-2.5 flex flex-col gap-2">
        <p className="text-[13px] font-semibold text-content truncate">{entry.title}</p>
        <div className="flex items-center justify-between gap-2">
          <span className={`inline-block rounded text-[11px] font-semibold px-2 py-[3px] ${badge.cls}`}>
            {badge.label}
          </span>
          {(completed || playing) && (
            <div className="flex items-center gap-1.5 shrink-0">
              {completed && (
                <span className="text-[11px] font-semibold text-brand">
                  {entry.rating ? `★ ${entry.rating}` : '★ —'}
                </span>
              )}
              {hours && <span className="text-[11px] text-content-subtle">{hours}</span>}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function BrowseCard({ game }) {
  const year = game.released ? game.released.slice(0, 4) : null;
  const genre = game.genres?.[0]?.name;
  const platform =
    game.platforms?.length > 1 ? 'Multi' : game.platforms?.[0]?.name;
  const score =
    game.metacritic ?? (game.rating ? Number(game.rating).toFixed(1) : null);
  const meta = [year, genre].filter(Boolean).join(' · ');
  return (
    <Link
      to={`/games/${game.id}`}
      className="group block bg-surface-card border border-edge rounded-[10px]
                 overflow-hidden transition-all hover:-translate-y-0.5
                 hover:border-[oklch(76%_0.19_55_/_0.3)]
                 hover:shadow-[0_12px_36px_rgba(0,0,0,0.7)]"
    >
      <Hero cover={game.background_image} seed={game.id} className="aspect-[3/2]">
        {score != null && (
          <span className="absolute top-[7px] right-[7px] rounded-[5px] border border-[oklch(62%_0.20_145_/_0.45)] bg-[oklch(56%_0.20_145_/_0.2)] px-2 py-0.5 text-[11px] font-bold text-[oklch(72%_0.18_145)]">
            {score}
          </span>
        )}
        {platform && (
          <span className="absolute top-[7px] left-[7px] rounded-[5px] border border-white/[0.14] bg-white/[0.08] px-2 py-0.5 text-[10px] font-medium text-white/50">
            {platform}
          </span>
        )}
        <span className="absolute bottom-2 right-2 rounded-md bg-brand px-3 py-1 text-[11px] font-semibold text-brand-ink opacity-0 group-hover:opacity-100 transition-opacity">
          + Add
        </span>
      </Hero>
      <div className="px-3 py-2.5">
        <p className="text-[13px] font-semibold text-content truncate">{game.name}</p>
        {meta && <p className="text-[11px] text-content-subtle mt-0.5">{meta}</p>}
      </div>
    </Link>
  );
}

export default function GameCard({ game, entry, variant = 'compact' }) {
  if (entry && variant === 'featured') return <FeaturedCard entry={entry} />;
  if (entry && variant === 'library') return <LibraryCard entry={entry} />;
  if (entry) return <CompactCard entry={entry} />;
  return <BrowseCard game={game} />;
}

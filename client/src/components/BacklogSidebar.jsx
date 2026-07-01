import { Link } from 'react-router-dom';
import CompletionRing from './ui/CompletionRing.jsx';

export const STATUS_META = [
  { key: 'playing', label: 'Playing', dot: 'oklch(62% 0.24 280)' },
  { key: 'completed', label: 'Completed', dot: 'oklch(76% 0.19 55)' },
  { key: 'backlog', label: 'Backlog', dot: 'oklch(52% 0.013 265)' },
  { key: 'dropped', label: 'Dropped', dot: 'oklch(52% 0.22 25)' },
  { key: 'wishlist', label: 'Wishlist', dot: 'oklch(60% 0.14 222)' },
];

function StatusRow({ dot, label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        'flex items-center justify-between px-2.5 py-2 rounded-[7px] text-left transition-colors',
        active
          ? 'bg-[oklch(76%_0.19_55_/_0.09)] border border-[oklch(76%_0.19_55_/_0.18)]'
          : 'border border-transparent hover:bg-[oklch(13%_0.02_265)]',
      ].join(' ')}
    >
      <span className="flex items-center gap-2.5">
        <span className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: dot }} />
        <span
          className={`text-[13px] font-medium ${active ? 'text-content' : 'text-content-muted'}`}
        >
          {label}
        </span>
      </span>
      <span
        className={`text-xs font-semibold ${active ? 'text-brand' : 'text-content-subtle'}`}
      >
        {count}
      </span>
    </button>
  );
}

export default function BacklogSidebar({
  completionRate,
  totalGames,
  totalHours,
  counts,
  genres,
  activeStatus,
  onSelect,
}) {
  const maxGenre = genres[0]?.count || 1;

  return (
    <aside
      className="hidden lg:flex w-[252px] shrink-0 flex-col gap-7 p-6
                 border-r border-edge-subtle bg-surface-raised
                 min-h-[calc(100vh-64px)]"
    >
      <div className="flex flex-col items-center gap-3.5">
        <CompletionRing
          percent={completionRate}
          size={110}
          thickness={11}
          sublabel="done"
          innerClassName="bg-surface-raised"
        />
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-content">{totalGames}</div>
            <div className="text-[10px] text-content-subtle mt-px">Games</div>
          </div>
          <div className="w-px bg-edge-subtle" />
          <div className="text-center">
            <div className="text-lg font-bold text-content">{totalHours}h</div>
            <div className="text-[10px] text-content-subtle mt-px">Played</div>
          </div>
        </div>
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-content-faint mb-3">
          Status
        </p>
        <div className="flex flex-col gap-1">
          <StatusRow
            dot="oklch(76% 0.19 55)"
            label="All games"
            count={totalGames}
            active={activeStatus === null}
            onClick={() => onSelect(null)}
          />
          {STATUS_META.map((s) => (
            <StatusRow
              key={s.key}
              dot={s.dot}
              label={s.label}
              count={counts[s.key] ?? 0}
              active={activeStatus === s.key}
              onClick={() => onSelect(s.key)}
            />
          ))}
        </div>
      </div>

      {genres.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-content-faint mb-3">
            Top Genres
          </p>
          <div className="flex flex-col gap-2.5">
            {genres.map((g) => (
              <div key={g.genre}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs font-medium text-[oklch(68%_0.01_265)]">
                    {g.genre}
                  </span>
                  <span className="text-[11px] font-medium text-content-subtle">
                    {g.count}
                  </span>
                </div>
                <div className="h-0.5 rounded-full bg-[oklch(14%_0.022_265)]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.round((g.count / maxGenre) * 100)}%`,
                      background:
                        'linear-gradient(90deg, oklch(62% 0.24 280), oklch(55% 0.22 290))',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Link
        to="/discover"
        className="mt-auto w-full rounded-[9px] bg-brand hover:bg-brand-hover
                   text-brand-ink text-center text-sm font-semibold py-3
                   tracking-[-0.01em] transition-colors"
      >
        + Add a game
      </Link>
    </aside>
  );
}

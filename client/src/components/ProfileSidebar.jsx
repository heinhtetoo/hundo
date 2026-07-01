import { Link } from 'react-router-dom';

const THUMBS = [
  'linear-gradient(135deg,oklch(13% 0.05 78),oklch(20% 0.09 62))',
  'linear-gradient(135deg,oklch(12% 0.07 152),oklch(20% 0.11 162))',
  'linear-gradient(135deg,oklch(12% 0.08 348),oklch(20% 0.13 8))',
  'linear-gradient(135deg,oklch(13% 0.09 222),oklch(21% 0.14 212))',
];

function Section({ title, children }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-content-subtle mb-[11px]">
        {title}
      </p>
      {children}
    </div>
  );
}

export default function ProfileSidebar({ genres, playing }) {
  const maxGenre = genres[0]?.count || 1;

  return (
    <aside className="hidden lg:flex w-[264px] shrink-0 flex-col gap-[22px]">
      {genres.length > 0 && (
        <Section title="Top Genres">
          <div className="flex flex-col gap-2.5">
            {genres.map((g) => (
              <div key={g.genre}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[13px] font-medium text-[oklch(78%_0.01_265)]">
                    {g.genre}
                  </span>
                  <span className="text-[11px] font-medium text-content-subtle">
                    {g.count}
                  </span>
                </div>
                <div className="h-[3px] rounded-full bg-[oklch(15%_0.022_265)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${Math.round((g.count / maxGenre) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {playing.length > 0 && (
        <Section title="Currently Playing">
          <div className="flex flex-col gap-2">
            {playing.map((e, i) => (
              <Link
                key={e.id}
                to={`/games/${e.rawg_id}`}
                className="flex items-center gap-2.5 rounded-[9px] border border-edge bg-surface-card px-3 py-2.5 hover:border-edge-strong transition-colors"
              >
                <div
                  className="w-[42px] h-[42px] rounded-[7px] shrink-0 bg-cover bg-center"
                  style={
                    e.cover_image_url
                      ? { backgroundImage: `url(${e.cover_image_url})` }
                      : { background: THUMBS[i % THUMBS.length] }
                  }
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-content truncate">
                    {e.title}
                  </p>
                  <p className="text-[11px] text-content-subtle">
                    {e.hours_played != null ? `${Number(e.hours_played)}h played` : 'Playing'}
                  </p>
                </div>
                <span className="w-2 h-2 rounded-full bg-accent shrink-0 shadow-[0_0_7px_oklch(62%_0.24_280_/_0.8)]" />
              </Link>
            ))}
          </div>
        </Section>
      )}
    </aside>
  );
}

import { useState } from 'react';

const SEGMENTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function RatingBar({ value, onChange, label, className = '' }) {
  const [hovered, setHovered] = useState(null);
  const current = Number(value) || 0;
  const active = hovered ?? current;
  const interactive = typeof onChange === 'function';

  return (
    <div className={className}>
      {label && (
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-content-subtle">
            {label}
          </span>
          <span className="text-[13px] font-semibold text-brand">
            {current || '—'}{' '}
            <span className="text-[11px] font-normal text-content-subtle">
              / 10
            </span>
          </span>
        </div>
      )}
      <div
        className="flex gap-[3px]"
        onMouseLeave={() => interactive && setHovered(null)}
      >
        {SEGMENTS.map((seg) => {
          const fill = seg <= active ? 'bg-brand' : 'bg-edge';
          const common = `flex-1 h-1.5 rounded-[3px] transition-colors ${fill}`;
          if (!interactive) return <div key={seg} className={common} />;
          return (
            <button
              key={seg}
              type="button"
              aria-label={`Rate ${seg} out of 10`}
              onMouseEnter={() => setHovered(seg)}
              onClick={() => onChange(seg)}
              className={`${common} cursor-pointer`}
            />
          );
        })}
      </div>
      {interactive && current > 0 && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="mt-2 text-xs text-content-subtle hover:text-content-muted"
        >
          Clear
        </button>
      )}
    </div>
  );
}

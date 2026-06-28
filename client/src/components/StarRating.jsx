import { useState } from 'react';

const STARS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(null);
  const current = Number(value) || 0;
  const active = hovered ?? current;

  return (
    <div className="flex items-center gap-2">
      <div className="flex" onMouseLeave={() => setHovered(null)}>
        {STARS.map(star => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onClick={() => onChange(star)}
            aria-label={`Rate ${star} out of 10`}
            className="p-0.5 text-xl leading-none transition-colors"
          >
            <span className={star <= active ? 'text-amber-400' : 'text-gray-600'}>
              ★
            </span>
          </button>
        ))}
      </div>
      <span className="text-sm text-gray-400 w-12 shrink-0">
        {current ? `${current}/10` : '—'}
      </span>
      {current > 0 && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="text-xs text-gray-500 hover:text-gray-300"
        >
          Clear
        </button>
      )}
    </div>
  );
}

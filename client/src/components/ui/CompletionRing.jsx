export default function CompletionRing({
  percent = 0,
  size = 110,
  thickness,
  label,
  sublabel,
  innerClassName = 'bg-surface',
  className = '',
}) {
  const pct = Math.max(0, Math.min(100, percent));
  const pad = thickness ?? Math.round(size * 0.1);
  const display = label ?? `${Math.round(pct)}%`;

  return (
    <div
      className={['relative shrink-0', className].filter(Boolean).join(' ')}
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(oklch(76% 0.19 55) ${pct}%, oklch(14% 0.022 265) 0)`,
        }}
      />
      <div
        className={[
          'absolute rounded-full flex flex-col items-center justify-center',
          innerClassName,
        ]
          .filter(Boolean)
          .join(' ')}
        style={{ inset: pad }}
      >
        {display != null && (
          <span
            className="font-bold text-brand leading-none"
            style={{ fontSize: Math.round(size * 0.22) }}
          >
            {display}
          </span>
        )}
        {sublabel && (
          <span
            className="text-content-subtle mt-0.5"
            style={{ fontSize: Math.round(size * 0.09) }}
          >
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}

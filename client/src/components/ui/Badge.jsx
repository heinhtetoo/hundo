const STATUS_STYLES = {
  backlog:
    'bg-[oklch(58%_0.04_265_/_0.14)] text-[oklch(70%_0.04_265)] ' +
    'border-[oklch(58%_0.04_265_/_0.35)]',
  playing:
    'bg-[oklch(62%_0.18_250_/_0.14)] text-[oklch(72%_0.16_250)] ' +
    'border-[oklch(62%_0.18_250_/_0.35)]',
  completed:
    'bg-[oklch(76%_0.19_55_/_0.14)] text-brand ' +
    'border-[oklch(76%_0.19_55_/_0.35)]',
  dropped:
    'bg-[oklch(58%_0.18_18_/_0.14)] text-[oklch(72%_0.16_18)] ' +
    'border-[oklch(58%_0.18_18_/_0.35)]',
  wishlist:
    'bg-[oklch(62%_0.20_300_/_0.14)] text-[oklch(74%_0.18_300)] ' +
    'border-[oklch(62%_0.20_300_/_0.35)]',
};

function metacriticStyle(score) {
  if (score >= 75) {
    return (
      'bg-[oklch(56%_0.18_145_/_0.14)] text-metacritic ' +
      'border-[oklch(56%_0.18_145_/_0.3)]'
    );
  }
  if (score >= 50) {
    return (
      'bg-[oklch(70%_0.15_85_/_0.14)] text-[oklch(82%_0.15_85)] ' +
      'border-[oklch(70%_0.15_85_/_0.3)]'
    );
  }
  return (
    'bg-[oklch(58%_0.18_18_/_0.14)] text-[oklch(72%_0.16_18)] ' +
    'border-[oklch(58%_0.18_18_/_0.3)]'
  );
}

const TAG = 'bg-white/5 text-content-muted border-white/10';
const COMPLETION =
  'bg-[oklch(76%_0.19_55_/_0.12)] text-brand border-[oklch(76%_0.19_55_/_0.32)]';

export default function Badge({
  variant = 'tag',
  status,
  score,
  className = '',
  children,
  ...props
}) {
  let tone = TAG;
  if (variant === 'status') tone = STATUS_STYLES[status] ?? STATUS_STYLES.backlog;
  else if (variant === 'metacritic') tone = metacriticStyle(score);
  else if (variant === 'completion') tone = COMPLETION;

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full border',
        'px-3 py-1 text-xs font-medium whitespace-nowrap',
        tone,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </span>
  );
}

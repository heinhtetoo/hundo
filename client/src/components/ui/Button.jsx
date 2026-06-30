const VARIANTS = {
  primary:
    'bg-brand text-brand-ink hover:bg-brand-hover hover:-translate-y-0.5 ' +
    'hover:shadow-[0_10px_28px_oklch(76%_0.19_55_/_0.38)]',
  secondary: 'bg-accent text-white hover:bg-accent-hover hover:-translate-y-px',
  outline:
    'bg-transparent text-content border border-edge-strong ' +
    'hover:border-content-faint',
  ghost: 'bg-transparent text-content-muted hover:text-content',
};

const SIZES = {
  sm: 'px-4 py-2 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-[15px] rounded-lg',
  lg: 'px-10 py-4 text-base rounded-lg',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      className={[
        'inline-flex items-center justify-center gap-2 font-semibold',
        'cursor-pointer transition-all',
        'disabled:opacity-50 disabled:pointer-events-none',
        VARIANTS[variant],
        SIZES[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  );
}

export default function Input({ className = '', ...props }) {
  return (
    <input
      className={[
        'w-full box-border px-4 py-3 rounded-lg',
        'bg-surface-input text-content border border-edge',
        'transition-colors',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  );
}

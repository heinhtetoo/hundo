export default function Card({ as: Tag = 'div', className = '', ...props }) {
  return (
    <Tag
      className={[
        'bg-surface-card border border-edge rounded-[14px]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  );
}

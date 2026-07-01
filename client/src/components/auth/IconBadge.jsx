export default function IconBadge({ children, corner, size = 96, className = '' }) {
  return (
    <div className={['relative', className].filter(Boolean).join(' ')}>
      <div
        className="glow absolute -inset-7 rounded-full"
        style={{ '--glow-color': 'oklch(76% 0.19 55 / 0.13)' }}
      />
      <div
        className="relative rounded-full bg-surface-card flex items-center
                   justify-center text-brand
                   border-[1.5px] border-[oklch(76%_0.19_55_/_0.32)]
                   shadow-[0_0_0_8px_oklch(76%_0.19_55_/_0.05),0_0_0_18px_oklch(76%_0.19_55_/_0.025)]"
        style={{ width: size, height: size }}
      >
        {children}
        {corner}
      </div>
    </div>
  );
}

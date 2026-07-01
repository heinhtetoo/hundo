export default function AuthScreen({
  children,
  className = '',
  maxWidthClass = 'max-w-md',
  gapClass = 'gap-7',
  glowColor = 'oklch(76% 0.19 55 / 0.07)',
  glowSize = 640,
  decor = null,
}) {
  return (
    <div className="relative flex-1 flex items-center justify-center px-6 py-16 overflow-hidden">
      <div className="absolute inset-0 dot-grid pointer-events-none" />
      <div
        className="glow absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2"
        style={{
          '--glow-color': glowColor,
          width: glowSize,
          height: glowSize,
        }}
      />
      {decor}
      <div
        className={[
          'relative z-10 w-full flex flex-col items-center text-center',
          maxWidthClass,
          gapClass,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </div>
    </div>
  );
}

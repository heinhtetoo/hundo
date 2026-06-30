export default function AuthScreen({ children, className = '' }) {
  return (
    <div className="relative flex-1 flex items-center justify-center px-6 py-16 overflow-hidden">
      <div className="absolute inset-0 dot-grid pointer-events-none" />
      <div
        className="glow absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 w-[640px] h-[640px]"
        style={{ '--glow-color': 'oklch(76% 0.19 55 / 0.07)' }}
      />
      <div
        className={[
          'relative z-10 w-full max-w-md flex flex-col items-center gap-7 text-center',
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

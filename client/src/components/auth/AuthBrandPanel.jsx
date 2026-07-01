import CompletionRing from '../ui/CompletionRing.jsx';

const SPINES = [
  { gradient: 'oklch(18% 0.12 260), oklch(26% 0.16 282)', done: false },
  { gradient: 'oklch(14% 0.10 152), oklch(22% 0.13 162)', done: true },
  { gradient: 'oklch(12% 0.08 348), oklch(20% 0.12 8)', done: false },
  { gradient: 'oklch(16% 0.10 42), oklch(24% 0.14 56)', done: true },
  { gradient: 'oklch(15% 0.09 222), oklch(23% 0.12 232)', done: false },
  { gradient: 'oklch(16% 0.10 302), oklch(24% 0.14 312)', done: false },
  { gradient: 'oklch(13% 0.08 182), oklch(21% 0.11 192)', done: true },
  { gradient: 'oklch(17% 0.11 342), oklch(25% 0.15 352)', done: false },
];

export default function AuthBrandPanel() {
  return (
    <div
      className="hidden lg:flex w-[496px] shrink-0 flex-col items-center
                 justify-center px-[52px] py-[60px] relative overflow-hidden"
    >
      <div className="absolute inset-0 dot-grid pointer-events-none" />

      <CompletionRing
        percent={100}
        size={164}
        thickness={9}
        label="H"
        labelSize={46}
        innerClassName="bg-surface"
        className="relative z-10 mb-[30px] shadow-[0_0_48px_oklch(76%_0.19_55_/_0.2)] rounded-full"
      />

      <h2 className="relative z-10 text-[28px] font-bold tracking-tight mb-2.5">
        Hundo
      </h2>
      <p className="relative z-10 text-[14px] font-semibold text-brand mb-3">
        Built for completionists.
      </p>
      <p className="relative z-10 text-[14px] leading-relaxed text-content-subtle text-center max-w-[280px]">
        Track your backlog, log completions, and discover what to play next.
      </p>

      <div className="relative z-10 flex gap-[5px] mt-[52px]">
        {SPINES.map((spine, i) => (
          <div
            key={i}
            className="relative w-9 h-[52px] rounded-[5px] shrink-0"
            style={{ background: `linear-gradient(148deg, ${spine.gradient})` }}
          >
            {spine.done && (
              <div className="absolute -top-1.5 -right-1.5 w-[15px] h-[15px] rounded-full bg-brand flex items-center justify-center text-[7px] font-bold text-brand-ink">
                ✓
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

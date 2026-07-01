import CompletionRing from '../ui/CompletionRing.jsx';

export default function AuthBrandMark() {
  return (
    <div className="lg:hidden relative flex flex-col items-center gap-2.5 px-6 pt-9 pb-[22px]">
      <div
        className="absolute inset-x-0 top-0 h-40 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, oklch(76% 0.19 55 / 0.07) 0%, transparent 100%)',
        }}
      />
      <CompletionRing
        percent={100}
        size={76}
        thickness={5}
        label="H"
        labelSize={28}
        innerClassName="bg-surface"
        className="relative z-10 shadow-[0_0_28px_oklch(76%_0.19_55_/_0.22)] rounded-full"
      />
      <p className="relative z-10 text-[12px] font-semibold text-brand">
        Built for completionists.
      </p>
    </div>
  );
}

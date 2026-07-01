import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/ui/Button.jsx';

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (!isLoading && isAuthenticated) return <Navigate to="/backlog" replace />;

  return (
    <div className="relative flex-1 overflow-hidden">
      <div className="absolute inset-0 dot-grid pointer-events-none" />
      <div
        className="glow absolute -left-48 top-1/2 -translate-y-1/2 w-[700px] h-[700px]"
        style={{ '--glow-color': 'oklch(62% 0.24 280 / 0.08)' }}
      />
      <div
        className="glow absolute -right-24 top-1/4 w-[750px] h-[700px]"
        style={{ '--glow-color': 'oklch(62% 0.24 280 / 0.13)' }}
      />

      <div
        className="relative z-10 mx-auto max-w-[1440px] px-6 md:px-28 py-6 lg:py-0
                   lg:min-h-[calc(100vh-68px)] flex flex-col lg:flex-row
                   items-center gap-10"
      >
        <div className="w-full lg:w-auto flex-1 lg:flex-[1.1] max-w-[600px]">
          <span
            className="lg:hidden inline-flex items-center gap-1.5 rounded-full
                       border border-brand/20 bg-brand/10 px-3 py-[5px] mb-5"
          >
            <span className="w-[5px] h-[5px] rounded-full bg-brand" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand">
              Game Backlog Tracker
            </span>
          </span>
          <p
            className="hidden lg:block text-[11px] font-semibold uppercase
                       tracking-[0.18em] text-brand mb-7"
          >
            Game Backlog Tracker
          </p>

          <h1
            className="text-[44px] md:text-[68px] font-bold leading-[1.03]
                       tracking-[-0.03em] text-content mb-4 md:mb-[26px]"
          >
            Your backlog,
            <br />
            <span className="text-brand">actually</span>
            <br />
            managed.
          </h1>
          <p
            className="text-[15px] md:text-[18px] leading-[1.6] md:leading-[1.65]
                       text-content-muted mb-7 md:mb-12 max-w-[390px]"
          >
            Track every game you&apos;ve played, want to play, and 100%&apos;d.
            <span className="hidden md:inline"> Discover what to play next.</span>
          </p>
          <div className="flex gap-[10px] md:gap-3.5">
            <Button as={Link} to="/register" size="lg" className="flex-1 md:flex-none">
              Get started
            </Button>
            <Button as={Link} to="/login" variant="outline" size="lg">
              Sign in
            </Button>
          </div>

          <div className="lg:hidden flex items-end justify-center pt-14 pb-6">
            <div className="relative w-[280px] h-[200px]">
              <div
                className="absolute -inset-5"
                style={{
                  background:
                    'radial-gradient(ellipse at center 45%, oklch(76% 0.19 55 / 0.11) 0%, transparent 65%)',
                }}
              />
              <div
                className="absolute left-[10px] top-[26px] w-[116px] h-[158px]
                           rounded-[11px] rotate-[-8deg]
                           shadow-[0_12px_28px_rgba(0,0,0,0.8)]"
                style={{
                  background:
                    'linear-gradient(148deg, oklch(18% 0.12 260), oklch(26% 0.16 282))',
                }}
              />
              <div
                className="absolute right-[10px] top-[26px] w-[116px] h-[158px]
                           rounded-[11px] rotate-[8deg]
                           shadow-[0_12px_28px_rgba(0,0,0,0.8)]"
                style={{
                  background:
                    'linear-gradient(148deg, oklch(14% 0.10 152), oklch(22% 0.13 162))',
                }}
              />
              <div
                className="absolute left-1/2 top-0 -translate-x-1/2 w-[126px]
                           h-[170px] rounded-[11px] z-[2]
                           shadow-[0_20px_48px_rgba(0,0,0,0.9)]"
                style={{
                  background:
                    'linear-gradient(148deg, oklch(12% 0.08 348), oklch(20% 0.13 8))',
                }}
              >
                <div
                  className="absolute -top-3 -right-3 w-[38px] h-[38px]
                             rounded-full bg-brand flex items-center
                             justify-center z-[3]
                             shadow-[0_4px_12px_oklch(76%_0.19_55_/_0.55)]"
                >
                  <span className="text-[8px] font-bold text-brand-ink">100%</span>
                </div>
                <div className="p-3.5 flex flex-col gap-1.5">
                  <div className="h-[2px] w-[68%] bg-white/10 rounded" />
                  <div className="h-[2px] w-[44%] bg-white/[0.07] rounded" />
                </div>
                <span className="absolute bottom-3 left-3 text-[7px] font-semibold uppercase tracking-[0.12em] text-brand/80">
                  Completed ✓
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex flex-1 items-center justify-center relative">
          <div
            className="glow absolute w-[380px] h-[380px] animate-glowPulse"
            style={{ '--glow-color': 'oklch(62% 0.24 280 / 0.2)' }}
          />
          <div className="relative w-[420px] h-[500px]">
            <div
              className="absolute left-0 top-[100px] w-[186px] h-[248px]
                         rounded-2xl shadow-2xl animate-floatA p-5"
              style={{
                background:
                  'linear-gradient(148deg, oklch(18% 0.12 260), oklch(26% 0.16 282))',
              }}
            >
              <div className="h-[3px] w-[65%] bg-white/10 rounded mb-2" />
              <div className="h-[3px] w-[42%] bg-white/5 rounded" />
              <span className="absolute bottom-5 left-5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/20">
                Backlog
              </span>
            </div>

            <div
              className="absolute left-[108px] top-[38px] w-[190px] h-[252px]
                         rounded-2xl shadow-2xl animate-floatB p-5"
              style={{
                background:
                  'linear-gradient(148deg, oklch(14% 0.10 152), oklch(22% 0.13 162))',
              }}
            >
              <div className="h-[3px] w-[72%] bg-white/10 rounded mb-2" />
              <div className="h-[3px] w-[50%] bg-white/5 rounded" />
              <span className="absolute bottom-5 left-5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/20">
                Playing
              </span>
            </div>

            <div
              className="absolute left-[218px] top-0 w-[204px] h-[272px] z-10
                         rounded-2xl shadow-2xl animate-floatC p-5"
              style={{
                background:
                  'linear-gradient(148deg, oklch(12% 0.08 348), oklch(20% 0.13 8))',
              }}
            >
              <div className="h-[3px] w-[78%] bg-white/[0.15] rounded mb-2" />
              <div className="h-[3px] w-[55%] bg-white/[0.08] rounded" />
              <div
                className="absolute -top-4 -right-4 w-[54px] h-[54px] rounded-full
                           bg-brand flex items-center justify-center
                           shadow-[0_4px_22px_oklch(76%_0.19_55_/_0.6)]"
              >
                <span className="text-[11px] font-bold text-brand-ink">
                  100%
                </span>
              </div>
              <span className="absolute bottom-5 left-5 text-[9px] font-semibold uppercase tracking-[0.14em] text-brand/85">
                Completed ✓
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
        className="relative z-10 mx-auto max-w-6xl px-6 md:px-12 py-16 lg:py-0
                   lg:min-h-[calc(100vh-68px)] flex flex-col lg:flex-row
                   items-center gap-12"
      >
        <div className="flex-1 max-w-xl text-center lg:text-left">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.18em]
                       text-brand mb-7"
          >
            Game Backlog Tracker
          </p>
          <h1
            className="text-5xl md:text-6xl font-bold leading-[1.03]
                       tracking-tight text-content mb-6"
          >
            Your backlog,
            <br />
            <span className="text-brand">actually</span>
            <br />
            managed.
          </h1>
          <p className="text-lg leading-relaxed text-content-muted mb-12 max-w-md mx-auto lg:mx-0">
            Track every game you&apos;ve played, want to play, and 100%&apos;d.
            Discover what to play next.
          </p>
          <div className="flex flex-wrap gap-3.5 justify-center lg:justify-start">
            <Button as={Link} to="/register" size="lg">
              Get started
            </Button>
            <Button as={Link} to="/login" variant="outline" size="lg">
              Sign in
            </Button>
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

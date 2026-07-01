import { Link, Outlet, useLocation } from 'react-router-dom';

export default function PublicLayout() {
  const { pathname } = useLocation();
  const isLogin = pathname === '/login';
  const isRegister = pathname === '/register';
  const isLanding = pathname === '/';

  // Landing keeps the filled Register button on all sizes; the auth pages use a
  // plain text link on mobile (per the mobile design) and the filled button on lg.
  const registerButtonCls = isLanding
    ? 'bg-accent hover:bg-accent-hover text-white font-semibold px-[22px] py-2.5 rounded-[7px]'
    : 'text-content-muted hover:text-content lg:text-white lg:hover:text-white lg:font-semibold lg:bg-accent lg:hover:bg-accent-hover lg:px-[22px] lg:py-2.5 lg:rounded-[7px]';

  return (
    <div className="min-h-screen flex flex-col">
      <nav
        className="flex items-center justify-between h-[68px] px-5 md:px-28
                   border-b border-edge-subtle shrink-0"
      >
        <Link
          to="/"
          className="text-[21px] font-bold text-brand tracking-[-0.02em]"
        >
          Hundo
        </Link>
        <div className="flex items-center gap-7">
          <Link
            to="/login"
            className={`text-[15px] text-content-muted hover:text-content
                       transition-colors ${isLogin ? 'max-lg:hidden' : ''}`}
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className={`text-[15px] transition-colors ${registerButtonCls} ${
              isRegister ? 'max-lg:hidden' : ''
            }`}
          >
            Register
          </Link>
        </div>
      </nav>
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}

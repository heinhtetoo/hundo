import { Link, Outlet } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav
        className="flex items-center justify-between h-[68px] px-6 md:px-28
                   border-b border-edge-subtle shrink-0"
      >
        <Link to="/" className="text-xl font-bold text-brand tracking-tight">
          Hundo
        </Link>
        <div className="flex items-center gap-7">
          <Link
            to="/login"
            className="text-[15px] text-content-muted hover:text-content
                       transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="bg-accent hover:bg-accent-hover text-white text-[15px]
                       font-semibold px-5 py-2.5 rounded-lg transition-colors"
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

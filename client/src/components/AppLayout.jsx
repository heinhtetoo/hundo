import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ErrorBoundary } from './ErrorBoundary.jsx';
import Navbar from './Navbar.jsx';
import MobileTabBar from './MobileTabBar.jsx';

export function AppLayout() {
  const { isAuthenticated } = useAuth();
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen">
      {isAuthenticated && <Navbar />}
      <main className="pb-[72px] md:pb-0">
        <ErrorBoundary resetKey={pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
      {isAuthenticated && <MobileTabBar />}
    </div>
  );
}

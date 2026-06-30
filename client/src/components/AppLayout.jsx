import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from './Navbar.jsx';
import MobileTabBar from './MobileTabBar.jsx';

export default function AppLayout() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {isAuthenticated && <Navbar />}
      <main className="pb-[72px] md:pb-0">
        <Outlet />
      </main>
      {isAuthenticated && <MobileTabBar />}
    </div>
  );
}

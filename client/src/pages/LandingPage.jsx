import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (!isLoading && isAuthenticated) return <Navigate to="/backlog" replace />;

  return (
    <div className="text-center py-24">
      <h1 className="text-6xl font-bold text-white mb-4">Hundo</h1>
      <p className="text-xl text-gray-400 mb-12 max-w-lg mx-auto leading-relaxed">
        Track every game you've played, want to play, and everything in between.
      </p>
      <div className="flex gap-4 justify-center">
        <Link
          to="/register"
          className="bg-indigo-600 hover:bg-indigo-500 text-white
                     px-8 py-3 rounded-lg font-medium transition-colors"
        >
          Get started
        </Link>
        <Link
          to="/login"
          className="bg-gray-800 hover:bg-gray-700 text-white
                     px-8 py-3 rounded-lg font-medium transition-colors"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}

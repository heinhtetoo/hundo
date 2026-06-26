import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext.jsx';
import { API_BASE } from '../lib/api.js';

function useGameSearch(query) {
  return useQuery({
    queryKey: ['gameSearch', query],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE}/api/v1/games/search?q=${encodeURIComponent(query)}`,
        { credentials: 'include' },
      );
      if (!res.ok) return { games: [] };
      return res.json();
    },
    enabled: query.trim().length >= 2,
    staleTime: 60_000,
  });
}

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  const { data } = useGameSearch(query);
  const results = data?.games ?? [];

  useEffect(() => {
    function onClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function handleSelect(game) {
    setQuery('');
    setShowResults(false);
    navigate(`/games/${game.id}`);
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center gap-4">
        <Link to="/" className="text-xl font-bold text-indigo-400 shrink-0">
          Hundo
        </Link>

        {isAuthenticated && (
          <div className="relative flex-1 max-w-md" ref={wrapperRef}>
            <input
              type="text"
              placeholder="Search games to add..."
              value={query}
              onChange={e => { setQuery(e.target.value); setShowResults(true); }}
              onFocus={() => setShowResults(true)}
              onKeyDown={e => e.key === 'Escape' && setShowResults(false)}
              className="w-full bg-gray-800 text-white placeholder-gray-500 rounded-lg
                         px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {showResults && results.length > 0 && (
              <ul className="absolute top-full mt-1 w-full bg-gray-800 border
                             border-gray-700 rounded-lg shadow-xl z-50 max-h-80
                             overflow-y-auto">
                {results.map(game => (
                  <li
                    key={game.id}
                    onClick={() => handleSelect(game)}
                    className="flex items-center gap-3 px-4 py-2.5
                               hover:bg-gray-700 cursor-pointer"
                  >
                    {game.background_image ? (
                      <img
                        src={game.background_image}
                        alt=""
                        className="w-10 h-7 object-cover rounded shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-7 bg-gray-700 rounded shrink-0" />
                    )}
                    <span className="text-sm text-white line-clamp-1">
                      {game.name}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="ml-auto flex items-center gap-5 shrink-0">
          {isAuthenticated ? (
            <>
              <Link
                to="/backlog"
                className="text-sm text-gray-300 hover:text-white"
              >
                Backlog
              </Link>
              <Link
                to="/dashboard"
                className="text-sm text-gray-300 hover:text-white"
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="text-sm text-gray-400 hover:text-white"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-gray-300 hover:text-white"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="text-sm bg-indigo-600 hover:bg-indigo-500
                           text-white px-4 py-1.5 rounded-lg"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

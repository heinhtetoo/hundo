import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext.jsx';
import { apiFetch } from '../lib/api.js';

function useGameSearch(query) {
  return useQuery({
    queryKey: ['gameSearch', query],
    queryFn: async () => {
      const res = await apiFetch(
        `/api/v1/games/search?q=${encodeURIComponent(query)}`,
      );
      if (!res.ok) return { games: [] };
      return res.json();
    },
    enabled: query.trim().length >= 2,
    staleTime: 60_000,
  });
}

function navLinkClass({ isActive }) {
  return [
    'text-[15px] pb-0.5 border-b-2 transition-colors',
    isActive
      ? 'text-brand border-brand font-semibold'
      : 'text-content-subtle border-transparent hover:text-content',
  ].join(' ');
}

export default function Navbar() {
  const { logout } = useAuth();
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
    <nav
      className="flex items-center gap-4 h-16 px-4 md:px-20
                 border-b border-edge-subtle"
    >
      <Link
        to="/backlog"
        className="text-xl font-bold text-brand tracking-tight shrink-0"
      >
        Hundo
      </Link>

      <div className="relative flex-1 max-w-xs" ref={wrapperRef}>
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5
                     text-content opacity-30 pointer-events-none"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search games to add…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          onKeyDown={(e) => e.key === 'Escape' && setShowResults(false)}
          className="w-full bg-surface-input text-content rounded-lg border
                     border-edge pl-9 pr-4 py-2 text-sm transition-colors"
        />
        {showResults && results.length > 0 && (
          <ul
            className="absolute top-full mt-1 w-full bg-surface-card border
                       border-edge rounded-lg shadow-xl z-50 max-h-80
                       overflow-y-auto"
          >
            {results.map((game) => (
              <li
                key={game.id}
                onClick={() => handleSelect(game)}
                className="flex items-center gap-3 px-4 py-2.5
                           hover:bg-surface-input cursor-pointer"
              >
                {game.background_image ? (
                  <img
                    src={game.background_image}
                    alt=""
                    className="w-10 h-7 object-cover rounded shrink-0"
                  />
                ) : (
                  <div className="w-10 h-7 bg-surface-input rounded shrink-0" />
                )}
                <span className="text-sm text-content line-clamp-1">
                  {game.name}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="ml-auto flex items-center gap-6 shrink-0">
        <div className="hidden md:flex items-center gap-6">
          <NavLink to="/backlog" className={navLinkClass}>
            Backlog
          </NavLink>
          <NavLink to="/discover" className={navLinkClass}>
            Discover
          </NavLink>
          <NavLink to="/profile" className={navLinkClass}>
            Profile
          </NavLink>
        </div>
        <button
          onClick={logout}
          className="text-sm font-medium text-content-subtle border border-edge
                     rounded-lg px-4 py-1.5 hover:text-content
                     hover:border-edge-strong transition-colors"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}

import { Link } from 'react-router-dom';

export default function GameCard({ game }) {
  return (
    <Link
      to={`/games/${game.id}`}
      className="bg-gray-800 rounded-xl overflow-hidden hover:ring-2
                 hover:ring-indigo-500 transition-all block"
    >
      {game.background_image ? (
        <img
          src={game.background_image}
          alt={game.name}
          className="w-full h-36 object-cover"
        />
      ) : (
        <div className="w-full h-36 bg-gray-700 flex items-center justify-center">
          <span className="text-gray-500 text-xs">No image</span>
        </div>
      )}
      <div className="p-3">
        <h3 className="font-medium text-white text-sm line-clamp-1">
          {game.name}
        </h3>
        {game.released && (
          <p className="text-xs text-gray-400 mt-1">
            {game.released.slice(0, 4)}
          </p>
        )}
      </div>
    </Link>
  );
}

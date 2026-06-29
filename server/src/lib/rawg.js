const BASE_URL = () => process.env.RAWG_BASE_URL ?? 'https://api.rawg.io/api';

function buildUrl(path, params = {}) {
  const url = new URL(`${BASE_URL()}${path}`);
  url.searchParams.set('key', process.env.RAWG_API_KEY ?? '');
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  return url.toString();
}

function trimGame(game) {
  return {
    id: game.id,
    name: game.name,
    background_image: game.background_image ?? null,
    genres: game.genres ?? [],
    platforms: (game.platforms ?? []).map(p => p.platform),
    rating: game.rating ?? null,
    released: game.released ?? null,
  };
}

function rawgError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function searchGames(query) {
  const url = buildUrl('/games', { search: query, page_size: 20 });
  const response = await fetch(url);
  if (!response.ok) {
    throw rawgError('RAWG search failed', 502);
  }
  const data = await response.json();
  return (data.results ?? []).map(trimGame);
}

function detailExtras(game) {
  return {
    description_raw: game.description_raw ?? '',
    metacritic: game.metacritic ?? null,
    rating_count: game.ratings_count ?? null,
    developers: (game.developers ?? []).map(d => d.name),
    publishers: (game.publishers ?? []).map(p => p.name),
    esrb_rating: game.esrb_rating?.name ?? null,
    playtime: game.playtime ?? null,
    website: game.website ?? null,
  };
}

async function getGameById(rawgId) {
  const url = buildUrl(`/games/${rawgId}`);
  const response = await fetch(url);
  if (response.status === 404) {
    throw rawgError('Game not found', 404);
  }
  if (!response.ok) {
    throw rawgError('RAWG request failed', 502);
  }
  const game = await response.json();
  return { ...trimGame(game), ...detailExtras(game) };
}

async function getGameScreenshots(rawgId) {
  const url = buildUrl(`/games/${rawgId}/screenshots`);
  const response = await fetch(url);
  if (response.status === 404) {
    throw rawgError('Game not found', 404);
  }
  if (!response.ok) {
    throw rawgError('RAWG request failed', 502);
  }
  const data = await response.json();
  return (data.results ?? []).map(s => ({ id: s.id, image: s.image }));
}

async function listGames(params = {}) {
  const url = buildUrl('/games', { page_size: 20, ...params });
  const response = await fetch(url);
  if (!response.ok) {
    throw rawgError('RAWG list failed', 502);
  }
  const data = await response.json();
  return {
    results: (data.results ?? []).map(trimGame),
    hasNext: !!data.next,
  };
}

async function getGenres() {
  const url = buildUrl('/genres', { page_size: 40 });
  const response = await fetch(url);
  if (!response.ok) {
    throw rawgError('RAWG genres failed', 502);
  }
  const data = await response.json();
  return (data.results ?? []).map(g => ({ id: g.id, name: g.name, slug: g.slug }));
}

async function getPlatforms() {
  const url = buildUrl('/platforms', { page_size: 40 });
  const response = await fetch(url);
  if (!response.ok) {
    throw rawgError('RAWG platforms failed', 502);
  }
  const data = await response.json();
  return (data.results ?? []).map(p => ({ id: p.id, name: p.name, slug: p.slug }));
}

module.exports = { searchGames, getGameById, getGameScreenshots, listGames, getGenres, getPlatforms };

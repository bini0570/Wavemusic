import { apiUrl } from './apiConfig.js';

function normalizeTrack(item) {
  const rawArt = item.artworkUrl100 || '';
  const highResArt = rawArt.replace('100x100bb', '600x600bb').replace('100x100', '600x600');

  return {
    id: String(item.trackId || Math.random().toString(36).substring(2, 9)),
    title: item.trackName || 'Unknown Title',
    artist: item.artistName || 'Unknown Artist',
    album: item.collectionName || 'Single / Collection',
    artworkUrl: highResArt || rawArt,
    previewUrl: item.previewUrl || '',
    trackTimeMillis: item.trackTimeMillis,
    previewDurationSec: item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : 210,
    genre: item.primaryGenreName || 'Music',
    releaseDate: item.releaseDate ? item.releaseDate.split('T')[0] : undefined,
    trackViewUrl: item.trackViewUrl,
    isExplicit: item.trackExplicitness === 'explicit',
  };
}

/**
 * Executes a JSONP request for iTunes Search API when standard CORS fetch fails
 */
function jsonpSearch(term, limit = 35) {
  return new Promise((resolve, reject) => {
    const callbackName = `itunes_jsonp_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const script = document.createElement('script');
    
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('JSONP request timed out'));
    }, 6000);

    const cleanup = () => {
      clearTimeout(timer);
      if (script.parentNode) script.parentNode.removeChild(script);
      delete window[callbackName];
    };

    window[callbackName] = (data) => {
      cleanup();
      if (!data || !data.results) {
        resolve([]);
        return;
      }
      const valid = data.results
        .filter((t) => Boolean(t.previewUrl))
        .map(normalizeTrack);
      resolve(valid);
    };

    script.src = `https://itunes.apple.com/search?term=${encodeURIComponent(
      term
    )}&entity=song&limit=${limit}&callback=${callbackName}`;
    script.onerror = () => {
      cleanup();
      reject(new Error('Script tag load error'));
    };

    document.head.appendChild(script);
  });
}

export async function searchTracks(query) {
  const trimmed = query.trim();
  if (!trimmed) return [];

  // Strategy 1: Backend proxy `/api/itunes/search`
  try {
    const proxyUrl = apiUrl(`/api/itunes/search?term=${encodeURIComponent(
      trimmed
    )}&entity=song&limit=36`);
    const res = await fetch(proxyUrl, { headers: { Accept: 'application/json' } });
    if (res.ok) {
      const data = await res.json();
      const valid = (data.results || [])
        .filter((t) => Boolean(t.previewUrl))
        .map(normalizeTrack);
      if (valid.length > 0) {
        return valid;
      }
    }
  } catch {}

  // Strategy 2: Direct JSONP
  try {
    const jsonpResults = await jsonpSearch(trimmed, 36);
    if (jsonpResults.length > 0) {
      return jsonpResults;
    }
  } catch {}

  // Strategy 3: Direct fetch with CORS
  try {
    const directUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(
      trimmed
    )}&entity=song&limit=36`;
    const res = await fetch(directUrl);
    if (res.ok) {
      const data = await res.json();
      const valid = (data.results || [])
        .filter((t) => Boolean(t.previewUrl))
        .map(normalizeTrack);
      if (valid.length > 0) {
        return valid;
      }
    }
  } catch {}

  return [];
}

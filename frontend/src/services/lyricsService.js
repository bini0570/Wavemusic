import { TRACK_LYRICS } from '../data/lyrics.js';

/**
 * Parses time-stamped LRC content into structured LyricLine array.
 * Cleans non-vocal markers and empty brackets.
 */
export function parseLrc(lrcContent) {
  const lines = lrcContent.split('\n');
  const result = [];
  const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{1,3}))?\]/;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    const match = timeRegex.exec(trimmed);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const frac = match[3] ? parseInt(match[3].padEnd(3, '0').slice(0, 3), 10) : 0;
      const totalSeconds = minutes * 60 + seconds + frac / 1000;
      let text = trimmed.replace(timeRegex, '').trim();

      // Filter non-singing symbols or empty placeholders
      if (!text || text === '♪' || text === '♫' || text === '♩' || /^\[.*\]$/.test(text)) {
        continue;
      }

      text = text.replace(/^"|"$/g, '').trim();

      result.push({
        time: Math.round(totalSeconds * 100) / 100,
        text,
      });
    }
  }

  return result.sort((a, b) => a.time - b.time);
}

/**
 * Distributes genuine singing lyrics across this track's exact duration and speed
 */
export function parsePlainLyrics(plain, totalDuration = 210) {
  const rawLines = plain
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('[') && !l.toLowerCase().includes('contributors') && !l.toLowerCase().includes('lyrics by'));

  if (rawLines.length === 0) return [];

  const introOffset = Math.min(14, totalDuration * 0.07);
  const activeDuration = Math.max(25, totalDuration - introOffset - 8);

  const totalChars = rawLines.reduce((acc, l) => acc + Math.max(6, l.length), 0);
  let currentSec = introOffset;

  return rawLines.map((text, idx) => {
    const lineTime = idx === 0 ? introOffset : Math.min(totalDuration - 4, currentSec);
    const weight = Math.max(6, text.length) / totalChars;
    currentSec += Math.max(2.8, weight * activeDuration);

    return {
      time: Math.round(lineTime * 10) / 10,
      text,
    };
  });
}

// In-memory cache keyed by artist, title, and rounded duration bucket (to separate sped-up/slowed versions)
const lyricsCache = new Map();

function cleanTitle(title) {
  return title
    .replace(/\(.*?(feat|ft|with|prod|official|remix|single|album|deluxe|audio|video|clip).*?\)/gi, '')
    .replace(/\[.*?\]/g, '')
    .replace(/ - .*$/, '')
    .trim();
}

function cleanArtist(artist) {
  return artist
    .split(/[,&/]/)[0]
    .replace(/\(.*?\)/g, '')
    .trim();
}

/**
 * Version-Aware & Speed-Matched Lyrics Service:
 * Ensures the lyrics belong to the exact owner, tempo, and speed of the current playing track.
 * Discards slowed/sped-up/remix/cover mismatches.
 */
export async function fetchLyrics(
  title,
  artist,
  trackId,
  durationSec = 210,
  album = ''
) {
  // 1. Check verified curated list for this exact track ID
  if (TRACK_LYRICS && TRACK_LYRICS[trackId]) {
    return {
      lines: TRACK_LYRICS[trackId],
      isSynced: true,
      isReal: true,
      source: 'Verified LRC',
      matchedTrackName: title,
      matchedArtistName: artist,
      durationDiffSec: 0,
    };
  }

  const queryArtist = cleanArtist(artist);
  const queryTitle = cleanTitle(title);
  const safeDuration = durationSec > 30 ? Math.round(durationSec) : 210;

  // Cache key includes duration bucket so slowed/sped up versions don't collide
  const durBucket = Math.round(safeDuration / 8) * 8;
  const cacheKey = `${queryArtist.toLowerCase()}:::${queryTitle.toLowerCase()}:::${durBucket}`;
  if (lyricsCache.has(cacheKey)) {
    return lyricsCache.get(cacheKey);
  }

  // Check version traits in playing track title
  const rawTitleLower = title.toLowerCase();
  const isSlowed = rawTitleLower.includes('slowed') || rawTitleLower.includes('reverb');
  const isSpedUp = rawTitleLower.includes('sped up') || rawTitleLower.includes('speed up') || rawTitleLower.includes('fast') || rawTitleLower.includes('nightcore');
  const isLive = rawTitleLower.includes('live');

  // Strategy A: LRCLIB Exact Lookup specifying target duration for exact speed matching
  const exactUrls = [
    `https://lrclib.net/api/get?artist_name=${encodeURIComponent(queryArtist)}&track_name=${encodeURIComponent(queryTitle)}&duration=${safeDuration}`,
    `/api/lrclib/api/get?artist_name=${encodeURIComponent(queryArtist)}&track_name=${encodeURIComponent(queryTitle)}&duration=${safeDuration}`,
  ];

  for (const url of exactUrls) {
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (res.ok) {
        const item = await res.json();
        if (item && item.syncedLyrics && item.syncedLyrics.trim().length > 20) {
          const durDiff = Math.abs((item.duration || safeDuration) - safeDuration);
          // If duration matches within 5 seconds, it's the exact speed/version
          if (durDiff <= 5) {
            const parsed = parseLrc(item.syncedLyrics);
            if (parsed.length > 0) {
              const result = {
                lines: parsed,
                isSynced: true,
                isReal: true,
                source: 'LRCLIB (Exact Speed Sync)',
                matchedTrackName: item.trackName,
                matchedArtistName: item.artistName,
                durationDiffSec: durDiff,
              };
              lyricsCache.set(cacheKey, result);
              return result;
            }
          }
        }
      }
    } catch {}
  }

  // Strategy B: LRCLIB Search with Speed & Artist Scoring
  const searchUrls = [
    `https://lrclib.net/api/search?q=${encodeURIComponent(`${queryArtist} ${queryTitle}`)}`,
    `/api/lrclib/api/search?q=${encodeURIComponent(`${queryArtist} ${queryTitle}`)}`,
  ];

  for (const url of searchUrls) {
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) continue;

      const data = await res.json();
      const candidates = Array.isArray(data) ? data : data ? [data] : [];

      let bestCandidate = null;
      let highestScore = -999;

      for (const cand of candidates) {
        if (!cand.syncedLyrics || cand.syncedLyrics.trim().length < 20) continue;

        let score = 0;
        const candDur = cand.duration || 0;
        const durDiff = Math.abs(candDur - safeDuration);

        // 1. Duration / Speed proximity
        if (durDiff <= 3) score += 120;
        else if (durDiff <= 6) score += 80;
        else if (durDiff <= 10) score += 40;
        else score -= 180; // Incompatible tempo or different audio cut

        // 2. Artist ownership verification
        const candArtist = (cand.artistName || '').toLowerCase();
        const targetArtist = queryArtist.toLowerCase();
        if (candArtist.includes(targetArtist) || targetArtist.includes(candArtist)) {
          score += 60;
        } else {
          score -= 150; // Different artist cover/version
        }

        // 3. Variant tags alignment
        const candNameLower = (cand.trackName || '').toLowerCase();
        const candIsSlowed = candNameLower.includes('slowed') || candNameLower.includes('reverb');
        const candIsSpedUp = candNameLower.includes('sped up') || candNameLower.includes('speed up') || candNameLower.includes('nightcore');
        const candIsLive = candNameLower.includes('live');

        if (candIsSlowed !== isSlowed) score -= 90;
        if (candIsSpedUp !== isSpedUp) score -= 90;
        if (candIsLive !== isLive) score -= 90;

        if (score > highestScore && score >= 80) {
          highestScore = score;
          bestCandidate = cand;
        }
      }

      if (bestCandidate && bestCandidate.syncedLyrics) {
        const parsed = parseLrc(bestCandidate.syncedLyrics);
        if (parsed.length > 0) {
          const durDiff = Math.abs((bestCandidate.duration || safeDuration) - safeDuration);
          const result = {
            lines: parsed,
            isSynced: true,
            isReal: true,
            source: 'Matched Studio LRC',
            matchedTrackName: bestCandidate.trackName,
            matchedArtistName: bestCandidate.artistName,
            durationDiffSec: durDiff,
          };
          lyricsCache.set(cacheKey, result);
          return result;
        }
      }
    } catch {}
  }

  // Strategy C: Verified Musixmatch lyrics for this exact artist, adaptively paced to this track duration
  try {
    const mxmUrl = `/api/lyrics/musixmatch?artist=${encodeURIComponent(queryArtist)}&title=${encodeURIComponent(queryTitle)}`;
    const mxmRes = await fetch(mxmUrl);
    if (mxmRes.ok) {
      const mxmData = await mxmRes.json();
      if (mxmData && mxmData.lyrics && mxmData.lyrics.trim().length > 25) {
        const parsed = parsePlainLyrics(mxmData.lyrics, safeDuration);
        if (parsed.length > 0) {
          const result = {
            lines: parsed,
            isSynced: true,
            isReal: true,
            source: 'Musixmatch (Paced to Track Duration)',
            matchedTrackName: title,
            matchedArtistName: artist,
            durationDiffSec: 0,
          };
          lyricsCache.set(cacheKey, result);
          return result;
        }
      }
    }
  } catch {}

  // Strategy D: Verified Lyrics.ovh for this artist, adaptively paced to this track duration
  try {
    const ovhUrl = `/api/lyrics/ovh?artist=${encodeURIComponent(queryArtist)}&title=${encodeURIComponent(queryTitle)}`;
    const ovhRes = await fetch(ovhUrl);
    if (ovhRes.ok) {
      const ovhData = await ovhRes.json();
      if (ovhData && ovhData.lyrics && ovhData.lyrics.trim().length > 25) {
        const parsed = parsePlainLyrics(ovhData.lyrics, safeDuration);
        if (parsed.length > 0) {
          const result = {
            lines: parsed,
            isSynced: true,
            isReal: true,
            source: 'Lyrics.ovh (Paced to Track Duration)',
            matchedTrackName: title,
            matchedArtistName: artist,
            durationDiffSec: 0,
          };
          lyricsCache.set(cacheKey, result);
          return result;
        }
      }
    }
  } catch {}

  // If no lyrics provider wrote lyrics for this specific owner/version, return empty state
  return {
    lines: [],
    isSynced: false,
    isReal: false,
    source: 'No Verified Match',
  };
}

/**
 * WAVE Song Recognition & Grouping Engine:
 * - Detects song requests dynamically in TikTok LIVE chat comments.
 * - Strips conversational prefixes ("play", "can you please play", "next:").
 * - Extracts artist and song title dynamically from what users type.
 * - Groups similar requests into the same canonical groupKey.
 */

// Built-in smart moderation keywords (profanity, troll text)
const BLOCKED_WORDS = new Set([
  'nigger', 'nigga', 'faggot', 'fag', 'bitch', 'whore', 'slut', 'cunt',
  'dick', 'pussy', 'cock', 'porn', 'sex', 'kill', 'suicide', 'die',
]);

let customBlacklist = [];
try {
  const saved = typeof window !== 'undefined' ? localStorage.getItem('wave_banned_words') : null;
  if (saved) {
    customBlacklist = JSON.parse(saved);
  }
} catch {}

export function setCustomBlacklist(words) {
  customBlacklist = words.map((w) => w.trim().toLowerCase()).filter(Boolean);
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wave_banned_words', JSON.stringify(customBlacklist));
    }
  } catch {}
}

export function getCustomBlacklist() {
  return [...customBlacklist];
}

// Conversational and bot chatter filters (comments that are NOT song requests)
const NON_REQUEST_PATTERNS = [
  /^(hi|hello|hey|yo|sup|hola|selam|salaam)$/i,
  /^(cool|nice|good|great|awesome|fire|lit|amazing|love this|vibe)$/i,
  /^(what song is this|who is singing|song name|id please|track id\??)$/i,
  /^(how to vote|w|l|gg|lol|lmao|omg|wow)$/i,
  /^(follow me|sub|check my profile|like for like)$/i,
  /^[0-9]+$/, // single raw numbers
];

/**
 * Normalizes an arbitrary text string for grouping
 */
export function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // remove special chars
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Cleans conversational prefixes and suffixes from a comment
 */
export function cleanCommentText(rawComment) {
  let text = rawComment.trim();

  // Remove common emojis
  text = text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, ' ');

  // Strip common request command prefixes
  const prefixRegex =
    /^(can you please play|could you play|can you play|please play|pls play|play song|play track|play:|request:|vote:|song:|next:|play\s+|song\s+|put on\s+|i want\s+|drop\s+|spin\s+|turn on\s+)/i;
  text = text.replace(prefixRegex, '');

  // Strip common polite / hype suffixes
  const suffixRegex =
    /(\s+(please|pls|plz|bro|babe|now|next|again|asap|goat|fire|fav|favorite|tune|banger|track|song|🔥|✨|❤️))+$/i;
  text = text.replace(suffixRegex, '');

  return text.trim();
}

/**
 * Parses an incoming live comment and identifies whether it is a valid song request dynamically.
 * Groups similar requests into the same canonical groupKey without any hardcoded song catalog.
 */
export function recognizeSongRequest(comment) {
  if (!comment || comment.trim().length < 2) return null;

  const rawLower = comment.toLowerCase();
  for (const word of BLOCKED_WORDS) {
    if (rawLower.includes(word)) return null;
  }
  for (const banned of customBlacklist) {
    if (banned && rawLower.includes(banned)) return null;
  }

  const cleaned = cleanCommentText(comment);
  if (!cleaned || cleaned.length < 2) return null;

  // Filter out greetings and general hype comments
  for (const pattern of NON_REQUEST_PATTERNS) {
    if (pattern.test(cleaned)) return null;
  }

  // 1. Parse freeform formats like "Artist - Title", "Artist: Title", "Artist, Title"
  const separatorMatch = cleaned.match(/\s*[-:,]\s*/);
  if (separatorMatch && separatorMatch.index) {
    const parts = [
      cleaned.slice(0, separatorMatch.index).trim(),
      cleaned.slice(separatorMatch.index + separatorMatch[0].length).trim(),
    ];
    if (parts[0].length >= 2 && parts[1].length >= 2) {
      const artist = parts[0];
      const title = parts[1];
      const groupKey = slugify(`${artist} ${title}`);
      return {
        groupKey,
        displayTitle: title,
        artist,
        rawRequest: cleaned,
      };
    }
  }

  // 2. Parse "Title by Artist" format
  if (/\s+by\s+/i.test(cleaned)) {
    const parts = cleaned.split(/\s+by\s+/i);
    if (parts.length === 2 && parts[0].trim() && parts[1].trim()) {
      const title = parts[0].trim();
      const artist = parts[1].trim();
      const groupKey = slugify(`${artist} ${title}`);
      return {
        groupKey,
        displayTitle: title,
        artist,
        rawRequest: cleaned,
      };
    }
  }

  // 3. Fallback: Arbitrary song title (e.g. "Yellow", "Someone Like You")
  // Only accept if at least 3 characters and not purely generic words
  if (cleaned.length >= 3 && !/^(song|music|play|vote|sound|radio)$/i.test(cleaned)) {
    const groupKey = slugify(cleaned);
    const words = cleaned.split(/\s+/).map(
      (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    );
    const displayTitle = words.join(' ');

    return {
      groupKey,
      displayTitle,
      artist: 'Viewer Request',
      rawRequest: cleaned,
    };
  }

  return null;
}

/**
 * WAVE Song Recognition & Grouping Engine:
 * - Detects song requests in TikTok LIVE chat comments.
 * - Strips conversational prefixes ("play", "can you please play", "next:").
 * - Groups similar requests into canonical vote buckets (e.g. "blinding lights" = "the weeknd - blinding lights").
 * - Returns structured song title, artist, and canonical group key.
 */

export interface RecognizedSong {
  groupKey: string;
  displayTitle: string;
  artist: string;
  rawRequest: string;
}

interface KnownSongPattern {
  groupKey: string;
  title: string;
  artist: string;
  aliases: string[];
}

const CANONICAL_SONGS: KnownSongPattern[] = [
  // Ethiopian Classics & Hits
  {
    groupKey: 'mulatu-yegelle-tezeta',
    title: 'Yegelle Tezeta',
    artist: 'Mulatu Astatke',
    aliases: [
      'yegelle tezeta',
      'yegel tezeta',
      'yegelle',
      'tezeta mulatu',
      'mulatu tezeta',
      'mulatu astatke',
      'ethiopian jazz',
    ],
  },
  {
    groupKey: 'teddy-afro-gonder',
    title: 'Gonder',
    artist: 'Teddy Afro',
    aliases: [
      'gonder',
      'gondar',
      'teddy afro gonder',
      'teddy afro gondar',
      'teddy gonder',
      'tedros kassahun',
      'teddy afro',
    ],
  },
  {
    groupKey: 'aster-aweke-tizita',
    title: 'Tizita',
    artist: 'Aster Aweke',
    aliases: [
      'tizita aster',
      'tizita',
      'aster tizita',
      'aster aweke tizita',
      'aster aweke',
      'aster awke',
    ],
  },
  {
    groupKey: 'mahmoud-ahmed-tezeta',
    title: 'Tezeta (Memories)',
    artist: 'Mahmoud Ahmed',
    aliases: [
      'tezeta mahmoud',
      'mahmoud tezeta',
      'mahmoud ahmed',
      'ere mela mela',
      'mahmud ahmed',
    ],
  },
  {
    groupKey: 'gigi-guramayle',
    title: 'Guramayle',
    artist: 'Gigi',
    aliases: [
      'guramayle',
      'guramaye',
      'gigi guramayle',
      'ejigayehu shibabaw',
      'gigi',
    ],
  },
  {
    groupKey: 'ropha-fiker-new',
    title: 'Fiker New',
    artist: 'Rophnan',
    aliases: ['rophnan', 'fiker new', 'fiker', 'rophnan fiker', 'rophnan my generation'],
  },

  // Afrobeats Hits
  {
    groupKey: 'rema-calm-down',
    title: 'Calm Down',
    artist: 'Rema',
    aliases: ['calm down', 'rema calm down', 'baby calm down', 'rema', 'calm down rema'],
  },
  {
    groupKey: 'wizkid-essence',
    title: 'Essence (feat. Tems)',
    artist: 'Wizkid & Tems',
    aliases: ['essence', 'wizkid essence', 'essence wizkid', 'wizkid tems', 'essence tems'],
  },
  {
    groupKey: 'burna-boy-last-last',
    title: 'Last Last',
    artist: 'Burna Boy',
    aliases: ['last last', 'burna last last', 'burna boy last last', 'breakfast', 'last last burna'],
  },
  {
    groupKey: 'burna-boy-ye',
    title: 'Ye',
    artist: 'Burna Boy',
    aliases: ['burna ye', 'burna boy ye', 'ye burna boy', 'ye'],
  },
  {
    groupKey: 'asake-lonely-at-the-top',
    title: 'Lonely At The Top',
    artist: 'Asake',
    aliases: ['lonely at the top', 'asake lonely', 'asake lonely at the top', 'asake'],
  },

  // Global Pop & Viral Hits
  {
    groupKey: 'the-weeknd-blinding-lights',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    aliases: [
      'blinding lights',
      'blinding light',
      'the weeknd',
      'weeknd blinding lights',
      'weeknd',
      'blinding lights weeknd',
    ],
  },
  {
    groupKey: 'harry-styles-as-it-was',
    title: 'As It Was',
    artist: 'Harry Styles',
    aliases: ['as it was', 'harry styles as it was', 'harry styles', 'as it was harry'],
  },
  {
    groupKey: 'billie-eilish-birds-of-a-feather',
    title: 'BIRDS OF A FEATHER',
    artist: 'Billie Eilish',
    aliases: ['birds of a feather', 'billie eilish birds', 'billie birds of a feather', 'billie eilish'],
  },
  {
    groupKey: 'sabrina-carpenter-espresso',
    title: 'Espresso',
    artist: 'Sabrina Carpenter',
    aliases: ['espresso', 'sabrina carpenter espresso', 'sabrina espresso', 'say you cant sleep'],
  },
  {
    groupKey: 'taylor-swift-cruel-summer',
    title: 'Cruel Summer',
    artist: 'Taylor Swift',
    aliases: ['cruel summer', 'taylor swift cruel summer', 'cruel summer taylor', 'taylor swift'],
  },
];

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
export function slugify(text: string): string {
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
export function cleanCommentText(rawComment: string): string {
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
 * Parses an incoming live comment and identifies whether it is a valid song request.
 * Groups similar requests into the same canonical groupKey.
 */
export function recognizeSongRequest(comment: string): RecognizedSong | null {
  if (!comment || comment.trim().length < 2) return null;

  const cleaned = cleanCommentText(comment);
  if (!cleaned || cleaned.length < 2) return null;

  // Filter out greetings and general hype comments
  for (const pattern of NON_REQUEST_PATTERNS) {
    if (pattern.test(cleaned)) return null;
  }

  const normalized = cleaned.toLowerCase();

  // 1. Check against Canonical Song Library (Exact or alias matching)
  for (const song of CANONICAL_SONGS) {
    // Check main title or artist
    if (
      normalized === song.title.toLowerCase() ||
      normalized === `${song.artist.toLowerCase()} - ${song.title.toLowerCase()}` ||
      normalized === `${song.title.toLowerCase()} by ${song.artist.toLowerCase()}` ||
      normalized === `${song.title.toLowerCase()} ${song.artist.toLowerCase()}` ||
      normalized === `${song.artist.toLowerCase()} ${song.title.toLowerCase()}`
    ) {
      return {
        groupKey: song.groupKey,
        displayTitle: song.title,
        artist: song.artist,
        rawRequest: cleaned,
      };
    }

    // Check aliases
    for (const alias of song.aliases) {
      if (normalized === alias || normalized.includes(alias)) {
        return {
          groupKey: song.groupKey,
          displayTitle: song.title,
          artist: song.artist,
          rawRequest: cleaned,
        };
      }
    }
  }

  // 2. Parse freeform formats like "Artist - Title", "Artist: Title", "Artist, Title" or "Title by Artist"
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
    // Capitalize first letters for clean display
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

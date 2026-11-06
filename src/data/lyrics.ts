export interface LyricLine {
  time: number; // in seconds
  text: string;
  translation?: string;
}

export const TRACK_LYRICS: Record<string, LyricLine[]> = {};

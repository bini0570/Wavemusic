export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  artworkUrl: string;
  previewUrl: string;
  trackTimeMillis?: number;
  previewDurationSec: number;
  genre: string;
  releaseDate?: string;
  trackViewUrl?: string;
  isExplicit?: boolean;
  youtubeId?: string;
  fullAudioUrl?: string;
}

export type PlaybackMode = 'preview' | 'full';
export type RepeatMode = 'off' | 'all' | 'one';

export interface PlayerState {
  currentTrack: Track | null;
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string | null;
}

export interface TikTokComment {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  comment: string;
  timestamp: number;
  recognizedSong?: {
    groupKey: string;
    displayTitle: string;
    artist: string;
  };
}

export interface SongVoteGroup {
  groupKey: string;
  displayTitle: string;
  artist: string;
  voteCount: number;
  firstVotedAt: number;
  lastVotedAt: number;
  requestingUsers: string[];
}

export interface RoundHistoryItem {
  roundNumber: number;
  winningSong: string;
  winningArtist: string;
  artworkUrl?: string;
  voteCount: number;
  totalRoundComments: number;
  winningUsers: string[];
  playedAt: number;
  status: 'played' | 'skipped' | 'no-votes';
  failureReason?: string;
}

export interface VotingRoundState {
  roundNumber: number;
  durationSeconds: number;
  timeRemainingSeconds: number;
  totalCommentsThisRound: number;
  totalCommentsAllTime: number;
  leaderboard: SongVoteGroup[];
  currentWinner: SongVoteGroup | null;
  history: RoundHistoryItem[];
  isVotingActive: boolean;
  isConnected: boolean;
  channelName: string;
  trafficRate: 'slow' | 'medium' | 'fast' | 'paused';
  streamSafeMode: boolean;
  isWaitingForVotes?: boolean;
}

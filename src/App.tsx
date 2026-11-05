import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MobileLaunchScreen } from './components/MobileLaunchScreen';
import { MobileLiveStage } from './components/MobileLiveStage';
import { DJDrawer } from './components/DJDrawer';
import { Track, TikTokComment, SongVoteGroup, VotingRoundState } from './types';
import { searchTracks } from './services/musicApi';
import { fetchLyrics } from './services/lyricsService';
import { fullAudioEngine } from './services/fullAudioEngine';
import { VotingEngine } from './services/votingEngine';
import { tiktokLiveService } from './services/tiktokLiveService';
import { LyricLine } from './data/lyrics';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  // Mobile Launch State
  const [hasStartedLive, setHasStartedLive] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [launchError, setLaunchError] = useState<string | null>(null);

  // Track & Playback state (starts 100% blank waiting for live chat requests)
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Lyrics State
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [isLyricsLoading, setIsLyricsLoading] = useState<boolean>(false);

  // Drawer & Announcement
  const [isDJDrawerOpen, setIsDJDrawerOpen] = useState<boolean>(false);
  const [announcement, setAnnouncement] = useState<{
    type: 'success' | 'warning' | 'info';
    message: string;
  } | null>(null);

  // Stream Comments Log
  const [streamComments, setStreamComments] = useState<TikTokComment[]>([]);

  // Voting Engine Reference & State
  const votingEngineRef = useRef<VotingEngine | null>(null);
  const [votingState, setVotingState] = useState<VotingRoundState>({
    roundNumber: 1,
    durationSeconds: 60,
    timeRemainingSeconds: 60,
    totalCommentsThisRound: 0,
    totalCommentsAllTime: 0,
    leaderboard: [],
    currentWinner: null,
    history: [],
    isVotingActive: true,
    isConnected: false,
    channelName: '@your_live',
    trafficRate: 'paused',
    streamSafeMode: false,
    isWaitingForVotes: true,
  });

  // Sync volume with fullAudioEngine
  useEffect(() => {
    fullAudioEngine.setVolume(volume);
    fullAudioEngine.setMuted(isMuted);
  }, [volume, isMuted]);

  // Core Play Track Function (60s loop playback)
  const playTrack = useCallback(async (track: Track, autoPlay = true): Promise<boolean> => {
    setCurrentTrack(track);
    setCurrentTime(0);

    const streamUrl = track.fullAudioUrl || track.previewUrl;
    // Set 60-second limit
    const started = await fullAudioEngine.loadTrack(
      track.artist,
      track.title,
      60,
      autoPlay,
      track.youtubeId,
      streamUrl
    );

    setIsPlaying(started && autoPlay);
    return started;
  }, []);

  // Handle Winner Selection when 60s concludes
  const handleWinnerSelected = useCallback(
    async (winner: SongVoteGroup, roundNumber: number): Promise<boolean> => {
      const query = `${winner.displayTitle} ${
        winner.artist !== 'Viewer Request' ? winner.artist : ''
      }`.trim();

      setAnnouncement({
        type: 'info',
        message: `Winner: "${winner.displayTitle}" (${winner.voteCount} votes)! Loading 60s track...`,
      });

      try {
        const results = await searchTracks(query);

        if (results.length > 0) {
          const winningTrack = results[0];
          const started = await playTrack(winningTrack, true);

          if (started) {
            setAnnouncement({
              type: 'success',
              message: `Now Playing Round #${roundNumber} Winner: "${winningTrack.title}" (${winner.voteCount} votes)!`,
            });
            return true;
          }
        }

        setAnnouncement({
          type: 'warning',
          message: `Could not resolve stream for "${winner.displayTitle}".`,
        });
        return false;
      } catch {
        setAnnouncement({
          type: 'warning',
          message: `Network error loading "${winner.displayTitle}".`,
        });
        return false;
      }
    },
    [playTrack]
  );

  // Handle 0 votes received at round end (Pause & wait for chat)
  const handleNoVotes = useCallback(() => {
    fullAudioEngine.pause();
    setIsPlaying(false);
    setAnnouncement({
      type: 'warning',
      message: 'No votes received this round. Music paused waiting for chat requests...',
    });
  }, []);

  // Initialize VotingEngine & TikTok Live Service
  useEffect(() => {
    const engine = new VotingEngine(handleWinnerSelected, handleNoVotes);
    votingEngineRef.current = engine;

    const unsubState = engine.subscribeState((newState) => {
      setVotingState(newState);
    });

    const unsubComments = engine.subscribeComments((comment) => {
      setStreamComments((prev) => [comment, ...prev.slice(0, 50)]);
    });

    // Wire real TikTok LIVE connector
    const unsubTikTokStatus = tiktokLiveService.onStatus((status) => {
      engine.setIsConnected(status.connected, status.channel);
      setIsConnecting(false);
      if (status.connected) {
        setLaunchError(null);
      }
      if (status.message) {
        setAnnouncement({
          type: status.connected ? 'success' : 'info',
          message: status.message,
        });
      }
    });

    const unsubTikTokComments = tiktokLiveService.onComment((comment) => {
      engine.ingestComment(
        comment.comment,
        comment.username,
        comment.displayName,
        comment.avatarUrl
      );
    });

    const unsubTikTokError = tiktokLiveService.onError((errMsg) => {
      setIsConnecting(false);
      setLaunchError(errMsg);
      setAnnouncement({
        type: 'warning',
        message: errMsg,
      });
    });

    return () => {
      unsubState();
      unsubComments();
      unsubTikTokStatus();
      unsubTikTokComments();
      unsubTikTokError();
      engine.destroy();
    };
  }, [handleWinnerSelected, handleNoVotes]);

  // Dismiss toast after 4 seconds
  useEffect(() => {
    if (!announcement) return;
    const t = setTimeout(() => setAnnouncement(null), 4000);
    return () => clearTimeout(t);
  }, [announcement]);

  // Hardware clock sync with fullAudioEngine
  useEffect(() => {
    const unsubscribe = fullAudioEngine.subscribe({
      onTimeUpdate: (time) => {
        // Clamp to 60 seconds
        setCurrentTime(Math.min(60, time));
      },
      onStateChange: (playing) => {
        setIsPlaying(playing);
      },
      onEnded: () => {
        fullAudioEngine.seekTo(0);
      },
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Fetch Synchronized Lyrics for current track
  useEffect(() => {
    if (!currentTrack) {
      setLyrics([]);
      return;
    }

    let isCancelled = false;
    setIsLyricsLoading(true);

    fetchLyrics(currentTrack.title, currentTrack.artist, currentTrack.id, 60)
      .then((res) => {
        if (!isCancelled) {
          setLyrics(res.lines);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setLyrics([]);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLyricsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [currentTrack]);

  // Start Live Show from Mobile Launch Screen
  const handleStartLive = useCallback(
    (username: string) => {
      setIsConnecting(true);
      setLaunchError(null);
      setHasStartedLive(true);
      tiktokLiveService.connect(username);
      setAnnouncement({
        type: 'info',
        message: `Connected to @${username.replace(/^@/, '')}! Waiting for chat song requests...`,
      });
    },
    []
  );

  // Host Controls
  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      fullAudioEngine.pause();
      setIsPlaying(false);
    } else {
      fullAudioEngine.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleSkipRound = useCallback(() => {
    votingEngineRef.current?.skipRoundNow();
  }, []);

  const handleResetTimer = useCallback(() => {
    votingEngineRef.current?.resetRoundTimer();
  }, []);

  const handleConnectTikTok = useCallback((username: string) => {
    tiktokLiveService.connect(username);
  }, []);

  const handleDisconnectTikTok = useCallback(() => {
    tiktokLiveService.disconnect();
    setHasStartedLive(false);
  }, []);

  const handleInjectComment = useCallback((text: string, user = 'host') => {
    votingEngineRef.current?.ingestComment(text, user);
  }, []);

  return (
    <div className="relative min-h-screen w-screen bg-[#0c0a1a] text-white overflow-hidden">
      {/* Toast Notification */}
      {announcement && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[calc(100%-2rem)] animate-in fade-in slide-in-from-top-2 duration-300">
          <div
            className={`p-2.5 rounded-2xl border shadow-2xl flex items-center justify-between gap-2.5 ${
              announcement.type === 'success'
                ? 'bg-emerald-950/95 border-emerald-500/60 text-emerald-200'
                : announcement.type === 'warning'
                ? 'bg-amber-950/95 border-amber-500/60 text-amber-200'
                : 'bg-purple-950/95 border-purple-500/60 text-purple-200'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold truncate">
              {announcement.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
              )}
              <span className="truncate">{announcement.message}</span>
            </div>
            <button
              onClick={() => setAnnouncement(null)}
              className="text-slate-400 hover:text-white text-xs font-bold px-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Screen 1: Mobile Launchpad (Enter Username & Start) */}
      {!hasStartedLive ? (
        <MobileLaunchScreen
          onStart={handleStartLive}
          isLoading={isConnecting}
          errorMessage={launchError}
        />
      ) : (
        /* Screen 2: Mobile Portrait 9:16 Broadcast Stage (When Live) */
        <MobileLiveStage
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          currentTime={currentTime}
          votingState={votingState}
          lyrics={lyrics}
          isLyricsLoading={isLyricsLoading}
          isMuted={isMuted}
          onTogglePlay={handleTogglePlay}
          onToggleMute={() => setIsMuted((prev) => !prev)}
          onSkipTrack={handleSkipRound}
          onOpenDrawer={() => setIsDJDrawerOpen(true)}
        />
      )}

      {/* Slide-Over DJ Host Drawer */}
      <DJDrawer
        isOpen={isDJDrawerOpen}
        onClose={() => setIsDJDrawerOpen(false)}
        votingState={votingState}
        recentComments={streamComments}
        isPlaying={isPlaying}
        volume={volume}
        isMuted={isMuted}
        onTogglePlay={handleTogglePlay}
        onSkipRound={handleSkipRound}
        onResetTimer={handleResetTimer}
        onChangeVolume={(v) => setVolume(v)}
        onToggleMute={() => setIsMuted((prev) => !prev)}
        onConnectTikTok={handleConnectTikTok}
        onDisconnectTikTok={handleDisconnectTikTok}
        onInjectComment={handleInjectComment}
      />

      {/* Audio Engine Hidden YouTube Iframe Mount */}
      <iframe
        ref={(el) => fullAudioEngine.setIframe(el)}
        className="fixed -top-[9999px] -left-[9999px] w-1 h-1 opacity-0 pointer-events-none"
        title="WAVE Audio Engine"
        allow="autoplay; encrypted-media"
      />
    </div>
  );
}

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { TikTokConnectModal } from './components/TikTokConnectModal';
import { Top10RankingTable } from './components/Top10RankingTable';
import { LiveCommentsFeed } from './components/LiveCommentsFeed';
import { MusicPlayerSection } from './components/MusicPlayerSection';
import { TrackCard } from './components/TrackCard';
import { LyricsView } from './components/LyricsView';
import { DJDrawer } from './components/DJDrawer';
import { PWAInstallBanner } from './components/PWAInstallBanner';

import {
  Track,
  TikTokComment,
  SongVoteGroup,
  VotingRoundState,
} from './types';
import { searchTracks } from './services/musicApi';
import { DEFAULT_TRACKS } from './data/curatedTracks';
import { fetchLyrics } from './services/lyricsService';
import { fullAudioEngine } from './services/fullAudioEngine';
import { VotingEngine } from './services/votingEngine';
import { tiktokLiveService } from './services/tiktokLiveService';
import { soundEffects } from './services/soundEffectsService';
import { LyricLine } from './data/lyrics';
import {
  Trophy,
  MessageSquare,
  Search,
  Mic2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Music,
} from 'lucide-react';

export default function App() {
  // Track & playback state
  const [currentTrack, setCurrentTrack] = useState<Track | null>(DEFAULT_TRACKS[0] || null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(() => {
    return DEFAULT_TRACKS[0]?.trackTimeMillis
      ? Math.round(DEFAULT_TRACKS[0].trackTimeMillis / 1000)
      : 212;
  });
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Search & Library state
  const [searchResults, setSearchResults] = useState<Track[]>(DEFAULT_TRACKS || []);
  const [isLoadingSearch, setIsLoadingSearch] = useState<boolean>(false);

  // Lyrics State
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [isLyricsLoading, setIsLyricsLoading] = useState<boolean>(false);

  // Modals & Panels State
  const [isConnectModalOpen, setIsConnectModalOpen] = useState<boolean>(false);
  const [isConnectingTikTok, setIsConnectingTikTok] = useState<boolean>(false);
  const [isDJDrawerOpen, setIsDJDrawerOpen] = useState<boolean>(false);

  // Tab selections in 2-column split screen
  const [activeLeftTab, setActiveLeftTab] = useState<'rankings' | 'chat'>('rankings');
  const [activeRightTab, setActiveRightTab] = useState<'search' | 'lyrics'>('search');
  // Mobile responsive view switcher ('votes' or 'player')
  const [mobileTab, setMobileTab] = useState<'votes' | 'player'>('votes');

  // Toast Notification
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

  // Sync volume with fullAudioEngine and soundEffects
  useEffect(() => {
    fullAudioEngine.setVolume(volume);
    fullAudioEngine.setMuted(isMuted);
    soundEffects.setVolume(volume);
    soundEffects.setMuted(isMuted);
  }, [volume, isMuted]);

  // Core Play Track Function (60s loop playback)
  const playTrack = useCallback(async (track: Track, autoPlay = true): Promise<boolean> => {
    setCurrentTrack(track);
    setCurrentTime(0);

    const fullSec = track.trackTimeMillis
      ? Math.round(track.trackTimeMillis / 1000)
      : (track.previewDurationSec || 60);
    setDuration(fullSec);

    const streamUrl = track.fullAudioUrl || track.previewUrl;
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

  // Handle Winner Selection when 60s round concludes
  const handleWinnerSelected = useCallback(
    async (winner: SongVoteGroup, roundNumber: number): Promise<boolean> => {
      soundEffects.playWinnerFanfare();

      const query = `${winner.displayTitle} ${
        winner.artist !== 'Viewer Request' ? winner.artist : ''
      }`.trim();

      setAnnouncement({
        type: 'info',
        message: `60s Round Concluded! Winner: "${winner.displayTitle}" (${winner.voteCount} votes). Loading track...`,
      });

      try {
        const results = await searchTracks(query);

        if (results.length > 0) {
          const winningTrack = results[0];
          setSearchResults(results);
          const started = await playTrack(winningTrack, true);

          if (started) {
            setAnnouncement({
              type: 'success',
              message: `Now Playing Round #${roundNumber} Winner: "${winningTrack.title}" (${winner.voteCount} votes)!`,
            });
            return true;
          }
        }

        // Auto-fallback to #2 contender if #1 stream could not be resolved
        const runnerUp = votingState.leaderboard.find((s) => s.groupKey !== winner.groupKey);
        if (runnerUp) {
          const runnerQuery = `${runnerUp.displayTitle} ${
            runnerUp.artist !== 'Viewer Request' ? runnerUp.artist : ''
          }`.trim();
          const runnerResults = await searchTracks(runnerQuery);
          if (runnerResults.length > 0) {
            setSearchResults(runnerResults);
            return await playTrack(runnerResults[0], true);
          }
        }

        // Curated fallback so music never cuts out
        if (DEFAULT_TRACKS && DEFAULT_TRACKS.length > 0) {
          const fallbackTrack = DEFAULT_TRACKS[roundNumber % DEFAULT_TRACKS.length];
          return await playTrack(fallbackTrack, true);
        }

        return false;
      } catch {
        if (DEFAULT_TRACKS && DEFAULT_TRACKS.length > 0) {
          const fallbackTrack = DEFAULT_TRACKS[roundNumber % DEFAULT_TRACKS.length];
          return await playTrack(fallbackTrack, true);
        }
        return false;
      }
    },
    [playTrack, votingState.leaderboard]
  );

  // Handle 0 votes received at round end
  const handleNoVotes = useCallback((roundNumber: number) => {
    setAnnouncement({
      type: 'info',
      message: `Round #${roundNumber} finished with no new votes. Music continues playing.`,
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

    // Real TikTok LIVE Connector subscriptions
    const unsubTikTokStatus = tiktokLiveService.onStatus((status) => {
      setIsConnectingTikTok(false);
      engine.setIsConnected(status.connected, status.channel);
      if (status.connected) {
        setAnnouncement({
          type: 'success',
          message: `Connected to @${status.channel.replace(/^@/, '')} LIVE! Chat votes are streaming in.`,
        });
      } else if (status.message) {
        setAnnouncement({
          type: 'info',
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
      setIsConnectingTikTok(false);
      setAnnouncement({
        type: 'warning',
        message: `TikTok Notice: ${errMsg}`,
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

  // 5-Second Countdown Audio Cues
  useEffect(() => {
    if (
      !votingState.isWaitingForVotes &&
      votingState.timeRemainingSeconds <= 5 &&
      votingState.timeRemainingSeconds > 0
    ) {
      soundEffects.playTick(votingState.timeRemainingSeconds);
    }
  }, [votingState.timeRemainingSeconds, votingState.isWaitingForVotes]);

  // Hardware clock sync with fullAudioEngine
  useEffect(() => {
    const unsubscribe = fullAudioEngine.subscribe({
      onTimeUpdate: (time, dur) => {
        setCurrentTime(Math.min(60, time));
        if (dur > 0) setDuration(dur);
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

  // Search Functionality
  const handleSearch = useCallback(async (query: string) => {
    const q = query.trim();
    if (!q) return;
    setIsLoadingSearch(true);
    setActiveRightTab('search');

    try {
      const results = await searchTracks(q);
      setSearchResults(results);
      if (results.length > 0) {
        setAnnouncement({
          type: 'success',
          message: `Found ${results.length} songs for "${q}". Tap any track to play!`,
        });
      } else {
        setAnnouncement({
          type: 'warning',
          message: `No songs found for "${q}". Try another search term.`,
        });
      }
    } catch {
      setAnnouncement({
        type: 'warning',
        message: `Network error searching for "${q}".`,
      });
    } finally {
      setIsLoadingSearch(false);
    }
  }, []);

  // Playback Control Handlers
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

  const handleSeek = useCallback((seconds: number) => {
    setCurrentTime(seconds);
    fullAudioEngine.seekTo(seconds);
  }, []);

  // TikTok Connect & Disconnect
  const handleConnectTikTok = useCallback((username: string) => {
    setIsConnectingTikTok(true);
    setAnnouncement({
      type: 'info',
      message: `Connecting to @${username.replace(/^@/, '')}...`,
    });
    tiktokLiveService.connect(username);
  }, []);

  const handleDisconnectTikTok = useCallback(() => {
    tiktokLiveService.disconnect();
    votingEngineRef.current?.setIsConnected(false);
    setAnnouncement({
      type: 'info',
      message: 'Disconnected from TikTok stream.',
    });
  }, []);

  const handleInjectComment = useCallback((text: string, user = 'host') => {
    votingEngineRef.current?.ingestComment(text, user);
  }, []);

  // Auto-sync search bar with leading comment query
  const autoLeadingQuery = votingState.currentWinner?.displayTitle;
  const autoLeadingVotes = votingState.currentWinner?.voteCount;

  return (
    <div className="min-h-screen w-full bg-[#070612] text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      {/* PWA Banner if installable */}
      <PWAInstallBanner />

      {/* Toast Notification Banner */}
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

      {/* ============================================================= */}
      {/* 1. TOP HEADER BANNER (WAVE Name + TikTok Offline/Online Pill)  */}
      {/* ============================================================= */}
      <Header
        isConnected={votingState.isConnected}
        channelName={votingState.channelName}
        isConnecting={isConnectingTikTok}
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
        onOpenDrawer={() => setIsDJDrawerOpen(true)}
      />

      {/* ============================================================= */}
      {/* 2. SEARCH FIELD (Positioned directly below top banner)         */}
      {/* ============================================================= */}
      <div className="px-3 sm:px-6 max-w-7xl w-full mx-auto shrink-0">
        <SearchBar
          onSearch={handleSearch}
          isLoading={isLoadingSearch}
          autoLeadingQuery={autoLeadingQuery}
          autoLeadingVotes={autoLeadingVotes}
          timeRemaining={votingState.timeRemainingSeconds}
        />
      </div>

      {/* Round & Timer Bar */}
      <div className="px-3 sm:px-6 max-w-7xl w-full mx-auto my-1.5 flex items-center justify-between gap-2 shrink-0 text-xs">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold uppercase tracking-wider text-[10px]">
            Round #{votingState.roundNumber}
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#14102c] border border-amber-500/30 text-amber-300 font-mono font-bold shadow-sm">
          <Clock className="h-3.5 w-3.5 animate-spin" />
          <span>{votingState.timeRemainingSeconds}s</span>
        </div>
      </div>

      {/* ============================================================= */}
      {/* MOBILE-FIRST SEGMENTED SWITCHER (Visible on phones, hidden on desktop) */}
      {/* ============================================================= */}
      <div className="flex md:hidden items-center p-1 bg-[#120f29] border border-purple-900/40 rounded-2xl mx-3 mb-2 shrink-0">
        <button
          onClick={() => setMobileTab('votes')}
          className={`flex-1 py-2 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition ${
            mobileTab === 'votes'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Trophy className="h-3.5 w-3.5" />
          <span>Rankings &amp; Chat</span>
        </button>

        <button
          onClick={() => setMobileTab('player')}
          className={`flex-1 py-2 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition ${
            mobileTab === 'player'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Music className="h-3.5 w-3.5" />
          <span>Player &amp; Search</span>
        </button>
      </div>

      {/* ============================================================= */}
      {/* 3. MAIN WORKSPACE: 50% SPLIT (Desktop) / ADAPTIVE TABS (Mobile) */}
      {/* ============================================================= */}
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-6 pb-16 md:pb-4 flex-1 min-h-0 overflow-hidden md:grid md:grid-cols-2 md:gap-4">
        
        {/* =========================================================== */}
        {/* LEFT COLUMN (50% on Desktop, Active on Mobile in 'votes' view) */}
        {/* =========================================================== */}
        <section
          className={`flex-col h-full bg-[#120f29]/90 border border-purple-900/30 rounded-3xl p-3 sm:p-4 shadow-xl backdrop-blur-md overflow-hidden ${
            mobileTab === 'votes' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Left Column Tabs Header: Comments & Rankings */}
          <div className="flex items-center justify-between pb-3 border-b border-white/5 shrink-0 mb-3">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveLeftTab('rankings')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                  activeLeftTab === 'rankings'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-md'
                    : 'text-slate-400 hover:text-white bg-white/5'
                }`}
              >
                <Trophy className="h-3.5 w-3.5" />
                <span>Rankings</span>
              </button>

              <button
                onClick={() => setActiveLeftTab('chat')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                  activeLeftTab === 'chat'
                    ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30 shadow-md'
                    : 'text-slate-400 hover:text-white bg-white/5'
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Chat ({streamComments.length})</span>
              </button>
            </div>
          </div>

          {/* Tab Content 1: Top 10 Ranking Table */}
          {activeLeftTab === 'rankings' ? (
            <div className="flex-1 overflow-hidden min-h-0 flex flex-col justify-between">
              <Top10RankingTable
                leaderboard={votingState.leaderboard}
                timeRemainingSeconds={votingState.timeRemainingSeconds}
                durationSeconds={votingState.durationSeconds}
                roundNumber={votingState.roundNumber}
                recentComments={streamComments}
                onForceWin={(song) => handleWinnerSelected(song, votingState.roundNumber)}
                onSendComment={(comment, user) => handleInjectComment(comment, user)}
              />
            </div>
          ) : (
            /* Tab Content 2: Live Comments Feed */
            <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
              <LiveCommentsFeed
                comments={streamComments}
                onSendComment={(comment, user) => handleInjectComment(comment, user)}
              />
            </div>
          )}
        </section>

        {/* =========================================================== */}
        {/* RIGHT COLUMN (50% on Desktop, Active on Mobile in 'player' view) */}
        {/* =========================================================== */}
        <section
          className={`flex-col h-full gap-3 overflow-hidden ${
            mobileTab === 'player' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Top: Now Playing Music Player Section */}
          <div className="shrink-0">
            <MusicPlayerSection
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              volume={volume}
              isMuted={isMuted}
              upcomingWinner={votingState.currentWinner}
              onTogglePlay={handleTogglePlay}
              onNext={handleSkipRound}
              onPrev={() => handleSeek(0)}
              onSeek={handleSeek}
              onVolumeChange={(v) => setVolume(v)}
              onToggleMute={() => setIsMuted(!isMuted)}
            />
          </div>

          {/* Bottom of Right Column: Search Results & Synced Lyrics Tabs */}
          <div className="flex-1 rounded-3xl bg-[#120f29]/90 border border-purple-900/30 p-3 sm:p-4 shadow-xl backdrop-blur-md flex flex-col min-h-0 overflow-hidden">
            {/* Right Tabs Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-white/5 shrink-0 mb-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveRightTab('search')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                    activeRightTab === 'search'
                      ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-md'
                      : 'text-slate-400 hover:text-white bg-white/5'
                  }`}
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>Results ({searchResults.length})</span>
                </button>

                <button
                  onClick={() => setActiveRightTab('lyrics')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                    activeRightTab === 'lyrics'
                      ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-md'
                      : 'text-slate-400 hover:text-white bg-white/5'
                  }`}
                >
                  <Mic2 className="h-3.5 w-3.5" />
                  <span>Lyrics</span>
                </button>
              </div>

              {currentTrack && (
                <span className="text-[10px] font-mono text-slate-400 truncate max-w-[140px]">
                  {currentTrack.title}
                </span>
              )}
            </div>

            {/* Right Tab Content 1: Search Results List */}
            {activeRightTab === 'search' ? (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
                {searchResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-10 text-center text-slate-500">
                    <Music className="h-8 w-8 text-slate-600 mb-2" />
                    <p className="text-xs">No songs found</p>
                  </div>
                ) : (
                  searchResults.map((t) => (
                    <TrackCard
                      key={t.id}
                      track={t}
                      isPlaying={isPlaying && currentTrack?.id === t.id}
                      isCurrent={currentTrack?.id === t.id}
                      isFavorite={false}
                      onPlayToggle={() => {
                        if (currentTrack?.id === t.id) {
                          handleTogglePlay();
                        } else {
                          playTrack(t, true);
                        }
                      }}
                      onToggleFavorite={() => {}}
                      onSelectTrack={() => playTrack(t, true)}
                    />
                  ))
                )}
              </div>
            ) : (
              /* Right Tab Content 2: Synced Karaoke Lyrics View */
              <div className="flex-1 overflow-hidden min-h-0">
                <LyricsView
                  currentTrack={currentTrack}
                  lyrics={lyrics}
                  currentTime={currentTime}
                  isPlaying={isPlaying}
                  isLoading={isLyricsLoading}
                  isSynced={true}
                  hideHeader={true}
                  onSeek={handleSeek}
                  className="h-full"
                />
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ============================================================= */}
      {/* MOBILE MINI-PLAYER (Sticky at bottom when viewing votes on phone) */}
      {/* ============================================================= */}
      {mobileTab === 'votes' && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#120e29]/95 border-t border-purple-900/40 p-2.5 backdrop-blur-md flex items-center justify-between gap-3 shadow-2xl">
          <div
            onClick={() => setMobileTab('player')}
            className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
          >
            <div className="h-9 w-9 rounded-xl bg-purple-900/60 overflow-hidden shrink-0 border border-white/10 flex items-center justify-center">
              {currentTrack?.artworkUrl ? (
                <img src={currentTrack.artworkUrl} alt={currentTrack.title} className="h-full w-full object-cover" />
              ) : (
                <Music className="h-4 w-4 text-purple-300" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-white truncate leading-tight">
                {currentTrack?.title || 'No Track'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {currentTrack?.artist || 'Tap for Player'} · 0:{Math.round(currentTime).toString().padStart(2, '0')}/0:60
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleTogglePlay}
              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center active:scale-95 text-xs font-bold"
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button
              onClick={handleSkipRound}
              className="h-8 w-8 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center active:scale-95 text-xs font-bold"
            >
              ⏭
            </button>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 4. TIKTOK CONNECT POPUP MODAL (Appears on clicking Connect)    */}
      {/* ============================================================= */}
      <TikTokConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        isConnected={votingState.isConnected}
        channelName={votingState.channelName}
        isConnecting={isConnectingTikTok}
        onConnect={handleConnectTikTok}
        onDisconnect={handleDisconnectTikTok}
      />

      {/* Slide-Over DJ Host Controls Drawer */}
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
    </div>
  );
}

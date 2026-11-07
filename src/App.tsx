import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { TikTokConnectModal } from './components/TikTokConnectModal';
import { Top10RankingTable } from './components/Top10RankingTable';
import { LiveCommentsFeed } from './components/LiveCommentsFeed';
import { MusicPlayerSection } from './components/MusicPlayerSection';
import { TrackCard } from './components/TrackCard';
import { LyricsView } from './components/LyricsView';
import { PWAInstallBanner } from './components/PWAInstallBanner';

import {
  Track,
  TikTokComment,
  SongVoteGroup,
  VotingRoundState,
} from './types';
import { searchTracks } from './services/musicApi';
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
  Music,
} from 'lucide-react';

export default function App() {
  // Track & playback state
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(60);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Search & Library state
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState<boolean>(false);

  // Lyrics State
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [isLyricsLoading, setIsLyricsLoading] = useState<boolean>(false);

  // Modals & Panels State
  const [isConnectModalOpen, setIsConnectModalOpen] = useState<boolean>(false);
  const [isConnectingTikTok, setIsConnectingTikTok] = useState<boolean>(false);

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

        // Runner-up fallback
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

        return false;
      } catch {
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
      onTimeUpdate: (time) => {
        setCurrentTime(Math.min(60, time));
        setDuration(60);
      },
      onStateChange: (playing) => {
        setIsPlaying(playing);
      },
      onEnded: () => {
        votingEngineRef.current?.skipRoundNow();
      },
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Dynamically populate search library on launch with live trending tracks (0 hardcoded data)
  useEffect(() => {
    let isCancelled = false;
    setIsLoadingSearch(true);

    searchTracks('Top Hits')
      .then((tracks) => {
        if (!isCancelled && tracks.length > 0) {
          setSearchResults(tracks);
          setCurrentTrack(tracks[0]);
          const streamUrl = tracks[0].fullAudioUrl || tracks[0].previewUrl;
          fullAudioEngine.loadTrack(tracks[0].artist, tracks[0].title, 60, false, tracks[0].youtubeId, streamUrl);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!isCancelled) setIsLoadingSearch(false);
      });

    return () => {
      isCancelled = true;
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
      if (currentTrack) {
        playTrack(currentTrack, true);
      } else if (searchResults.length > 0) {
        playTrack(searchResults[0], true);
      } else {
        handleSearch('Top Hits');
      }
    }
  }, [isPlaying, currentTrack, searchResults, playTrack, handleSearch]);

  const handleSkipRound = useCallback(() => {
    votingEngineRef.current?.skipRoundNow();
  }, []);

  const handleSeek = useCallback((seconds: number) => {
    setCurrentTime(seconds);
    fullAudioEngine.seekTo(seconds);
  }, []);

  // TikTok Connect & Disconnect
  const handleConnectTikTok = useCallback((username: string, sessionId?: string) => {
    setIsConnectingTikTok(true);
    setAnnouncement({
      type: 'info',
      message: `Connecting to @${username.replace(/^@/, '')}...`,
    });
    tiktokLiveService.connect(username, sessionId);
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
    <div style={{ minHeight: '100dvh', width: '100%', background: '#0b0816', color: '#e2e8f0', display: 'flex', flexDirection: 'column', fontFamily: 'inherit', userSelect: 'none', overflowX: 'hidden' }}>
      {/* PWA Banner if installable */}
      <PWAInstallBanner />

      {/* Toast Notification Banner */}
      {announcement && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[calc(100%-2rem)] animate-in fade-in slide-in-from-top-2 duration-300">
          <div
            className={`p-2.5 rounded-2xl border shadow-2xl flex items-center justify-between gap-2.5 ${
              announcement.type === 'success'
                ? 'border-emerald-500/60 text-emerald-200'
                : announcement.type === 'warning'
                ? 'border-amber-500/60 text-amber-200'
                : 'border-purple-500/60 text-purple-200'
            }`}
            style={{
              background: announcement.type === 'success'
                ? 'rgba(6,78,59,0.97)'
                : announcement.type === 'warning'
                ? 'rgba(78,52,6,0.97)'
                : 'rgba(46,16,101,0.97)',
              boxShadow: announcement.type === 'success'
                ? '0 0 20px rgba(16,185,129,0.25)'
                : announcement.type === 'warning'
                ? '0 0 20px rgba(245,158,11,0.25)'
                : '0 0 20px rgba(139,92,246,0.25)',
            }}
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
          <span style={{ padding: '2px 10px', borderRadius: '999px', background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Round #{votingState.roundNumber}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '999px', background: 'rgba(11,8,22,0.8)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24', fontFamily: 'monospace', fontWeight: 700, fontSize: '12px' }}>
          <Clock className="h-3.5 w-3.5 animate-spin" />
          <span>{votingState.timeRemainingSeconds}s</span>
        </div>
      </div>

      {/* ============================================================= */}
      {/* MOBILE-FIRST SEGMENTED SWITCHER (Visible on phones, hidden on desktop) */}
      {/* ============================================================= */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '16px', margin: '0 12px 8px', background: 'rgba(11,8,22,0.8)', border: '1px solid rgba(139,92,246,0.2)' }} className="md:hidden shrink-0">
        <button
          onClick={() => setMobileTab('votes')}
          style={{
            flex: 1, padding: '8px', borderRadius: '12px', fontWeight: 700, fontSize: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            transition: 'all 0.2s', border: 'none', cursor: 'pointer',
            background: mobileTab === 'votes' ? 'linear-gradient(135deg, #8b5cf6, #06b6d4)' : 'transparent',
            color: mobileTab === 'votes' ? '#fff' : '#94a3b8',
            boxShadow: mobileTab === 'votes' ? '0 0 12px rgba(139,92,246,0.3)' : 'none',
          }}
        >
          <Trophy className="h-3.5 w-3.5" />
          <span>Rankings &amp; Chat</span>
        </button>

        <button
          onClick={() => setMobileTab('player')}
          style={{
            flex: 1, padding: '8px', borderRadius: '12px', fontWeight: 700, fontSize: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            transition: 'all 0.2s', border: 'none', cursor: 'pointer',
            background: mobileTab === 'player' ? 'linear-gradient(135deg, #8b5cf6, #06b6d4)' : 'transparent',
            color: mobileTab === 'player' ? '#fff' : '#94a3b8',
            boxShadow: mobileTab === 'player' ? '0 0 12px rgba(139,92,246,0.3)' : 'none',
          }}
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
          className={`flex-col h-full overflow-hidden rounded-3xl p-3 sm:p-4 shadow-xl backdrop-blur-md ${
            mobileTab === 'votes' ? 'flex' : 'hidden md:flex'
          }`}
          style={{ background: 'rgba(11,8,22,0.9)', border: '1px solid rgba(139,92,246,0.2)' }}
        >
          {/* Left Column Tabs Header: Comments & Rankings */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(139,92,246,0.1)', marginBottom: '12px', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setActiveLeftTab('rankings')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '10px',
                  fontWeight: 700, fontSize: '12px', cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                  background: activeLeftTab === 'rankings' ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.04)',
                  color: activeLeftTab === 'rankings' ? '#fbbf24' : '#94a3b8',
                  boxShadow: activeLeftTab === 'rankings' ? '0 0 10px rgba(251,191,36,0.15)' : 'none',
                  borderColor: activeLeftTab === 'rankings' ? 'rgba(251,191,36,0.3)' : 'transparent',
                  outline: activeLeftTab === 'rankings' ? '1px solid rgba(251,191,36,0.3)' : '1px solid transparent',
                }}
              >
                <Trophy style={{ height: '14px', width: '14px' }} />
                <span>Rankings</span>
              </button>

              <button
                onClick={() => setActiveLeftTab('chat')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '10px',
                  fontWeight: 700, fontSize: '12px', cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                  background: activeLeftTab === 'chat' ? 'rgba(6,182,212,0.12)' : 'rgba(255,255,255,0.04)',
                  color: activeLeftTab === 'chat' ? '#06b6d4' : '#94a3b8',
                  boxShadow: activeLeftTab === 'chat' ? '0 0 10px rgba(6,182,212,0.15)' : 'none',
                  outline: activeLeftTab === 'chat' ? '1px solid rgba(6,182,212,0.3)' : '1px solid transparent',
                }}
              >
                <MessageSquare style={{ height: '14px', width: '14px' }} />
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
          <div style={{ flex: 1, borderRadius: '24px', background: 'rgba(11,8,22,0.9)', border: '1px solid rgba(139,92,246,0.2)', padding: '12px 14px', boxShadow: '0 4px 24px rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
            {/* Right Tabs Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid rgba(139,92,246,0.1)', marginBottom: '8px', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setActiveRightTab('search')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '10px',
                    fontWeight: 700, fontSize: '12px', cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                    background: activeRightTab === 'search' ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)',
                    color: activeRightTab === 'search' ? '#a78bfa' : '#94a3b8',
                    outline: activeRightTab === 'search' ? '1px solid rgba(139,92,246,0.35)' : '1px solid transparent',
                    boxShadow: activeRightTab === 'search' ? '0 0 10px rgba(139,92,246,0.15)' : 'none',
                  }}
                >
                  <Search style={{ height: '13px', width: '13px' }} />
                  <span>Results ({searchResults.length})</span>
                </button>

                <button
                  onClick={() => setActiveRightTab('lyrics')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '10px',
                    fontWeight: 700, fontSize: '12px', cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                    background: activeRightTab === 'lyrics' ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)',
                    color: activeRightTab === 'lyrics' ? '#a78bfa' : '#94a3b8',
                    outline: activeRightTab === 'lyrics' ? '1px solid rgba(139,92,246,0.35)' : '1px solid transparent',
                    boxShadow: activeRightTab === 'lyrics' ? '0 0 10px rgba(139,92,246,0.15)' : 'none',
                  }}
                >
                  <Mic2 style={{ height: '13px', width: '13px' }} />
                  <span>Lyrics</span>
                </button>
              </div>

              {currentTrack && (
                <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
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
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-2.5 backdrop-blur-md flex items-center justify-between gap-3 shadow-2xl"
          style={{ background: 'rgba(11,8,22,0.97)', borderTop: '1px solid rgba(139,92,246,0.25)' }}>
          <div
            onClick={() => setMobileTab('player')}
            className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
          >
            <div style={{ height: '36px', width: '36px', borderRadius: '12px', background: 'rgba(139,92,246,0.15)', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {currentTrack?.artworkUrl ? (
                <img src={currentTrack.artworkUrl} alt={currentTrack.title} style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
              ) : (
                <Music style={{ height: '15px', width: '15px', color: '#8b5cf6' }} />
              )}
            </div>
            <div className="min-w-0">
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                {currentTrack?.title || 'No Track'}
              </p>
              <p style={{ fontSize: '10px', color: '#8b5cf6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                {currentTrack?.artist || 'Tap for Player'} · 0:{Math.round(currentTime).toString().padStart(2, '0')}/0:60
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleTogglePlay}
              style={{ height: '32px', width: '32px', borderRadius: '50%', background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px' }}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button
              onClick={handleSkipRound}
              style={{ height: '32px', width: '32px', borderRadius: '50%', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px' }}
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
    </div>
  );
}

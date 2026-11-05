import React from 'react';
import { Track, VotingRoundState, SongVoteGroup } from '../types';
import { LyricLine } from '../data/lyrics';
import { LyricsView } from './LyricsView';
import { WaveformVisualizer } from './WaveformVisualizer';
import {
  Clock,
  Radio,
  Sliders,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  Trophy,
  Users,
  MessageCircle,
  Flame,
  Sparkles,
} from 'lucide-react';

interface MobileLiveStageProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  votingState: VotingRoundState;
  lyrics: LyricLine[];
  isLyricsLoading: boolean;
  isMuted: boolean;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onSkipTrack: () => void;
  onOpenDrawer: () => void;
}

export const MobileLiveStage: React.FC<MobileLiveStageProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  votingState,
  lyrics,
  isLyricsLoading,
  isMuted,
  onTogglePlay,
  onToggleMute,
  onSkipTrack,
  onOpenDrawer,
}) => {
  const {
    roundNumber,
    timeRemainingSeconds,
    durationSeconds,
    leaderboard,
    channelName,
    isConnected,
    isWaitingForVotes,
  } = votingState;

  // 60s countdown calculation
  const countdownPercent = Math.max(
    0,
    Math.min(100, Math.round((timeRemainingSeconds / (durationSeconds || 60)) * 100))
  );

  // Playback timeline (0 to 60s)
  const musicSec = Math.min(60, Math.round(currentTime));
  const musicPercent = Math.min(100, (musicSec / 60) * 100);

  const top3 = leaderboard.slice(0, 3);
  const maxVotes = top3.length > 0 ? top3[0].voteCount : 1;

  return (
    <div className="flex flex-col h-screen w-full bg-[#0c0a1a] text-white select-none overflow-hidden relative">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-pink-600/15 blur-3xl pointer-events-none" />

      {/* ============================================================= */}
      {/* 1. TOP MOBILE HEADER BAR                                       */}
      {/* ============================================================= */}
      <header className="flex items-center justify-between px-4 py-2.5 bg-[#120e29]/90 border-b border-purple-900/30 backdrop-blur-md shrink-0 z-20">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 shadow-md shrink-0">
            <Radio className="h-4 w-4 text-white animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black tracking-wide text-white">WAVE</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                60s DJ
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isConnected ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-amber-400 animate-ping'
                }`}
              />
              <span className="font-bold text-slate-300 truncate">
                {isConnected ? channelName : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>

        {/* Round Badge & Settings */}
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono font-black text-amber-400">
            R#{roundNumber}
          </div>
          <button
            onClick={onOpenDrawer}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5"
            title="DJ Controls"
          >
            <Sliders className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* ============================================================= */}
      {/* 2. MAIN SCROLLABLE/FLEX CONTENT (VERTICAL 9:16 OPTIMIZED)      */}
      {/* ============================================================= */}
      <div className="flex-1 flex flex-col p-3.5 gap-3 min-h-0 overflow-y-auto z-10">
        {/* HERO NOW PLAYING CARD */}
        <div className="rounded-2xl p-4 bg-gradient-to-br from-[#1b153b]/95 via-[#14102c]/95 to-[#0e0b1f]/98 border border-purple-500/20 shadow-xl shrink-0">
          {isWaitingForVotes ? (
            <div className="py-6 px-3 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(251,191,36,0.2)]">
                <MessageCircle className="h-6 w-6 animate-bounce" />
              </div>
              <h2 className="text-base font-black text-white mb-1">Waiting For Song Votes</h2>
              <p className="text-xs text-slate-300 font-medium max-w-xs">
                Comment a song title in TikTok chat to play the next 60s track!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {/* Artwork */}
                <div
                  className={`relative w-16 h-16 rounded-xl overflow-hidden shadow-lg border border-white/10 shrink-0 transition-transform ${
                    isPlaying ? 'scale-105 shadow-purple-500/30' : ''
                  }`}
                >
                  <img
                    src={
                      currentTrack?.artworkUrl ||
                      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop'
                    }
                    alt={currentTrack?.title || 'Track Art'}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Metadata */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      PLAYING · 60s
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white truncate leading-tight">
                    {currentTrack?.title || 'Select a Song'}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 truncate">
                    {currentTrack?.artist || 'WAVE Live'}
                  </p>
                  <div className="mt-1">
                    <WaveformVisualizer isPlaying={isPlaying} barCount={18} className="h-6" />
                  </div>
                </div>
              </div>

              {/* 60s Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                  <span className="text-purple-300">0:{musicSec.toString().padStart(2, '0')}</span>
                  <span className="text-slate-400">0:60 Max</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 transition-all duration-300 rounded-full"
                    style={{ width: `${musicPercent}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 60-SECOND COUNTDOWN & TOP VOTE RACE */}
        <div className="rounded-2xl p-3.5 bg-[#14102c]/90 border border-amber-500/20 shadow-xl shrink-0 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1 mb-0.5">
              <Clock className="h-3 w-3 animate-spin" />
              Next Track Countdown
            </span>
            <p className="text-xs font-extrabold text-white truncate">
              {top3.length > 0
                ? `#1: ${top3[0].displayTitle}`
                : 'Comment song to vote!'}
            </p>
            <span className="text-[10px] text-slate-400">
              Plays automatically at 0s
            </span>
          </div>

          {/* Digital Timer Ring */}
          <div className="relative flex items-center justify-center h-14 w-14 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="15"
                className="text-white/10 stroke-current"
                strokeWidth="3"
                fill="none"
              />
              <circle
                cx="18"
                cy="18"
                r="15"
                className="text-amber-400 stroke-current transition-all duration-1000 ease-linear"
                strokeWidth="3.2"
                strokeDasharray="94.2"
                strokeDashoffset={94.2 - (countdownPercent / 100) * 94.2}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center font-mono leading-none">
              <span className="text-base font-black text-white">{timeRemainingSeconds}s</span>
            </div>
          </div>
        </div>

        {/* TOP 3 VOTE RACE LIST */}
        <div className="rounded-2xl p-3 bg-[#120e29]/70 border border-white/5 backdrop-blur-md shrink-0 space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
            <div className="flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs font-black text-white tracking-wide">
                Chat Vote Leaderboard
              </span>
            </div>
            <span className="text-[10px] font-mono text-purple-300">
              1 vote per viewer
            </span>
          </div>

          {top3.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-3 font-medium">
              No votes yet. Tell chat: &ldquo;Comment a song name!&rdquo;
            </p>
          ) : (
            top3.map((song, idx) => {
              const isLeader = idx === 0;
              const percent = Math.round((song.voteCount / maxVotes) * 100);

              return (
                <div
                  key={song.groupKey}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isLeader
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-white/[0.02] border-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-black shrink-0 ${
                          isLeader ? 'bg-amber-400 text-black' : 'bg-white/10 text-white'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="text-xs font-black text-white truncate">
                        {song.displayTitle}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate">
                        · {song.artist}
                      </span>
                    </div>

                    <span className="text-[11px] font-black font-mono text-amber-400 shrink-0">
                      {song.voteCount} {song.voteCount === 1 ? 'vote' : 'votes'}
                    </span>
                  </div>

                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isLeader ? 'bg-gradient-to-r from-amber-400 to-pink-500' : 'bg-purple-500/60'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* SYNCHRONIZED KARAOKE LYRICS */}
        <div className="flex-1 rounded-2xl bg-[#120e29]/70 border border-white/5 p-3 min-h-[140px] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between pb-1.5 border-b border-white/5 mb-1 shrink-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-300">
              Synchronized Lyrics
            </span>
            <span className="text-[9px] font-mono text-slate-400">Karaoke Mode</span>
          </div>

          <div className="flex-1 overflow-hidden min-h-0">
            <LyricsView
              currentTrack={currentTrack}
              lyrics={lyrics}
              currentTime={currentTime}
              isPlaying={isPlaying}
              isLoading={isLyricsLoading}
              isSynced={true}
              onSeek={() => {}}
              className="h-full"
            />
          </div>
        </div>
      </div>

      {/* ============================================================= */}
      {/* 3. BOTTOM THUMB-FRIENDLY HOST TOOLBAR                          */}
      {/* ============================================================= */}
      <footer className="px-4 py-2.5 bg-[#120e29]/95 border-t border-white/10 flex items-center justify-between gap-3 shrink-0 z-20">
        <button
          onClick={onTogglePlay}
          className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 font-bold text-xs text-white flex items-center justify-center gap-1.5 transition active:scale-95"
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          <span>{isPlaying ? 'Pause' : 'Play'}</span>
        </button>

        <button
          onClick={onSkipTrack}
          className="flex-1 py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 font-bold text-xs text-amber-300 flex items-center justify-center gap-1.5 transition active:scale-95"
        >
          <SkipForward className="h-3.5 w-3.5" />
          <span>Next Winner</span>
        </button>

        <button
          onClick={onToggleMute}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </footer>
    </div>
  );
};

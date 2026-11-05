import React from 'react';
import { Track, VotingRoundState, SongVoteGroup } from '../types';
import { LyricLine } from '../data/lyrics';
import { LyricsView } from './LyricsView';
import { WaveformVisualizer } from './WaveformVisualizer';
import {
  Flame,
  Clock,
  Radio,
  Sliders,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  Sparkles,
  Trophy,
  Users,
  MessageCircle,
} from 'lucide-react';

interface LiveStageProps {
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
  onForceWin: (song: SongVoteGroup) => void;
}

export const LiveStage: React.FC<LiveStageProps> = ({
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
  onForceWin,
}) => {
  const {
    roundNumber,
    timeRemainingSeconds,
    durationSeconds,
    leaderboard,
    currentWinner,
    isConnected,
    channelName,
    isWaitingForVotes,
  } = votingState;

  // Percentage for the 60s round countdown
  const countdownPercent = Math.max(
    0,
    Math.min(100, Math.round((timeRemainingSeconds / (durationSeconds || 60)) * 100))
  );

  // Playback time clamped to 60s
  const currentMusicSec = Math.min(60, Math.round(currentTime));
  const musicPercent = Math.min(100, (currentMusicSec / 60) * 100);

  const top3 = leaderboard.slice(0, 3);
  const maxVotes = top3.length > 0 ? top3[0].voteCount : 1;

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0c0a1a] text-white overflow-hidden select-none">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-3 border-b border-purple-900/30 bg-[#120e29]/80 backdrop-blur-xl shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 shadow-lg shadow-purple-950/60">
            <Radio className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-wider bg-gradient-to-r from-purple-200 via-pink-200 to-amber-200 bg-clip-text text-transparent">
                WAVE
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                60s Live DJ
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  isConnected ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400 animate-ping'
                }`}
              />
              <span className="font-semibold text-slate-300">
                {isConnected ? channelName : 'TikTok Disconnected'}
              </span>
            </div>
          </div>
        </div>

        {/* Center Round Badge */}
        <div className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 shadow-inner">
          <span className="text-xs font-bold text-slate-400">CURRENT ROUND</span>
          <span className="text-sm font-black text-amber-400 font-mono">#{roundNumber}</span>
          <span className="text-slate-600">|</span>
          <span className="text-xs font-semibold text-purple-300">60s Continuous Voting</span>
        </div>

        {/* DJ Controls Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="h-5 w-5 text-rose-400" /> : <Volume2 className="h-5 w-5" />}
          </button>

          <button
            onClick={onOpenDrawer}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-900/40 transition transform active:scale-95"
          >
            <Sliders className="h-4 w-4" />
            <span>DJ Controls</span>
          </button>
        </div>
      </header>

      {/* Main Broadcast Stage Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 sm:p-6 overflow-hidden min-h-0">
        {/* ========================================================= */}
        {/* LEFT / CENTER: NOW PLAYING & LYRICS STAGE (7 COLS)        */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 flex flex-col gap-4 h-full min-h-0 overflow-hidden">
          {/* Hero Now Playing Card */}
          <div className="relative rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#1b153b]/90 via-[#14102c]/90 to-[#0e0b1f]/95 border border-purple-500/20 shadow-2xl backdrop-blur-xl flex flex-col justify-between overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-pink-600/20 blur-3xl pointer-events-none" />

            {/* Waiting for Votes Overlay Banner */}
            {isWaitingForVotes ? (
              <div className="py-8 px-4 flex flex-col items-center justify-center text-center z-10 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-3 shadow-[0_0_25px_rgba(251,191,36,0.25)]">
                  <MessageCircle className="h-8 w-8 animate-bounce" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mb-1.5 tracking-wide">
                  Waiting For Your Song Votes
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md font-medium leading-relaxed">
                  The music is paused. Comment any song title or artist in the{' '}
                  <span className="text-amber-400 font-bold">TikTok LIVE chat</span> to launch the next
                  60-second music round!
                </p>
                <div className="mt-4 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300 flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>Example: &ldquo;play blinding lights&rdquo; or &ldquo;mulatu tezeta&rdquo;</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 z-10">
                {/* Track Metadata & Artwork */}
                <div className="flex items-center gap-4 sm:gap-6">
                  {/* Artwork with Vinyl Effect */}
                  <div className="relative group shrink-0">
                    <div
                      className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 transition-transform duration-700 ${
                        isPlaying ? 'scale-105 shadow-purple-500/30' : 'scale-100'
                      }`}
                    >
                      <img
                        src={
                          currentTrack?.artworkUrl ||
                          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop'
                        }
                        alt={currentTrack?.title || 'Track Art'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Title & Artist */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        NOW PLAYING · 60s
                      </span>
                      {currentTrack?.genre && (
                        <span className="text-[10px] font-semibold text-slate-400">
                          {currentTrack.genre}
                        </span>
                      )}
                    </div>

                    <h1 className="text-xl sm:text-2xl font-black text-white truncate tracking-tight">
                      {currentTrack?.title || 'Select a Song'}
                    </h1>
                    <p className="text-sm sm:text-base font-bold text-slate-300 truncate">
                      {currentTrack?.artist || 'WAVE Radio'}
                    </p>

                    {/* Waveform Visualizer */}
                    <div className="mt-2">
                      <WaveformVisualizer isPlaying={isPlaying} barCount={24} />
                    </div>
                  </div>
                </div>

                {/* 60-Second Track Timeline Bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold">
                    <span className="text-purple-300">0:{currentMusicSec.toString().padStart(2, '0')}</span>
                    <span className="text-slate-400">0:60 Max</span>
                  </div>
                  <div className="relative h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 transition-all duration-300 rounded-full"
                      style={{ width: `${musicPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Synchronized Lyrics Container */}
          <div className="flex-1 rounded-3xl bg-[#120e29]/70 border border-white/5 backdrop-blur-md overflow-hidden min-h-0 flex flex-col p-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-2">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                Synchronized Lyrics
              </span>
              <span className="text-[10px] font-mono text-slate-400">Karaoke Mode</span>
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

        {/* ========================================================= */}
        {/* RIGHT: 60-SECOND VOTE RACE & LIVE LEADERBOARD (5 COLS)     */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 flex flex-col gap-4 h-full min-h-0 overflow-hidden">
          {/* Circular Countdown Timer Widget */}
          <div className="relative rounded-3xl p-5 bg-gradient-to-b from-[#181339]/90 to-[#120e29]/90 border border-amber-500/20 shadow-2xl backdrop-blur-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5 mb-1">
                <Clock className="h-3.5 w-3.5 animate-spin" />
                VOTING COUNTDOWN
              </span>
              <h3 className="text-lg font-black text-white">Next Song Winner</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isWaitingForVotes
                  ? 'Timer paused until chat votes'
                  : 'Leading song plays immediately at 0s'}
              </p>
            </div>

            {/* Glowing Digital Gauge */}
            <div className="relative flex items-center justify-center h-20 w-20 shrink-0">
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
              <div className="absolute flex flex-col items-center justify-center font-mono">
                <span className="text-xl font-black text-white leading-none">
                  {timeRemainingSeconds}s
                </span>
                <span className="text-[9px] font-bold text-amber-400 uppercase mt-0.5">LEFT</span>
              </div>
            </div>
          </div>

          {/* Top 3 Vote Race Leaderboard */}
          <div className="flex-1 rounded-3xl bg-[#120e29]/70 border border-white/5 backdrop-blur-md overflow-hidden min-h-0 flex flex-col p-4 sm:p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-black text-white tracking-wide">
                  Top Live Requests
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-purple-300">
                {leaderboard.length} {leaderboard.length === 1 ? 'song' : 'songs'} in race
              </span>
            </div>

            {/* Song Cards */}
            <div className="flex-1 overflow-y-auto space-y-3 min-h-0 pr-1">
              {top3.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <Flame className="h-10 w-10 text-slate-700 mb-2" />
                  <p className="text-sm font-bold text-slate-400">No Votes In This Round Yet</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Viewers can comment song titles in TikTok LIVE to push them to #1!
                  </p>
                </div>
              ) : (
                top3.map((song, index) => {
                  const isLeader = index === 0;
                  const percentOfTop = Math.round((song.voteCount / maxVotes) * 100);

                  return (
                    <div
                      key={song.groupKey}
                      className={`p-3.5 rounded-2xl border transition-all duration-300 ${
                        isLeader
                          ? 'bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-transparent border-amber-500/30 shadow-lg shadow-amber-950/20'
                          : 'bg-white/[0.03] border-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black shrink-0 ${
                              isLeader
                                ? 'bg-amber-400 text-slate-950 shadow-[0_0_10px_#fbbf24]'
                                : 'bg-white/10 text-white'
                            }`}
                          >
                            {index + 1}
                          </span>
                          <div className="min-w-0">
                            <h4 className="text-sm font-extrabold text-white truncate leading-tight">
                              {song.displayTitle}
                            </h4>
                            <p className="text-xs font-semibold text-slate-400 truncate">
                              {song.artist}
                            </p>
                          </div>
                        </div>

                        {/* Vote Count & Force Win */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-black font-mono text-amber-400 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                            {song.voteCount} {song.voteCount === 1 ? 'vote' : 'votes'}
                          </span>
                        </div>
                      </div>

                      {/* Animated Vote Bar */}
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isLeader
                              ? 'bg-gradient-to-r from-amber-400 to-pink-500'
                              : 'bg-purple-500/60'
                          }`}
                          style={{ width: `${percentOfTop}%` }}
                        />
                      </div>

                      {/* Requesting Users Avatars / Nicknames */}
                      {song.requestingUsers.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400">
                          <Users className="h-3 w-3 text-purple-400" />
                          <span className="truncate">
                            Requested by: {song.requestingUsers.slice(0, 3).join(', ')}
                            {song.requestingUsers.length > 3 &&
                              ` +${song.requestingUsers.length - 3}`}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Anti-Spam / Tie-Breaker Hint */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
              <span>Rule: 1 vote per viewer</span>
              <span className="text-purple-300 font-semibold">Earliest vote wins ties</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

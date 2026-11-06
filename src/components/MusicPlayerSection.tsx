import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Headphones,
  Music,
} from 'lucide-react';
import { Track, SongVoteGroup } from '../types';

interface MusicPlayerSectionProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  upcomingWinner: SongVoteGroup | null;
  lastWinnerMeta?: {
    songTitle: string;
    artist: string;
    voteCount: number;
    roundNumber: number;
  };
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev?: () => void;
  onSeek: (seconds: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onOpenVideoModal?: () => void;
}

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export const MusicPlayerSection: React.FC<MusicPlayerSectionProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onNext,
  onPrev,
  onSeek,
  onOpenVideoModal,
}) => {
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  useEffect(() => {
    if (!isScrubbing) {
      setScrubTime(currentTime);
    }
  }, [currentTime, isScrubbing]);

  const maxDuration = duration > 0 ? duration : 212; // 3:32 default
  const displayCurrent = isScrubbing ? scrubTime : currentTime;
  const progressPercent = Math.min(100, (displayCurrent / maxDuration) * 100);

  return (
    <div className="flex flex-col h-full rounded-2xl sm:rounded-3xl border border-[#2b2454] bg-[#120f26]/95 backdrop-blur-xl p-2.5 sm:p-3.5 shadow-2xl justify-between overflow-hidden">
      {/* Header: Headphones + MUSIC PLAYER */}
      <div className="flex items-center gap-2 mb-1 sm:mb-2 shrink-0">
        <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
          <Headphones className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
        </div>
        <h2 className="text-sm sm:text-base font-extrabold tracking-wide text-white uppercase">
          MUSIC PLAYER
        </h2>
      </div>

      {/* Album Artwork & Metadata: Compact horizontal on mobile, large centered on desktop */}
      <div className="flex sm:flex-col items-center gap-3 sm:gap-2 mb-1 sm:mb-2 shrink-0">
        <div
          onClick={onOpenVideoModal}
          className="relative h-16 w-16 sm:h-auto sm:w-full sm:flex-1 min-h-[64px] sm:min-h-[110px] max-h-[170px] rounded-xl sm:rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shadow-lg group cursor-pointer shrink-0 flex items-center justify-center"
          title="Click to expand video stage"
        >
          {currentTrack?.artworkUrl ? (
            <img
              src={currentTrack.artworkUrl}
              alt={currentTrack.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-purple-300">
              <Music className="h-6 w-6 sm:h-10 sm:w-10" />
            </div>
          )}
        </div>

        {/* Song Title & Artist */}
        <div className="text-left sm:text-center min-w-0 flex-1 sm:w-full">
          <h3 className="text-sm sm:text-base font-black text-white truncate leading-tight">
            {currentTrack?.title || 'Faded'}
          </h3>
          <p className="text-[11px] sm:text-xs font-semibold text-slate-400 truncate mt-0.5">
            {currentTrack?.artist || 'Alan Walker'}
          </p>
        </div>
      </div>

      {/* Scrubber Progress Slider with 0:15 and 3:32 */}
      <div className="mb-1 sm:mb-2 shrink-0">
        <div className="relative flex items-center mb-0.5">
          {/* Custom styled track */}
          <div className="relative h-1.5 w-full bg-[#231d42] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-150"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <input
            type="range"
            min={0}
            max={maxDuration}
            step={0.5}
            value={displayCurrent}
            onMouseDown={() => setIsScrubbing(true)}
            onTouchStart={() => setIsScrubbing(true)}
            onChange={(e) => setScrubTime(Number(e.target.value))}
            onMouseUp={() => {
              setIsScrubbing(false);
              onSeek(scrubTime);
            }}
            onTouchEnd={() => {
              setIsScrubbing(false);
              onSeek(scrubTime);
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        <div className="flex justify-between text-[10px] sm:text-[11px] font-mono text-slate-400 tabular-nums">
          <span>{formatTime(displayCurrent)}</span>
          <span>{formatTime(maxDuration)}</span>
        </div>
      </div>

      {/* Controls Row: Shuffle | Prev | Play/Pause | Next | Repeat */}
      <div className="flex items-center justify-between px-2 sm:px-5 mb-1.5 sm:mb-2 shrink-0">
        {/* Shuffle */}
        <button
          onClick={() => setIsShuffle(!isShuffle)}
          className={`p-1.5 transition active:scale-90 ${
            isShuffle ? 'text-purple-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
          title="Shuffle"
        >
          <Shuffle className="h-4 w-4" />
        </button>

        {/* Previous */}
        <button
          onClick={onPrev || (() => onSeek(0))}
          className="p-1.5 text-slate-200 hover:text-white active:scale-90 transition"
          title="Previous"
        >
          <SkipBack className="h-5 w-5 fill-current" />
        </button>

        {/* Center Glowing Play / Pause Button */}
        <button
          onClick={onTogglePlay}
          className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-[0_0_18px_rgba(168,85,247,0.55)] hover:scale-105 active:scale-95 transition"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5 sm:h-6 sm:w-6 fill-white" />
          ) : (
            <Play className="h-5 w-5 sm:h-6 sm:w-6 fill-white ml-0.5" />
          )}
        </button>

        {/* Next */}
        <button
          onClick={onNext}
          className="p-1.5 text-slate-200 hover:text-white active:scale-90 transition"
          title="Next"
        >
          <SkipForward className="h-5 w-5 fill-current" />
        </button>

        {/* Repeat */}
        <button
          onClick={() => setIsRepeat(!isRepeat)}
          className={`p-1.5 transition active:scale-90 ${
            isRepeat ? 'text-purple-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
          title="Repeat"
        >
          <Repeat className="h-4 w-4" />
        </button>
      </div>

      {/* Bottom Status Pill: Green dot + Now Playing */}
      <div className="flex items-center justify-center gap-2 py-1.5 sm:py-2 px-3 rounded-full bg-[#1b153b] border border-[#3b2d6a] text-[11px] sm:text-xs font-bold text-[#00e676] shadow-sm shrink-0">
        <span className="h-2 w-2 rounded-full bg-[#00e676] animate-pulse shadow-[0_0_8px_#00e676]" />
        <span>Now Playing</span>
      </div>
    </div>
  );
};

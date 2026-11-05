import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  Mic2,
  Heart,
  Music,
  Repeat,
  Repeat1,
  Tv,
} from 'lucide-react';
import { Track, RepeatMode } from '../types';

interface PlayerBarProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  repeatMode: RepeatMode;
  isFavorite: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onToggleRepeat: () => void;
  onToggleFavorite: () => void;
  onOpenExpanded: () => void;
  onOpenLyrics: () => void;
  onOpenFullSong: () => void;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  repeatMode,
  isFavorite,
  onTogglePlay,
  onNext,
  onToggleRepeat,
  onToggleFavorite,
  onOpenExpanded,
  onOpenLyrics,
  onOpenFullSong,
}) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [currentTrack?.id]);

  if (!currentTrack) return null;

  const maxDuration = duration > 0 ? duration : 210;
  const progressPercent = Math.min(100, (currentTime / maxDuration) * 100);

  return (
    <div className="fixed bottom-14 left-0 right-0 z-40 px-3 sm:px-6 pointer-events-none">
      <div className="mx-auto max-w-xl pointer-events-auto">
        <div
          onClick={onOpenExpanded}
          className="group relative flex items-center justify-between gap-2.5 rounded-2xl border border-white/10 bg-[#161624]/95 p-2 sm:p-2.5 shadow-2xl backdrop-blur-xl cursor-pointer hover:border-purple-500/40 transition-all active:scale-[0.99]"
        >
          {/* Top hairline progress bar */}
          <div className="absolute top-0 left-3 right-3 h-[2px] rounded-full overflow-hidden bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Left: Thumbnail & Song Info */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-purple-950/40 border border-white/10 shadow-sm">
              {!imgError && currentTrack.artworkUrl ? (
                <img
                  src={currentTrack.artworkUrl}
                  alt={currentTrack.title}
                  onError={() => setImgError(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-purple-300">
                  <Music className="h-5 w-5" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                {currentTrack.title}
              </h4>
              <p className="truncate text-xs text-slate-400">
                {currentTrack.artist}
              </p>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div
            className="flex items-center gap-1 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Quick Loop Button */}
            <button
              onClick={onToggleRepeat}
              className={`rounded-full p-2 transition ${
                repeatMode === 'one'
                  ? 'text-pink-400 bg-pink-500/20'
                  : repeatMode === 'all'
                  ? 'text-purple-400 bg-purple-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={
                repeatMode === 'one'
                  ? 'Loop: 1 Song'
                  : repeatMode === 'all'
                  ? 'Loop: All'
                  : 'Loop: Off'
              }
              aria-label="Toggle loop"
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="h-4 w-4" />
              ) : (
                <Repeat className="h-4 w-4" />
              )}
            </button>

            {/* Direct Full Song Video Stage Toggle */}
            <button
              onClick={onOpenFullSong}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/35 text-purple-300 hover:text-white hover:bg-purple-500/25 text-[11px] font-bold active:scale-90 transition"
              title="Play Full Song Uncut (ሙሉ ዘፈን)"
              aria-label="Play Full Song Uncut"
            >
              <Tv className="h-3.5 w-3.5 text-purple-400" />
              <span>ሙሉ</span>
            </button>

            {/* Direct lyrics toggle */}
            <button
              onClick={onOpenLyrics}
              className="rounded-full p-2 text-slate-400 hover:text-purple-300 active:scale-90 transition"
              title="View Lyrics"
              aria-label="View Lyrics"
            >
              <Mic2 className="h-4 w-4" />
            </button>

            {/* Favorite button */}
            <button
              onClick={onToggleFavorite}
              className="rounded-full p-2 text-slate-400 hover:text-pink-400 active:scale-90 transition"
              title="Favorite"
              aria-label="Favorite"
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-pink-500 text-pink-500' : ''}`} />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={onTogglePlay}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500 text-slate-950 shadow-md shadow-purple-500/25 active:scale-90 transition"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 fill-slate-950" />
              ) : (
                <Play className="h-4 w-4 fill-slate-950 ml-0.5" />
              )}
            </button>

            {/* Next Track */}
            <button
              onClick={onNext}
              className="rounded-full p-2 text-slate-300 hover:text-white active:scale-90 transition"
              aria-label="Next track"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

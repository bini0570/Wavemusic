import React from 'react';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { DVAlbumArt } from './DVAlbumArt';

export const DVMiniPlayer = ({
  currentTrack,
  isPlaying,
  currentTime = 0,
  duration = 1,
  onPlayToggle,
  onPrevTrack,
  onNextTrack,
  onOpenNowPlaying,
}) => {
  if (!currentTrack) return null;

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full overflow-hidden rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.6)] border border-purple-500/25 bg-[#0e071c]/95 backdrop-blur-2xl select-none transition-all active:scale-[0.99]">
      {/* Hairline Progress Bar */}
      <div className="w-full h-[2px] bg-white/5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-400 to-indigo-400 transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>

      <div
        onClick={onOpenNowPlaying}
        className="flex items-center gap-3 px-3 py-2 cursor-pointer group"
      >
        {/* Tiny Album Art with Playing Glow */}
        <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-purple-500/30 bg-neutral-900 shadow-md">
          <DVAlbumArt
            track={currentTrack}
            isPlaying={isPlaying}
            size="sm"
            className="w-full h-full object-cover"
          />
          {isPlaying && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-[2px]">
              {[1, 2, 3].map((i) => (
                <span
                  key={i}
                  style={{
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: `${0.5 + i * 0.12}s`,
                  }}
                  className="w-[2px] rounded-full bg-purple-300 animate-bounce h-2.5"
                />
              ))}
            </div>
          )}
        </div>

        {/* Track Title and Artist */}
        <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
          <span className="text-xs font-bold text-white truncate group-hover:text-purple-300 transition-colors leading-tight">
            {currentTrack.title}
          </span>
          <span className="text-[10px] text-purple-300/70 truncate leading-tight mt-0.5">
            {currentTrack.artist}
          </span>
        </div>

        {/* Compact Transport Controls */}
        <div
          className="flex items-center gap-1 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {onPrevTrack && (
            <button
              onClick={onPrevTrack}
              className="w-7 h-7 flex items-center justify-center text-neutral-400 hover:text-white transition active:scale-90"
              title="Previous"
            >
              <SkipBack className="w-3.5 h-3.5 fill-current" />
            </button>
          )}

          <button
            onClick={onPlayToggle}
            className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white flex items-center justify-center shadow-md shadow-purple-950/60 transition active:scale-95"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={onNextTrack}
            className="w-7 h-7 flex items-center justify-center text-neutral-400 hover:text-white transition active:scale-90"
            title="Next"
          >
            <SkipForward className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
};

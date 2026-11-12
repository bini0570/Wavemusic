import React from 'react';
import { Play, Pause, SkipForward } from 'lucide-react';

export const DVMiniPlayer = ({
  currentTrack,
  isPlaying,
  onPlayToggle,
  onNextTrack,
  onOpenNowPlaying,
}) => {
  if (!currentTrack) return null;

  return (
    <div
      onClick={onOpenNowPlaying}
      className="w-full bg-[#120726]/95 border border-purple-500/25 rounded-2xl p-2 px-3 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 cursor-pointer group hover:border-purple-400/50 transition-all select-none"
    >
      <div className="flex items-center gap-3 overflow-hidden min-w-0">
        {/* Tiny Album Cover with subtle purple border */}
        <div className="w-10 h-10 rounded-xl overflow-hidden border border-purple-500/40 shrink-0 bg-neutral-900 relative">
          <img
            src={
              currentTrack.coverUrl ||
              '/assets/aistudio/6fb296ac-33e4-4fa6-b660-2b2aff3cb756_f201cdfc.png'
            }
            alt={currentTrack.title}
            className="w-full h-full object-cover"
            style={{
              objectPosition: currentTrack.coverUrl ? 'center' : '50% 24%',
              transform: currentTrack.coverUrl ? 'none' : 'scale(1.8)',
            }}
          />
        </div>

        {/* Track Title and Artist */}
        <div className="flex flex-col truncate min-w-0">
          <span className="text-xs font-bold text-white truncate group-hover:text-purple-300 transition-colors">
            {currentTrack.title}
          </span>
          <span className="text-[10px] text-purple-300/70 truncate">
            {currentTrack.artist}
          </span>
        </div>
      </div>

      {/* Mini Controls */}
      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onPlayToggle}
          className="w-9 h-9 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-950/60 transition active:scale-95"
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
          className="w-8 h-8 rounded-full text-neutral-300 hover:text-white flex items-center justify-center transition active:scale-95"
          title="Next Track"
        >
          <SkipForward className="w-4 h-4 fill-current" />
        </button>
      </div>
    </div>
  );
};

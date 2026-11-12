import React from 'react';
import { Play, Pause, SkipForward } from 'lucide-react';
import { DVAlbumArt } from './DVAlbumArt';

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
      className="w-full bg-[#120726]/95 border border-purple-500/30 rounded-2xl p-2 px-3 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 cursor-pointer group hover:border-purple-400/50 transition-all select-none active:scale-[0.99]"
    >
      <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
        {/* Tiny Album Cover */}
        <div className="w-9 h-9 rounded-xl overflow-hidden border border-purple-500/40 shrink-0 bg-neutral-900 relative">
          <DVAlbumArt
            track={currentTrack}
            isPlaying={isPlaying}
            size="sm"
            className="w-full h-full"
          />
          {isPlaying && (
            <div className="absolute inset-0 bg-purple-600/30 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            </div>
          )}
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
      <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
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
          className="w-8 h-8 rounded-full text-neutral-300 hover:text-white flex items-center justify-center transition active:scale-90"
          title="Next Track"
        >
          <SkipForward className="w-4 h-4 fill-current" />
        </button>
      </div>
    </div>
  );
};

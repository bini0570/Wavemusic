import React, { useState } from 'react';
import { Music, Headphones, Disc, Radio, Sparkles } from 'lucide-react';

export const DVAlbumArt = ({
  track,
  className = 'w-full h-full',
  isPlaying = false,
  size = 'md', // 'sm' | 'md' | 'lg'
}) => {
  const [imgError, setImgError] = useState(false);

  // If track has a valid coverUrl and it hasn't errored
  if (track?.coverUrl && !imgError) {
    return (
      <img
        src={track.coverUrl}
        alt={track?.title || 'Cover'}
        onError={() => setImgError(true)}
        className={`${className} object-cover`}
      />
    );
  }

  // Neon Geometric Offline Album Artwork
  return (
    <div
      className={`${className} relative flex items-center justify-center overflow-hidden bg-gradient-to-tr from-[#1b0a33] via-[#241142] to-[#0f0520] select-none`}
    >
      {/* Subtle Vinyl Grooves Pattern */}
      <div className="absolute inset-0 vinyl-grooves opacity-35" />

      {/* Radiant Glow Behind Center Emblem */}
      <div
        className={`absolute w-3/4 h-3/4 rounded-full bg-purple-600/30 blur-xl pointer-events-none ${
          isPlaying ? 'animate-pulse' : 'opacity-40'
        }`}
      />

      {/* Rotating Accent Ring when playing */}
      {size === 'lg' && (
        <div
          className={`absolute inset-4 rounded-full border border-purple-500/25 border-dashed pointer-events-none ${
            isPlaying ? 'animate-vinyl' : ''
          }`}
        />
      )}

      {/* Center Icon Graphic */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center p-2">
        <div
          className={`rounded-2xl bg-gradient-to-br from-purple-500/30 to-indigo-500/20 border border-purple-400/40 flex items-center justify-center text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.5)] ${
            size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-16 h-16 rounded-3xl' : 'w-10 h-10'
          }`}
        >
          {size === 'sm' ? (
            <Music className="w-3.5 h-3.5 text-purple-300" />
          ) : size === 'lg' ? (
            <Headphones className="w-8 h-8 text-purple-200" />
          ) : (
            <Disc className="w-5 h-5 text-purple-300" />
          )}
        </div>

        {size === 'lg' && (
          <div className="mt-3 flex flex-col items-center max-w-[85%]">
            <span className="text-xs font-bold text-white tracking-wide truncate max-w-full drop-shadow">
              {track?.title || 'DV Music'}
            </span>
            <span className="text-[10px] text-purple-300/80 truncate max-w-full font-medium">
              {track?.artist || 'Offline Audio'}
            </span>
          </div>
        )}
      </div>

      {/* Corner Sparkle / VIP Brand */}
      {size === 'lg' && (
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-950/70 border border-purple-400/30 text-[8px] font-mono text-purple-300">
          <Sparkles className="w-2.5 h-2.5 text-purple-300" />
          <span>OFFLINE HQ</span>
        </div>
      )}
    </div>
  );
};

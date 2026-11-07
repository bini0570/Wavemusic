import React, { useEffect, useRef } from 'react';
import { Mic2, Music, Loader2 } from 'lucide-react';

export const LyricsView = ({
  currentTrack,
  lyrics = [],
  currentTime,
  isPlaying,
  isLoading = false,
  isSynced = true,
  isReal = true,
  sourceName = 'LRC Sync',
  hideHeader = false,
  onSeek,
  className = '',
}) => {
  const containerRef = useRef(null);
  const activeLineRef = useRef(null);

  // Find currently active lyric line index based on playback currentTime
  let activeIndex = 0;
  for (let i = 0; i < lyrics.length; i++) {
    if (currentTime >= lyrics[i].time) {
      activeIndex = i;
    } else {
      break;
    }
  }

  // Smooth scroll active line into view without jarring jumps
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex]);

  if (!currentTrack) {
    return (
      <div className={`flex flex-col items-center justify-center py-20 px-4 text-center ${className}`}>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10 text-purple-400 mb-2">
          <Mic2 className="h-5 w-5" />
        </div>
        <h3 className="text-sm font-semibold text-white">ግጥም (Lyrics)</h3>
        <p className="text-xs text-slate-500 mt-1">
          Select any track from Discover to follow real-time lyrics.
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Lightweight compact top header (hidden if hideHeader is true) */}
      {!hideHeader && (
        <div className="flex items-center justify-between gap-3 px-2 py-2 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-slate-900">
              {currentTrack.artworkUrl ? (
                <img
                  src={currentTrack.artworkUrl}
                  alt={currentTrack.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-purple-300">
                  <Music className="h-4 w-4" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h4 className="truncate text-xs font-bold text-white leading-tight">
                {currentTrack.title}
              </h4>
              <p className="truncate text-[11px] text-slate-400">{currentTrack.artist}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Audio: Studio
            </span>
            <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
              Lyrics: {sourceName}
            </span>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
          <Loader2 className="h-6 w-6 text-purple-400 animate-spin mb-2" />
          <p className="text-xs text-slate-400">Loading time-stamped lyrics...</p>
        </div>
      ) : lyrics.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-16 px-6 text-center">
          <Mic2 className="h-8 w-8 text-slate-600 mb-2" />
          <h4 className="text-sm font-medium text-slate-300 mb-1">No time-stamped lyrics found</h4>
          <p className="text-xs text-slate-500 max-w-xs">
            Singing lyrics for <strong>{currentTrack.title}</strong> are not yet available in the LRC database.
          </p>
        </div>
      ) : (
        /* Lightweight, airy lyrics typography list (zero heavy boxes/borders) */
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto space-y-5 py-10 px-3 scroll-smooth no-scrollbar"
        >
          {lyrics.map((line, idx) => {
            const isActive = idx === activeIndex && isPlaying;
            const isPast = idx < activeIndex;

            return (
              <button
                key={`${line.time}-${idx}`}
                ref={isActive ? activeLineRef : null}
                onClick={() => onSeek && onSeek(line.time)}
                className={`w-full text-left transition-all duration-300 block py-1 cursor-pointer focus:outline-none ${
                  isActive
                    ? 'text-white text-lg sm:text-xl font-semibold opacity-100 scale-[1.01]'
                    : isPast
                    ? 'text-slate-400 text-sm sm:text-base opacity-75 hover:opacity-100'
                    : 'text-slate-500 text-sm sm:text-base opacity-50 hover:opacity-90'
                }`}
              >
                <span className="block leading-relaxed tracking-normal">{line.text}</span>
                {line.translation && (
                  <span className="block text-xs font-normal text-slate-400 mt-1">
                    {line.translation}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-10 text-center text-[10px] text-slate-600 font-mono">
            Time-Stamped Real Singing Lyrics
          </div>
        </div>
      )}
    </div>
  );
};

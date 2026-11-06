import React, { useState } from 'react';
import { Play, Pause, Heart, Music } from 'lucide-react';
import { Track } from '../types';

interface TrackCardProps {
  track: Track;
  isPlaying: boolean;
  isCurrent: boolean;
  isFavorite: boolean;
  onPlayToggle: () => void;
  onToggleFavorite: () => void;
  onSelectTrack: () => void;
}

export const TrackCard: React.FC<TrackCardProps> = ({
  track,
  isPlaying,
  isCurrent,
  isFavorite,
  onPlayToggle,
  onToggleFavorite,
  onSelectTrack,
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <article
      onClick={onSelectTrack}
      className={`group flex items-center justify-between gap-3 rounded-2xl p-2.5 transition-all cursor-pointer active:scale-[0.98] ${
        isCurrent
          ? 'bg-purple-950/40 border border-purple-500/40'
          : 'bg-[#151522]/80 border border-white/5 hover:border-white/10 hover:bg-[#191928]'
      }`}
    >
      {/* Artwork with play overlay */}
      <div className="relative h-13 w-13 shrink-0 overflow-hidden rounded-xl bg-purple-950/40">
        {!imgError && track.artworkUrl ? (
          <img
            src={track.artworkUrl}
            alt={track.title}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-purple-300">
            <Music className="h-5 w-5" />
          </div>
        )}

        {/* Playing animation or play icon */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition ${
            isCurrent ? 'bg-black/30' : 'opacity-0 group-hover:opacity-100 bg-black/40'
          }`}
        >
          {isCurrent && isPlaying ? (
            <div className="flex items-end gap-0.5 h-3">
              <span className="w-1 bg-purple-400 animate-pulse h-full rounded-full" />
              <span className="w-1 bg-purple-300 animate-bounce h-2/3 rounded-full" />
              <span className="w-1 bg-purple-400 animate-pulse h-4/5 rounded-full" />
            </div>
          ) : (
            <Play className="h-4 w-4 fill-white text-white ml-0.5" />
          )}
        </div>
      </div>

      {/* Meta text (minimal, zero fluff) */}
      <div className="min-w-0 flex-1">
        <h3
          className={`truncate text-sm font-bold ${
            isCurrent ? 'text-purple-300' : 'text-white'
          }`}
        >
          {track.title}
        </h3>
        <p className="truncate text-xs text-slate-400 mt-0.5">
          {track.artist}
        </p>
      </div>

      {/* Actions (Heart + Play) */}
      <div
        className="flex items-center gap-1 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onToggleFavorite}
          className="rounded-full p-2 text-slate-400 hover:text-pink-400 active:scale-90 transition"
          aria-label="Favorite"
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-pink-500 text-pink-500' : ''}`} />
        </button>

        <button
          type="button"
          onClick={onPlayToggle}
          className={`flex h-9 w-9 items-center justify-center rounded-full transition active:scale-90 ${
            isCurrent && isPlaying
              ? 'bg-purple-500 text-slate-950 shadow-md shadow-purple-500/20'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
          aria-label={isCurrent && isPlaying ? 'Pause' : 'Play'}
        >
          {isCurrent && isPlaying ? (
            <Pause className="h-4 w-4 fill-current" />
          ) : (
            <Play className="h-4 w-4 fill-current ml-0.5" />
          )}
        </button>
      </div>
    </article>
  );
};

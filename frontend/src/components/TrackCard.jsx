import React, { useState } from 'react';
import { Play, Pause, Heart, Music } from 'lucide-react';

export const TrackCard = ({
  track,
  isPlaying,
  isCurrent,
  isFavorite,
  onPlayToggle,
  onToggleFavorite,
  onSelectTrack,
}) => {
  const [imgError, setImgError] = useState(false);

  const cardStyle = isCurrent
    ? {
        background: 'rgba(139,92,246,0.1)',
        border: '1px solid rgba(139,92,246,0.45)',
        boxShadow: '0 0 14px rgba(139,92,246,0.15)',
      }
    : {
        background: 'rgba(11,8,22,0.75)',
        border: '1px solid rgba(139,92,246,0.1)',
      };

  return (
    <article
      onClick={onSelectTrack}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '12px', borderRadius: '16px', padding: '10px',
        cursor: 'pointer', transition: 'all 0.15s',
        ...cardStyle,
      }}
      onMouseEnter={(e) => {
        if (!isCurrent) {
          e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)';
          e.currentTarget.style.background = 'rgba(139,92,246,0.06)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isCurrent) {
          e.currentTarget.style.borderColor = 'rgba(139,92,246,0.1)';
          e.currentTarget.style.background = 'rgba(11,8,22,0.75)';
        }
      }}
    >
      {/* Artwork with play overlay */}
      <div style={{ position: 'relative', height: '52px', width: '52px', flexShrink: 0, overflow: 'hidden', borderRadius: '12px', background: 'rgba(139,92,246,0.15)' }}>
        {!imgError && track.artworkUrl ? (
          <img
            src={track.artworkUrl}
            alt={track.title}
            onError={() => setImgError(true)}
            style={{ height: '100%', width: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
        ) : (
          <div style={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
            <Music style={{ height: '20px', width: '20px' }} />
          </div>
        )}

        {/* Overlay */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isCurrent ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0)',
          transition: 'background 0.2s',
        }}
          onMouseEnter={(e) => { if (!isCurrent) e.currentTarget.style.background = 'rgba(0,0,0,0.4)'; }}
          onMouseLeave={(e) => { if (!isCurrent) e.currentTarget.style.background = 'rgba(0,0,0,0)'; }}
        >
          {isCurrent && isPlaying ? (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '14px' }}>
              <span className="eq-bar eq-bar-1" style={{ background: '#8b5cf6' }} />
              <span className="eq-bar eq-bar-3" style={{ background: '#06b6d4' }} />
              <span className="eq-bar eq-bar-5" style={{ background: '#8b5cf6' }} />
            </div>
          ) : (
            <Play style={{ height: '16px', width: '16px', fill: 'white', color: 'white', marginLeft: '2px' }} />
          )}
        </div>
      </div>

      {/* Meta text */}
      <div style={{ minWidth: 0, flex: 1 }}>
        <h3 style={{
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          fontSize: '13px', fontWeight: 700,
          color: isCurrent ? '#a78bfa' : '#fff',
          textShadow: isCurrent ? '0 0 8px rgba(139,92,246,0.5)' : 'none',
        }}>
          {track.title}
        </h3>
        <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '11px', color: isCurrent ? '#06b6d4' : '#94a3b8', marginTop: '2px' }}>
          {track.artist}
        </p>
      </div>

      {/* Actions */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onToggleFavorite}
          style={{ borderRadius: '50%', padding: '8px', color: isFavorite ? '#ec4899' : '#64748b', background: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}
          aria-label="Favorite"
        >
          <Heart style={{ height: '15px', width: '15px', fill: isFavorite ? '#ec4899' : 'none' }} />
        </button>

        <button
          type="button"
          onClick={onPlayToggle}
          style={{
            display: 'flex', height: '36px', width: '36px', alignItems: 'center', justifyContent: 'center',
            borderRadius: '50%', border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            background: isCurrent && isPlaying
              ? 'linear-gradient(135deg, #8b5cf6, #06b6d4)'
              : 'rgba(255,255,255,0.08)',
            color: '#fff',
            boxShadow: isCurrent && isPlaying ? '0 0 12px rgba(139,92,246,0.5)' : 'none',
          }}
          aria-label={isCurrent && isPlaying ? 'Pause' : 'Play'}
        >
          {isCurrent && isPlaying ? (
            <Pause style={{ height: '15px', width: '15px', fill: 'currentColor' }} />
          ) : (
            <Play style={{ height: '15px', width: '15px', fill: 'currentColor', marginLeft: '2px' }} />
          )}
        </button>
      </div>
    </article>
  );
};

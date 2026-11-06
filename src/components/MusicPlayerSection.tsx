import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Music } from 'lucide-react';
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

// Animated equalizer bars
const EQVisualizer: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => (
  <div
    className="flex items-end gap-0.5 h-5"
    style={{ opacity: isPlaying ? 1 : 0.3, transition: 'opacity 0.3s' }}
  >
    {[1, 2, 3, 4, 5].map((i) => (
      <span
        key={i}
        className={`eq-bar eq-bar-${i}`}
        style={{
          background: i % 2 === 0 ? '#06b6d4' : '#8b5cf6',
          animationPlayState: isPlaying ? 'running' : 'paused',
          boxShadow: isPlaying
            ? i % 2 === 0
              ? '0 0 6px #06b6d4'
              : '0 0 6px #8b5cf6'
            : 'none',
        }}
      />
    ))}
  </div>
);

// SVG Countdown Ring — transitions from cyan → yellow → pulsing-red
const CountdownRing: React.FC<{ timeRemaining: number; duration: number }> = ({
  timeRemaining,
  duration,
}) => {
  const size = 180;
  const stroke = 4;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, timeRemaining / (duration || 60)));
  const offset = circumference * (1 - pct);

  let ringColor = '#06b6d4'; // cyan
  let glow = 'drop-shadow(0 0 6px #06b6d4)';
  if (pct < 0.4) { ringColor = '#fbbf24'; glow = 'drop-shadow(0 0 8px #fbbf24)'; }
  if (pct < 0.1) { ringColor = '#ef4444'; glow = 'drop-shadow(0 0 10px #ef4444)'; }

  return (
    <svg
      width={size}
      height={size}
      className="absolute inset-0"
      style={{ transform: 'rotate(-90deg)', filter: glow, transition: 'filter 1s' }}
    >
      {/* Background track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth={stroke}
      />
      {/* Progress arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={ringColor}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s linear, stroke 1s' }}
      />
    </svg>
  );
};

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
    if (!isScrubbing) setScrubTime(currentTime);
  }, [currentTime, isScrubbing]);

  const maxDuration = duration > 0 ? duration : 60;
  const displayCurrent = isScrubbing ? scrubTime : currentTime;
  const progressPercent = Math.min(100, (displayCurrent / maxDuration) * 100);

  const artSize = 180;

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{
        background: 'rgba(11,8,22,0.92)',
        border: '1px solid rgba(139,92,246,0.25)',
        borderRadius: '1.5rem',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 0 60px rgba(139,92,246,0.12), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {/* Header Row */}
      <div
        className="flex items-center justify-between px-3 sm:px-4 py-2.5 shrink-0"
        style={{ borderBottom: '1px solid rgba(139,92,246,0.15)' }}
      >
        <div className="flex items-center gap-2">
          <EQVisualizer isPlaying={isPlaying} />
          <h2
            className="text-xs sm:text-sm font-bold tracking-widest uppercase"
            style={{ color: '#c4b5fd', textShadow: '0 0 10px rgba(139,92,246,0.6)' }}
          >
            Now Playing
          </h2>
        </div>
        {isPlaying && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{
              background: 'rgba(6,182,212,0.15)',
              border: '1px solid rgba(6,182,212,0.4)',
              color: '#67e8f9',
              boxShadow: '0 0 8px rgba(6,182,212,0.3)',
            }}
          >
            ● LIVE
          </span>
        )}
      </div>

      {/* Album Art with Countdown Ring */}
      <div className="flex flex-col items-center pt-3 pb-2 shrink-0 px-3">
        <div
          className="relative flex-shrink-0 cursor-pointer"
          style={{ width: artSize, height: artSize }}
          onClick={onOpenVideoModal}
        >
          {/* SVG Ring on top */}
          <CountdownRing timeRemaining={maxDuration - displayCurrent} duration={maxDuration} />

          {/* Vinyl disc + artwork */}
          <div
            className={`vinyl-spin ${isPlaying ? 'playing' : ''}`}
            style={{
              position: 'absolute',
              inset: 10,
              borderRadius: '50%',
              overflow: 'hidden',
              border: '3px solid rgba(139,92,246,0.4)',
              boxShadow: isPlaying
                ? '0 0 20px rgba(139,92,246,0.5), 0 0 40px rgba(6,182,212,0.2)'
                : '0 0 10px rgba(0,0,0,0.5)',
            }}
          >
            {currentTrack?.artworkUrl ? (
              <img
                src={currentTrack.artworkUrl}
                alt={currentTrack.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center"
                style={{ background: 'rgba(139,92,246,0.15)' }}
              >
                <Music style={{ width: 40, height: 40, color: '#8b5cf6' }} />
              </div>
            )}
          </div>

          {/* Center vinyl hole */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%,-50%)',
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: '#0b0816',
              border: '2px solid rgba(139,92,246,0.5)',
              zIndex: 10,
            }}
          />
        </div>
      </div>

      {/* Song Title & Artist */}
      <div className="text-center px-4 pb-2 shrink-0">
        <h3
          className="text-sm sm:text-base font-black truncate"
          style={{ color: '#f1f5f9', textShadow: '0 0 15px rgba(139,92,246,0.5)' }}
        >
          {currentTrack?.title || 'Faded'}
        </h3>
        <p className="text-[11px] sm:text-xs font-semibold truncate mt-0.5" style={{ color: '#67e8f9' }}>
          {currentTrack?.artist || 'Alan Walker'}
        </p>
      </div>

      {/* Progress Scrubber */}
      <div className="px-4 pb-2 shrink-0">
        <div className="relative h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          {/* Neon glow fill */}
          <div
            className="h-full rounded-full transition-all duration-150"
            style={{
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)',
              boxShadow: '0 0 8px rgba(6,182,212,0.6)',
            }}
          />
          <input
            type="range"
            min={0}
            max={maxDuration}
            step={0.5}
            value={displayCurrent}
            onMouseDown={() => setIsScrubbing(true)}
            onTouchStart={() => setIsScrubbing(true)}
            onChange={(e) => setScrubTime(Number(e.target.value))}
            onMouseUp={() => { setIsScrubbing(false); onSeek(scrubTime); }}
            onTouchEnd={() => { setIsScrubbing(false); onSeek(scrubTime); }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono tabular-nums mt-1" style={{ color: '#475569' }}>
          <span>{formatTime(displayCurrent)}</span>
          <span>{formatTime(maxDuration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-4 sm:px-6 pb-3 shrink-0">
        {/* Shuffle */}
        <button
          onClick={() => setIsShuffle(!isShuffle)}
          className="p-1.5 transition active:scale-90"
          style={{ color: isShuffle ? '#8b5cf6' : '#475569' }}
          title="Shuffle"
        >
          <Shuffle className="h-4 w-4" />
        </button>

        {/* Previous */}
        <button
          onClick={onPrev || (() => onSeek(0))}
          className="p-2 transition active:scale-90"
          style={{ color: '#94a3b8' }}
          title="Previous"
        >
          <SkipBack className="h-5 w-5 fill-current" />
        </button>

        {/* Play / Pause — big neon glow button */}
        <button
          onClick={onTogglePlay}
          className="flex items-center justify-center rounded-full transition hover:scale-105 active:scale-95"
          style={{
            width: 52,
            height: 52,
            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            boxShadow: isPlaying
              ? '0 0 25px rgba(139,92,246,0.8), 0 0 50px rgba(6,182,212,0.4)'
              : '0 0 15px rgba(139,92,246,0.4)',
            color: '#fff',
          }}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="h-6 w-6 fill-white" />
          ) : (
            <Play className="h-6 w-6 fill-white ml-0.5" />
          )}
        </button>

        {/* Next */}
        <button
          onClick={onNext}
          className="p-2 transition active:scale-90"
          style={{ color: '#94a3b8' }}
          title="Next"
        >
          <SkipForward className="h-5 w-5 fill-current" />
        </button>

        {/* Repeat */}
        <button
          onClick={() => setIsRepeat(!isRepeat)}
          className="p-1.5 transition active:scale-90"
          style={{ color: isRepeat ? '#06b6d4' : '#475569' }}
          title="Repeat"
        >
          <Repeat className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Shuffle,
  Heart,
  Volume2,
  VolumeX,
  Volume1,
  Mic2,
  Music,
  Tv,
} from 'lucide-react';
import { Track, RepeatMode } from '../types';
import { LyricsView } from './LyricsView';
import { LyricLine } from '../data/lyrics';
import { fullAudioEngine } from '../services/fullAudioEngine';

interface FullScreenPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  isFavorite: boolean;
  lyrics: LyricLine[];
  lyricsLoading?: boolean;
  lyricsSynced?: boolean;
  lyricsReal?: boolean;
  lyricsSource?: string;
  initialMode?: 'cover' | 'lyrics' | 'video';
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onToggleRepeat: () => void;
  onToggleShuffle: () => void;
  onToggleFavorite: () => void;
}

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export const FullScreenPlayer: React.FC<FullScreenPlayerProps> = ({
  isOpen,
  onClose,
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  repeatMode,
  isShuffle,
  isFavorite,
  lyrics,
  lyricsLoading = false,
  lyricsSynced = true,
  lyricsReal = true,
  lyricsSource = 'Musixmatch',
  initialMode = 'video',
  onTogglePlay,
  onPrev,
  onNext,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleRepeat,
  onToggleShuffle,
  onToggleFavorite,
}) => {
  const [viewMode, setViewMode] = useState<'cover' | 'lyrics' | 'video'>(initialMode);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState(0);

  useEffect(() => {
    setViewMode(initialMode);
  }, [initialMode, currentTrack?.id]);

  useEffect(() => {
    if (!isScrubbing) {
      setScrubTime(currentTime);
    }
  }, [currentTime, isScrubbing]);

  if (!isOpen || !currentTrack) return null;

  const maxDuration = duration > 0 ? duration : 210;
  const displayCurrent = isScrubbing ? scrubTime : currentTime;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0d0d16] text-white animate-in slide-in-from-bottom duration-300">
      {/* Background ambient album blur */}
      <div
        className="absolute inset-0 opacity-25 blur-3xl pointer-events-none scale-125"
        style={{
          backgroundImage: `url(${currentTrack.artworkUrl})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      />

      {/* Top Bar: Solo Clean Mode Switcher (Cover vs Lyrics vs Video) - Equalizer Removed */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-3 pb-2 border-b border-white/5">
        <button
          onClick={onClose}
          className="rounded-full p-2 text-slate-300 hover:bg-white/10 active:scale-90 transition shrink-0"
          aria-label="Minimize player"
        >
          <ChevronDown className="h-6 w-6" />
        </button>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 p-1 bg-white/10 rounded-full border border-white/5 shrink-0">
          <button
            onClick={() => setViewMode('cover')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              viewMode === 'cover' ? 'bg-purple-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Cover
          </button>
          <button
            onClick={() => setViewMode('lyrics')}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition ${
              viewMode === 'lyrics' ? 'bg-purple-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Mic2 className="h-3 w-3" />
            <span>Lyrics</span>
          </button>
          <button
            onClick={() => setViewMode('video')}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition ${
              viewMode === 'video' ? 'bg-purple-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Tv className="h-3 w-3" />
            <span>Video</span>
          </button>
        </div>

        {/* Status indicator on right */}
        <div className="text-[11px] font-semibold text-emerald-400 shrink-0">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 mr-1 animate-pulse" />
          <span>ሙሉ</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-4 sm:px-6 py-2 min-h-0 overflow-hidden">
        {viewMode === 'cover' ? (
          <div className="flex flex-col items-center justify-center max-w-sm mx-auto w-full">
            {/* Visual docking slot for the persistent player */}
            <div className="relative aspect-video w-full max-w-[270px] sm:max-w-[300px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900 mb-4 pointer-events-none opacity-0" />

            {/* Song Meta + Heart */}
            <div className="flex items-center justify-between w-full mb-3 px-1">
              <div className="min-w-0 flex-1 pr-3">
                <h2 className="text-xl sm:text-2xl font-extrabold truncate text-white">
                  {currentTrack.title}
                </h2>
                <p className="text-sm font-semibold text-purple-300 truncate mt-0.5">
                  {currentTrack.artist}
                </p>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {currentTrack.album} · {currentTrack.genre}
                </p>
              </div>

              <button
                onClick={onToggleFavorite}
                className="rounded-full p-3 bg-white/5 hover:bg-white/10 text-slate-300 active:scale-90 transition shrink-0"
              >
                <Heart className={`h-6 w-6 ${isFavorite ? 'fill-pink-500 text-pink-500' : ''}`} />
              </button>
            </div>

            {/* Play Full Song (ሙሉ ዘፈን) Action Button */}
            <button
              onClick={() => setViewMode('video')}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 border border-purple-500/40 text-xs font-bold text-white hover:border-purple-400 active:scale-95 transition mt-2 shadow-sm"
            >
              <Tv className="h-4 w-4 text-purple-400" />
              <span>ሙሉ ዘፈን በቪዲዮና ኦዲዮ (Full Song Video & Audio)</span>
            </button>
          </div>
        ) : viewMode === 'lyrics' ? (
          /* Real Time Lyrics Karaoke View with Persistent Video Dock at Top */
          <div className="h-full max-w-md mx-auto w-full flex flex-col overflow-hidden">
            {/* Video dock slot placeholder for synced watching */}
            <div className="w-full h-36 sm:h-40 rounded-xl mb-2 shrink-0 pointer-events-none opacity-0" />
            <div className="flex-1 min-h-0 overflow-hidden">
              <LyricsView
                currentTrack={currentTrack}
                lyrics={lyrics}
                currentTime={currentTime}
                isPlaying={isPlaying}
                isLoading={lyricsLoading}
                isSynced={lyricsSynced}
                isReal={lyricsReal}
                sourceName={lyricsSource}
                onSeek={onSeek}
                className="h-full"
              />
            </div>
          </div>
        ) : (
          /* In-App Video Stage Slot (Full uncut performance) */
          <div className="flex flex-col items-center justify-center max-w-sm mx-auto w-full">
            {/* Exact dimensions slot where the master video stage is positioned */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black mb-3 pointer-events-none opacity-0" />
            <div className="text-center px-2">
              <h3 className="text-base font-bold text-white truncate">{currentTrack.title}</h3>
              <p className="text-xs text-purple-300 mt-0.5">{currentTrack.artist}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] text-emerald-300 font-semibold">
                ሙሉ ሙዚቃ (Full Uncut Audio & Video)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Area (Full width scrubber and playback controls) */}
      <div className="relative z-10 px-6 pb-6 pt-1 max-w-md mx-auto w-full">
        {/* Full song scrubber slider */}
        <div className="mb-2">
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
            className="w-full h-1.5 rounded-lg bg-white/20 accent-purple-400 cursor-pointer"
          />
          <div className="flex justify-between text-xs font-mono text-slate-400 mt-1 tabular-nums">
            <span>{formatTime(displayCurrent)}</span>
            <span className="text-[11px] text-emerald-400 font-sans font-semibold">
              ሙሉ ሙዚቃ (0:00 - {formatTime(maxDuration)})
            </span>
            <span>{formatTime(maxDuration)}</span>
          </div>
        </div>

        {/* Primary Buttons */}
        <div className="flex items-center justify-between my-2">
          {/* Shuffle toggle */}
          <button
            onClick={onToggleShuffle}
            className={`p-2 transition ${isShuffle ? 'text-purple-400 font-bold' : 'text-slate-400 hover:text-white'}`}
            title={isShuffle ? 'Shuffle: On' : 'Shuffle: Off'}
          >
            <Shuffle className="h-5 w-5" />
          </button>

          <button
            onClick={onPrev}
            className="p-3 text-slate-200 hover:text-white active:scale-90 transition"
          >
            <SkipBack className="h-7 w-7" />
          </button>

          <button
            onClick={onTogglePlay}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-500 text-slate-950 shadow-xl shadow-purple-500/30 hover:scale-105 active:scale-95 transition"
          >
            {isPlaying ? (
              <Pause className="h-7 w-7 fill-slate-950" />
            ) : (
              <Play className="h-7 w-7 fill-slate-950 ml-1" />
            )}
          </button>

          <button
            onClick={onNext}
            className="p-3 text-slate-200 hover:text-white active:scale-90 transition"
          >
            <SkipForward className="h-7 w-7" />
          </button>

          {/* Loop/Repeat button with explicit modes (Off -> All -> One) */}
          <button
            onClick={onToggleRepeat}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition ${
              repeatMode === 'one'
                ? 'bg-pink-500/20 text-pink-400 border border-pink-500/40 font-bold'
                : repeatMode === 'all'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
            title={
              repeatMode === 'one'
                ? 'Loop 1 Song (ተደጋጋሚ)'
                : repeatMode === 'all'
                ? 'Loop All Tracks (ሁሉንም)'
                : 'Loop: Off (አቁም)'
            }
          >
            {repeatMode === 'one' ? (
              <>
                <Repeat1 className="h-4 w-4" />
                <span className="text-[10px]">1</span>
              </>
            ) : (
              <>
                <Repeat className="h-4 w-4" />
                <span className="text-[10px]">{repeatMode === 'all' ? 'All' : 'Off'}</span>
              </>
            )}
          </button>
        </div>

        {/* Volume Scrubber */}
        <div className="flex items-center gap-3 pt-1">
          <button onClick={onToggleMute} className="text-slate-400 hover:text-white">
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : volume < 0.5 ? (
              <Volume1 className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="flex-1 h-1 rounded-lg bg-white/20 accent-purple-400 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

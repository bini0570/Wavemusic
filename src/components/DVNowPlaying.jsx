import React, { useState, useRef } from 'react';
import {
  Heart,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  AudioWaveform,
  Headphones,
  Rocket,
  Box,
  Radio,
  Eye,
  Volume2,
  VolumeX,
  Disc,
  Sliders,
  Moon,
  Waves,
  Mic,
  Zap,
  MoveHorizontal,
  Sparkles,
} from 'lucide-react';
import { DVSpectrumVisualizer } from './DVSpectrumVisualizer';
import { DVAlbumArt } from './DVAlbumArt';

export const DVNowPlaying = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  isShuffle,
  repeatMode,
  volume,
  onVolumeChange,
  onPlayToggle,
  onSeek,
  onPrevTrack,
  onNextTrack,
  onShuffleToggle,
  onRepeatToggle,
  onFavoriteToggle,
  visualizerMode,
  onToggleVisualizerMode,
  effectsEnabled,
  onToggleEffects,
  activeEffect,
  onSelectEffect,
  eightDAngle,
}) => {
  const [isVinylMode, setIsVinylMode] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const seekRef = useRef(null);

  const fmt = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    return `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
  };

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  // All 12 Audio DSP Presets displayed in a fixed, non-scrolling 4x3 grid
  const dspEffects = [
    { id: 'normal', label: 'Flat', icon: <AudioWaveform className="w-3 h-3" /> },
    { id: '8d', label: '8D Spatial', icon: <Headphones className="w-3 h-3" /> },
    { id: 'bass_boost', label: 'Bass Boost', icon: <Rocket className="w-3 h-3" /> },
    { id: 'trubass', label: 'TruBass', icon: <Volume2 className="w-3 h-3" /> },
    { id: 'vocal_boost', label: 'Vocal', icon: <Mic className="w-3 h-3" /> },
    { id: 'treble_boost', label: 'Treble', icon: <Zap className="w-3 h-3" /> },
    { id: 'echo', label: 'Echo', icon: <Repeat className="w-3 h-3" /> },
    { id: 'reverb', label: 'Reverb', icon: <Waves className="w-3 h-3" /> },
    { id: 'virtualizer', label: 'Virtualizer', icon: <Box className="w-3 h-3" /> },
    { id: 'surround', label: 'Surround', icon: <Radio className="w-3 h-3" /> },
    { id: 'night_mode', label: 'Night Mode', icon: <Moon className="w-3 h-3" /> },
    { id: 'wide_stereo', label: 'Wide Stereo', icon: <MoveHorizontal className="w-3 h-3" /> },
  ];

  return (
    <div className="relative w-full h-full flex flex-col justify-between select-none text-white overflow-hidden px-3 pt-1 pb-2">
      {/* ── FULL BLEED BLURRED BACKGROUND ── */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[#06020d]" />
        <div className="absolute inset-0 opacity-25">
          <DVAlbumArt
            track={currentTrack}
            isPlaying={false}
            size="lg"
            className="w-full h-full object-cover scale-125 blur-3xl"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/35 to-black/90" />
      </div>

      {/* ── TOP COMPACT STATUS BAR ── */}
      <div className="flex items-center justify-between py-1 shrink-0">
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/8 backdrop-blur-md border border-white/10 text-[9px] font-mono text-neutral-300">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'
            }`}
          />
          <span>32-BIT DSP · 48kHz</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleVisualizerMode}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/8 backdrop-blur-md border border-white/10 text-[8.5px] font-mono text-neutral-300 hover:border-purple-400/50 active:scale-95 transition-all"
            title="Visualizer Mode"
          >
            <Eye className="w-2.5 h-2.5 text-purple-400" />
            <span className="capitalize">{visualizerMode.replace('-', ' ')}</span>
          </button>

          <button
            onClick={() => setIsVinylMode(!isVinylMode)}
            className={`p-1 rounded-full border transition-all active:scale-95 ${
              isVinylMode
                ? 'bg-purple-600/40 border-purple-400 text-purple-200 shadow-[0_0_8px_rgba(192,132,252,0.7)]'
                : 'bg-white/8 border-white/10 text-neutral-400 hover:text-white'
            }`}
            title="Toggle Vinyl Turntable"
          >
            <Disc className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* ── REDUCED PLAYING ANIMATION & ALBUM ART SECTION (COMPACT) ── */}
      <div className="flex flex-col items-center justify-center shrink-0 my-0.5">
        {!isVinylMode ? (
          <div
            onClick={() => setIsVinylMode(true)}
            className={`relative aspect-square w-32 h-32 max-h-[17vh] rounded-2xl overflow-hidden cursor-pointer
              shadow-[0_10px_30px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.08)]
              transition-transform duration-300 ${isPlaying ? 'scale-100' : 'scale-[0.97]'}`}
          >
            <DVAlbumArt
              track={currentTrack}
              isPlaying={isPlaying}
              size="md"
              className="w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/30 pointer-events-none" />

            {/* 8D Orbit Indicator Pill */}
            {effectsEnabled && activeEffect === '8d' && (
              <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-purple-400/40 text-[8px] text-purple-200">
                <span className="flex items-center gap-1 font-medium">
                  <Headphones className="w-2 h-2 text-purple-400" /> 8D
                </span>
                <span className="font-mono font-bold text-purple-300">
                  {Math.round(eightDAngle)}°
                </span>
              </div>
            )}
          </div>
        ) : (
          <div
            onClick={() => setIsVinylMode(false)}
            className="relative aspect-square w-32 h-32 max-h-[17vh] rounded-full cursor-pointer
              shadow-[0_10px_30px_rgba(0,0,0,0.7),0_0_20px_rgba(168,85,247,0.3)]
              vinyl-grooves border-2 border-[#1a0a2e] flex items-center justify-center overflow-hidden"
          >
            <div
              className={`w-full h-full rounded-full flex items-center justify-center ${
                isPlaying ? 'animate-vinyl' : 'animate-vinyl-paused'
              }`}
            >
              <div className="w-14 h-14 rounded-full border border-purple-400/50 overflow-hidden relative shadow-md">
                <DVAlbumArt
                  track={currentTrack}
                  isPlaying={isPlaying}
                  size="sm"
                  className="w-full h-full"
                />
                <div className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-[#06020d] border border-purple-400/70" />
              </div>
            </div>
          </div>
        )}

        {/* Compact Waveform Spectrum Visualizer */}
        <div className="w-full max-w-xs mt-1 shrink-0">
          <DVSpectrumVisualizer
            isPlaying={isPlaying}
            mode={visualizerMode}
            className="w-full h-7"
          />
        </div>
      </div>

      {/* ── TRACK INFO & FAVORITE / REPEAT ── */}
      <div className="flex items-center justify-between px-2 py-0.5 shrink-0">
        <div className="flex flex-col min-w-0 flex-1 pr-2">
          <h2 className="text-sm font-bold text-white tracking-tight truncate leading-tight">
            {currentTrack?.title || 'Wave Music'}
          </h2>
          <span className="text-[11px] text-purple-300/80 font-medium truncate">
            {currentTrack?.artist || 'Unknown Artist'}
            {currentTrack?.album && <span className="text-neutral-500"> · {currentTrack.album}</span>}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onFavoriteToggle}
            className={`p-1.5 rounded-full transition-all active:scale-90 ${
              currentTrack?.isFavorite ? 'text-pink-500' : 'text-neutral-400 hover:text-white'
            }`}
            title="Favorite"
          >
            <Heart className={`w-4 h-4 ${currentTrack?.isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={onRepeatToggle}
            className={`p-1.5 rounded-full transition-colors ${
              repeatMode !== 'off' ? 'text-purple-400' : 'text-neutral-400 hover:text-white'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── PROGRESS BAR ── */}
      <div className="px-2 pb-0.5 shrink-0">
        <div className="relative w-full h-3 flex items-center group cursor-pointer" ref={seekRef}>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-400 to-indigo-400 rounded-full"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div
            className="absolute w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(192,132,252,1)] border border-purple-300 pointer-events-none -translate-x-1/2"
            style={{ left: `${pct}%` }}
          />
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={pct}
            onChange={(e) => onSeek((parseFloat(e.target.value) / 100) * (duration || 1))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <div className="flex justify-between text-[8.5px] font-mono text-neutral-400 mt-0.5 px-0.5">
          <span>{fmt(currentTime)}</span>
          {currentTrack?.bpm && <span className="text-neutral-500">{currentTrack.bpm} BPM</span>}
          <span>{fmt(duration)}</span>
        </div>
      </div>

      {/* ── MAIN TRANSPORT CONTROLS ── */}
      <div className="flex items-center justify-around px-2 py-0.5 shrink-0">
        <button
          onClick={onShuffleToggle}
          className={`p-2 rounded-full transition-all active:scale-90 ${
            isShuffle ? 'text-purple-400 bg-purple-950/50' : 'text-neutral-500 hover:text-white'
          }`}
          title="Shuffle"
        >
          <Shuffle className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onPrevTrack}
          className="p-2 text-neutral-200 hover:text-white transition-transform active:scale-90"
          title="Previous Track"
        >
          <SkipBack className="w-5 h-5 fill-current" />
        </button>

        {/* Central Play/Pause Button */}
        <button
          onClick={onPlayToggle}
          className="relative w-12 h-12 rounded-full text-white flex items-center justify-center transition-all active:scale-95
            bg-gradient-to-br from-purple-500 via-fuchsia-600 to-indigo-600
            shadow-[0_0_20px_rgba(168,85,247,0.6)] hover:shadow-[0_0_30px_rgba(168,85,247,0.8)]"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying && (
            <span className="absolute inset-0 rounded-full border border-purple-400/50 animate-ping" />
          )}
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current translate-x-0.5" />
          )}
        </button>

        <button
          onClick={onNextTrack}
          className="p-2 text-neutral-200 hover:text-white transition-transform active:scale-90"
          title="Next Track"
        >
          <SkipForward className="w-5 h-5 fill-current" />
        </button>

        {/* Volume Button & Slider Popover */}
        <div className="relative">
          <button
            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            className={`p-2 rounded-full transition-all active:scale-90 ${
              volume === 0
                ? 'text-neutral-500'
                : showVolumeSlider
                ? 'text-purple-300 bg-purple-950/60'
                : 'text-purple-400 hover:text-purple-300'
            }`}
            title="Volume"
          >
            {volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {showVolumeSlider && (
            <div className="absolute bottom-10 right-0 bg-[#0e071c]/95 border border-purple-500/30 rounded-xl p-2 shadow-2xl backdrop-blur-2xl flex flex-col items-center gap-1.5 z-30">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-20 h-1.5 accent-purple-400 cursor-pointer"
                style={{ accentColor: '#c084fc' }}
              />
              <span className="text-[8px] font-mono text-neutral-400">
                {Math.round(volume * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── FIXED ALL 12 AUDIO DSP EFFECTS GRID (NO SCROLL, NO HIDE, ALWAYS VISIBLE) ── */}
      <div className="glass-card rounded-2xl p-2 shrink-0 border border-purple-500/20 bg-[#0a0414]/90">
        <div className="flex items-center justify-between pb-1.5 px-0.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span className="text-[9.5px] font-mono uppercase tracking-wider text-neutral-200 font-bold">
              Audio DSP Effects (12)
            </span>
          </div>

          <button
            onClick={onToggleEffects}
            className={`px-2 py-0.5 rounded-full text-[8.5px] font-mono font-semibold transition-all active:scale-95 ${
              effectsEnabled
                ? 'bg-purple-600 text-white shadow-[0_0_8px_rgba(168,85,247,0.5)]'
                : 'bg-white/10 text-neutral-400'
            }`}
          >
            {effectsEnabled ? 'DSP ACTIVE' : 'BYPASS'}
          </button>
        </div>

        {/* Fixed 4 columns x 3 rows grid of all 12 effects — always fully visible, no scroll! */}
        <div className="grid grid-cols-4 gap-1">
          {dspEffects.map((effect) => {
            const isSelected = activeEffect === effect.id && effectsEnabled;
            return (
              <button
                key={effect.id}
                onClick={() => {
                  if (activeEffect === effect.id && effectsEnabled) {
                    onToggleEffects();
                  } else {
                    onSelectEffect(effect.id);
                  }
                }}
                className={`flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-xl border transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-purple-600/35 border-purple-400 text-white shadow-[0_0_10px_rgba(192,132,252,0.6)] font-bold'
                    : 'bg-white/3 border-white/6 text-neutral-400 hover:text-neutral-200 hover:bg-white/6'
                }`}
                style={{ minHeight: '38px' }}
              >
                <span className={isSelected ? 'text-purple-300' : 'text-neutral-400'}>
                  {effect.icon}
                </span>
                <span className="text-[8.5px] font-medium leading-tight truncate w-full text-center">
                  {effect.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

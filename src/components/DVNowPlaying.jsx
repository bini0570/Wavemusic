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
  X,
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
  const [showDspModal, setShowDspModal] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const seekRef = useRef(null);

  const fmt = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    return `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
  };

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Complete 12 Professional Audio DSP Presets
  const dspEffects = [
    { id: 'normal', label: 'Flat / Pure', desc: 'Natural transparent soundstage', icon: <AudioWaveform className="w-3.5 h-3.5" /> },
    { id: '8d', label: '8D Spatial', desc: 'Binaural 360° rotating sound', icon: <Headphones className="w-3.5 h-3.5" /> },
    { id: 'bass_boost', label: 'Bass Boost', desc: 'Deep warm sub-bass punch', icon: <Rocket className="w-3.5 h-3.5" /> },
    { id: 'trubass', label: 'TruBass', desc: 'Harmonic low-frequency power', icon: <Volume2 className="w-3.5 h-3.5" /> },
    { id: 'vocal_boost', label: 'Vocal Boost', desc: 'Clear intimate center voice', icon: <Mic className="w-3.5 h-3.5" /> },
    { id: 'treble_boost', label: 'Treble Boost', desc: 'Crisp sparkle & airy highs', icon: <Zap className="w-3.5 h-3.5" /> },
    { id: 'echo', label: 'Echo Delay', desc: 'Tempo-synced stereo reflection', icon: <Repeat className="w-3.5 h-3.5" /> },
    { id: 'reverb', label: 'Hall Reverb', desc: 'Lush atmospheric acoustic space', icon: <Waves className="w-3.5 h-3.5" /> },
    { id: 'virtualizer', label: 'Virtualizer', desc: 'Widened psychoacoustic stereo', icon: <Box className="w-3.5 h-3.5" /> },
    { id: 'surround', label: '3D Surround', desc: 'Cinematic multi-channel depth', icon: <Radio className="w-3.5 h-3.5" /> },
    { id: 'night_mode', label: 'Night Mode', desc: 'Compressed dynamics for low volume', icon: <Moon className="w-3.5 h-3.5" /> },
    { id: 'wide_stereo', label: 'Wide Stereo', desc: 'Expanded acoustic separation', icon: <MoveHorizontal className="w-3.5 h-3.5" /> },
  ];

  const currentEffectObj = dspEffects.find((e) => e.id === activeEffect) || dspEffects[0];

  return (
    <div className="relative w-full h-full flex flex-col justify-between select-none text-white overflow-hidden pb-20">
      {/* ── FULL BLEED BLURRED BACKGROUND ── */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[#06020d]" />
        <div className="absolute inset-0 opacity-30">
          <DVAlbumArt
            track={currentTrack}
            isPlaying={false}
            size="lg"
            className="w-full h-full object-cover scale-125 blur-3xl"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/25 to-black/85" />
        <div
          className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl transition-opacity duration-1000 ${
            isPlaying ? 'opacity-35 bg-purple-600' : 'opacity-10 bg-purple-950'
          }`}
        />
      </div>

      {/* ── TOP BAR (Clean, Native Mobile Hierarchy) ── */}
      <div className="flex items-center justify-between px-4 pt-2 pb-1 shrink-0 z-10">
        {/* Source & DSP pill */}
        <button
          onClick={() => setShowDspModal(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md border text-[10px] font-mono transition-all active:scale-95 ${
            effectsEnabled
              ? 'bg-purple-950/60 border-purple-500/40 text-purple-200 shadow-[0_0_10px_rgba(192,132,252,0.4)]'
              : 'bg-white/5 border-white/10 text-neutral-400'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              effectsEnabled ? 'bg-purple-400 animate-pulse' : 'bg-neutral-500'
            }`}
          />
          <span className="font-semibold">{currentEffectObj.label}</span>
          <Sliders className="w-2.5 h-2.5 ml-0.5 opacity-70" />
        </button>

        {/* Right Tools: Visualizer mode toggle & Vinyl Disc toggle */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleVisualizerMode}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/8 backdrop-blur-md border border-white/10 text-[9px] font-mono text-neutral-300 hover:border-purple-400/50 active:scale-95 transition-all"
            title="Toggle Visualizer Mode"
          >
            <Eye className="w-2.5 h-2.5 text-purple-400" />
            <span className="capitalize">{visualizerMode.replace('-', ' ')}</span>
          </button>

          <button
            onClick={() => setIsVinylMode(!isVinylMode)}
            className={`p-1.5 rounded-full border transition-all active:scale-95 ${
              isVinylMode
                ? 'bg-purple-600/40 border-purple-400 text-purple-200 shadow-[0_0_10px_rgba(192,132,252,0.7)]'
                : 'bg-white/8 border-white/10 text-neutral-400 hover:text-white'
            }`}
            title="Toggle Vinyl Turntable"
          >
            <Disc className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── HERO ALBUM ARTWORK ── */}
      <div className="flex items-center justify-center px-6 my-auto shrink-0 py-1">
        {!isVinylMode ? (
          <div
            onClick={() => setIsVinylMode(true)}
            className={`relative aspect-square w-full max-w-[240px] max-h-[26vh] rounded-[24px] overflow-hidden cursor-pointer
              shadow-[0_16px_50px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.08)]
              transition-transform duration-300 ${isPlaying ? 'scale-100' : 'scale-[0.97]'}`}
          >
            <DVAlbumArt
              track={currentTrack}
              isPlaying={isPlaying}
              size="lg"
              className="w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/35 pointer-events-none" />

            {/* 8D Orbit Indicator Pill */}
            {effectsEnabled && activeEffect === '8d' && (
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-purple-400/40 text-[9px] text-purple-200">
                <span className="flex items-center gap-1 font-medium">
                  <Headphones className="w-2.5 h-2.5 text-purple-400" /> 8D Orbit
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
            className="relative aspect-square w-full max-w-[210px] max-h-[25vh] rounded-full cursor-pointer
              shadow-[0_16px_45px_rgba(0,0,0,0.7),0_0_25px_rgba(168,85,247,0.3)]
              vinyl-grooves border-4 border-[#1a0a2e] flex items-center justify-center overflow-hidden"
          >
            <div
              className={`w-full h-full rounded-full flex items-center justify-center ${
                isPlaying ? 'animate-vinyl' : 'animate-vinyl-paused'
              }`}
            >
              <div className="w-20 h-20 rounded-full border-2 border-purple-400/50 overflow-hidden relative shadow-lg">
                <DVAlbumArt
                  track={currentTrack}
                  isPlaying={isPlaying}
                  size="sm"
                  className="w-full h-full"
                />
                <div className="absolute inset-0 m-auto w-4 h-4 rounded-full bg-[#06020d] border-2 border-purple-400/70" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── SPECTRUM VISUALIZER ── */}
      <div className="px-5 shrink-0 my-0.5">
        <DVSpectrumVisualizer isPlaying={isPlaying} mode={visualizerMode} className="w-full h-9" />
      </div>

      {/* ── TRACK INFO & FAVORITE / REPEAT ── */}
      <div className="flex items-center justify-between px-5 py-1 shrink-0">
        <div className="flex flex-col min-w-0 flex-1 pr-3">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate leading-tight">
            {currentTrack?.title || 'Dreams'}
          </h2>
          <span className="text-xs text-purple-300/80 font-medium truncate mt-0.5">
            {currentTrack?.artist || 'Lost Sky'}
            {currentTrack?.album && <span className="text-neutral-500"> · {currentTrack.album}</span>}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onFavoriteToggle}
            className={`p-2 rounded-full transition-all active:scale-90 ${
              currentTrack?.isFavorite ? 'text-pink-500' : 'text-neutral-400 hover:text-white'
            }`}
            title="Favorite"
          >
            <Heart className={`w-5 h-5 ${currentTrack?.isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={onRepeatToggle}
            className={`p-2 rounded-full transition-colors ${
              repeatMode !== 'off' ? 'text-purple-400' : 'text-neutral-400 hover:text-white'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── SEEKER / PROGRESS BAR ── */}
      <div className="px-5 pb-1 shrink-0">
        <div className="relative w-full h-4 flex items-center group cursor-pointer" ref={seekRef}>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-400 to-indigo-400 rounded-full"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div
            className="absolute w-3 h-3 rounded-full bg-white shadow-[0_0_10px_rgba(192,132,252,1)] border border-purple-300 pointer-events-none -translate-x-1/2"
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
        <div className="flex justify-between text-[9px] font-mono text-neutral-400 mt-0.5 px-0.5">
          <span>{fmt(currentTime)}</span>
          {currentTrack?.bpm && <span className="text-neutral-500">{currentTrack.bpm} BPM</span>}
          <span>{fmt(duration)}</span>
        </div>
      </div>

      {/* ── MAIN TRANSPORT CONTROLS ── */}
      <div className="flex items-center justify-around px-4 py-1 shrink-0">
        <button
          onClick={onShuffleToggle}
          className={`p-2.5 rounded-full transition-all active:scale-90 ${
            isShuffle ? 'text-purple-400 bg-purple-950/50' : 'text-neutral-500 hover:text-white'
          }`}
          title="Shuffle"
        >
          <Shuffle className="w-4 h-4" />
        </button>

        <button
          onClick={onPrevTrack}
          className="p-2.5 text-neutral-200 hover:text-white transition-transform active:scale-90"
          title="Previous Track"
        >
          <SkipBack className="w-6 h-6 fill-current" />
        </button>

        {/* Big Central Play/Pause with Halo Glow */}
        <button
          onClick={onPlayToggle}
          className="relative w-14 h-14 rounded-full text-white flex items-center justify-center transition-all active:scale-95
            bg-gradient-to-br from-purple-500 via-fuchsia-600 to-indigo-600
            shadow-[0_0_25px_rgba(168,85,247,0.6),0_0_50px_rgba(168,85,247,0.2),inset_0_1px_0_rgba(255,255,255,0.2)]
            hover:shadow-[0_0_35px_rgba(168,85,247,0.8)]"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying && (
            <span className="absolute inset-0 rounded-full border-2 border-purple-400/50 animate-ping" />
          )}
          {isPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current translate-x-0.5" />
          )}
        </button>

        <button
          onClick={onNextTrack}
          className="p-2.5 text-neutral-200 hover:text-white transition-transform active:scale-90"
          title="Next Track"
        >
          <SkipForward className="w-6 h-6 fill-current" />
        </button>

        {/* Volume Button & Slider Popover */}
        <div className="relative">
          <button
            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            className={`p-2.5 rounded-full transition-all active:scale-90 ${
              volume === 0
                ? 'text-neutral-500'
                : showVolumeSlider
                ? 'text-purple-300 bg-purple-950/60'
                : 'text-purple-400 hover:text-purple-300'
            }`}
            title="Volume"
          >
            {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {showVolumeSlider && (
            <div className="absolute bottom-11 right-0 bg-[#0e071c]/95 border border-purple-500/30 rounded-2xl p-2.5 shadow-2xl backdrop-blur-2xl flex flex-col items-center gap-2 z-30">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-24 h-1.5 accent-purple-400 cursor-pointer"
                style={{ accentColor: '#c084fc' }}
              />
              <span className="text-[9px] font-mono text-neutral-400">
                {Math.round(volume * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── HORIZONTAL DSP EFFECTS RACK (All 12 Presets Swipable) ── */}
      <div className="mx-3.5 mb-1 mt-0.5 glass-card rounded-2xl p-2 shrink-0">
        <div className="flex items-center justify-between px-1.5 pb-1.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-300 font-bold">
              Audio DSP Profiles
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleEffects}
              className={`px-2 py-0.5 rounded-full text-[9px] font-semibold transition-all active:scale-95 ${
                effectsEnabled
                  ? 'bg-purple-600 text-white shadow-[0_0_8px_rgba(168,85,247,0.5)]'
                  : 'bg-white/10 text-neutral-400'
              }`}
            >
              {effectsEnabled ? 'DSP ACTIVE' : 'BYPASSED'}
            </button>
            <button
              onClick={() => setShowDspModal(true)}
              className="text-[9px] text-purple-300/80 hover:text-white font-mono underline"
            >
              View All (12)
            </button>
          </div>
        </div>

        {/* Scrollable preset pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 px-0.5">
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
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-medium shrink-0 transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-purple-600/35 border-purple-400 text-white shadow-[0_0_10px_rgba(192,132,252,0.6)] font-semibold'
                    : 'bg-white/4 border-white/8 text-neutral-400 hover:text-neutral-200 hover:bg-white/8'
                }`}
              >
                <span className={isSelected ? 'text-purple-300' : 'text-neutral-400'}>
                  {effect.icon}
                </span>
                <span className="whitespace-nowrap">{effect.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── FULL AUDIO DSP PRESETS MODAL DRAWER ── */}
      {showDspModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end animate-fade-in"
          onClick={() => setShowDspModal(false)}
        >
          <div
            className="w-full max-w-md mx-auto bg-[#0d071c] border-t border-purple-500/30 rounded-t-3xl p-5 shadow-2xl flex flex-col gap-3 max-h-[80vh] overflow-y-auto scrollbar-none tab-enter"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Audio DSP Soundstage Effects</h3>
              </div>
              <button
                onClick={() => setShowDspModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {dspEffects.map((item) => {
                const isSelected = activeEffect === item.id && effectsEnabled;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectEffect(item.id);
                      setShowDspModal(false);
                    }}
                    className={`flex flex-col text-left p-3 rounded-2xl border transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-purple-900/40 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)] text-white'
                        : 'bg-white/4 border-white/6 text-neutral-300 hover:bg-white/8 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 font-semibold text-xs">
                        <span className={isSelected ? 'text-purple-300' : 'text-neutral-400'}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_6px_#c084fc]" />
                      )}
                    </div>
                    <span className="text-[10px] text-neutral-400 leading-tight">
                      {item.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

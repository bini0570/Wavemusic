import React from 'react';
import {
  Folder,
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
  Crown,
  Eye,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { DVSpectrumVisualizer } from './DVSpectrumVisualizer';

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
  // Format seconds to m:ss
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeekChange = (e) => {
    const val = parseFloat(e.target.value);
    onSeek((val / 100) * (duration || 1));
  };

  // 5 Quick Effect Capsules matching reference design
  const quickEffects = [
    {
      id: 'normal',
      label: 'Normal',
      icon: <AudioWaveform className="w-4 h-4" />,
    },
    {
      id: '8d',
      label: '8D',
      icon: <Headphones className="w-4 h-4" />,
    },
    {
      id: 'bass_boost',
      label: 'Bass',
      icon: <Rocket className="w-4 h-4" />,
    },
    {
      id: 'virtualizer',
      label: 'Virtualizer',
      icon: <Box className="w-4 h-4" />,
    },
    {
      id: 'surround',
      label: 'Surround',
      icon: <Radio className="w-4 h-4" />,
    },
  ];

  return (
    <div className="w-full flex flex-col gap-3.5 px-4 sm:px-6 pt-2 pb-24 relative select-none text-white max-h-screen overflow-hidden">
      {/* 1. TOP APP BAR */}
      <div className="flex items-center justify-between py-1">
        {/* Brand Lockup with purple gradient play triangle + DV Music */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-fuchsia-500 flex items-center justify-center shadow-[0_0_14px_rgba(168,85,247,0.8)]">
            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-bold tracking-wide text-white font-sans leading-tight">
              DV Music
            </h1>
            <span className="text-[10px] text-purple-300/80 font-normal">
              Feel the Music...
            </span>
          </div>
        </div>

        {/* Right Tools: Audio spec badge & VIP Crown */}
        <div className="flex items-center gap-2">
          {/* Audio Spec Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/40 border border-purple-500/30 text-[10px] font-mono text-purple-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>32-BIT DSP</span>
          </div>

          {/* VIP Crown */}
          <div
            className="p-1.5 rounded-full text-purple-300 drop-shadow-[0_0_10px_rgba(192,132,252,0.9)]"
            title="VIP Offline Audio Processing Active"
          >
            <Crown className="w-5 h-5 fill-purple-400/30 text-purple-300" />
          </div>
        </div>
      </div>

      {/* 2. ALBUM ARTWORK CARD WITH COSMIC PURPLE AURA */}
      <div className="relative w-full flex items-center justify-center my-0.5">
        {/* Glowing cosmic purple ambient aura */}
        <div className="absolute w-64 h-64 sm:w-72 sm:h-72 bg-purple-600/30 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />

        {/* The Squircle Artwork Card */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-[32px] overflow-hidden border border-purple-500/35 shadow-[0_0_40px_rgba(147,51,234,0.4)] bg-gradient-to-b from-[#1b1033] to-[#0d071a] flex items-center justify-center group">
          {/* Cover Art Image */}
          <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
            <img
              src={
                currentTrack?.coverUrl ||
                '/assets/aistudio/6fb296ac-33e4-4fa6-b660-2b2aff3cb756_f201cdfc.png'
              }
              alt={currentTrack?.title || 'Cover'}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              style={{
                objectPosition: currentTrack?.coverUrl ? 'center' : '50% 24%',
                transform: currentTrack?.coverUrl ? 'none' : 'scale(1.85)',
              }}
            />
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e071e]/70 via-transparent to-black/20 pointer-events-none" />
          </div>

          {/* Top-Left Floating Badge: Local File vs Demo Track */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-medium text-neutral-200 pointer-events-none">
            <Folder className="w-3.5 h-3.5 text-purple-400" />
            <span>{currentTrack?.source === 'synthetic' ? 'Demo Track' : 'Offline Track'}</span>
          </div>

          {/* Top-Right Visualizer Mode Switcher Pill */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
            <button
              onClick={onToggleVisualizerMode}
              className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-purple-500/30 text-[10px] font-semibold text-purple-300 hover:text-white flex items-center gap-1 transition active:scale-95"
              title="Change Visualizer Effect"
            >
              <Eye className="w-3 h-3 text-purple-400" />
              <span className="capitalize">{visualizerMode.replace('-', ' ')}</span>
            </button>
          </div>

          {/* Floating 8D Orbit Indicator if 8D audio is active */}
          {effectsEnabled && activeEffect === '8d' && (
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between px-3.5 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-purple-500/40 text-[11px] text-purple-300">
              <span className="flex items-center gap-1.5 font-medium">
                <Headphones className="w-3.5 h-3.5 text-purple-400" /> 8D Binaural Orbit
              </span>
              <span className="font-mono text-xs text-purple-400 font-bold">
                {Math.round(eightDAngle)}°
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 3. TRACK TITLE, ARTIST & FAVORITE */}
      <div className="flex items-center justify-between pt-0.5">
        <div className="flex flex-col min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans truncate max-w-[240px] sm:max-w-md">
            {currentTrack?.title || 'Dreams'}
          </h2>
          <span className="text-xs sm:text-sm text-purple-300/80 font-medium truncate">
            {currentTrack?.artist || 'Lost Sky'}
          </span>
        </div>

        {/* Right Action Icons: Favorite & Repeat */}
        <div className="flex items-center gap-2">
          {/* Favorite */}
          <button
            onClick={onFavoriteToggle}
            className={`p-2 transition-transform active:scale-90 ${
              currentTrack?.isFavorite
                ? 'text-pink-500 fill-pink-500'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Favorite Track"
          >
            <Heart className={`w-5 h-5 sm:w-6 sm:h-6 ${currentTrack?.isFavorite ? 'fill-current' : ''}`} />
          </button>

          {/* Repeat */}
          <button
            onClick={onRepeatToggle}
            className={`p-2 transition-colors ${
              repeatMode !== 'off' ? 'text-purple-400' : 'text-neutral-400 hover:text-white'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-5 h-5 sm:w-6 sm:h-6" /> : <Repeat className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>
      </div>

      {/* 4. REAL-TIME SPECTRUM WAVEFORM VISUALIZER */}
      <div className="w-full">
        <DVSpectrumVisualizer
          isPlaying={isPlaying}
          mode={visualizerMode}
        />
      </div>

      {/* 5. SEEKER / PROGRESS BAR */}
      <div className="w-full flex flex-col gap-1 -mt-1.5">
        <div className="relative w-full h-4 flex items-center group cursor-pointer">
          {/* Background Bar */}
          <div className="w-full h-1 bg-[#231542] rounded-full overflow-hidden relative">
            {/* Filled Progress Bar */}
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-400 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Draggable Circle Thumb */}
          <div
            className="absolute w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_10px_rgba(192,132,252,0.9)] border border-purple-400 pointer-events-none transform -translate-x-1/2"
            style={{ left: `${progressPercent}%` }}
          />

          {/* Hidden Input Range */}
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progressPercent}
            onChange={handleSeekChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        {/* Time Indicators */}
        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 px-0.5">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* 6. MAIN PLAYBACK TRANSPORT CONTROLS */}
      <div className="flex items-center justify-around px-4 py-1">
        {/* Shuffle */}
        <button
          onClick={onShuffleToggle}
          className={`p-2.5 rounded-full transition-colors ${
            isShuffle ? 'text-purple-400 bg-purple-950/40' : 'text-neutral-400 hover:text-white'
          }`}
          title="Shuffle"
        >
          <Shuffle className="w-5 h-5" />
        </button>

        {/* Previous */}
        <button
          onClick={onPrevTrack}
          className="p-2 text-neutral-200 hover:text-white transition-transform active:scale-90"
          title="Previous Track"
        >
          <SkipBack className="w-7 h-7 fill-current" />
        </button>

        {/* Big Central Play / Pause Button with Purple Halo Glow */}
        <button
          onClick={onPlayToggle}
          className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-[0_0_30px_rgba(168,85,247,0.6)] border-2 border-purple-400/40 hover:scale-105 active:scale-95 transition-all"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          <div className="absolute inset-[-4px] rounded-full border border-purple-400/30 pointer-events-none animate-pulse" />
          {isPlaying ? (
            <Pause className="w-7 h-7 sm:w-8 sm:h-8 fill-current" />
          ) : (
            <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current translate-x-0.5" />
          )}
        </button>

        {/* Next */}
        <button
          onClick={onNextTrack}
          className="p-2 text-neutral-200 hover:text-white transition-transform active:scale-90"
          title="Next Track"
        >
          <SkipForward className="w-7 h-7 fill-current" />
        </button>

        {/* Repeat Mode Quick Toggle */}
        <button
          onClick={onRepeatToggle}
          className={`p-2.5 rounded-full transition-colors ${
            repeatMode !== 'off' ? 'text-purple-400 bg-purple-950/40' : 'text-neutral-400 hover:text-white'
          }`}
          title={`Repeat: ${repeatMode}`}
        >
          {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
        </button>
      </div>

      {/* 6b. MASTER VOLUME SLIDER */}
      <div className="w-full bg-[#110724]/60 border border-purple-500/15 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-md">
        <button
          onClick={() => onVolumeChange(volume === 0 ? 0.9 : 0)}
          className="text-purple-400 hover:text-white transition active:scale-95 shrink-0"
          title={volume === 0 ? 'Unmute' : 'Mute'}
        >
          {volume === 0 ? <VolumeX className="w-4 h-4 text-neutral-400" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <div className="relative flex-1 h-3 flex items-center cursor-pointer">
          <div className="w-full h-1 bg-[#231542] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full"
              style={{ width: `${Math.round(volume * 100)}%` }}
            />
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        <span className="font-mono text-[10px] text-purple-300/80 w-8 text-right font-semibold">
          {Math.round(volume * 100)}%
        </span>
      </div>

      {/* 7. QUICK AUDIO EFFECTS CAPSULES STRIP */}
      <div className="w-full bg-[#110724]/90 border border-purple-500/20 rounded-[28px] p-2.5 shadow-xl backdrop-blur-xl">
        <div className="grid grid-cols-5 gap-2 items-center">
          {quickEffects.map((effect) => {
            const isSelected = activeEffect === effect.id;
            return (
              <button
                key={effect.id}
                onClick={() => onSelectEffect(effect.id)}
                className={`flex flex-col items-center justify-center gap-1.5 py-2 px-1 rounded-2xl transition-all active:scale-95 ${
                  isSelected ? 'text-purple-200' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {/* Glowing Circular Icon Bubble */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-purple-600/30 border-2 border-purple-400 text-purple-200 shadow-[0_0_16px_rgba(192,132,252,0.8)]'
                      : 'bg-white/5 border border-white/10 text-neutral-400 hover:bg-white/10'
                  }`}
                >
                  {effect.icon}
                </div>
                <span
                  className={`text-[10px] font-medium leading-none ${
                    isSelected ? 'text-purple-200 font-semibold' : 'text-neutral-400'
                  }`}
                >
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

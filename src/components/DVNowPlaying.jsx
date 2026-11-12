import React, { useState } from 'react';
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
  Eye,
  Volume2,
  VolumeX,
  Disc,
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

  // Format seconds to m:ss
  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeekChange = (e) => {
    const val = parseFloat(e.target.value);
    onSeek((val / 100) * (duration || 1));
  };

  // 5 Quick Effect Capsules
  const quickEffects = [
    {
      id: 'normal',
      label: 'Normal',
      icon: <AudioWaveform className="w-4 h-4" />,
    },
    {
      id: '8d',
      label: '8D Audio',
      icon: <Headphones className="w-4 h-4" />,
    },
    {
      id: 'bass_boost',
      label: 'Bass Boost',
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
    <div className="w-full flex flex-col justify-between px-4 sm:px-6 pt-1 pb-2 select-none text-white max-w-md mx-auto">
      {/* 1. TOP APP BAR */}
      <div className="flex items-center justify-between py-1 shrink-0">
        {/* Brand Lockup */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 via-indigo-600 to-fuchsia-500 flex items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.7)]">
            <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold tracking-wide text-white leading-tight">
              DV Music
            </h1>
            <span className="text-[9px] text-purple-300/80 font-normal">
              100% Offline Audio
            </span>
          </div>
        </div>

        {/* Right Tools: 32-Bit DSP spec badge & Vinyl Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-[9px] font-mono text-purple-300">
            <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'}`} />
            <span>32-BIT DSP</span>
          </div>

          <button
            onClick={() => setIsVinylMode(!isVinylMode)}
            className={`p-1.5 rounded-full border transition-all ${
              isVinylMode
                ? 'bg-purple-600/40 border-purple-400 text-purple-200 shadow-[0_0_10px_rgba(192,132,252,0.8)]'
                : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
            }`}
            title="Toggle Vinyl Turntable Mode"
          >
            <Disc className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. ARTWORK CARD / ROTATING VINYL DISC */}
      <div className="relative w-full flex items-center justify-center my-2 shrink-0">
        {/* Ambient Purple Glow */}
        <div className={`absolute w-52 h-52 sm:w-64 sm:h-64 bg-purple-600/25 rounded-full blur-2xl pointer-events-none -z-10 ${isPlaying ? 'animate-neon-pulse' : 'opacity-20'}`} />

        {/* Squircle Album Art or Vinyl Disc */}
        {!isVinylMode ? (
          <div
            onClick={() => setIsVinylMode(true)}
            className="relative w-48 h-48 xs:w-56 xs:h-56 sm:w-64 sm:h-64 max-h-[30vh] aspect-square rounded-[26px] overflow-hidden border border-purple-500/30 shadow-[0_8px_30px_rgba(147,51,234,0.35)] bg-gradient-to-b from-[#1b1033] to-[#0d071a] flex items-center justify-center cursor-pointer group"
          >
            <DVAlbumArt
              track={currentTrack}
              isPlaying={isPlaying}
              size="lg"
              className="w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e071e]/75 via-transparent to-black/20 pointer-events-none" />

            {/* Badges on Artwork */}
            <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-medium text-neutral-200 pointer-events-none">
              <Folder className="w-3 h-3 text-purple-400" />
              <span>{currentTrack?.source === 'synthetic' ? 'Demo' : 'Offline'}</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisualizerMode();
              }}
              className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-purple-500/30 text-[9px] font-semibold text-purple-300 hover:text-white flex items-center gap-1 active:scale-95 transition z-10"
            >
              <Eye className="w-2.5 h-2.5 text-purple-400" />
              <span className="capitalize">{visualizerMode.replace('-', ' ')}</span>
            </button>

            {/* 8D Orbit Indicator Pill */}
            {effectsEnabled && activeEffect === '8d' && (
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-purple-500/40 text-[10px] text-purple-300">
                <span className="flex items-center gap-1 font-medium">
                  <Headphones className="w-3 h-3 text-purple-400" /> 8D Orbit
                </span>
                <span className="font-mono text-[10px] text-purple-300 font-bold">
                  {Math.round(eightDAngle)}°
                </span>
              </div>
            )}
          </div>
        ) : (
          /* Interactive Vinyl Turntable */
          <div
            onClick={() => setIsVinylMode(false)}
            className="relative w-48 h-48 xs:w-56 xs:h-56 sm:w-64 sm:h-64 max-h-[30vh] aspect-square rounded-full border-4 border-[#24133d] shadow-[0_0_35px_rgba(168,85,247,0.4)] flex items-center justify-center cursor-pointer vinyl-grooves overflow-hidden"
          >
            {/* Rotating Disc */}
            <div className={`w-full h-full rounded-full flex items-center justify-center ${isPlaying ? 'animate-vinyl' : 'animate-vinyl-paused'}`}>
              <div className="w-20 h-20 rounded-full border-2 border-purple-400/50 overflow-hidden relative shadow-lg">
                <DVAlbumArt
                  track={currentTrack}
                  isPlaying={isPlaying}
                  size="sm"
                  className="w-full h-full"
                />
                <div className="absolute inset-0 m-auto w-4 h-4 rounded-full bg-[#0a0414] border-2 border-purple-400/80" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. TRACK TITLE, ARTIST & FAVORITE */}
      <div className="flex items-center justify-between py-1 shrink-0">
        <div className="flex flex-col min-w-0 flex-1 pr-2">
          <h2 className="text-base xs:text-lg sm:text-xl font-bold text-white tracking-tight truncate">
            {currentTrack?.title || 'Dreams'}
          </h2>
          <span className="text-xs text-purple-300/80 font-medium truncate">
            {currentTrack?.artist || 'Lost Sky'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onFavoriteToggle}
            className={`p-2 rounded-full transition-transform active:scale-90 ${
              currentTrack?.isFavorite
                ? 'text-pink-500 fill-pink-500'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Favorite Track"
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
            {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 4. REAL-TIME SPECTRUM WAVEFORM VISUALIZER */}
      <div className="w-full shrink-0 my-0.5">
        <DVSpectrumVisualizer
          isPlaying={isPlaying}
          mode={visualizerMode}
          className="w-full h-11 relative"
        />
      </div>

      {/* 5. SEEKER / PROGRESS BAR */}
      <div className="w-full flex flex-col gap-1 shrink-0 my-1">
        <div className="relative w-full h-4 flex items-center cursor-pointer">
          <div className="w-full h-1 bg-[#231542] rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-400 to-indigo-400 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div
            className="absolute w-3 h-3 rounded-full bg-white shadow-[0_0_10px_rgba(192,132,252,0.9)] border border-purple-400 pointer-events-none transform -translate-x-1/2"
            style={{ left: `${progressPercent}%` }}
          />

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

        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 px-0.5">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* 6. MAIN PLAYBACK TRANSPORT CONTROLS */}
      <div className="flex items-center justify-around px-2 py-1 shrink-0">
        <button
          onClick={onShuffleToggle}
          className={`p-2 rounded-full transition-colors ${
            isShuffle ? 'text-purple-400 bg-purple-950/50' : 'text-neutral-400 hover:text-white'
          }`}
          title="Shuffle"
        >
          <Shuffle className="w-4 h-4" />
        </button>

        <button
          onClick={onPrevTrack}
          className="p-2 text-neutral-200 hover:text-white transition-transform active:scale-90"
          title="Previous Track"
        >
          <SkipBack className="w-6 h-6 fill-current" />
        </button>

        {/* Big Central Play / Pause Button with Purple Halo Glow */}
        <button
          onClick={onPlayToggle}
          className="relative w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 flex items-center justify-center text-white shadow-[0_0_25px_rgba(168,85,247,0.7)] border-2 border-purple-300/40 hover:scale-105 active:scale-95 transition-all"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current translate-x-0.5" />
          )}
        </button>

        <button
          onClick={onNextTrack}
          className="p-2 text-neutral-200 hover:text-white transition-transform active:scale-90"
          title="Next Track"
        >
          <SkipForward className="w-6 h-6 fill-current" />
        </button>

        <button
          onClick={() => onVolumeChange(volume === 0 ? 0.9 : 0)}
          className={`p-2 rounded-full transition-colors ${
            volume === 0 ? 'text-neutral-500' : 'text-purple-400 hover:text-purple-300'
          }`}
          title={volume === 0 ? 'Unmute' : 'Mute'}
        >
          {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* 7. QUICK AUDIO EFFECTS CAPSULES STRIP */}
      <div className="w-full bg-[#110724]/90 border border-purple-500/20 rounded-2xl p-2 shadow-xl backdrop-blur-xl shrink-0 my-1">
        <div className="grid grid-cols-5 gap-1.5 items-center">
          {quickEffects.map((effect) => {
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
                className={`flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition-all active:scale-95 ${
                  isSelected ? 'text-purple-200' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-purple-600/35 border-2 border-purple-400 text-purple-200 shadow-[0_0_14px_rgba(192,132,252,0.8)]'
                      : 'bg-white/5 border border-white/10 text-neutral-400 hover:bg-white/10'
                  }`}
                >
                  {effect.icon}
                </div>
                <span
                  className={`text-[9px] font-medium leading-none ${
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

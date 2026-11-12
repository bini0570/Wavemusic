import React, { useState } from 'react';
import {
  Activity,
  Headphones,
  BarChart2,
  Box,
  Radio,
  Moon,
  Volume2,
  MoveHorizontal,
  ChevronRight,
  Sliders,
  Check,
  Mic,
  Zap,
  Repeat,
  Waves,
} from 'lucide-react';

export const DVEffectsCard = ({
  effectsEnabled,
  onToggleEffects,
  activeEffect,
  onSelectEffect,
  eqPreset,
  onSelectEqPreset,
  eqBands,
  onBandChange,
}) => {
  const [showPresetMenu, setShowPresetMenu] = useState(false);

  const effectTiles = [
    { id: 'normal', label: 'Normal', icon: <Activity className="w-4 h-4" /> },
    { id: '8d', label: '8D Audio', icon: <Headphones className="w-4 h-4" /> },
    { id: 'bass_boost', label: 'Bass Boost', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'vocal_boost', label: 'Vocal', icon: <Mic className="w-4 h-4" /> },
    { id: 'treble_boost', label: 'Treble', icon: <Zap className="w-4 h-4" /> },
    { id: 'echo', label: 'Echo', icon: <Repeat className="w-4 h-4" /> },
    { id: 'reverb', label: 'Reverb', icon: <Waves className="w-4 h-4" /> },
    { id: 'virtualizer', label: 'Virtualizer', icon: <Box className="w-4 h-4" /> },
    { id: 'surround', label: 'Surround', icon: <Radio className="w-4 h-4" /> },
    { id: 'night_mode', label: 'Night Mode', icon: <Moon className="w-4 h-4" /> },
    { id: 'trubass', label: 'TruBass', icon: <Volume2 className="w-4 h-4" /> },
    { id: 'wide_stereo', label: 'Wide Stereo', icon: <MoveHorizontal className="w-4 h-4" /> },
  ];

  const eqPresetsList = [
    { id: 'custom', label: 'Custom' },
    { id: 'normal', label: 'Flat (Normal)' },
    { id: 'deep_bass', label: 'Deep Bass' },
    { id: 'edm', label: 'EDM / Dance' },
    { id: 'pop', label: 'Pop' },
    { id: 'rock', label: 'Rock' },
    { id: 'vocal', label: 'Vocal Boost' },
    { id: 'jazz', label: 'Jazz' },
    { id: 'classical', label: 'Classical' },
    { id: 'acoustic', label: 'Acoustic' },
  ];

  const bandsConfig = [
    { key: 'b60', label: '60' },
    { key: 'b170', label: '170' },
    { key: 'b310', label: '310' },
    { key: 'b600', label: '600' },
    { key: 'b1k', label: '1k' },
    { key: 'b3k', label: '3k' },
    { key: 'b6k', label: '6k' },
    { key: 'b8k', label: '8k' },
    { key: 'b12k', label: '12k' },
    { key: 'b14k', label: '14k' },
    { key: 'b16k', label: '16k' },
  ];

  return (
    <div className="w-full bg-[#140c26]/90 border border-purple-500/20 rounded-3xl p-3.5 sm:p-5 flex flex-col gap-4 shadow-xl backdrop-blur-xl">
      {/* 1. AUDIO EFFECTS SECTION */}
      <div className="flex flex-col gap-3">
        {/* Section Header with Master Toggle Switch */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs sm:text-sm font-semibold tracking-wide text-neutral-100 font-sans">
              Audio DSP Effects
            </h3>
          </div>

          {/* Master Toggle Pill */}
          <button
            onClick={onToggleEffects}
            className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
              effectsEnabled ? 'bg-purple-600 shadow-[0_0_12px_rgba(168,85,247,0.6)]' : 'bg-neutral-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                effectsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 12 Effect Presets Grid (3 columns on mobile, 4 on larger screens) */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {effectTiles.map((tile) => {
            const isSelected = effectsEnabled && activeEffect === tile.id;
            return (
              <button
                key={tile.id}
                onClick={() => onSelectEffect(tile.id)}
                className={`flex flex-col items-center justify-center gap-1.5 py-2.5 px-1 rounded-2xl transition-all border text-center active:scale-95 ${
                  isSelected
                    ? 'bg-purple-950/70 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)] text-purple-200'
                    : 'bg-[#1b1033]/60 border-purple-900/20 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div className={`${isSelected ? 'text-purple-300' : 'text-neutral-400'}`}>
                  {tile.icon}
                </div>
                <span className="text-[10px] font-medium leading-none truncate max-w-[85px]">
                  {tile.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. 10-BAND EQUALIZER SECTION */}
      <div className="flex flex-col gap-3 pt-3 border-t border-purple-500/15">
        {/* Equalizer Header with Preset Selector */}
        <div className="flex items-center justify-between relative">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs sm:text-sm font-semibold tracking-wide text-neutral-100 font-sans">
              10-Band Equalizer
            </h3>
          </div>

          {/* Preset Button */}
          <button
            onClick={() => setShowPresetMenu(!showPresetMenu)}
            className="flex items-center gap-1 text-[11px] text-neutral-300 hover:text-white px-2.5 py-1 rounded-full bg-purple-950/50 border border-purple-500/30 transition-colors"
          >
            <span className="capitalize">{eqPreset.replace('_', ' ')}</span>
            <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
          </button>

          {/* Preset Dropdown Menu */}
          {showPresetMenu && (
            <div className="absolute right-0 top-8 z-30 w-44 bg-[#1b1033] border border-purple-500/40 rounded-2xl shadow-2xl p-1.5 flex flex-col gap-0.5">
              {eqPresetsList.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelectEqPreset(p.id);
                    setShowPresetMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                    eqPreset === p.id ? 'bg-purple-600/30 text-purple-200 font-semibold' : 'text-neutral-300 hover:bg-purple-950/60'
                  }`}
                >
                  <span>{p.label}</span>
                  {eqPreset === p.id && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 10-Band Sliders Grid */}
        <div className="flex items-center gap-1 pt-1 select-none overflow-x-auto">
          {/* Vertical Scale Reference Labels */}
          <div className="flex flex-col justify-between h-32 text-[8px] font-mono text-neutral-400 pb-4 shrink-0 pr-1">
            <span>+12</span>
            <span>0</span>
            <span>-12</span>
          </div>

          {/* 11 Vertical Sliders */}
          <div className="flex-1 grid grid-cols-11 gap-0.5 sm:gap-1 items-end h-32">
            {bandsConfig.map((band) => {
              const val = eqBands[band.key] || 0;
              const percent = ((val + 12) / 24) * 100;

              return (
                <div key={band.key} className="flex flex-col items-center h-full justify-between">
                  {/* Slider Track */}
                  <div className="relative w-full h-24 flex items-center justify-center">
                    <div className="w-1.5 h-full bg-[#231542] rounded-full relative overflow-hidden">
                      <div
                        className="w-full bg-gradient-to-t from-indigo-500 to-purple-400 absolute left-0"
                        style={{
                          bottom: val >= 0 ? '50%' : `${percent}%`,
                          top: val >= 0 ? `${100 - percent}%` : '50%',
                        }}
                      />
                    </div>

                    <div
                      className="absolute w-3 h-3 rounded-full bg-white shadow-[0_0_8px_rgba(192,132,252,0.8)] border border-purple-400 pointer-events-none transition-all"
                      style={{ bottom: `calc(${percent}% - 6px)` }}
                    />

                    <input
                      type="range"
                      min="-12"
                      max="12"
                      step="0.5"
                      value={val}
                      onChange={(e) => onBandChange(band.key, parseFloat(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                    />
                  </div>

                  {/* Frequency Label */}
                  <span className="text-[8px] font-mono text-neutral-400 pt-0.5 text-center leading-none">
                    {band.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

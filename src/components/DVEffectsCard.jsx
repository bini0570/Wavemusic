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
    { id: 'normal', label: 'Normal', icon: <Activity className="w-5 h-5" /> },
    { id: '8d', label: '8D Audio', icon: <Headphones className="w-5 h-5" /> },
    { id: 'bass_boost', label: 'Bass Boost', icon: <BarChart2 className="w-5 h-5" /> },
    { id: 'vocal_boost', label: 'Vocal Boost', icon: <Mic className="w-5 h-5" /> },
    { id: 'treble_boost', label: 'Treble Boost', icon: <Zap className="w-5 h-5" /> },
    { id: 'echo', label: 'Echo / Delay', icon: <Repeat className="w-5 h-5" /> },
    { id: 'reverb', label: 'Reverb', icon: <Waves className="w-5 h-5" /> },
    { id: 'virtualizer', label: 'Virtualizer', icon: <Box className="w-5 h-5" /> },
    { id: 'surround', label: 'Surround', icon: <Radio className="w-5 h-5" /> },
    { id: 'night_mode', label: 'Night Mode', icon: <Moon className="w-5 h-5" /> },
    { id: 'trubass', label: 'TruBass', icon: <Volume2 className="w-5 h-5" /> },
    { id: 'wide_stereo', label: 'Wide Stereo', icon: <MoveHorizontal className="w-5 h-5" /> },
  ];

  const eqPresetsList = [
    { id: 'custom', label: 'Custom' },
    { id: 'normal', label: 'Normal' },
    { id: 'deep_bass', label: 'Deep Bass' },
    { id: 'edm', label: 'EDM / Dance' },
    { id: 'pop', label: 'Pop' },
    { id: 'rock', label: 'Rock' },
    { id: 'vocal', label: 'Vocal' },
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
    <div className="w-full bg-[#140c26]/90 border border-purple-900/30 rounded-3xl p-4 sm:p-5 flex flex-col gap-5 shadow-[0_10px_35px_-10px_rgba(10,5,25,0.8)] backdrop-blur-xl">
      {/* 1. AUDIO EFFECTS SECTION */}
      <div className="flex flex-col gap-3.5">
        {/* Section Header with Master Toggle Switch */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-purple-400">
              <Sliders className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-semibold tracking-wide text-neutral-100 font-sans">
              Audio Effects
            </h3>
          </div>

          {/* Master Toggle Pill */}
          <button
            onClick={onToggleEffects}
            className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
              effectsEnabled ? 'bg-purple-600 shadow-[0_0_12px_rgba(168,85,247,0.5)]' : 'bg-neutral-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                effectsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 12 Effect Presets Grid */}
        <div className="grid grid-cols-4 gap-2">
          {effectTiles.map((tile) => {
            const isSelected = effectsEnabled && activeEffect === tile.id;
            return (
              <button
                key={tile.id}
                onClick={() => onSelectEffect(tile.id)}
                className={`flex flex-col items-center justify-center gap-1.5 py-3 px-1 rounded-2xl transition-all border text-center ${
                  isSelected
                    ? 'bg-purple-950/60 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.35)] text-purple-200'
                    : 'bg-[#1b1033]/60 border-purple-900/20 text-neutral-400 hover:text-neutral-200 hover:border-purple-800/40'
                }`}
              >
                <div className={`${isSelected ? 'text-purple-300' : 'text-neutral-400'}`}>
                  {tile.icon}
                </div>
                <span className="text-[10px] font-medium leading-none whitespace-nowrap">
                  {tile.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. 10-BAND EQUALIZER SECTION */}
      <div className="flex flex-col gap-3 pt-1 border-t border-purple-900/20">
        {/* Equalizer Header with Preset Selector */}
        <div className="flex items-center justify-between relative">
          <div className="flex items-center gap-2.5">
            <span className="text-purple-400">
              <Activity className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-semibold tracking-wide text-neutral-100 font-sans">
              Equalizer
            </h3>
          </div>

          {/* Preset Button */}
          <button
            onClick={() => setShowPresetMenu(!showPresetMenu)}
            className="flex items-center gap-1 text-xs text-neutral-300 hover:text-white px-2.5 py-1 rounded-full bg-purple-950/40 border border-purple-800/40 transition-colors"
          >
            <span className="capitalize">{eqPreset.replace('_', ' ')}</span>
            <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
          </button>

          {/* Preset Dropdown Menu */}
          {showPresetMenu && (
            <div className="absolute right-0 top-8 z-30 w-44 bg-[#1b1033] border border-purple-800/60 rounded-2xl shadow-2xl p-1.5 flex flex-col gap-0.5">
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
        <div className="flex items-center gap-1 pt-2 select-none">
          {/* Vertical Scale Reference Labels */}
          <div className="flex flex-col justify-between h-36 text-[9px] font-mono text-neutral-400 pb-5 shrink-0">
            <span>+12dB</span>
            <span>0dB</span>
            <span>-12dB</span>
          </div>

          {/* 11 Vertical Sliders */}
          <div className="flex-1 grid grid-cols-11 gap-1 items-end h-36">
            {bandsConfig.map((band) => {
              const val = eqBands[band.key] || 0;
              const percent = ((val + 12) / 24) * 100;

              return (
                <div key={band.key} className="flex flex-col items-center h-full justify-between">
                  {/* Slider Track */}
                  <div className="relative w-full h-28 flex items-center justify-center">
                    <div className="w-1.5 h-full bg-[#231542] rounded-full relative overflow-hidden">
                      <div
                        className="w-full bg-purple-500/50 absolute left-0"
                        style={{
                          bottom: val >= 0 ? '50%' : `${percent}%`,
                          top: val >= 0 ? `${100 - percent}%` : '50%',
                        }}
                      />
                    </div>

                    <div
                      className="absolute w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_8px_rgba(192,132,252,0.8)] border border-purple-400 pointer-events-none transition-all"
                      style={{ bottom: `calc(${percent}% - 7px)` }}
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
                  <span className="text-[9px] font-mono text-neutral-400 pt-1 text-center">
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

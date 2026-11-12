import React from 'react';
import { Headphones } from 'lucide-react';
import { DVEffectsCard } from './DVEffectsCard';
import { audioEngine } from '../audio/audioEngine';

export const DVEqualizerTab = ({
  effectsEnabled,
  onToggleEffects,
  activeEffect,
  onSelectEffect,
  eqPreset,
  onSelectEqPreset,
  eqBands,
  onBandChange,
  eightDAngle,
  eightDSpeed,
  onEightDSpeedChange,
}) => {
  // Convert angle (deg) to coordinates on 140px radar
  const rad = (eightDAngle * Math.PI) / 180;
  const radius = 52;
  const orbX = Math.cos(rad) * radius;
  const orbY = Math.sin(rad) * radius;

  return (
    <div className="w-full flex flex-col gap-3 px-4 sm:px-6 pt-2 pb-24 select-none max-w-2xl mx-auto tab-enter">
      {/* Header */}
      <div className="flex items-center justify-between py-1">
        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
          Sound Lab & Equalizer
        </h2>

        {/* Master Power Indicator */}
        <button
          onClick={onToggleEffects}
          className={`px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
            effectsEnabled
              ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)] font-bold'
              : 'bg-neutral-800 text-neutral-400'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${effectsEnabled ? 'bg-white animate-pulse' : 'bg-neutral-500'}`} />
          {effectsEnabled ? 'DSP ON' : 'BYPASS'}
        </button>
      </div>

      {/* 8D AUDIO INTERACTIVE 360 RADAR CARD */}
      <div className="w-full bg-[#140c26]/90 border border-purple-500/20 rounded-3xl p-4 flex flex-col gap-3 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs sm:text-sm font-semibold text-white">
              8D Spatial Audio Radar
            </h3>
          </div>
        </div>

        {/* Radar Circular Stage */}
        <div className="flex flex-row items-center gap-4 justify-between">
          <div className="relative w-32 h-32 rounded-full bg-[#0a0514] border border-purple-900/40 flex items-center justify-center shadow-inner shrink-0">
            {/* Concentric distance rings */}
            <div className="absolute inset-3 rounded-full border border-dashed border-purple-500/20" />
            <div className="absolute inset-8 rounded-full border border-purple-900/40" />
            <div className="absolute w-full h-[1px] bg-purple-900/20" />
            <div className="absolute h-full w-[1px] bg-purple-900/20" />

            {/* Listener Head Avatar */}
            <div className="relative z-10 w-9 h-9 rounded-full bg-[#180e30] border border-purple-500/50 flex items-center justify-center text-purple-300 shadow-lg">
              <Headphones className="w-4 h-4 text-purple-400" />
            </div>

            {/* Orbiting Audio Orb */}
            <div
              className={`absolute w-4 h-4 rounded-full flex items-center justify-center transition-transform duration-75 pointer-events-none ${
                activeEffect === '8d' && effectsEnabled
                  ? 'bg-purple-400 shadow-[0_0_14px_#c084fc]'
                  : 'bg-neutral-600'
              }`}
              style={{
                transform: `translate(${orbX}px, ${orbY}px)`,
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>

          {/* 8D Speed & Controls */}
          <div className="flex-1 w-full flex flex-col gap-2 text-xs">
            <div className="flex justify-between text-neutral-300">
              <span className="font-medium text-[11px]">Orbit Speed</span>
              <span className="font-mono text-purple-400 font-bold text-[11px]">
                {eightDSpeed.toFixed(1)}s
              </span>
            </div>
            <input
              type="range"
              min="2.0"
              max="20.0"
              step="0.5"
              value={eightDSpeed}
              onChange={(e) => {
                const s = parseFloat(e.target.value);
                onEightDSpeedChange(s);
                audioEngine.setEightDSpeed(s);
              }}
              className="w-full accent-purple-500 h-1.5 bg-[#231542] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[9px] font-mono text-neutral-400">
              <span>Fast (2s)</span>
              <span>Smooth (20s)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 10-Band EQ & Effects Component */}
      <DVEffectsCard
        effectsEnabled={effectsEnabled}
        onToggleEffects={onToggleEffects}
        activeEffect={activeEffect}
        onSelectEffect={onSelectEffect}
        eqPreset={eqPreset}
        onSelectEqPreset={onSelectEqPreset}
        eqBands={eqBands}
        onBandChange={onBandChange}
      />
    </div>
  );
};

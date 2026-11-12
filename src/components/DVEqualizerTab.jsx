import React from 'react';
import { Headphones, Sliders } from 'lucide-react';
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
  const radius = 55;
  const orbX = Math.cos(rad) * radius;
  const orbY = Math.sin(rad) * radius;

  return (
    <div className="w-full flex flex-col gap-5 px-4 sm:px-6 pt-3 pb-28 select-none">
      {/* Tab Header */}
      <div className="flex items-center justify-between py-1">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-white tracking-tight font-sans">
            Sound Lab & Equalizer
          </h2>
          <span className="text-xs text-purple-300/70">
            Professional 10-Band EQ & 8D Binaural Processor
          </span>
        </div>

        {/* Master Power Indicator */}
        <button
          onClick={onToggleEffects}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
            effectsEnabled
              ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] font-bold'
              : 'bg-neutral-800 text-neutral-400'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${effectsEnabled ? 'bg-white animate-pulse' : 'bg-neutral-500'}`} />
          {effectsEnabled ? 'DSP ACTIVE' : 'DSP BYPASS'}
        </button>
      </div>

      {/* 8D AUDIO INTERACTIVE 360 RADAR CARD */}
      <div className="w-full bg-[#140c26]/90 border border-purple-900/30 rounded-3xl p-5 flex flex-col gap-4 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">
              8D Spatial Audio Radar
            </h3>
          </div>
          <button
            onClick={() => onSelectEffect('8d')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              activeEffect === '8d' && effectsEnabled
                ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)] font-bold'
                : 'bg-neutral-800/80 text-neutral-400 hover:text-white'
            }`}
          >
            {activeEffect === '8d' && effectsEnabled ? '8D ACTIVATED' : 'ENABLE 8D'}
          </button>
        </div>

        {/* Radar Circular Stage */}
        <div className="flex flex-col sm:flex-row items-center gap-5 justify-between">
          <div className="relative w-40 h-40 rounded-full bg-[#0a0514] border border-purple-900/40 flex items-center justify-center shadow-inner shrink-0">
            {/* Concentric distance rings */}
            <div className="absolute inset-4 rounded-full border border-dashed border-purple-500/20" />
            <div className="absolute inset-10 rounded-full border border-purple-900/40" />
            <div className="absolute w-full h-[1px] bg-purple-900/30" />
            <div className="absolute h-full w-[1px] bg-purple-900/30" />

            {/* Listener Head Avatar */}
            <div className="relative z-10 w-11 h-11 rounded-full bg-[#180e30] border border-purple-500/50 flex items-center justify-center text-purple-300 shadow-lg">
              <Headphones className="w-5 h-5 text-purple-400" />
            </div>

            {/* Orbiting Audio Orb */}
            <div
              className={`absolute w-5 h-5 rounded-full flex items-center justify-center transition-transform duration-75 pointer-events-none ${
                activeEffect === '8d' && effectsEnabled
                  ? 'bg-purple-400 shadow-[0_0_15px_#c084fc]'
                  : 'bg-neutral-600'
              }`}
              style={{
                transform: `translate(${orbX}px, ${orbY}px)`,
              }}
            >
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          </div>

          {/* 8D Speed & Controls */}
          <div className="flex-1 w-full flex flex-col gap-3 text-xs">
            <div className="flex justify-between text-neutral-300">
              <span className="font-medium">360° Orbit Speed</span>
              <span className="font-mono text-purple-400 font-bold">
                {eightDSpeed.toFixed(1)}s / rev
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
              className="accent-purple-500 h-1.5 bg-[#231542] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-400">
              <span>Fast (2s)</span>
              <span>Medium (8s)</span>
              <span>Smooth (20s)</span>
            </div>

            <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-900/30 text-[11px] text-purple-300/80 leading-relaxed">
              🎧 Recommended: Wear headphones to experience full 360-degree binaural rotation around your head.
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

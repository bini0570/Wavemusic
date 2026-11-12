import React, { useState } from 'react';
import {
  Timer,
  HardDrive,
  Info,
  Sliders,
  RotateCw,
  Trash2,
} from 'lucide-react';
import { audioEngine } from '../audio/audioEngine';

export const DVSettingsTab = ({
  sleepTimerMinutes,
  onSetSleepTimer,
  eightDSpeed,
  onEightDSpeedChange,
  onTriggerScan,
}) => {
  const timerOptions = [null, 15, 30, 45, 60];
  const speedOptions = [4, 6, 8, 12, 16, 24];
  const detectedRate = `${(audioEngine.getSampleRate() / 1000).toFixed(1)} kHz`;
  const [cacheCleared, setCacheCleared] = useState(false);

  const handleClearCache = () => {
    try {
      localStorage.removeItem('dv_playlists');
      setCacheCleared(true);
      setTimeout(() => setCacheCleared(false), 2000);
    } catch {}
  };

  return (
    <div className="w-full flex flex-col gap-3 px-4 sm:px-6 pt-2 pb-24 select-none text-xs max-w-2xl mx-auto tab-enter">
      {/* Header */}
      <div className="flex items-center justify-between py-1">
        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
          Settings
        </h2>
      </div>

      {/* 1. Sleep Timer Card */}
      <div className="bg-[#140c26]/90 border border-purple-500/20 rounded-2xl p-3.5 flex flex-col gap-2.5 shadow-lg backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold text-white">Sleep Timer</span>
          </div>
          <span className="font-mono text-purple-400 font-bold text-[11px]">
            {sleepTimerMinutes ? `${sleepTimerMinutes}m` : 'OFF'}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1.5 pt-0.5">
          {timerOptions.map((mins) => (
            <button
              key={mins === null ? 'off' : mins}
              onClick={() => onSetSleepTimer(mins)}
              className={`py-1.5 rounded-xl font-medium transition-all text-center active:scale-95 text-[11px] ${
                sleepTimerMinutes === mins
                  ? 'bg-purple-600 text-white font-bold shadow-md'
                  : 'bg-[#1e1238] text-neutral-300 hover:text-white'
              }`}
            >
              {mins === null ? 'Off' : `${mins}m`}
            </button>
          ))}
        </div>
      </div>

      {/* 2. 8D Orbit Speed */}
      <div className="bg-[#140c26]/90 border border-purple-500/20 rounded-2xl p-3.5 flex flex-col gap-2.5 shadow-lg backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCw className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold text-white">8D Rotation Speed</span>
          </div>
          <span className="font-mono text-purple-400 font-bold text-[11px]">
            {eightDSpeed}s
          </span>
        </div>

        <div className="grid grid-cols-6 gap-1.5 pt-0.5">
          {speedOptions.map((spd) => (
            <button
              key={spd}
              onClick={() => onEightDSpeedChange(spd)}
              className={`py-1.5 rounded-xl font-medium transition-all text-center active:scale-95 text-[11px] ${
                eightDSpeed === spd
                  ? 'bg-purple-600 text-white font-bold shadow-md'
                  : 'bg-[#1e1238] text-neutral-300 hover:text-white'
              }`}
            >
              {spd}s
            </button>
          ))}
        </div>
      </div>

      {/* 3. Audio Engine Specs */}
      <div className="bg-[#140c26]/90 border border-purple-500/20 rounded-2xl p-3.5 flex flex-col gap-2 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-semibold text-white">Hardware Audio Engine</span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="p-2 rounded-xl bg-purple-950/30 border border-purple-900/20 flex flex-col">
            <span className="text-[10px] text-neutral-400">Processing</span>
            <span className="text-xs font-semibold text-purple-300">32-Bit Float</span>
          </div>
          <div className="p-2 rounded-xl bg-purple-950/30 border border-purple-900/20 flex flex-col">
            <span className="text-[10px] text-neutral-400">Sample Rate</span>
            <span className="text-xs font-semibold text-purple-300">{detectedRate}</span>
          </div>
          <div className="p-2 rounded-xl bg-purple-950/30 border border-purple-900/20 flex flex-col">
            <span className="text-[10px] text-neutral-400">Equalizer</span>
            <span className="text-xs font-semibold text-purple-300">10-Band Biquad</span>
          </div>
          <div className="p-2 rounded-xl bg-purple-950/30 border border-purple-900/20 flex flex-col">
            <span className="text-[10px] text-neutral-400">Spatialization</span>
            <span className="text-xs font-semibold text-purple-300">HRTF Binaural</span>
          </div>
        </div>
      </div>

      {/* 4. Local Media Scanning & Storage */}
      <div className="bg-[#140c26]/90 border border-purple-500/20 rounded-2xl p-3.5 flex items-center justify-between shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white">Device Audio</h3>
            <p className="text-[10px] text-purple-300/60">Import audio files</p>
          </div>
        </div>

        <button
          onClick={onTriggerScan}
          className="px-3 py-1.5 rounded-xl bg-purple-600 text-white font-semibold text-xs shadow hover:bg-purple-500 transition active:scale-95"
        >
          Browse
        </button>
      </div>

      {/* 5. Clear Cache / Reset Playlists */}
      <div className="bg-[#140c26]/90 border border-purple-500/20 rounded-2xl p-3.5 flex items-center justify-between shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
            <Trash2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white">Reset Playlists</h3>
            <p className="text-[10px] text-purple-300/60">Clear user playlists</p>
          </div>
        </div>

        <button
          onClick={handleClearCache}
          className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition active:scale-95 ${
            cacheCleared
              ? 'bg-emerald-600 text-white'
              : 'bg-white/5 hover:bg-red-600/30 text-neutral-300 hover:text-red-200 border border-white/10'
          }`}
        >
          {cacheCleared ? 'Cleared' : 'Reset'}
        </button>
      </div>
      {/* Version Footer */}
      <div className="flex items-center justify-center pt-2 pb-1">
        <span className="px-2 py-0.5 rounded-full bg-purple-950/40 border border-purple-500/20 text-[9px] font-mono text-purple-400/60">
          DV Music v3.5.0 · Offline
        </span>
      </div>
    </div>
  );
};

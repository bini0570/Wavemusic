import React, { useState } from 'react';
import {
  Timer,
  HardDrive,
  Info,
  Shield,
  Smartphone,
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
    <div className="w-full flex flex-col gap-4 px-4 sm:px-6 pt-3 pb-28 select-none text-xs">
      {/* Header */}
      <div className="flex flex-col py-1">
        <h2 className="text-xl font-bold text-white tracking-tight font-sans">
          Settings
        </h2>
        <span className="text-xs text-purple-300/70">
          Audio Engine & Offline Preferences
        </span>
      </div>

      {/* 1. Sleep Timer Card */}
      <div className="bg-[#140c26]/90 border border-purple-900/30 rounded-2xl p-4 flex flex-col gap-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Timer className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-white">Sleep Timer</span>
          </div>
          <span className="font-mono text-purple-400 font-bold">
            {sleepTimerMinutes ? `${sleepTimerMinutes} min` : 'OFF'}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1.5 pt-1">
          {timerOptions.map((mins) => (
            <button
              key={mins === null ? 'off' : mins}
              onClick={() => onSetSleepTimer(mins)}
              className={`py-1.5 rounded-xl font-medium transition-all text-center ${
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

      {/* 2. 8D Audio Rotation Speed */}
      <div className="bg-[#140c26]/90 border border-purple-900/30 rounded-2xl p-4 flex flex-col gap-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <RotateCw className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-white">8D Orbit Speed</span>
          </div>
          <span className="font-mono text-purple-400 font-bold">
            {eightDSpeed}s / rev
          </span>
        </div>

        <div className="grid grid-cols-6 gap-1.5 pt-1">
          {speedOptions.map((spd) => (
            <button
              key={spd}
              onClick={() => onEightDSpeedChange(spd)}
              className={`py-1.5 rounded-xl font-medium transition-all text-center ${
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

      {/* 3. Audio Engine & Hardware Specs */}
      <div className="bg-[#140c26]/90 border border-purple-900/30 rounded-2xl p-4 flex flex-col gap-3 shadow-lg">
        <div className="flex items-center gap-2.5">
          <Sliders className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-semibold text-white">Audio Engine</span>
        </div>

        <div className="space-y-2 pt-1">
          <div className="flex justify-between items-center text-neutral-300">
            <span>Audio Processing Pipeline</span>
            <span className="font-mono text-purple-300 font-semibold">32-Bit Floating Point</span>
          </div>
          <div className="flex justify-between items-center text-neutral-300">
            <span>Spatial Audio Model</span>
            <span className="font-mono text-purple-300 font-semibold">HRTF 3D Panner</span>
          </div>
          <div className="flex justify-between items-center text-neutral-300">
            <span>Hardware Sample Rate</span>
            <span className="font-mono text-purple-300 font-semibold">{detectedRate}</span>
          </div>
          <div className="flex justify-between items-center text-neutral-300">
            <span>Biquad Filters</span>
            <span className="font-mono text-purple-300 font-semibold">10-Band Graphic EQ</span>
          </div>
        </div>
      </div>

      {/* 4. Local Media Scanning */}
      <div className="bg-[#140c26]/90 border border-purple-900/30 rounded-2xl p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Import Device Tracks</h3>
            <p className="text-[11px] text-purple-300/60">FLAC, MP3, WAV, AAC, M4A, OGG</p>
          </div>
        </div>

        <button
          onClick={onTriggerScan}
          className="px-3.5 py-1.5 rounded-xl bg-purple-600 text-white font-semibold shadow hover:bg-purple-500 transition"
        >
          Select Files
        </button>
      </div>

      {/* 5. Clear Cache / Reset Playlists */}
      <div className="bg-[#140c26]/90 border border-purple-900/30 rounded-2xl p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
            <Trash2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Clear Stored Playlists</h3>
            <p className="text-[11px] text-purple-300/60">Reset user-created playlists</p>
          </div>
        </div>

        <button
          onClick={handleClearCache}
          className={`px-3.5 py-1.5 rounded-xl font-semibold transition ${
            cacheCleared
              ? 'bg-emerald-600 text-white'
              : 'bg-white/5 hover:bg-red-600/30 text-neutral-300 hover:text-red-200 border border-white/10'
          }`}
        >
          {cacheCleared ? 'Cleared!' : 'Clear Playlists'}
        </button>
      </div>

      {/* 6. App Info Card */}
      <div className="bg-[#140c26]/90 border border-purple-900/30 rounded-2xl p-4 flex flex-col gap-2.5 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-white">About DV Music</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-purple-600/30 border border-purple-400/40 text-[10px] font-mono text-purple-300 font-bold">
            v3.5.0
          </span>
        </div>

        <p className="text-neutral-400 text-[11px] leading-relaxed">
          DV Music is a high-fidelity offline music player featuring an interactive 8D binaural radar, 10-band studio equalizer, dynamic spectrum waveform visualizers, and offline audio library.
        </p>

        <div className="flex items-center gap-4 text-[11px] text-purple-300/80 pt-1">
          <div className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Offline & Private</span>
          </div>
          <div className="flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-purple-400" />
            <span>Mobile-First Web App</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  Headphones,
  Zap,
  Activity,
  Sliders,
  RotateCcw,
  RotateCw,
  Waves,
  Gauge,
  Check,
  Music2,
  Repeat,
  Radio,
} from 'lucide-react';
import { audioEngine } from '../audio/audioEngine';

export const DVEqualizerTab = ({
  currentTrack,
  isPlaying,
  currentTime = 0,
  duration = 0,
  onSeek,
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
  playbackRate = 1.0,
  onPlaybackRateChange,
  preservesPitch = false,
  onPreservesPitchChange,
  reverbDepth = 0,
  onReverbDepthChange,
  compressorThreshold = -24,
  onCompressorThresholdChange,
}) => {
  const [activeSection, setActiveSection] = useState('all'); // 'all' | 'eq' | 'studio' | 'spatial'
  const [loopA, setLoopA] = useState(null);
  const [loopB, setLoopB] = useState(null);
  const [loopActive, setLoopActive] = useState(false);

  // 8D Radar position
  const rad = (eightDAngle * Math.PI) / 180;
  const radius = 48;
  const orbX = Math.cos(rad) * radius;
  const orbY = Math.sin(rad) * radius;

  // Tempo & Pitch Calculations
  const semitones = Math.round(Math.log2(playbackRate || 1) * 12);
  const estBpm = Math.round((currentTrack?.bpm || 128) * (playbackRate || 1));

  const speedPresets = [
    { label: '0.50×', value: 0.5 },
    { label: '0.75×', value: 0.75 },
    { label: '0.85×', value: 0.85, tag: 'Slowed' },
    { label: '1.0×', value: 1.0, tag: 'Normal' },
    { label: '1.15×', value: 1.15, tag: 'Sped' },
    { label: '1.25×', value: 1.25 },
    { label: '1.50×', value: 1.5 },
    { label: '2.0×', value: 2.0 },
  ];

  const reverbPresets = [
    { label: 'DRY', value: 0 },
    { label: 'ROOM', value: 0.25 },
    { label: 'HALL', value: 0.55 },
    { label: 'CATHEDRAL', value: 0.9 },
  ];

  const compPresets = [
    { label: 'OFF', value: -60 },
    { label: 'GENTLE', value: -24 },
    { label: 'PUNCHY', value: -18 },
    { label: 'HARD', value: -12 },
  ];

  const eqPresetsList = [
    { id: 'custom', label: 'Custom' },
    { id: 'normal', label: 'Flat' },
    { id: 'deep_bass', label: 'Deep Bass' },
    { id: 'edm', label: 'EDM' },
    { id: 'pop', label: 'Pop' },
    { id: 'rock', label: 'Rock' },
    { id: 'vocal', label: 'Vocal' },
    { id: 'jazz', label: 'Jazz' },
    { id: 'classical', label: 'Classical' },
  ];

  const bandConfig = [
    { key: 'b60', label: '60', color: '#a855f7' },
    { key: 'b170', label: '170', color: '#a855f7' },
    { key: 'b310', label: '310', color: '#8b5cf6' },
    { key: 'b600', label: '600', color: '#3b82f6' },
    { key: 'b1k', label: '1k', color: '#3b82f6' },
    { key: 'b3k', label: '3k', color: '#06b6d4' },
    { key: 'b6k', label: '6k', color: '#06b6d4' },
    { key: 'b8k', label: '8k', color: '#ec4899' },
    { key: 'b12k', label: '12k', color: '#ec4899' },
    { key: 'b14k', label: '14k', color: '#f43f5e' },
    { key: 'b16k', label: '16k', color: '#f43f5e' },
  ];

  // Frequency response SVG curve
  const freqCurve = useMemo(() => {
    const W = 320;
    const H = 64;
    const mid = H / 2;
    const range = 12;
    const pts = bandConfig.map((b, i) => {
      const val = eqBands[b.key] || 0;
      const xp = (i / (bandConfig.length - 1)) * W;
      const yp = mid - (val / range) * (mid - 6);
      return [xp, yp];
    });

    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const cp1x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) / 3;
      const cp1y = pts[i][1];
      const cp2x = pts[i][0] + (2 * (pts[i + 1][0] - pts[i][0])) / 3;
      const cp2y = pts[i + 1][1];
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pts[i + 1][0]} ${pts[i + 1][1]}`;
    }
    return d;
  }, [eqBands]);

  const handleResetEq = () => {
    onSelectEqPreset('normal');
  };

  const handleLoopToggle = () => {
    const next = !loopActive;
    setLoopActive(next);
    audioEngine.setLoopPoints(loopA || 0, loopB || duration, next);
  };

  const fmtTime = (sec) => {
    if (!sec && sec !== 0) return '--:--';
    return `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
  };

  return (
    <div className="w-full flex flex-col gap-4 px-3.5 sm:px-6 pt-2 pb-24 select-none max-w-xl mx-auto tab-enter text-white">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.7)]">
            <Sliders className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight leading-tight">
              Sound Lab & Studio
            </h2>
            <p className="text-[10px] text-neutral-400 font-mono">
              10-Band EQ · BPM Studio · 8D Spatial
            </p>
          </div>
        </div>

        {/* Master Power Switch */}
        <button
          onClick={onToggleEffects}
          className={`px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
            effectsEnabled
              ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.6)]'
              : 'bg-white/8 text-neutral-400 border border-white/10'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              effectsEnabled ? 'bg-white animate-pulse' : 'bg-neutral-500'
            }`}
          />
          {effectsEnabled ? 'DSP ACTIVE' : 'BYPASS'}
        </button>
      </div>

      {/* ── 1. TEMPO & PITCH STUDIO DECK (FIXES SLOWED BEAT LAG) ── */}
      <div className="bg-[#0b0517] border border-amber-500/20 rounded-2xl p-4 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold font-mono tracking-wider text-amber-300 uppercase">
              Tempo & Beat Studio
            </h3>
          </div>

          {/* Pitch mode selector (Vinyl vs Key Lock) */}
          <button
            onClick={() => onPreservesPitchChange?.(!preservesPitch)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-mono border transition-all active:scale-95 flex items-center gap-1 ${
              !preservesPitch
                ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                : 'bg-white/5 border-white/10 text-neutral-400'
            }`}
            title="Vinyl mode eliminates beat stutter and buffer lag when slowing down music"
          >
            <span>{!preservesPitch ? '● VINYL PITCH (NO LAG)' : '○ KEY LOCK'}</span>
          </button>
        </div>

        {/* Live Readouts */}
        <div className="flex items-baseline justify-between mb-3 px-1">
          <div>
            <div className="text-4xl font-mono text-amber-300 font-bold leading-none tabular-nums">
              {playbackRate.toFixed(2)}
              <span className="text-xl text-amber-400/70 ml-0.5">×</span>
            </div>
            <div className="text-[10px] font-mono text-amber-400/80 mt-1">
              {estBpm} BPM {currentTrack?.bpm ? `(Base: ${currentTrack.bpm})` : ''}
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-mono text-cyan-300 font-bold leading-none tabular-nums">
              {semitones > 0 ? `+${semitones}` : semitones}
              <span className="text-sm text-cyan-400/70 ml-1">ST</span>
            </div>
            <div className="text-[10px] font-mono text-neutral-400 mt-1">
              {!preservesPitch ? 'Analog Tape Pitch' : 'Time-Stretched'}
            </div>
          </div>
        </div>

        {/* Smooth Tempo Slider */}
        <div className="relative w-full mb-3">
          <input
            type="range"
            min="0.25"
            max="2.0"
            step="0.01"
            value={playbackRate}
            onChange={(e) => onPlaybackRateChange?.(parseFloat(e.target.value))}
            className="w-full h-2 rounded-full cursor-pointer accent-amber-400"
            style={{ accentColor: '#f59e0b' }}
          />
          <div className="flex justify-between text-[9px] font-mono text-neutral-500 mt-1">
            <span>0.25×</span>
            <span>1.0× (Normal)</span>
            <span>2.0×</span>
          </div>
        </div>

        {/* Speed Preset Quick Pills */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {speedPresets.map((preset) => {
            const isMatch = Math.abs(playbackRate - preset.value) < 0.01;
            return (
              <button
                key={preset.value}
                onClick={() => onPlaybackRateChange?.(preset.value)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-mono border whitespace-nowrap transition-all active:scale-95 ${
                  isMatch
                    ? 'bg-amber-500/25 border-amber-400 text-amber-200 font-bold shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                    : 'bg-white/4 border-white/8 text-neutral-400 hover:text-white hover:bg-white/8'
                }`}
              >
                {preset.label} {preset.tag ? `(${preset.tag})` : ''}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. 10-BAND GRAPHIC EQUALIZER ── */}
      <div className="bg-[#0b0517] border border-purple-500/20 rounded-2xl p-4 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold font-mono tracking-wider text-purple-200 uppercase">
              10-Band Graphic EQ
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetEq}
              className="text-[10px] font-mono text-neutral-400 hover:text-white flex items-center gap-1 active:scale-95"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>

        {/* EQ Presets Bar */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-2 mb-3">
          {eqPresetsList.map((preset) => {
            const isSelected = eqPreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectEqPreset(preset.id)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-medium border shrink-0 transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-purple-600/35 border-purple-400 text-purple-200 font-bold shadow-[0_0_8px_rgba(192,132,252,0.6)]'
                    : 'bg-white/4 border-white/8 text-neutral-400 hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Frequency Response Visual Curve */}
        <div className="bg-[#06020c] border border-white/6 rounded-xl p-2.5 mb-4 overflow-hidden">
          <svg viewBox="0 0 320 64" className="w-full h-12">
            <defs>
              <linearGradient id="eqFillGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ec4899" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="eqLineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            {/* Center 0dB dashed line */}
            <line
              x1="0"
              y1="32"
              x2="320"
              y2="32"
              stroke="rgba(255,255,255,0.1)"
              strokeDasharray="3,3"
              strokeWidth="1"
            />
            {/* Smooth Fill Area */}
            <path d={`${freqCurve} L 320,64 L 0,64 Z`} fill="url(#eqFillGrad)" />
            {/* Smooth Line */}
            <path
              d={freqCurve}
              fill="none"
              stroke="url(#eqLineGrad)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <div className="flex justify-between text-[8px] font-mono text-neutral-500 mt-1 px-1">
            <span>60Hz (Sub)</span>
            <span>1kHz (Mid)</span>
            <span>16kHz (Air)</span>
          </div>
        </div>

        {/* 10 Vertical Faders with Colored Glow */}
        <div className="flex justify-between items-end gap-1 pt-1">
          {bandConfig.map(({ key, label, color }) => {
            const val = eqBands[key] ?? 0;
            const pct = ((val + 12) / 24) * 100;
            return (
              <div key={key} className="flex flex-col items-center gap-1 flex-1">
                {/* dB value */}
                <span
                  className="text-[8px] font-mono tabular-nums leading-none font-bold"
                  style={{ color }}
                >
                  {val > 0 ? `+${val.toFixed(0)}` : val.toFixed(0)}
                </span>

                {/* Vertical slider wrapper */}
                <div className="relative h-24 w-5 flex items-center justify-center">
                  <div className="absolute w-1 h-full bg-white/8 rounded-full" />
                  <div
                    className="absolute w-1 rounded-full transition-all"
                    style={{
                      backgroundColor: color,
                      boxShadow: `0 0 6px ${color}80`,
                      bottom: '50%',
                      height: `${Math.abs(pct - 50)}%`,
                      ...(val >= 0 ? { bottom: '50%' } : { top: '50%', bottom: 'auto' }),
                    }}
                  />
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="0.5"
                    value={val}
                    onChange={(e) => onBandChange(key, parseFloat(e.target.value))}
                    className="absolute h-full w-full opacity-0 cursor-pointer"
                    style={{
                      writingMode: 'vertical-lr',
                      direction: 'rtl',
                      WebkitAppearance: 'slider-vertical',
                    }}
                  />
                  {/* Thumb Pill */}
                  <div
                    className="absolute w-3.5 h-2 rounded-sm border border-white/50 shadow-md pointer-events-none z-10"
                    style={{
                      backgroundColor: color,
                      boxShadow: `0 0 8px ${color}`,
                      bottom: `${pct}%`,
                      transform: 'translateY(50%)',
                    }}
                  />
                </div>

                <span className="text-[7px] font-mono text-neutral-400 mt-0.5">{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. REVERB & DYNAMICS COMPRESSOR SECTION ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Reverb Card */}
        <div className="bg-[#0b0517] border border-purple-500/20 rounded-2xl p-3.5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Waves className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs font-bold font-mono text-purple-200">Reverb Depth</span>
            </div>
            <span className="text-xs font-mono text-purple-300 font-bold">
              {Math.round(reverbDepth * 100)}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={reverbDepth}
            onChange={(e) => onReverbDepthChange?.(parseFloat(e.target.value))}
            className="w-full h-1.5 rounded-full cursor-pointer mb-2 accent-purple-400"
            style={{ accentColor: '#a855f7' }}
          />

          <div className="grid grid-cols-4 gap-1">
            {reverbPresets.map((p) => (
              <button
                key={p.label}
                onClick={() => onReverbDepthChange?.(p.value)}
                className={`py-1 rounded-lg text-[9px] font-mono border transition-all active:scale-95 ${
                  Math.abs(reverbDepth - p.value) < 0.05
                    ? 'bg-purple-600/30 border-purple-400 text-purple-200 font-bold'
                    : 'bg-white/4 border-white/8 text-neutral-400'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Master Compressor Card */}
        <div className="bg-[#0b0517] border border-emerald-500/20 rounded-2xl p-3.5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-bold font-mono text-emerald-200">Dynamics Limit</span>
            </div>
            <span className="text-xs font-mono text-emerald-300 font-bold">
              {compressorThreshold === -60 ? 'OFF' : `${compressorThreshold} dB`}
            </span>
          </div>

          <input
            type="range"
            min="-60"
            max="0"
            step="1"
            value={compressorThreshold}
            onChange={(e) => onCompressorThresholdChange?.(parseInt(e.target.value))}
            className="w-full h-1.5 rounded-full cursor-pointer mb-2 accent-emerald-400"
            style={{ accentColor: '#10b981' }}
          />

          <div className="grid grid-cols-4 gap-1">
            {compPresets.map((p) => (
              <button
                key={p.label}
                onClick={() => onCompressorThresholdChange?.(p.value)}
                className={`py-1 rounded-lg text-[9px] font-mono border transition-all active:scale-95 ${
                  compressorThreshold === p.value
                    ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200 font-bold'
                    : 'bg-white/4 border-white/8 text-neutral-400'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. 8D SPATIAL AUDIO 360 RADAR CARD ── */}
      <div className="bg-[#0b0517] border border-purple-500/20 rounded-2xl p-4 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold font-mono tracking-wider text-purple-200 uppercase">
              8D Spatial Audio Radar
            </h3>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-mono text-purple-300">
            <span>Angle:</span>
            <span className="font-bold">{Math.round(eightDAngle)}°</span>
          </div>
        </div>

        <div className="flex flex-row items-center gap-4 justify-between">
          {/* Radar circle */}
          <div className="relative w-28 h-28 rounded-full bg-[#070310] border border-purple-900/40 flex items-center justify-center shrink-0">
            <div className="absolute inset-2.5 rounded-full border border-dashed border-purple-500/20" />
            <div className="absolute inset-6 rounded-full border border-purple-900/40" />
            <div className="absolute w-full h-[1px] bg-purple-900/20" />
            <div className="absolute h-full w-[1px] bg-purple-900/20" />

            {/* Listener avatar */}
            <div className="relative z-10 w-8 h-8 rounded-full bg-[#180e30] border border-purple-500/50 flex items-center justify-center text-purple-300 shadow-md">
              <Headphones className="w-3.5 h-3.5 text-purple-400" />
            </div>

            {/* Orbiting orb */}
            <div
              className={`absolute w-3.5 h-3.5 rounded-full transition-transform duration-75 pointer-events-none ${
                activeEffect === '8d' && effectsEnabled
                  ? 'bg-purple-400 shadow-[0_0_12px_#c084fc]'
                  : 'bg-neutral-600'
              }`}
              style={{ transform: `translate(${orbX}px, ${orbY}px)` }}
            />
          </div>

          {/* Speed & Rotation controls */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex justify-between text-xs text-neutral-300 font-mono">
              <span className="text-[11px]">Orbit Speed</span>
              <span className="text-purple-400 font-bold">{eightDSpeed.toFixed(1)}s / rev</span>
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
              className="w-full h-1.5 accent-purple-400 cursor-pointer"
              style={{ accentColor: '#c084fc' }}
            />
            <div className="flex justify-between text-[9px] font-mono text-neutral-500">
              <span>Fast (2s)</span>
              <span>Smooth (20s)</span>
            </div>
            <button
              onClick={() => onSelectEffect('8d')}
              className={`w-full py-1.5 rounded-xl text-[10px] font-mono border transition-all active:scale-95 ${
                activeEffect === '8d' && effectsEnabled
                  ? 'bg-purple-600/30 border-purple-400 text-purple-200 font-bold shadow-[0_0_10px_rgba(192,132,252,0.4)]'
                  : 'bg-white/4 border-white/8 text-neutral-400 hover:text-white'
              }`}
            >
              {activeEffect === '8d' && effectsEnabled ? '● 8D ACTIVE' : '○ ACTIVATE 8D SPATIAL'}
            </button>
          </div>
        </div>
      </div>

      {/* ── 5. A/B LOOP STUDIO SECTION ── */}
      <div className="bg-[#0b0517] border border-orange-500/20 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Repeat className="w-4 h-4 text-orange-400" />
            <h3 className="text-xs font-bold font-mono tracking-wider text-orange-200 uppercase">
              A / B Loop Studio
            </h3>
          </div>
          <span className="text-[10px] font-mono text-neutral-400">
            Current: {fmtTime(currentTime)}
          </span>
        </div>

        <div className="flex items-center gap-2.5 mb-3">
          <button
            onClick={() => setLoopA(currentTime)}
            className="flex-1 py-2 px-3 rounded-xl border border-orange-500/30 bg-orange-950/20 text-orange-300 text-xs font-mono flex items-center justify-between hover:bg-orange-500/20 active:scale-95 transition-all"
          >
            <span>SET A</span>
            <span className="text-amber-200 font-bold">{fmtTime(loopA)}</span>
          </button>

          <button
            onClick={() => setLoopB(currentTime)}
            className="flex-1 py-2 px-3 rounded-xl border border-orange-500/30 bg-orange-950/20 text-orange-300 text-xs font-mono flex items-center justify-between hover:bg-orange-500/20 active:scale-95 transition-all"
          >
            <span>SET B</span>
            <span className="text-amber-200 font-bold">{fmtTime(loopB)}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLoopToggle}
            className={`flex-1 py-2 rounded-xl text-xs font-mono border transition-all active:scale-95 ${
              loopActive
                ? 'bg-orange-500/25 border-orange-400 text-orange-200 font-bold shadow-[0_0_12px_rgba(251,146,60,0.5)]'
                : 'bg-white/4 border-white/8 text-neutral-400 hover:text-white'
            }`}
          >
            {loopActive ? '● LOOP ACTIVE (PLAYING A ↔ B)' : '○ ACTIVATE A/B LOOP'}
          </button>

          {(loopA !== null || loopB !== null) && (
            <button
              onClick={() => {
                setLoopA(null);
                setLoopB(null);
                setLoopActive(false);
                audioEngine.setLoopActive(false);
              }}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/8 text-neutral-400 text-xs font-mono hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Zap, Music2, Wind, Activity, RotateCcw, ChevronRight } from 'lucide-react';

export const DVStudioTab = ({
  currentTrack,
  isPlaying,
  playbackRate = 1.0,
  onPlaybackRateChange,
  reverbDepth = 0,
  onReverbDepthChange,
  compressorThreshold = -24,
  onCompressorThresholdChange,
  currentTime = 0,
  duration = 0,
  onSeek,
}) => {
  const [loopA, setLoopA] = useState(null);
  const [loopB, setLoopB] = useState(null);
  const [loopActive, setLoopActive] = useState(false);

  const fmt = (sec) => {
    if (!sec && sec !== 0) return '--:--';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const semitones = Math.round(Math.log2(playbackRate) * 12);
  const estBpm = Math.round((currentTrack?.bpm || 128) * playbackRate);

  const speedPresets = [
    { label: '0.5×', value: 0.5 },
    { label: '0.75×', value: 0.75 },
    { label: '1×', value: 1.0 },
    { label: '1.25×', value: 1.25 },
    { label: '1.5×', value: 1.5 },
    { label: '2×', value: 2.0 },
  ];

  const reverbPresets = [
    { label: 'DRY', value: 0 },
    { label: 'ROOM', value: 0.25 },
    { label: 'HALL', value: 0.55 },
    { label: 'CATH', value: 0.9 },
  ];

  const compPresets = [
    { label: 'OFF', value: -60 },
    { label: 'SOFT', value: -24 },
    { label: 'MED', value: -18 },
    { label: 'HARD', value: -12 },
  ];

  const handleReset = () => {
    onPlaybackRateChange?.(1.0);
    onReverbDepthChange?.(0);
    onCompressorThresholdChange?.(-24);
    setLoopA(null);
    setLoopB(null);
    setLoopActive(false);
  };

  const Section = ({ label, accent, children }) => (
    <div className="bg-[#0d0817] border border-white/5 rounded-2xl p-4">
      <div className={`text-[10px] font-mono uppercase tracking-widest mb-3 ${accent}`}>{label}</div>
      {children}
    </div>
  );

  const PresetPill = ({ label, isActive, onClick, activeClass }) => (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-[10px] font-mono border transition-all active:scale-95 ${
        isActive
          ? `${activeClass} border-current shadow-[0_0_10px_currentColor] text-white`
          : 'border-white/10 text-neutral-500 bg-white/3 hover:border-white/20 hover:text-neutral-300'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="w-full flex flex-col gap-4 px-4 pb-6 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-400">Studio</span>
        </div>
        <span className="text-[10px] font-mono text-neutral-600 truncate max-w-[140px]">
          {currentTrack?.title || 'No track'}
        </span>
      </div>

      {/* TEMPO */}
      <Section label="⏱ Tempo / Speed" accent="text-amber-400">
        <div className="flex items-end gap-3 mb-3">
          <div className="text-5xl font-mono text-amber-300 leading-none tabular-nums">
            {playbackRate.toFixed(2)}<span className="text-2xl text-amber-400/60">×</span>
          </div>
          <div className="pb-1">
            <div className="text-lg font-mono text-amber-400/70 tabular-nums">{estBpm}</div>
            <div className="text-[10px] font-mono text-neutral-500">BPM</div>
          </div>
        </div>
        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.01"
          value={playbackRate}
          onChange={(e) => onPlaybackRateChange?.(parseFloat(e.target.value))}
          className="w-full h-1.5 rounded-full mb-3 accent-amber-400 cursor-pointer"
          style={{ accentColor: '#f59e0b' }}
        />
        <div className="flex gap-1.5 flex-wrap">
          {speedPresets.map((p) => (
            <PresetPill
              key={p.value}
              label={p.label}
              isActive={Math.abs(playbackRate - p.value) < 0.01}
              onClick={() => onPlaybackRateChange?.(p.value)}
              activeClass="bg-amber-500/20 text-amber-300"
            />
          ))}
        </div>
      </Section>

      {/* PITCH */}
      <Section label="🎵 Pitch Shift" accent="text-cyan-400">
        <div className="flex items-end gap-3 mb-3">
          <div className="text-4xl font-mono text-cyan-300 leading-none tabular-nums">
            {semitones > 0 ? '+' : ''}{semitones}
            <span className="text-xl text-cyan-400/60"> ST</span>
          </div>
          <div className="pb-1 text-[10px] font-mono text-neutral-500">semitones</div>
        </div>
        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.01"
          value={playbackRate}
          onChange={(e) => onPlaybackRateChange?.(parseFloat(e.target.value))}
          className="w-full h-1.5 rounded-full mb-2 cursor-pointer"
          style={{ accentColor: '#22d3ee' }}
        />
        <p className="text-[9px] text-neutral-600 italic">
          Rate-coupled mode — independent pitch shift requires AudioWorklet
        </p>
      </Section>

      {/* REVERB */}
      <Section label="🌊 Reverb Depth" accent="text-purple-400">
        <div className="text-3xl font-mono text-purple-300 mb-3 tabular-nums">
          {Math.round(reverbDepth * 100)}<span className="text-lg text-purple-400/60">%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={reverbDepth}
          onChange={(e) => onReverbDepthChange?.(parseFloat(e.target.value))}
          className="w-full h-1.5 rounded-full mb-3 cursor-pointer"
          style={{ accentColor: '#a855f7' }}
        />
        <div className="flex gap-1.5">
          {reverbPresets.map((p) => (
            <PresetPill
              key={p.label}
              label={p.label}
              isActive={Math.abs(reverbDepth - p.value) < 0.03}
              onClick={() => onReverbDepthChange?.(p.value)}
              activeClass="bg-purple-500/20 text-purple-300"
            />
          ))}
        </div>
      </Section>

      {/* COMPRESSOR */}
      <Section label="⚡ Compressor" accent="text-emerald-400">
        <div className="text-2xl font-mono text-emerald-300 mb-3 tabular-nums">
          {compressorThreshold === -60 ? 'OFF' : `${compressorThreshold} dB`}
        </div>
        <input
          type="range"
          min="-60"
          max="0"
          step="1"
          value={compressorThreshold}
          onChange={(e) => onCompressorThresholdChange?.(parseInt(e.target.value))}
          className="w-full h-1.5 rounded-full mb-3 cursor-pointer"
          style={{ accentColor: '#10b981' }}
        />
        <div className="flex gap-1.5">
          {compPresets.map((p) => (
            <PresetPill
              key={p.label}
              label={p.label}
              isActive={compressorThreshold === p.value}
              onClick={() => onCompressorThresholdChange?.(p.value)}
              activeClass="bg-emerald-500/20 text-emerald-300"
            />
          ))}
        </div>
      </Section>

      {/* LOOP */}
      <Section label="🔄 Loop A/B" accent="text-orange-400">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => setLoopA(currentTime)}
            className="flex-1 py-2 rounded-xl border border-orange-500/30 text-orange-400 text-xs font-mono hover:bg-orange-500/10 active:scale-95 transition-all"
          >
            SET A <span className="text-[10px] text-orange-300/70 ml-1">{fmt(loopA)}</span>
          </button>
          <button
            onClick={() => setLoopB(currentTime)}
            className="flex-1 py-2 rounded-xl border border-orange-500/30 text-orange-400 text-xs font-mono hover:bg-orange-500/10 active:scale-95 transition-all"
          >
            SET B <span className="text-[10px] text-orange-300/70 ml-1">{fmt(loopB)}</span>
          </button>
        </div>
        <button
          onClick={() => setLoopActive(!loopActive)}
          className={`w-full py-2 rounded-xl text-xs font-mono border transition-all active:scale-95 ${
            loopActive
              ? 'bg-orange-500/20 border-orange-400 text-orange-300 shadow-[0_0_12px_rgba(251,146,60,0.4)]'
              : 'border-white/10 text-neutral-500'
          }`}
        >
          {loopActive ? '● LOOP ACTIVE' : '○ LOOP OFF'}
        </button>
      </Section>

      {/* RESET */}
      <button
        onClick={handleReset}
        className="w-full py-3 rounded-2xl border border-white/8 text-neutral-500 text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2 hover:border-white/20 hover:text-neutral-400 active:scale-98 transition-all"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Reset All
      </button>
    </div>
  );
};

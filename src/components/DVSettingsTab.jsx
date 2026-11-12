import React, { useState } from 'react';
import {
  Timer, RotateCw, Trash2, Info,
  Music2, Zap, Shield, Cpu,
  ChevronRight, Check, Moon, Sun,
  Volume2, Vibrate, Gauge,
} from 'lucide-react';
import { audioEngine } from '../audio/audioEngine';

export const DVSettingsTab = ({
  sleepTimerMinutes,
  onSetSleepTimer,
  eightDSpeed,
  onEightDSpeedChange,
  onTriggerScan,
}) => {
  const [cacheCleared, setCacheCleared] = useState(false);
  const [hapticsOn, setHapticsOn] = useState(true);
  const [crossfadeOn, setCrossfadeOn] = useState(false);
  const [normalizationOn, setNormalizationOn] = useState(true);
  const detectedRate = `${((audioEngine.getSampleRate?.() || 48000) / 1000).toFixed(1)} kHz`;

  const handleClearCache = () => {
    try {
      localStorage.removeItem('dv_playlists');
      setCacheCleared(true);
      setTimeout(() => setCacheCleared(false), 2000);
    } catch {}
  };

  const ToggleRow = ({ icon: Icon, label, sublabel, value, onToggle, accent = 'purple' }) => {
    const colors = {
      purple: 'bg-purple-600 shadow-[0_0_10px_rgba(168,85,247,0.5)]',
      cyan: 'bg-cyan-600 shadow-[0_0_10px_rgba(34,211,238,0.5)]',
      emerald: 'bg-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.5)]',
      amber: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]',
    };
    return (
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-white/5`}>
            <Icon className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-white">{label}</div>
            {sublabel && <div className="text-[10px] text-neutral-500 leading-tight">{sublabel}</div>}
          </div>
        </div>
        <button
          onClick={onToggle}
          className={`relative w-11 h-6 rounded-full transition-all shrink-0 ${value ? colors[accent] : 'bg-white/10'}`}
        >
          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>
    );
  };

  const SectionCard = ({ title, icon: Icon, children }) => (
    <div className="bg-white/3 border border-white/6 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 pt-3 pb-2">
        <Icon className="w-3.5 h-3.5 text-neutral-500" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">{title}</span>
      </div>
      <div className="px-4 pb-2 divide-y divide-white/5">{children}</div>
    </div>
  );

  return (
    <div className="w-full flex flex-col gap-4 px-4 pb-6 pt-2 select-none max-w-2xl mx-auto tab-enter">
      {/* Header */}
      <div className="flex items-center gap-2 py-1">
        <Zap className="w-4 h-4 text-purple-400" />
        <h2 className="text-base font-bold text-white tracking-tight">Settings</h2>
      </div>

      {/* PLAYBACK */}
      <SectionCard title="Playback" icon={Music2}>
        <ToggleRow
          icon={Volume2}
          label="Volume Normalization"
          sublabel="Auto-level loudness across tracks"
          value={normalizationOn}
          onToggle={() => setNormalizationOn(!normalizationOn)}
          accent="purple"
        />
        <ToggleRow
          icon={Gauge}
          label="Crossfade"
          sublabel="Smooth blend between tracks (2s)"
          value={crossfadeOn}
          onToggle={() => setCrossfadeOn(!crossfadeOn)}
          accent="cyan"
        />
        <ToggleRow
          icon={Vibrate}
          label="Haptic Feedback"
          sublabel="Vibrate on controls"
          value={hapticsOn}
          onToggle={() => setHapticsOn(!hapticsOn)}
          accent="emerald"
        />
      </SectionCard>

      {/* SLEEP TIMER */}
      <SectionCard title="Sleep Timer" icon={Timer}>
        <div className="py-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-white">Auto-stop playback</span>
            <span className={`font-mono text-xs font-bold ${sleepTimerMinutes ? 'text-amber-400' : 'text-neutral-500'}`}>
              {sleepTimerMinutes ? `${sleepTimerMinutes} MIN` : 'OFF'}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[null, 15, 30, 45, 60].map((m) => (
              <button
                key={m ?? 'off'}
                onClick={() => onSetSleepTimer(m)}
                className={`py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                  sleepTimerMinutes === m
                    ? 'bg-amber-500/20 border border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                    : 'bg-white/5 border border-white/8 text-neutral-400 hover:text-white hover:border-white/20'
                }`}
              >
                {m == null ? 'Off' : `${m}m`}
              </button>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* 8D SPEED */}
      <SectionCard title="8D Spatial Audio" icon={RotateCw}>
        <div className="py-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-white">Rotation Speed</span>
            <span className="font-mono text-xs text-purple-400 font-bold">{eightDSpeed}s / rev</span>
          </div>
          <input
            type="range" min="2" max="30" step="1" value={eightDSpeed}
            onChange={(e) => onEightDSpeedChange(parseInt(e.target.value))}
            className="w-full"
            style={{ accentColor: '#a855f7' }}
          />
          <div className="flex justify-between text-[9px] font-mono text-neutral-600 mt-1">
            <span>FAST (2s)</span><span>SLOW (30s)</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 mt-3">
            {[4, 8, 12, 20].map((s) => (
              <button
                key={s}
                onClick={() => onEightDSpeedChange(s)}
                className={`py-1.5 rounded-xl text-[10px] font-mono transition-all active:scale-95 ${
                  eightDSpeed === s
                    ? 'bg-purple-500/20 border border-purple-400 text-purple-300'
                    : 'bg-white/5 border border-white/8 text-neutral-400 hover:text-white'
                }`}
              >
                {s}s
              </button>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* LIBRARY */}
      <SectionCard title="Library" icon={Music2}>
        <div className="py-3 flex flex-col gap-2">
          <button
            onClick={onTriggerScan}
            className="flex items-center justify-between w-full py-2.5 px-3 rounded-xl bg-purple-600/15 border border-purple-500/30 text-purple-300 hover:bg-purple-600/25 active:scale-98 transition-all"
          >
            <div className="flex items-center gap-2">
              <Music2 className="w-4 h-4" />
              <span className="text-sm font-medium">Import Audio Files</span>
            </div>
            <ChevronRight className="w-4 h-4 text-purple-400/70" />
          </button>
          <button
            onClick={handleClearCache}
            className={`flex items-center justify-between w-full py-2.5 px-3 rounded-xl border transition-all active:scale-98 ${
              cacheCleared
                ? 'bg-emerald-600/15 border-emerald-500/30 text-emerald-300'
                : 'bg-white/3 border-white/8 text-neutral-400 hover:text-white hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-2">
              {cacheCleared ? <Check className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
              <span className="text-sm font-medium">{cacheCleared ? 'Playlists Cleared!' : 'Clear Playlist Data'}</span>
            </div>
          </button>
        </div>
      </SectionCard>

      {/* ENGINE INFO */}
      <SectionCard title="Audio Engine" icon={Cpu}>
        <div className="py-3">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Sample Rate', value: detectedRate },
              { label: 'Bit Depth', value: '32-bit Float' },
              { label: 'EQ Bands', value: '10-Band' },
              { label: 'DSP Pipeline', value: '8-Node' },
              { label: 'Spatial Audio', value: 'HRTF 8D' },
              { label: 'Codec Support', value: 'MP3/FLAC/AAC' },
            ].map((item) => (
              <div key={item.label} className="bg-white/3 rounded-xl p-2.5">
                <div className="text-[9px] font-mono text-neutral-600 uppercase tracking-wider">{item.label}</div>
                <div className="text-xs font-semibold text-white mt-0.5">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Footer */}
      <div className="text-center py-4">
        <div className="text-[10px] font-mono text-neutral-700">DV Music · v3.5.0 · 100% Offline</div>
        <div className="text-[9px] text-neutral-800 mt-0.5">Built with Web Audio API · Zero cloud dependency</div>
      </div>
    </div>
  );
};

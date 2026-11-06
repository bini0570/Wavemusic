import React, { useState, useEffect } from 'react';
import { Radio, Zap, ArrowRight, Sparkles, Smartphone, Play } from 'lucide-react';

interface MobileLaunchScreenProps {
  onStart: (username: string, mode: 'tiktok' | 'offline') => void;
  isLoading?: boolean;
}

export const MobileLaunchScreen: React.FC<MobileLaunchScreenProps> = ({
  onStart,
  isLoading = false,
}) => {
  const [username, setUsername] = useState('');

  // Auto-fill from localStorage if previously used
  useEffect(() => {
    try {
      const saved = localStorage.getItem('wave_tiktok_username');
      if (saved) {
        setUsername(saved.replace(/^@/, ''));
      }
    } catch {}
  }, []);

  const handleStartTikTok = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = username.trim().replace(/^@/, '') || 'live_host';
    try {
      localStorage.setItem('wave_tiktok_username', clean);
    } catch {}
    onStart(clean, 'tiktok');
  };

  const handleStartOffline = () => {
    const clean = username.trim().replace(/^@/, '') || 'dj_host';
    onStart(clean, 'offline');
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen w-full bg-[#0c0a1a] text-white p-5 sm:p-8 select-none relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-pink-600/20 blur-3xl pointer-events-none" />

      {/* Top Brand */}
      <div className="w-full flex items-center justify-between z-10 pt-2">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-10 w-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 shadow-lg shadow-purple-950/60">
            <Radio className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-wider bg-gradient-to-r from-purple-200 via-pink-200 to-amber-200 bg-clip-text text-transparent">
            WAVE
          </span>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
          <Smartphone className="h-3.5 w-3.5" />
          Mobile Live DJ
        </span>
      </div>

      {/* Center Welcome Card */}
      <div className="w-full max-w-sm flex flex-col items-center text-center z-10 my-auto py-4">
        <div className="h-16 w-16 rounded-3xl bg-gradient-to-tr from-purple-600/30 to-pink-600/30 border border-purple-500/30 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(168,85,247,0.25)]">
          <Zap className="h-8 w-8 text-amber-400" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight mb-2">
          TikTok LIVE Music DJ
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xs mb-6">
          Every track plays for <span className="text-amber-400 font-bold">60 seconds</span>. Viewers
          vote in chat for the next song with real-time synchronized karaoke lyrics!
        </p>

        {/* Input Form */}
        <form onSubmit={handleStartTikTok} className="w-full space-y-3">
          <div className="relative text-left">
            <label className="text-[11px] font-bold text-purple-300 uppercase tracking-wider block mb-1.5">
              TikTok Username (For Live Chat Votes):
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base font-black">
                @
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_tiktok_username"
                autoCapitalize="none"
                autoCorrect="off"
                className="w-full rounded-2xl bg-[#171330] border-2 border-purple-500/30 pl-9 pr-4 py-3 text-sm font-bold text-white placeholder-slate-500 outline-none focus:border-amber-400 focus:shadow-[0_0_20px_rgba(251,191,36,0.25)] transition"
              />
            </div>
          </div>

          {/* Primary Action Button: Connect TikTok & Start */}
          <button
            type="submit"
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-purple-950/50 flex items-center justify-center gap-2 transition transform active:scale-95"
          >
            <span>{isLoading ? 'Launching Stage...' : 'Start Live Broadcast'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          {/* Secondary Action Button: Offline DJ Stage */}
          <button
            type="button"
            onClick={handleStartOffline}
            className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <Play className="h-3.5 w-3.5 text-amber-400" />
            <span>Enter DJ Stage (Offline / Practice Mode)</span>
          </button>
        </form>

        {/* How it Works Quick Steps */}
        <div className="mt-6 p-3 rounded-2xl bg-white/[0.03] border border-white/5 w-full text-left space-y-1.5 text-xs text-slate-300">
          <p className="font-bold text-purple-300 text-[11px] uppercase tracking-wider">
            Quick Setup:
          </p>
          <p>1. Start <strong className="text-amber-400">Screen Share</strong> in TikTok app.</p>
          <p>2. Tap <strong className="text-white">Start Live Broadcast</strong> above.</p>
          <p>3. Starts clean: 1st song plays when chat votes!</p>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="z-10 pb-1 text-center">
        <span className="text-xs text-slate-500 font-medium flex items-center justify-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          60s Continuous Music · Synced Lyrics · Real-Time Chat Votes
        </span>
      </div>
    </div>
  );
};

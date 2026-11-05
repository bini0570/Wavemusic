import React, { useState, useEffect } from 'react';
import { Radio, Zap, ArrowRight, ShieldCheck, Sparkles, Smartphone } from 'lucide-react';

interface MobileLaunchScreenProps {
  onStart: (username: string) => void;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export const MobileLaunchScreen: React.FC<MobileLaunchScreenProps> = ({
  onStart,
  isLoading = false,
  errorMessage = null,
}) => {
  const [username, setUsername] = useState('');

  // Auto-fill from localStorage if previously used
  useEffect(() => {
    const saved = localStorage.getItem('wave_tiktok_username');
    if (saved) {
      setUsername(saved.replace(/^@/, ''));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = username.trim().replace(/^@/, '');
    if (!clean) return;

    localStorage.setItem('wave_tiktok_username', clean);
    onStart(clean);
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen w-full bg-[#0c0a1a] text-white p-6 sm:p-8 select-none relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-pink-600/20 blur-3xl pointer-events-none" />

      {/* Top Brand */}
      <div className="w-full flex items-center justify-between z-10 pt-4">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-10 w-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 shadow-lg shadow-purple-950/60">
            <Radio className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-wider bg-gradient-to-r from-purple-200 via-pink-200 to-amber-200 bg-clip-text text-transparent">
            WAVE
          </span>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
          <Smartphone className="h-3 w-3" />
          Mobile Live
        </span>
      </div>

      {/* Center Welcome Card */}
      <div className="w-full max-w-sm flex flex-col items-center text-center z-10 my-auto py-6">
        <div className="h-16 w-16 rounded-3xl bg-gradient-to-tr from-purple-600/30 to-pink-600/30 border border-purple-500/30 flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(168,85,247,0.25)]">
          <Zap className="h-8 w-8 text-amber-400" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight mb-2">
          TikTok LIVE Music DJ
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xs mb-8">
          Go live on TikTok with <span className="text-purple-300 font-bold">Screen Share</span>,
          enter your username below, and let your viewers vote on every 60-second track!
        </p>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
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
              className="w-full rounded-2xl bg-[#171330] border-2 border-purple-500/30 pl-9 pr-4 py-3.5 text-base font-bold text-white placeholder-slate-500 outline-none focus:border-purple-400 focus:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition"
              required
            />
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !username.trim()}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 disabled:opacity-50 text-white font-black text-sm tracking-wider uppercase shadow-xl shadow-purple-950/50 flex items-center justify-center gap-2 transition transform active:scale-95"
          >
            <span>{isLoading ? 'Connecting to TikTok...' : 'Start Live Broadcast'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* How it Works Quick Steps */}
        <div className="mt-8 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 w-full text-left space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 block">
            How to broadcast on mobile:
          </span>
          <div className="space-y-1.5 text-[11px] text-slate-300 font-medium">
            <p>1. Open TikTok app → tap <span className="text-white font-bold">+</span> → Select <span className="text-amber-400 font-bold">Screen Share</span>.</p>
            <p>2. Start live on TikTok, then switch to this app.</p>
            <p>3. Enter your username above and tap <span className="text-purple-300 font-bold">Start Live Broadcast</span>!</p>
          </div>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="z-10 pb-2 text-center">
        <span className="text-[11px] text-slate-500 font-medium flex items-center justify-center gap-1.5">
          <Sparkles className="h-3 w-3 text-amber-400" />
          60s Continuous Music · Synced Lyrics · Real-Time Chat Votes
        </span>
      </div>
    </div>
  );
};

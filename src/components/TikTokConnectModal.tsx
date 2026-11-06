import React, { useState, useEffect } from 'react';
import { X, Radio, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface TikTokConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
  channelName: string;
  isConnecting: boolean;
  onConnect: (username: string) => void;
  onDisconnect: () => void;
}

export const TikTokConnectModal: React.FC<TikTokConnectModalProps> = ({
  isOpen,
  onClose,
  isConnected,
  channelName,
  isConnecting,
  onConnect,
  onDisconnect,
}) => {
  const [username, setUsername] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('wave_tiktok_username');
      if (saved) {
        setUsername(saved.replace(/^@/, ''));
      } else if (channelName && channelName !== '@your_live') {
        setUsername(channelName.replace(/^@/, ''));
      }
    } catch {}
  }, [channelName, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = username.trim().replace(/^@/, '');
    if (!clean) return;
    try {
      localStorage.setItem('wave_tiktok_username', clean);
    } catch {}
    onConnect(clean);
    onClose();
  };

  const handleDisconnect = () => {
    onDisconnect();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-[#130f2c] border-2 border-purple-500/30 rounded-3xl p-6 text-white shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 shadow-lg shadow-purple-950/60">
            <Radio className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Connect TikTok LIVE</h2>
            <p className="text-xs text-slate-400 font-medium">Read live chat song requests & votes</p>
          </div>
        </div>

        {/* Current Status Pill */}
        <div className="mb-4 p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300">Connection Status:</span>
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
              isConnected
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            {isConnected ? `${channelName} (LIVE)` : 'Offline'}
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-left space-y-1.5">
            <label className="text-[11px] font-bold text-purple-300 uppercase tracking-wider block">
              TikTok Username:
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-black">
                @
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_tiktok_username"
                autoCapitalize="none"
                autoCorrect="off"
                className="w-full rounded-2xl bg-black/40 border-2 border-purple-500/30 pl-9 pr-4 py-3 text-sm font-bold text-white placeholder-slate-500 outline-none focus:border-amber-400 focus:shadow-[0_0_15px_rgba(251,191,36,0.25)] transition"
              />
            </div>
          </div>

          {/* Quick Notice */}
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-slate-300 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
            <span>Account must be actively streaming LIVE on TikTok to sync chat.</span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              type="submit"
              disabled={isConnecting}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-purple-950/50 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
            >
              <span>{isConnecting ? 'Connecting...' : isConnected ? 'Reconnect Channel' : 'Connect LIVE'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            {isConnected && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="w-full py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 font-bold text-xs transition"
              >
                Disconnect Stream
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

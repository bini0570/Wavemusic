import React from 'react';
import { Music2, Radio, Sliders, Volume2, Sparkles } from 'lucide-react';

interface HeaderProps {
  isConnected: boolean;
  channelName: string;
  isConnecting?: boolean;
  onOpenConnectModal: () => void;
  onOpenDrawer?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isConnected,
  channelName,
  isConnecting = false,
  onOpenConnectModal,
  onOpenDrawer,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-purple-900/30 bg-[#0e0b1f]/95 backdrop-blur-md px-3 sm:px-6 py-2.5 shrink-0 shadow-lg">
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Left: Webapp Banner & Branding */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 shadow-md shadow-purple-950/60 shrink-0">
            <Music2 className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black tracking-wider bg-gradient-to-r from-purple-200 via-pink-200 to-amber-200 bg-clip-text text-transparent">
                WAVE
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Live Music Voting
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold truncate hidden sm:block">
              Music discovery · 60s chat community voting
            </p>
          </div>
        </div>

        {/* Right: TikTok Online/Offline Status & Connect Button */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Status Badge */}
          <div
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full border text-[11px] sm:text-xs font-bold transition ${
              isConnected
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.25)]'
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full shrink-0 ${
                isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span className="truncate max-w-[90px] sm:max-w-none">
              <span className="sm:hidden">{isConnected ? 'LIVE' : 'Offline'}</span>
              <span className="hidden sm:inline">{isConnected ? `${channelName} LIVE` : 'Offline Mode'}</span>
            </span>
          </div>

          {/* Connect Button */}
          <button
            onClick={onOpenConnectModal}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl font-bold text-[11px] sm:text-xs uppercase tracking-wider transition active:scale-95 shadow-md ${
              isConnected
                ? 'bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10'
                : 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white shadow-purple-950/50'
            }`}
          >
            <Radio className={`h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 ${isConnecting ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">
              {isConnecting ? 'Connecting...' : isConnected ? 'Change Channel' : 'Connect TikTok'}
            </span>
            <span className="sm:hidden">
              {isConnecting ? '...' : isConnected ? 'Change' : 'Connect'}
            </span>
          </button>

          {/* DJ Studio Controls Drawer Toggle */}
          {onOpenDrawer && (
            <button
              onClick={onOpenDrawer}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition"
              title="DJ Studio Host Controls"
            >
              <Sliders className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

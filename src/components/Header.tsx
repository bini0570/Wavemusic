import React from 'react';
import { Radio, Sliders, Zap } from 'lucide-react';

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
    <header className="sticky top-0 z-30 shrink-0" style={{ background: 'rgba(11,8,22,0.97)', borderBottom: '1px solid rgba(139,92,246,0.25)', backdropFilter: 'blur(20px)', boxShadow: '0 0 40px rgba(139,92,246,0.15)' }}>
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto px-3 sm:px-6 py-2.5">

        {/* Left: WAVE Branding */}
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Neon icon */}
          <div
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl shrink-0"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
              boxShadow: '0 0 18px rgba(139,92,246,0.7), 0 0 36px rgba(6,182,212,0.3)',
            }}
          >
            <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-white fill-white" />
          </div>

          <div className="min-w-0">
            <h1
              className="text-xl sm:text-2xl font-black tracking-widest uppercase"
              style={{
                background: 'linear-gradient(90deg, #c4b5fd, #67e8f9, #c4b5fd)',
                backgroundSize: '200%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 8px rgba(139,92,246,0.8))',
              }}
            >
              WAVE
            </h1>
          </div>
        </div>

        {/* Right: Status + Connect Button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

          {/* Live / Offline Status Pill */}
          <div
            className={`flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all`}
            style={
              isConnected
                ? {
                    background: 'rgba(6,182,212,0.12)',
                    border: '1px solid rgba(6,182,212,0.4)',
                    color: '#67e8f9',
                    boxShadow: '0 0 12px rgba(6,182,212,0.3)',
                  }
                : {
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#64748b',
                  }
            }
          >
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={
                isConnected
                  ? { background: '#06b6d4', boxShadow: '0 0 8px #06b6d4', animation: 'neon-pulse 1.5s ease-in-out infinite' }
                  : { background: '#475569' }
              }
            />
            <span className="sm:hidden">{isConnected ? 'LIVE' : 'Offline'}</span>
            <span className="hidden sm:inline">
              {isConnected ? `${channelName} LIVE` : 'Offline Mode'}
            </span>
          </div>

          {/* Connect TikTok Button */}
          <button
            onClick={onOpenConnectModal}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl font-bold text-[11px] sm:text-xs uppercase tracking-wider transition active:scale-95"
            style={
              isConnected
                ? {
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#cbd5e1',
                  }
                : {
                    background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                    border: 'none',
                    color: '#fff',
                    boxShadow: '0 0 20px rgba(139,92,246,0.5)',
                  }
            }
          >
            <Radio
              className={`h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 ${isConnecting ? 'animate-spin' : ''}`}
            />
            <span className="hidden sm:inline">
              {isConnecting ? 'Connecting...' : isConnected ? 'Change Channel' : 'Connect TikTok'}
            </span>
            <span className="sm:hidden">
              {isConnecting ? '...' : isConnected ? 'Change' : 'Connect'}
            </span>
          </button>

          {/* DJ Controls Drawer Button */}
          {onOpenDrawer && (
            <button
              onClick={onOpenDrawer}
              className="p-2 rounded-xl transition hover:scale-105 active:scale-95"
              style={{
                background: 'rgba(139,92,246,0.1)',
                border: '1px solid rgba(139,92,246,0.25)',
                color: '#c4b5fd',
              }}
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

import React, { useState } from 'react';
import {
  Radio,
  Clock,
  MessageSquare,
  Play,
  Pause,
  FastForward,
  RotateCcw,
  ShieldCheck,
  Send,
  Zap,
} from 'lucide-react';
import { VotingRoundState } from '../types';

interface LiveControlPanelProps {
  state: VotingRoundState;
  onToggleConnection: () => void;
  onToggleVoting: () => void;
  onSetTrafficRate: (rate: 'slow' | 'medium' | 'fast' | 'paused') => void;
  onSkipRound: () => void;
  onResetRoundTimer: () => void;
  onInjectComment: (text: string, username?: string) => void;
  onOpenLicensingInfo: () => void;
  onUpdateChannelName: (name: string) => void;
}

export const LiveControlPanel: React.FC<LiveControlPanelProps> = ({
  state,
  onToggleConnection,
  onToggleVoting,
  onSetTrafficRate,
  onSkipRound,
  onResetRoundTimer,
  onInjectComment,
  onOpenLicensingInfo,
  onUpdateChannelName,
}) => {
  const [customComment, setCustomComment] = useState('');
  const [customUser, setCustomUser] = useState('host_live');
  const [isEditingChannel, setIsEditingChannel] = useState(false);
  const [tempChannel, setTempChannel] = useState(state.channelName);

  const percentLeft = Math.round((state.timeRemainingSeconds / state.durationSeconds) * 100);

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customComment.trim()) return;
    onInjectComment(customComment.trim(), customUser.trim() || 'viewer');
    setCustomComment('');
  };

  const handleSaveChannel = () => {
    setIsEditingChannel(false);
    if (tempChannel.trim()) {
      onUpdateChannelName(tempChannel.trim());
    }
  };

  return (
    <header className="border-b border-white/10 bg-[#12121e]/90 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        {/* Top Title & Broadcast Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 shadow-lg shadow-purple-900/30">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                  WAVE
                </h1>
                <span className="text-xs font-semibold text-purple-300">
                  TikTok LIVE Interactive Music System
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span>Viewers decide next track</span>
                <span aria-hidden="true">·</span>
                <span>Auto-plays #1 winner every 60s</span>
              </div>
            </div>
          </div>

          {/* Quick License & Broadcaster Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenLicensingInfo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 hover:text-white transition"
              title="Livestream audio rights & stream-safe playback guidelines"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="hidden sm:inline">Livestream Rights</span>
              <span className="sm:hidden">Rights</span>
            </button>

            <button
              onClick={onToggleConnection}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                state.isConnected
                  ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                  : 'bg-rose-500/15 border border-rose-500/40 text-rose-300 hover:bg-rose-500/25'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  state.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                }`}
              />
              <span>{state.isConnected ? 'Connected (Live)' : 'Disconnected'}</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Summary Counters (Requested Layout: Connected | 60s Round | Comments Received) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
          {/* Card 1: Channel Connection & Live Status */}
          <div className="rounded-xl border border-white/10 bg-[#161626]/80 p-3 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-lg bg-pink-500/15 border border-pink-500/30 flex items-center justify-center shrink-0">
                <Radio className="h-4 w-4 text-pink-400 animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  TikTok LIVE Channel
                </p>
                {isEditingChannel ? (
                  <div className="flex items-center gap-1 mt-0.5">
                    <input
                      type="text"
                      value={tempChannel}
                      onChange={(e) => setTempChannel(e.target.value)}
                      className="bg-black/40 border border-purple-500/50 rounded px-1.5 py-0.5 text-xs text-white w-28"
                      placeholder="@username"
                    />
                    <button
                      onClick={handleSaveChannel}
                      className="text-[10px] bg-purple-600 px-2 py-0.5 rounded text-white"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingChannel(true)}
                    className="text-sm font-bold text-white hover:text-purple-300 truncate text-left block"
                    title="Click to change live channel name"
                  >
                    {state.channelName}
                  </button>
                )}
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                Round #{state.roundNumber}
              </span>
            </div>
          </div>

          {/* Card 2: 60s Round Countdown Timer */}
          <div className="rounded-xl border border-white/10 bg-[#161626]/80 p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-400" />
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Round Duration
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-base font-extrabold text-white">
                <span
                  className={
                    state.timeRemainingSeconds <= 10
                      ? 'text-pink-400 animate-pulse'
                      : 'text-purple-300'
                  }
                >
                  {state.timeRemainingSeconds}s
                </span>
                <span className="text-slate-500 text-xs font-normal">/ 60s</span>
              </div>
            </div>

            {/* Hairline countdown progress bar */}
            <div className="mt-2.5 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  state.timeRemainingSeconds <= 10
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}
                style={{ width: `${percentLeft}%` }}
              />
            </div>
          </div>

          {/* Card 3: Comments Received (Round & All-Time) */}
          <div className="rounded-xl border border-white/10 bg-[#161626]/80 p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0">
                <MessageSquare className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Comments Received
                </p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base font-extrabold text-white font-mono tabular-nums">
                    {state.totalCommentsThisRound}
                  </span>
                  <span className="text-xs text-slate-400">
                    this round ({state.totalCommentsAllTime} total)
                  </span>
                </div>
              </div>
            </div>

            {/* Broadcaster Quick Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={onToggleVoting}
                className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                title={state.isVotingActive ? 'Pause Voting' : 'Resume Voting'}
              >
                {state.isVotingActive ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={onSkipRound}
                className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                title="Skip round & play winner now"
              >
                <FastForward className="h-4 w-4" />
              </button>
              <button
                onClick={onResetRoundTimer}
                className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                title="Reset 60s timer"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Live Traffic Simulator Selector & Direct Test Comment Bar */}
        <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Viewer Traffic:</span>
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-black/40 border border-white/10 text-xs">
              {(['slow', 'medium', 'fast', 'paused'] as const).map((rate) => (
                <button
                  key={rate}
                  onClick={() => onSetTrafficRate(rate)}
                  className={`px-2.5 py-1 rounded-md capitalize transition font-medium ${
                    state.trafficRate === rate
                      ? 'bg-purple-600 text-white font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {rate}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Comment Injector for Broadcaster testing */}
          <form
            onSubmit={handleSendComment}
            className="flex items-center gap-2 flex-1 max-w-md ml-auto"
          >
            <input
              type="text"
              value={customUser}
              onChange={(e) => setCustomUser(e.target.value)}
              placeholder="Username"
              className="w-24 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <input
              type="text"
              value={customComment}
              onChange={(e) => setCustomComment(e.target.value)}
              placeholder="Test a request (e.g. 'play Teddy Afro Gonder')"
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={!customComment.trim()}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0"
            >
              <Send className="h-3 w-3" />
              <span>Vote</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
};

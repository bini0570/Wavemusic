import React, { useState } from 'react';
import {
  X,
  Radio,
  Sliders,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Volume2,
  VolumeX,
  Send,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { TikTokComment, VotingRoundState } from '../types';

interface DJDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  votingState: VotingRoundState;
  recentComments: TikTokComment[];
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  onTogglePlay: () => void;
  onSkipRound: () => void;
  onResetTimer: () => void;
  onChangeVolume: (vol: number) => void;
  onToggleMute: () => void;
  onConnectTikTok: (username: string) => void;
  onDisconnectTikTok: () => void;
  onInjectComment: (text: string, user?: string) => void;
}

export const DJDrawer: React.FC<DJDrawerProps> = ({
  isOpen,
  onClose,
  votingState,
  recentComments,
  isPlaying,
  volume,
  isMuted,
  onTogglePlay,
  onSkipRound,
  onResetTimer,
  onChangeVolume,
  onToggleMute,
  onConnectTikTok,
  onDisconnectTikTok,
  onInjectComment,
}) => {
  const [usernameInput, setUsernameInput] = useState(
    votingState.channelName.replace(/^@/, '') || ''
  );
  const [manualComment, setManualComment] = useState('');
  const [manualUser, setManualUser] = useState('DJ_Host');

  if (!isOpen) return null;

  const handleConnectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    onConnectTikTok(usernameInput.trim());
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualComment.trim()) return;
    onInjectComment(manualComment.trim(), manualUser.trim() || 'DJ_Host');
    setManualComment('');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Dimmed Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-Over Panel */}
      <div className="relative w-full max-w-md bg-[#130f2c] border-l border-purple-500/20 text-white shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <Sliders className="h-5 w-5 text-purple-400" />
            <h2 className="text-base font-black tracking-wide">DJ Host Studio</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* ========================================================= */}
          {/* 1. TIKTOK LIVE CONNECTION                                 */}
          {/* ========================================================= */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-purple-300">
                TikTok LIVE Stream
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                  votingState.isConnected
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    votingState.isConnected ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                {votingState.isConnected ? 'Connected' : 'Offline'}
              </span>
            </div>

            <form onSubmit={handleConnectSubmit} className="space-y-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">
                  @
                </span>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="your_tiktok_username"
                  className="w-full rounded-xl bg-black/40 border border-purple-500/30 pl-8 pr-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-purple-400"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white transition shadow-lg shadow-purple-900/30"
                >
                  Connect LIVE
                </button>
                {votingState.isConnected && (
                  <button
                    type="button"
                    onClick={onDisconnectTikTok}
                    className="py-2 px-3 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/30 font-bold text-xs text-rose-300 transition"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* ========================================================= */}
          {/* 2. PLAYBACK & ROUND CONTROLS                              */}
          {/* ========================================================= */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-purple-300">
              Playback & Round Actions
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onTogglePlay}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold text-xs text-white transition"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <button
                onClick={onSkipRound}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 font-bold text-xs text-amber-300 transition"
              >
                <SkipForward className="h-4 w-4" />
                <span>Next Winner</span>
              </button>

              <button
                onClick={onResetTimer}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold text-xs text-slate-300 transition col-span-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset 60s Timer</span>
              </button>
            </div>

            {/* Volume Control */}
            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="h-3.5 w-3.5" />
                  Master Volume
                </span>
                <span className="font-mono">{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
                className="w-full accent-purple-500 h-1.5 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* ========================================================= */}
          {/* 3. TEST / MANUAL COMMENT INPUT                            */}
          {/* ========================================================= */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-purple-300">
              Host Manual Song Request
            </span>
            <p className="text-[11px] text-slate-400">
              Inject a song into the race as host to kick off or test the round.
            </p>

            <form onSubmit={handleCommentSubmit} className="space-y-2">
              <input
                type="text"
                value={manualComment}
                onChange={(e) => setManualComment(e.target.value)}
                placeholder="e.g. play mulatu tezeta or blinding lights"
                className="w-full rounded-xl bg-black/40 border border-purple-500/30 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-400"
              />
              <button
                type="submit"
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-xs text-white transition flex items-center justify-center gap-2 shadow-lg shadow-purple-950/40"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Inject Request</span>
              </button>
            </form>
          </div>

          {/* ========================================================= */}
          {/* 4. RECENT LIVE COMMENTS FEED                              */}
          {/* ========================================================= */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-purple-300">
                Live Chat Stream
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {recentComments.length} comments
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {recentComments.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">
                  No comments received yet.
                </p>
              ) : (
                recentComments.map((c) => (
                  <div
                    key={c.id}
                    className="p-2 rounded-xl bg-black/30 border border-white/5 flex items-start gap-2 text-xs"
                  >
                    <img
                      src={c.avatarUrl}
                      alt={c.displayName}
                      className="h-6 w-6 rounded-full shrink-0 object-cover mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-purple-300 truncate">
                          {c.displayName}
                        </span>
                        {c.recognizedSong && (
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                            VOTE
                          </span>
                        )}
                      </div>
                      <p className="text-slate-300 break-words">{c.comment}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

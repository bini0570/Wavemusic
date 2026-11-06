import React, { useState } from 'react';
import {
  X,
  Sliders,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Volume2,
  Send,
} from 'lucide-react';
import { TikTokComment, VotingRoundState } from '../types';
import { soundEffects } from '../services/soundEffectsService';

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
  onTogglePlay,
  onSkipRound,
  onResetTimer,
  onChangeVolume,
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

  const panelStyle: React.CSSProperties = {
    position: 'fixed', inset: 0, zIndex: 50, display: 'flex', justifyContent: 'flex-end',
  };

  const drawerStyle: React.CSSProperties = {
    position: 'relative', width: '100%', maxWidth: '400px',
    background: 'rgba(11,8,22,0.98)',
    borderLeft: '1px solid rgba(139,92,246,0.3)',
    color: '#fff', boxShadow: '-8px 0 40px rgba(0,0,0,0.6)',
    display: 'flex', flexDirection: 'column', height: '100%', zIndex: 10,
    backdropFilter: 'blur(20px)',
  };

  const sectionStyle: React.CSSProperties = {
    padding: '14px', borderRadius: '14px',
    background: 'rgba(255,255,255,0.025)',
    border: '1px solid rgba(139,92,246,0.12)',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '10px', fontWeight: 700, color: '#a78bfa',
    textTransform: 'uppercase', letterSpacing: '0.08em',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', borderRadius: '10px',
    background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(139,92,246,0.3)',
    padding: '8px 12px', fontSize: '13px', color: '#fff',
    outline: 'none', boxSizing: 'border-box',
  };

  const btnBaseStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    padding: '9px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 700,
    cursor: 'pointer', border: 'none', transition: 'all 0.15s',
  };

  return (
    <div style={panelStyle}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      />

      {/* Drawer */}
      <div style={drawerStyle}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid rgba(139,92,246,0.15)', background: 'rgba(139,92,246,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sliders style={{ height: '18px', width: '18px', color: '#8b5cf6' }} />
            <h2 style={{ fontSize: '15px', fontWeight: 900, margin: 0, letterSpacing: '0.03em' }}>DJ Host Studio</h2>
          </div>
          <button
            onClick={onClose}
            style={{ padding: '6px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X style={{ height: '18px', width: '18px' }} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* TikTok Connection */}
          <div style={sectionStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={labelStyle}>TikTok LIVE</span>
              <span style={{
                fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '999px',
                display: 'flex', alignItems: 'center', gap: '5px',
                background: votingState.isConnected ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                color: votingState.isConnected ? '#6ee7b7' : '#fcd34d',
                border: `1px solid ${votingState.isConnected ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
              }}>
                <span style={{ height: '6px', width: '6px', borderRadius: '50%', background: votingState.isConnected ? '#10b981' : '#f59e0b' }} />
                {votingState.isConnected ? 'Live' : 'Offline'}
              </span>
            </div>

            <form onSubmit={handleConnectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8b5cf6', fontWeight: 700 }}>@</span>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="your_tiktok_username"
                  style={{ ...inputStyle, paddingLeft: '28px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="submit"
                  style={{ ...btnBaseStyle, flex: 1, background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', color: '#fff' }}
                >
                  Connect LIVE
                </button>
                {votingState.isConnected && (
                  <button
                    type="button"
                    onClick={onDisconnectTikTok}
                    style={{ ...btnBaseStyle, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Playback Controls */}
          <div style={sectionStyle}>
            <span style={{ ...labelStyle, display: 'block', marginBottom: '10px' }}>Playback</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={onTogglePlay}
                style={{ ...btnBaseStyle, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)', color: '#a78bfa' }}
              >
                {isPlaying ? <Pause style={{ height: '15px', width: '15px' }} /> : <Play style={{ height: '15px', width: '15px' }} />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <button
                onClick={onSkipRound}
                style={{ ...btnBaseStyle, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24' }}
              >
                <SkipForward style={{ height: '15px', width: '15px' }} />
                <span>Skip</span>
              </button>

              <button
                onClick={onResetTimer}
                style={{ ...btnBaseStyle, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', gridColumn: '1 / -1' }}
              >
                <RotateCcw style={{ height: '14px', width: '14px' }} />
                <span>Reset Round</span>
              </button>
            </div>

            {/* Volume */}
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Volume2 style={{ height: '13px', width: '13px' }} /> Volume
                </span>
                <span style={{ fontFamily: 'monospace' }}>{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#8b5cf6', height: '4px', cursor: 'pointer' }}
              />
            </div>

            {/* Sound FX */}
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ ...labelStyle, display: 'block', marginBottom: '8px' }}>Sound FX</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <button
                  onClick={() => soundEffects.playTick(1)}
                  style={{ ...btnBaseStyle, fontSize: '11px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}
                >
                  ⏱ Tick Cue
                </button>
                <button
                  onClick={() => soundEffects.playWinnerFanfare()}
                  style={{ ...btnBaseStyle, fontSize: '11px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24' }}
                >
                  🎉 Fanfare
                </button>
              </div>
            </div>
          </div>

          {/* Test Comment */}
          <div style={sectionStyle}>
            <span style={{ ...labelStyle, display: 'block', marginBottom: '10px' }}>Test Request</span>
            <form onSubmit={handleCommentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                type="text"
                value={manualComment}
                onChange={(e) => setManualComment(e.target.value)}
                placeholder="e.g. Blinding Lights"
                style={inputStyle}
              />
              <button
                type="submit"
                style={{ ...btnBaseStyle, background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', color: '#fff', justifyContent: 'center' }}
              >
                <Send style={{ height: '13px', width: '13px' }} />
                <span>Inject Request</span>
              </button>
            </form>
          </div>

          {/* Chat Stream */}
          <div style={sectionStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={labelStyle}>Chat</span>
              <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#64748b' }}>{recentComments.length}</span>
            </div>
            <div style={{ maxHeight: '192px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {recentComments.length === 0 ? (
                <p style={{ fontSize: '12px', color: '#475569', textAlign: 'center', padding: '16px 0' }}>No comments received yet.</p>
              ) : (
                recentComments.map((c) => (
                  <div
                    key={c.id}
                    style={{ padding: '8px 10px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '11px' }}
                  >
                    <img
                      src={c.avatarUrl}
                      alt={c.displayName}
                      style={{ height: '24px', width: '24px', borderRadius: '50%', flexShrink: 0, objectFit: 'cover', marginTop: '1px' }}
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontWeight: 700, color: '#a78bfa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.displayName}
                        </span>
                        {c.recognizedSong && (
                          <span style={{ fontSize: '9px', fontWeight: 900, padding: '1px 5px', borderRadius: '4px', background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)', flexShrink: 0 }}>
                            VOTE
                          </span>
                        )}
                      </div>
                      <p style={{ color: '#cbd5e1', margin: 0, wordBreak: 'break-word' }}>{c.comment}</p>
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

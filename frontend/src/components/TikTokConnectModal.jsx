import React, { useState, useEffect } from 'react';
import { X, Radio, ArrowRight, Sparkles } from 'lucide-react';

export const TikTokConnectModal = ({
  isOpen,
  onClose,
  isConnected,
  channelName,
  isConnecting,
  onConnect,
  onDisconnect,
}) => {
  const [username, setUsername] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('wave_tiktok_username');
      const savedSession = localStorage.getItem('wave_tiktok_sessionid');
      if (saved) {
        setUsername(saved.replace(/^@/, ''));
      } else if (channelName && channelName !== '@your_live') {
        setUsername(channelName.replace(/^@/, ''));
      }
      if (savedSession) {
        setSessionId(savedSession);
      }
    } catch {}
  }, [channelName, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = username.trim().replace(/^@/, '');
    if (!clean) return;
    try {
      localStorage.setItem('wave_tiktok_username', clean);
      if (sessionId.trim()) {
        localStorage.setItem('wave_tiktok_sessionid', sessionId.trim());
      }
    } catch {}
    onConnect(clean, sessionId.trim() || undefined);
    onClose();
  };

  const handleDisconnect = () => {
    onDisconnect();
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      />

      {/* Modal Panel */}
      <div style={{
        position: 'relative', width: '100%', maxWidth: '420px',
        background: 'rgba(11,8,22,0.97)',
        border: '1px solid rgba(139,92,246,0.4)',
        borderRadius: '24px', padding: '24px', color: '#fff',
        boxShadow: '0 0 40px rgba(139,92,246,0.2), 0 25px 50px rgba(0,0,0,0.6)',
        zIndex: 10,
      }}>
        {/* Close */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', padding: '6px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
        >
          <X style={{ height: '18px', width: '18px' }} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            display: 'flex', height: '44px', width: '44px', alignItems: 'center', justifyContent: 'center',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            boxShadow: '0 0 20px rgba(139,92,246,0.4)',
            flexShrink: 0,
          }}>
            <Radio style={{ height: '20px', width: '20px', color: '#fff' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 900, color: '#fff', margin: 0 }}>Connect TikTok LIVE</h2>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>Sync live chat song requests &amp; votes</p>
          </div>
        </div>

        {/* Status Pill */}
        <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>Status:</span>
          <span style={{
            fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px',
            display: 'flex', alignItems: 'center', gap: '6px',
            background: isConnected ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
            color: isConnected ? '#6ee7b7' : '#fcd34d',
            border: `1px solid ${isConnected ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
          }}>
            <span style={{
              height: '8px', width: '8px', borderRadius: '50%', flexShrink: 0,
              background: isConnected ? '#10b981' : '#f59e0b',
              animation: isConnected ? 'neon-pulse 2s ease-in-out infinite' : 'none',
            }} />
            {isConnected ? `${channelName} (LIVE)` : 'Offline'}
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '10px', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
              TikTok Username
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#8b5cf6', fontSize: '14px', fontWeight: 900 }}>@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_tiktok_username"
                autoCapitalize="none"
                autoCorrect="off"
                style={{
                  width: '100%', borderRadius: '14px',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(139,92,246,0.35)',
                  paddingLeft: '36px', paddingRight: '14px', paddingTop: '12px', paddingBottom: '12px',
                  fontSize: '14px', fontWeight: 700, color: '#fff',
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(6,182,212,0.6)';
                  e.target.style.boxShadow = '0 0 12px rgba(6,182,212,0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(139,92,246,0.35)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Notice */}
          <div style={{ padding: '10px 12px', borderRadius: '12px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', fontSize: '11px', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles style={{ height: '16px', width: '16px', color: '#fbbf24', flexShrink: 0 }} />
            <span>Account must be actively streaming LIVE on TikTok to sync chat.</span>
          </div>

          {/* Optional Cloud IP Bypass (sessionid) */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{ background: 'none', border: 'none', color: '#06b6d4', fontSize: '11px', fontWeight: 700, cursor: 'pointer', padding: 0 }}
            >
              {showAdvanced ? '− Hide Cloud Bypass Options' : '+ Cloud IP / Session ID (Optional)'}
            </button>
            {showAdvanced && (
              <div style={{ marginTop: '8px' }}>
                <input
                  type="text"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  placeholder="Paste TikTok sessionid cookie (bypasses cloud IP check)"
                  style={{
                    width: '100%', borderRadius: '10px',
                    background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(6,182,212,0.3)',
                    padding: '8px 12px', fontSize: '11px', color: '#fff', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="submit"
              disabled={isConnecting}
              style={{
                width: '100%', padding: '13px 16px', borderRadius: '14px',
                background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                border: 'none', color: '#fff', fontWeight: 900, fontSize: '12px',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                cursor: isConnecting ? 'not-allowed' : 'pointer',
                opacity: isConnecting ? 0.6 : 1,
                boxShadow: '0 0 20px rgba(139,92,246,0.3)',
                transition: 'opacity 0.15s',
              }}
            >
              <span>{isConnecting ? 'Connecting...' : isConnected ? 'Reconnect Channel' : 'Connect LIVE'}</span>
              <ArrowRight style={{ height: '16px', width: '16px' }} />
            </button>

            {isConnected && (
              <button
                type="button"
                onClick={handleDisconnect}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '12px',
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                  color: '#fca5a5', fontWeight: 700, fontSize: '12px', cursor: 'pointer',
                }}
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

import React, { useRef, useEffect, useState } from 'react';
import { MessageSquare, Music2, Send } from 'lucide-react';
import { TikTokComment } from '../types';

interface LiveCommentsFeedProps {
  comments: TikTokComment[];
  onSendComment: (comment: string, username?: string) => void;
}

export const LiveCommentsFeed: React.FC<LiveCommentsFeedProps> = ({
  comments,
  onSendComment,
}) => {
  const [inputText, setInputText] = useState('');
  const [inputUser, setInputUser] = useState('you');
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [comments, autoScroll]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendComment(inputText.trim(), inputUser.trim() || 'you');
    setInputText('');
  };

  return (
    <section
      className="flex flex-col h-full overflow-hidden"
      style={{
        background: 'rgba(11,8,22,0.92)',
        border: '1px solid rgba(6,182,212,0.2)',
        borderRadius: '1.5rem',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 0 40px rgba(6,182,212,0.08), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 sm:px-4 py-2.5 shrink-0"
        style={{ borderBottom: '1px solid rgba(6,182,212,0.12)' }}
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" style={{ color: '#06b6d4' }} />
          <h2
            className="text-xs sm:text-sm font-bold tracking-widest uppercase"
            style={{ color: '#67e8f9', textShadow: '0 0 10px rgba(6,182,212,0.5)' }}
          >
            Live Chat
          </h2>
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
            style={{
              background: 'rgba(6,182,212,0.15)',
              border: '1px solid rgba(6,182,212,0.3)',
              color: '#67e8f9',
            }}
          >
            {comments.length}
          </span>
        </div>

        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className="text-[10px] font-semibold px-2 py-0.5 rounded transition"
          style={
            autoScroll
              ? {
                  background: 'rgba(139,92,246,0.15)',
                  border: '1px solid rgba(139,92,246,0.3)',
                  color: '#c4b5fd',
                }
              : {
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#64748b',
                }
          }
          title="Toggle auto-scroll"
        >
          {autoScroll ? 'Auto' : 'Paused'}
        </button>
      </div>

      {/* Comment List */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-0 min-h-0"
        style={{ padding: '8px 12px' }}
      >
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-10 text-center">
            <MessageSquare className="h-7 w-7 mb-2" style={{ color: '#1e293b' }} />
            <p className="text-xs" style={{ color: '#334155' }}>Waiting for comments...</p>
          </div>
        ) : (
          comments.map((item, i) => (
            <div
              key={item.id}
              className="float-comment"
              style={{
                padding: '7px 0',
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                animationDelay: `${i * 0.03}s`,
              }}
            >
              <div className="flex items-start gap-2">
                {/* Avatar */}
                <img
                  src={item.avatarUrl}
                  alt={item.username}
                  className="h-7 w-7 rounded-full object-cover shrink-0"
                  style={{
                    border: '1.5px solid rgba(6,182,212,0.4)',
                    boxShadow: '0 0 6px rgba(6,182,212,0.2)',
                  }}
                  loading="lazy"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-xs font-bold truncate"
                      style={{ color: '#67e8f9', textShadow: '0 0 6px rgba(6,182,212,0.4)' }}
                    >
                      {item.username}
                    </span>
                    <span className="text-[9px] font-mono shrink-0" style={{ color: '#1e3a4a' }}>
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-xs mt-0.5 break-words" style={{ color: '#94a3b8' }}>
                    {item.comment}
                  </p>

                  {/* Vote Badge */}
                  {item.recognizedSong && (
                    <div
                      className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md"
                      style={{
                        background: 'rgba(139,92,246,0.15)',
                        border: '1px solid rgba(139,92,246,0.3)',
                        boxShadow: '0 0 8px rgba(139,92,246,0.2)',
                      }}
                    >
                      <Music2 className="h-3 w-3 shrink-0" style={{ color: '#8b5cf6' }} />
                      <span className="text-[10px] font-semibold truncate" style={{ color: '#c4b5fd' }}>
                        {item.recognizedSong.displayTitle}
                        {item.recognizedSong.artist !== 'Viewer Request' &&
                          ` (${item.recognizedSong.artist})`}
                      </span>
                      <span
                        className="text-[9px] font-black shrink-0"
                        style={{ color: '#4ade80', textShadow: '0 0 6px rgba(74,222,128,0.5)' }}
                      >
                        +1
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comment Input Form */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-2.5 py-2 shrink-0"
        style={{ borderTop: '1px solid rgba(6,182,212,0.1)', background: 'rgba(0,0,0,0.3)' }}
      >
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs font-semibold" style={{ color: '#475569' }}>@</span>
          <input
            type="text"
            value={inputUser}
            onChange={(e) => setInputUser(e.target.value)}
            className="w-14 px-2 py-1 rounded-lg text-xs font-bold focus:outline-none"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(6,182,212,0.2)',
              color: '#67e8f9',
            }}
            placeholder="user"
          />
        </div>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message or song..."
          className="flex-1 px-3 py-1.5 rounded-lg text-xs focus:outline-none"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(139,92,246,0.2)',
            color: '#e2e8f0',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)')}
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-1.5 rounded-lg transition active:scale-95 disabled:opacity-30"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            boxShadow: '0 0 10px rgba(139,92,246,0.4)',
            color: '#fff',
          }}
          title="Send comment"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </section>
  );
};

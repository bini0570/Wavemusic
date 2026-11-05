import React, { useRef, useEffect, useState } from 'react';
import { MessageSquare, Music2, Send, Sparkles } from 'lucide-react';
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
      scrollRef.current.scrollTop = 0; // Recent comments at top
    }
  }, [comments, autoScroll]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendComment(inputText.trim(), inputUser.trim() || 'you');
    setInputText('');
  };

  return (
    <section className="flex flex-col h-full rounded-2xl border border-white/10 bg-[#141422]/90 backdrop-blur-md overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-pink-400" />
          <h2 className="text-sm font-bold text-white tracking-wide">
            A. Live Comments
          </h2>
          <span className="text-[11px] font-mono text-slate-400">
            ({comments.length} stream log)
          </span>
        </div>

        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className={`text-[10px] font-semibold px-2 py-0.5 rounded transition ${
            autoScroll
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              : 'bg-white/5 text-slate-400 hover:text-white'
          }`}
          title="Toggle auto-scroll"
        >
          {autoScroll ? 'Auto-Scroll ON' : 'Paused'}
        </button>
      </div>

      {/* Real-time Streaming Comments List */}
      <div
        ref={scrollRef}
        className="flex-1 p-3 overflow-y-auto space-y-2.5 min-h-[260px] max-h-[380px] sm:max-h-[460px] divide-y divide-white/[0.03]"
      >
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center text-slate-500">
            <MessageSquare className="h-8 w-8 text-slate-600 mb-2" />
            <p className="text-xs">Waiting for live viewer comments...</p>
            <p className="text-[11px] text-slate-600 mt-1">
              Type a song request below to test the voting engine
            </p>
          </div>
        ) : (
          comments.map((item) => (
            <div
              key={item.id}
              className="pt-2.5 first:pt-0 animate-in fade-in slide-in-from-top-1 duration-200"
            >
              <div className="flex items-start gap-2.5">
                {/* Avatar with TikTok live ring */}
                <img
                  src={item.avatarUrl}
                  alt={item.username}
                  className="h-7 w-7 rounded-full object-cover shrink-0 border border-pink-500/40 shadow-sm"
                  loading="lazy"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-pink-300 truncate">
                      {item.username}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Comment message body */}
                  <p className="text-xs text-slate-200 mt-0.5 break-words font-medium">
                    {item.comment}
                  </p>

                  {/* Recognized Song Request Highlight */}
                  {item.recognizedSong && (
                    <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/35 text-[11px] text-purple-200 font-semibold shadow-sm">
                      <Music2 className="h-3 w-3 text-purple-400 shrink-0" />
                      <span className="truncate">
                        Vote detected: {item.recognizedSong.displayTitle}
                        {item.recognizedSong.artist !== 'Viewer Request' &&
                          ` (${item.recognizedSong.artist})`}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold shrink-0">
                        +1 Vote
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick In-Stream Comment Form */}
      <form
        onSubmit={handleSubmit}
        className="p-2.5 border-t border-white/10 bg-black/40 flex items-center gap-2"
      >
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs text-slate-400 font-semibold">@</span>
          <input
            type="text"
            value={inputUser}
            onChange={(e) => setInputUser(e.target.value)}
            className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-pink-300 font-bold focus:outline-none focus:border-pink-500"
            placeholder="user"
          />
        </div>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Send comment (e.g. 'play Teddy Afro Gonder')"
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 disabled:opacity-30 text-white transition active:scale-95"
          title="Send comment"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </section>
  );
};

import React from 'react';
import { History, Play, Users, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { RoundHistoryItem } from '../types';

interface RoundHistorySectionProps {
  history: RoundHistoryItem[];
  onReplaySong: (title: string, artist: string) => void;
}

export const RoundHistorySection: React.FC<RoundHistorySectionProps> = ({
  history,
  onReplaySong,
}) => {
  return (
    <section className="flex flex-col h-full rounded-2xl border border-white/10 bg-[#141422]/90 backdrop-blur-md overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-white tracking-wide">
            D. Round History
          </h2>
          <span className="text-[11px] font-mono text-slate-400">
            ({history.length} completed rounds)
          </span>
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5 min-h-[220px] max-h-[380px] sm:max-h-[460px]">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center text-slate-500">
            <Clock className="h-8 w-8 text-slate-600 mb-2" />
            <p className="text-xs">No completed rounds yet</p>
            <p className="text-[11px] text-slate-600 mt-1">
              Winning songs from each 60-second round will be logged here
            </p>
          </div>
        ) : (
          history.map((item) => (
            <div
              key={`round_${item.roundNumber}_${item.playedAt}`}
              className="group rounded-xl border border-white/5 bg-[#18182a]/70 hover:border-white/10 p-3 transition"
            >
              <div className="flex items-start justify-between gap-3">
                {/* Round Badge & Song Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Round #{item.roundNumber}
                    </span>

                    {item.status === 'played' ? (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                        <CheckCircle className="h-3 w-3" />
                        <span>Winner Played</span>
                      </span>
                    ) : item.status === 'no-votes' ? (
                      <span className="text-[10px] text-slate-500 font-semibold">
                        No Votes (Kept Playing)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-rose-400 font-semibold">
                        <AlertCircle className="h-3 w-3" />
                        <span>Search Failed (Skipped)</span>
                      </span>
                    )}

                    <span className="text-[10px] text-slate-500 font-mono ml-auto">
                      {new Date(item.playedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Song Title & Artist */}
                  <h4 className="text-sm font-bold text-white truncate mt-1">
                    {item.winningSong}
                  </h4>
                  <p className="text-xs text-purple-300 truncate mt-0.5">
                    {item.winningArtist}
                  </p>

                  {/* Winning Usernames & Request Count */}
                  {item.winningUsers.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-400">
                      <Users className="h-3 w-3 text-pink-400 shrink-0" />
                      <span className="text-slate-300 font-bold">
                        {item.voteCount} {item.voteCount === 1 ? 'vote' : 'votes'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate text-pink-300/90 text-[10px]">
                        Requested by {item.winningUsers.slice(0, 3).join(', ')}
                        {item.winningUsers.length > 3 &&
                          ` +${item.winningUsers.length - 3} others`}
                      </span>
                    </div>
                  )}

                  {item.failureReason && (
                    <p className="text-[10px] text-rose-300 mt-1 italic">
                      {item.failureReason}
                    </p>
                  )}
                </div>

                {/* Replay Button (if playable song) */}
                {item.status === 'played' && (
                  <button
                    onClick={() => onReplaySong(item.winningSong, item.winningArtist)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-purple-600 text-slate-300 hover:text-white transition active:scale-90 shrink-0 self-center"
                    title={`Replay ${item.winningSong}`}
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 border-t border-white/5 bg-white/[0.01] text-[11px] text-slate-400 flex items-center justify-between">
        <span>Continuous 60-second voting archive</span>
        <span className="font-mono text-purple-300">WAVE History</span>
      </div>
    </section>
  );
};

import React from 'react';
import { Trophy, Crown } from 'lucide-react';
import { SongVoteGroup, TikTokComment } from '../types';

interface Top10RankingTableProps {
  leaderboard: SongVoteGroup[];
  timeRemainingSeconds: number;
  durationSeconds: number;
  roundNumber: number;
  recentComments: TikTokComment[];
  onForceWin: (song: SongVoteGroup) => void;
  onSendComment: (comment: string, username?: string) => void;
}

export const Top10RankingTable: React.FC<Top10RankingTableProps> = ({
  leaderboard,
  onForceWin,
}) => {
  const top10 = leaderboard.slice(0, 10);

  // Generate 10 entries
  const rows = Array.from({ length: 10 }).map((_, index) => {
    return top10[index] || null;
  });

  return (
    <div className="flex flex-col h-full rounded-2xl sm:rounded-3xl border border-[#2b2454] bg-[#120f26]/95 backdrop-blur-xl p-2.5 sm:p-3.5 shadow-2xl justify-between overflow-hidden">
      {/* Header: Trophy + TOP 10 COMMENTS */}
      <div className="flex items-center gap-2 mb-1 sm:mb-2 shrink-0">
        <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
          <Trophy className="h-4 w-4 sm:h-5 sm:w-5 fill-amber-400 text-amber-400" />
        </div>
        <h2 className="text-sm sm:text-base font-extrabold tracking-wide text-white uppercase">
          TOP 10 COMMENTS
        </h2>
      </div>

      {/* 10 Rows List (dynamically flexes and fits available vertical space) */}
      <div className="flex-1 flex flex-col justify-between gap-1 min-h-0 overflow-hidden">
        {rows.map((song, index) => {
          const rank = index + 1;
          const isWinner = rank === 1 && song !== null;

          if (!song) {
            return (
              <div
                key={`empty_${rank}`}
                className="flex items-center justify-between px-2.5 py-0.5 rounded-lg border border-dashed border-white/5 bg-black/20 opacity-30 text-[11px] text-slate-500"
              >
                <div className="flex items-center gap-2">
                  <span className="w-4 text-center font-bold text-slate-500">{rank}</span>
                  <span className="font-mono text-slate-500">#{rank}</span>
                  <span className="italic">Waiting for live vote...</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-slate-600">
                  —
                </span>
              </div>
            );
          }

          if (isWinner) {
            // #1 Leader with Golden Glowing Border
            return (
              <div
                key={song.groupKey}
                onClick={() => onForceWin(song)}
                className="relative flex items-center justify-between px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border-2 border-[#ffd700] bg-[#1b1638] shadow-[0_0_12px_rgba(255,215,0,0.3)] cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition shrink-0"
                title="Click to force play winner"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {/* Golden Crown Icon */}
                  <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded bg-amber-400 text-slate-950 shadow-sm shrink-0">
                    <Crown className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-slate-950 text-slate-950" />
                  </div>

                  <span className="text-xs sm:text-sm font-black text-amber-400 font-mono shrink-0">
                    #1
                  </span>

                  <span className="text-xs sm:text-sm font-black text-[#ffd700] truncate">
                    {song.displayTitle}
                  </span>
                </div>

                {/* Vote Count Pill */}
                <div className="shrink-0 px-2 sm:px-2.5 py-0.5 rounded-full bg-[#2a2055] border border-purple-500/30 text-[10px] sm:text-xs font-bold text-[#c4b5fd]">
                  {song.voteCount} votes
                </div>
              </div>
            );
          }

          if (rank === 2) {
            // #2 Silver
            return (
              <div
                key={song.groupKey}
                onClick={() => onForceWin(song)}
                className="flex items-center justify-between px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg border border-white/5 bg-[#16122d]/70 hover:bg-[#1a1635] transition cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-slate-300 text-slate-950 shrink-0">
                    <Crown className="h-3 w-3 fill-slate-950 text-slate-950" />
                  </div>

                  <span className="text-xs font-bold text-slate-300 font-mono shrink-0">
                    #2
                  </span>

                  <span className="text-xs sm:text-sm font-extrabold text-white truncate">
                    {song.displayTitle}
                  </span>
                </div>

                <div className="shrink-0 px-2 sm:px-2.5 py-0.5 rounded-full bg-[#2a2055] border border-purple-500/20 text-[10px] sm:text-xs font-bold text-[#c4b5fd]">
                  {song.voteCount} votes
                </div>
              </div>
            );
          }

          if (rank === 3) {
            // #3 Bronze
            return (
              <div
                key={song.groupKey}
                onClick={() => onForceWin(song)}
                className="flex items-center justify-between px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg border border-white/5 bg-[#16122d]/70 hover:bg-[#1a1635] transition cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-[#e07a38] text-white shrink-0">
                    <Crown className="h-3 w-3 fill-white text-white" />
                  </div>

                  <span className="text-xs font-bold text-[#e07a38] font-mono shrink-0">
                    #3
                  </span>

                  <span className="text-xs sm:text-sm font-extrabold text-white truncate">
                    {song.displayTitle}
                  </span>
                </div>

                <div className="shrink-0 px-2 sm:px-2.5 py-0.5 rounded-full bg-[#2a2055] border border-purple-500/20 text-[10px] sm:text-xs font-bold text-[#c4b5fd]">
                  {song.voteCount} votes
                </div>
              </div>
            );
          }

          // Ranks 4 to 10
          return (
            <div
              key={song.groupKey}
              onClick={() => onForceWin(song)}
              className="flex items-center justify-between px-2 sm:px-2.5 py-0.5 rounded-lg border border-transparent hover:border-white/5 hover:bg-[#181332] transition cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-4 text-center text-xs font-bold text-slate-400 shrink-0">
                  {rank}
                </span>

                <span className="text-[11px] font-bold text-slate-500 font-mono shrink-0">
                  #{rank}
                </span>

                <span className="text-xs sm:text-sm font-medium text-slate-100 truncate">
                  {song.displayTitle}
                </span>
              </div>

              <div className="shrink-0 px-2 py-0.5 rounded-full bg-[#2a2055] border border-purple-500/20 text-[10px] sm:text-xs font-bold text-[#c4b5fd]">
                {song.voteCount} votes
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React from 'react';
import { Trophy, Clock, Flame, Users, CheckCircle2 } from 'lucide-react';
import { SongVoteGroup } from '../types';

interface VotingLeaderboardProps {
  leaderboard: SongVoteGroup[];
  timeRemainingSeconds: number;
  durationSeconds: number;
  roundNumber: number;
  onForceWin?: (song: SongVoteGroup) => void;
}

export const VotingLeaderboard: React.FC<VotingLeaderboardProps> = ({
  leaderboard,
  timeRemainingSeconds,
  durationSeconds,
  roundNumber,
  onForceWin,
}) => {
  const topVotes = leaderboard.length > 0 ? leaderboard[0].voteCount : 1;
  const currentLeader = leaderboard.length > 0 ? leaderboard[0] : null;

  return (
    <section className="flex flex-col h-full rounded-2xl border border-white/10 bg-[#141422]/90 backdrop-blur-md overflow-hidden shadow-xl">
      {/* Leaderboard Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white tracking-wide">
            B. Voting Leaderboard
          </h2>
          <span className="text-[11px] font-mono text-slate-400">
            (Round #{roundNumber})
          </span>
        </div>

        {/* Sync Countdown Timer */}
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300 bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 rounded-full">
          <Clock className="h-3 w-3 animate-spin" />
          <span>{timeRemainingSeconds}s left</span>
        </div>
      </div>

      {/* #1 Leader Banner (Next Winner Preview) */}
      {currentLeader ? (
        <div className="px-4 py-2.5 bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-transparent border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-slate-950 text-[10px] font-black shrink-0">
              1
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Current Leader · Plays next at 0s
                </span>
              </div>
              <p className="text-xs font-extrabold text-white truncate">
                {currentLeader.displayTitle} — {currentLeader.artist}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs font-bold text-amber-400 font-mono">
              {currentLeader.voteCount} {currentLeader.voteCount === 1 ? 'vote' : 'votes'}
            </span>
          </div>
        </div>
      ) : (
        <div className="px-4 py-2 bg-purple-500/5 border-b border-white/5 text-center">
          <p className="text-[11px] text-purple-300">
            No votes yet in Round #{roundNumber}. Comment a song name to vote!
          </p>
        </div>
      )}

      {/* Ranked Song List */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5 min-h-[260px] max-h-[380px] sm:max-h-[460px]">
        {leaderboard.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center text-slate-500">
            <Flame className="h-8 w-8 text-slate-600 mb-2" />
            <p className="text-xs">Leaderboard is waiting for votes</p>
            <p className="text-[11px] text-slate-600 mt-1">
              Top requested song in the 60s round automatically plays next
            </p>
          </div>
        ) : (
          leaderboard.map((song, index) => {
            const rank = index + 1;
            const votePercent = Math.round((song.voteCount / topVotes) * 100);
            const isWinner = rank === 1;

            return (
              <div
                key={song.groupKey}
                className={`group relative rounded-xl p-2.5 border transition-all ${
                  isWinner
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-[#18182a]/70 border-white/5 hover:border-white/10'
                }`}
              >
                {/* Background vote progress bar */}
                <div
                  className={`absolute inset-0 rounded-xl transition-all duration-300 opacity-20 pointer-events-none ${
                    isWinner
                      ? 'bg-gradient-to-r from-amber-500 to-pink-500'
                      : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                  }`}
                  style={{ width: `${votePercent}%` }}
                />

                <div className="relative z-10 flex items-center justify-between gap-3">
                  {/* Left: Rank & Title */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-black shrink-0 ${
                        rank === 1
                          ? 'bg-amber-400 text-slate-950 shadow-sm'
                          : rank === 2
                          ? 'bg-slate-300 text-slate-950'
                          : rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'bg-white/10 text-slate-300 font-mono'
                      }`}
                    >
                      {rank}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                          {song.displayTitle}
                        </h3>
                        {isWinner && (
                          <span className="text-[10px] text-amber-300 font-bold shrink-0">
                            ★ Leads
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 truncate mt-0.5">
                        <span className="text-purple-300 truncate">{song.artist}</span>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-1 text-[10px]">
                          <Users className="h-3 w-3" />
                          <span>{song.requestingUsers.length} viewers</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Vote count & Quick actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="text-sm sm:text-base font-extrabold text-white font-mono tabular-nums">
                        {song.voteCount}
                      </span>
                      <p className="text-[10px] text-slate-400 leading-none">
                        {song.voteCount === 1 ? 'vote' : 'votes'}
                      </p>
                    </div>

                    {onForceWin && (
                      <button
                        onClick={() => onForceWin(song)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md bg-purple-600 hover:bg-purple-500 text-white text-[10px] transition font-bold"
                        title="Force pick this winner immediately"
                      >
                        Play
                      </button>
                    )}
                  </div>
                </div>

                {/* Voter Usernames list preview */}
                <div className="relative z-10 mt-1 pt-1 border-t border-white/5 flex items-center gap-1 text-[10px] text-slate-400 truncate">
                  <span className="text-slate-500">Voters:</span>
                  <span className="truncate text-pink-300/80">
                    {song.requestingUsers.slice(0, 4).join(', ')}
                    {song.requestingUsers.length > 4 &&
                      ` +${song.requestingUsers.length - 4} more`}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Rule Note */}
      <div className="px-4 py-2 border-t border-white/5 bg-white/[0.01] flex items-center justify-between text-[11px] text-slate-400">
        <span>Ties broken by earliest timestamp</span>
        <span className="text-emerald-400 font-semibold">1 comment = 1 vote</span>
      </div>
    </section>
  );
};

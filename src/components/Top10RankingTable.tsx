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
  const rows = top10.length > 0 ? top10 : [null, null, null];
  const maxVotes = top10.length > 0 ? top10[0].voteCount : 1;

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{
        background: 'rgba(11,8,22,0.92)',
        border: '1px solid rgba(139,92,246,0.25)',
        borderRadius: '1.5rem',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 0 60px rgba(139,92,246,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-3 sm:px-4 py-2.5 shrink-0"
        style={{ borderBottom: '1px solid rgba(139,92,246,0.15)' }}
      >
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ background: 'rgba(251,191,36,0.15)', boxShadow: '0 0 10px rgba(251,191,36,0.2)' }}
        >
          <Trophy className="h-4 w-4" style={{ color: '#fbbf24', fill: '#fbbf24' }} />
        </div>
        <h2
          className="text-xs sm:text-sm font-bold tracking-widest uppercase"
          style={{ color: '#fbbf24', textShadow: '0 0 10px rgba(251,191,36,0.5)' }}
        >
          Rankings
        </h2>
      </div>

      {/* Rows */}
      <div className="flex-1 flex flex-col gap-1.5 min-h-0 overflow-y-auto px-2.5 sm:px-3.5 py-2.5 pr-0.5">
        {rows.map((song, index) => {
          const rank = index + 1;
          const isWinner = rank === 1 && song !== null;

          if (!song) {
            return (
              <div
                key={`empty_${rank}`}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px]"
                style={{
                  border: '1px dashed rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.01)',
                  opacity: 0.35,
                  color: '#475569',
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-4 text-center font-bold">{rank}</span>
                  <span>No votes yet</span>
                </div>
                <span>—</span>
              </div>
            );
          }

          const voteBarPct = Math.round((song.voteCount / maxVotes) * 100);

          if (isWinner) {
            return (
              <div
                key={song.groupKey}
                onClick={() => onForceWin(song)}
                className="relative flex flex-col px-2.5 sm:px-3 py-2 rounded-xl cursor-pointer transition hover:scale-[1.01] active:scale-[0.99] overflow-hidden shrink-0"
                style={{
                  border: '2px solid #fbbf24',
                  background: 'rgba(251,191,36,0.07)',
                  boxShadow: '0 0 20px rgba(251,191,36,0.25), inset 0 1px 0 rgba(251,191,36,0.15)',
                  animation: 'glow-gold 2s ease-in-out infinite',
                }}
                title="Click to force play winner"
              >
                {/* Vote bar behind content */}
                <div
                  className="absolute inset-0 opacity-10 transition-all duration-700"
                  style={{ width: `${voteBarPct}%`, background: 'linear-gradient(90deg, #fbbf24, transparent)' }}
                />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded"
                      style={{ background: '#fbbf24', boxShadow: '0 0 8px #fbbf24' }}
                    >
                      <Crown className="h-3 w-3 fill-black text-black" />
                    </div>
                    <span className="text-xs font-black font-mono shrink-0" style={{ color: '#fbbf24' }}>#1</span>
                    <span className="text-xs sm:text-sm font-black truncate" style={{ color: '#fde68a' }}>
                      {song.displayTitle}
                    </span>
                  </div>
                  <span
                    className="shrink-0 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold"
                    style={{ background: 'rgba(251,191,36,0.2)', border: '1px solid rgba(251,191,36,0.4)', color: '#fbbf24' }}
                  >
                    {song.voteCount}v
                  </span>
                </div>
              </div>
            );
          }

          if (rank === 2) {
            return (
              <div
                key={song.groupKey}
                onClick={() => onForceWin(song)}
                className="relative flex items-center justify-between px-2.5 sm:px-3 py-1.5 rounded-xl cursor-pointer transition overflow-hidden"
                style={{
                  border: '1px solid rgba(203,213,225,0.2)',
                  background: 'rgba(203,213,225,0.04)',
                }}
              >
                <div
                  className="absolute inset-0 opacity-10 transition-all duration-700"
                  style={{ width: `${voteBarPct}%`, background: 'linear-gradient(90deg, #94a3b8, transparent)' }}
                />
                <div className="relative flex items-center gap-2 min-w-0">
                  <div className="flex h-5 w-5 items-center justify-center rounded" style={{ background: '#cbd5e1' }}>
                    <Crown className="h-3 w-3 fill-black text-black" />
                  </div>
                  <span className="text-xs font-bold font-mono shrink-0" style={{ color: '#94a3b8' }}>#2</span>
                  <span className="text-xs sm:text-sm font-bold truncate text-white">{song.displayTitle}</span>
                </div>
                <span className="relative shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)', color: '#c4b5fd' }}>
                  {song.voteCount}v
                </span>
              </div>
            );
          }

          if (rank === 3) {
            return (
              <div
                key={song.groupKey}
                onClick={() => onForceWin(song)}
                className="relative flex items-center justify-between px-2.5 sm:px-3 py-1.5 rounded-xl cursor-pointer transition overflow-hidden"
                style={{
                  border: '1px solid rgba(224,122,56,0.3)',
                  background: 'rgba(224,122,56,0.04)',
                }}
              >
                <div
                  className="absolute inset-0 opacity-10 transition-all duration-700"
                  style={{ width: `${voteBarPct}%`, background: 'linear-gradient(90deg, #e07a38, transparent)' }}
                />
                <div className="relative flex items-center gap-2 min-w-0">
                  <div className="flex h-5 w-5 items-center justify-center rounded" style={{ background: '#e07a38' }}>
                    <Crown className="h-3 w-3 fill-white text-white" />
                  </div>
                  <span className="text-xs font-bold font-mono shrink-0" style={{ color: '#e07a38' }}>#3</span>
                  <span className="text-xs sm:text-sm font-bold truncate text-white">{song.displayTitle}</span>
                </div>
                <span className="relative shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)', color: '#c4b5fd' }}>
                  {song.voteCount}v
                </span>
              </div>
            );
          }

          // Ranks 4–10
          return (
            <div
              key={song.groupKey}
              onClick={() => onForceWin(song)}
              className="relative flex items-center justify-between px-2.5 py-1 rounded-lg cursor-pointer transition overflow-hidden"
              style={{ border: '1px solid transparent' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.15)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
            >
              <div
                className="absolute inset-0 opacity-[0.07] transition-all duration-700"
                style={{ width: `${voteBarPct}%`, background: 'linear-gradient(90deg, #8b5cf6, transparent)' }}
              />
              <div className="relative flex items-center gap-2 min-w-0">
                <span className="w-5 text-center text-xs font-bold font-mono shrink-0" style={{ color: '#475569' }}>
                  #{rank}
                </span>
                <span className="text-xs sm:text-sm font-medium truncate" style={{ color: '#cbd5e1' }}>
                  {song.displayTitle}
                </span>
              </div>
              <span className="relative shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'rgba(139,92,246,0.1)', color: '#8b7cf8' }}>
                {song.voteCount}v
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

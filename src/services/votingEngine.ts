/**
/**
 * WAVE 60-Second Real-Time Voting Engine:
 * - 60-second precise countdown round ticker.
 * - Ingests real TikTok LIVE comments via WebSocket.
 * - Groups votes by song groupKey with 1-vote-per-user-per-round anti-spam rule.
 * - Deterministic tie-breaker: first song to reach the tied score wins.
 * - When 0 votes occur: pauses and transitions into Waiting-For-Votes state.
 * - Automatically kicks off a new 60s round as soon as chat votes.
 */

import { TikTokComment, SongVoteGroup, RoundHistoryItem, VotingRoundState } from '../types';
import { recognizeSongRequest } from './songRecognizer';

export type WinnerCallback = (winner: SongVoteGroup, roundNumber: number) => Promise<boolean>;
export type NoVotesCallback = (roundNumber: number) => void;

export class VotingEngine {
  private roundDuration = 60;
  private timeRemaining = 60;
  private roundNumber = 1;
  private isVotingActive = true;
  private isConnected = false;
  private channelName = '@your_live';
  private isConcludingRound = false;
  private isWaitingForVotes = true;
  private votedByUser = new Map<string, Set<string>>();

  private totalCommentsRound = 0;
  private totalCommentsAllTime = 0;
  private votesByGroup: Map<string, SongVoteGroup> = new Map();
  private recentComments: TikTokComment[] = [];
  private history: RoundHistoryItem[] = [];

  private timerInterval: number | null = null;
  private stateChangeListeners: Set<(state: VotingRoundState) => void> = new Set();
  private commentListeners: Set<(comment: TikTokComment) => void> = new Set();

  private onWinnerSelected?: WinnerCallback;
  private onNoVotes?: NoVotesCallback;

  constructor(onWinner?: WinnerCallback, onNoVotes?: NoVotesCallback) {
    this.onWinnerSelected = onWinner;
    this.onNoVotes = onNoVotes;
    this.startRoundTimer();
  }

  public subscribeState(listener: (state: VotingRoundState) => void) {
    this.stateChangeListeners.add(listener);
    listener(this.getState());
    return () => {
      this.stateChangeListeners.delete(listener);
    };
  }

  public subscribeComments(listener: (comment: TikTokComment) => void) {
    this.commentListeners.add(listener);
    return () => {
      this.commentListeners.delete(listener);
    };
  }

  public getState(): VotingRoundState {
    const leaderboard = Array.from(this.votesByGroup.values()).sort((a, b) => {
      if (b.voteCount !== a.voteCount) {
        return b.voteCount - a.voteCount; // Highest votes first
      }
      return a.firstVotedAt - b.firstVotedAt; // Tie-breaker: earliest to reach score
    });

    return {
      roundNumber: this.roundNumber,
      durationSeconds: this.roundDuration,
      timeRemainingSeconds: this.timeRemaining,
      totalCommentsThisRound: this.totalCommentsRound,
      totalCommentsAllTime: this.totalCommentsAllTime,
      leaderboard,
      currentWinner: leaderboard.length > 0 ? leaderboard[0] : null,
      history: [...this.history],
      isVotingActive: this.isVotingActive,
      isConnected: this.isConnected,
      channelName: this.channelName,
      trafficRate: 'paused',
      streamSafeMode: false,
      isWaitingForVotes: this.isWaitingForVotes,
    };
  }

  private notifyState() {
    const s = this.getState();
    this.stateChangeListeners.forEach((l) => l(s));
  }

  /**
   * Ingests and processes a new live comment from TikTok
   */
  public ingestComment(
    rawText: string,
    username = 'viewer',
    displayName?: string,
    avatarUrl?: string
  ) {
    this.totalCommentsRound += 1;
    this.totalCommentsAllTime += 1;

    const recognized = recognizeSongRequest(rawText);

    const commentItem: TikTokComment = {
      id: `comm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      username: username.startsWith('@') ? username : `@${username}`,
      displayName: displayName || username,
      avatarUrl:
        avatarUrl ||
        `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(username)}`,
      comment: rawText,
      timestamp: Date.now(),
      recognizedSong: recognized
        ? {
            groupKey: recognized.groupKey,
            displayTitle: recognized.displayTitle,
            artist: recognized.artist,
          }
        : undefined,
    };

    // Keep latest 60 comments for log
    this.recentComments.unshift(commentItem);
    if (this.recentComments.length > 60) {
      this.recentComments.pop();
    }
    this.commentListeners.forEach((l) => l(commentItem));

    // If a recognized song request is made and voting is active
    if (recognized && this.isVotingActive) {
      const userKey = username.toLowerCase().replace(/^@/, '');
      let userVotes = this.votedByUser.get(userKey);
      if (!userVotes) {
        userVotes = new Set<string>();
        this.votedByUser.set(userKey, userVotes);
      }

      // Check anti-spam: 1 vote per song per viewer per round
      if (!userVotes.has(recognized.groupKey)) {
        userVotes.add(recognized.groupKey);

        const existing = this.votesByGroup.get(recognized.groupKey);
        if (existing) {
          existing.voteCount += 1;
          existing.lastVotedAt = Date.now();
          if (!existing.requestingUsers.includes(commentItem.displayName)) {
            existing.requestingUsers.push(commentItem.displayName);
          }
        } else {
          this.votesByGroup.set(recognized.groupKey, {
            groupKey: recognized.groupKey,
            displayTitle: recognized.displayTitle,
            artist: recognized.artist,
            voteCount: 1,
            firstVotedAt: Date.now(),
            lastVotedAt: Date.now(),
            requestingUsers: [commentItem.displayName],
          });
        }

        // If we were waiting for votes (idle silence), immediately play this first requested song
        // and start the 60s voting round for the NEXT song so the stream never sits in silence!
        if (this.isWaitingForVotes) {
          this.isWaitingForVotes = false;
          this.timeRemaining = this.roundDuration;
          const initialWinner = this.votesByGroup.get(recognized.groupKey)!;
          // Clear current round votes so chat can immediately begin voting on track #2
          this.votesByGroup.clear();
          this.votedByUser.clear();
          if (this.onWinnerSelected) {
            this.onWinnerSelected(initialWinner, this.roundNumber);
          }
        }
      }
    }

    this.notifyState();
  }

  /**
   * Starts or resumes the 60s countdown timer
   */
  private startRoundTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = window.setInterval(() => {
      if (!this.isVotingActive || this.isConcludingRound || this.isWaitingForVotes) {
        return;
      }

      if (this.timeRemaining > 1) {
        this.timeRemaining -= 1;
        this.notifyState();
      } else {
        this.timeRemaining = 0;
        this.notifyState();
        this.concludeRound();
      }
    }, 1000);
  }

  /**
   * Concludes the 60s round, crowns the winner, and prepares the next round
   */
  private async concludeRound() {
    if (this.isConcludingRound) return;
    this.isConcludingRound = true;

    const roundFinished = this.roundNumber;
    const sorted = Array.from(this.votesByGroup.values()).sort((a, b) => {
      if (b.voteCount !== a.voteCount) {
        return b.voteCount - a.voteCount;
      }
      return a.firstVotedAt - b.firstVotedAt;
    });

    const winner = sorted.length > 0 ? sorted[0] : null;

    if (winner && winner.voteCount > 0) {
      this.isWaitingForVotes = false;
      let playedOk = true;
      if (this.onWinnerSelected) {
        try {
          playedOk = await this.onWinnerSelected(winner, roundFinished);
        } catch {
          playedOk = false;
        }
      }

      this.history.unshift({
        roundNumber: roundFinished,
        winningSong: winner.displayTitle,
        winningArtist: winner.artist,
        voteCount: winner.voteCount,
        totalRoundComments: this.totalCommentsRound,
        winningUsers: [...winner.requestingUsers],
        playedAt: Date.now(),
        status: playedOk ? 'played' : 'skipped',
        failureReason: playedOk ? undefined : 'Search lookup failed or skipped',
      });

      // Advance to next 60s round immediately
      this.roundNumber += 1;
      this.timeRemaining = this.roundDuration;
      this.totalCommentsRound = 0;
      this.votesByGroup.clear();
      this.votedByUser.clear();
      this.isConcludingRound = false;
      this.notifyState();
    } else {
      // 0 votes: Pause and transition into Waiting-for-Votes mode
      this.isWaitingForVotes = true;
      if (this.onNoVotes) {
        this.onNoVotes(roundFinished);
      }

      this.history.unshift({
        roundNumber: roundFinished,
        winningSong: 'No Requests',
        winningArtist: 'Waiting for chat...',
        voteCount: 0,
        totalRoundComments: this.totalCommentsRound,
        winningUsers: [],
        playedAt: Date.now(),
        status: 'no-votes',
      });

      this.isConcludingRound = false;
      this.notifyState();
    }

    if (this.history.length > 25) {
      this.history.pop();
    }
  }

  // Host Controls
  public skipRoundNow() {
    this.concludeRound();
  }

  public resetRoundTimer() {
    this.timeRemaining = this.roundDuration;
    this.isWaitingForVotes = false;
    this.notifyState();
  }

  public toggleVoting() {
    this.isVotingActive = !this.isVotingActive;
    this.notifyState();
  }

  public setIsConnected(connected: boolean, channel?: string) {
    this.isConnected = connected;
    if (channel) this.channelName = channel;
    this.notifyState();
  }

  public setChannelName(name: string) {
    this.channelName = name.startsWith('@') ? name : `@${name}`;
    this.notifyState();
  }

  public forceWinner(song: SongVoteGroup) {
    this.votesByGroup.set(song.groupKey, {
      ...song,
      voteCount: (song.voteCount || 0) + 999,
      lastVotedAt: Date.now(),
    });
    this.concludeRound();
  }

  public destroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.stateChangeListeners.clear();
    this.commentListeners.clear();
  }
}

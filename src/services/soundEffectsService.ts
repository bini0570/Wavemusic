/**
 * WAVE Web Audio API Sound Effects Engine:
 * - 0ms latency, synthesized audio cues.
 * - Works offline on iOS Safari & Android Chrome without external MP3 files.
 * - 5-Second Countdown Ticks with ascending pitch.
 * - Winner Celebration Fanfare & Chime.
 */

class SoundEffectsService {
  private ctx: AudioContext | null = null;
  private isMuted = false;
  private volume = 0.8;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  /**
   * Plays a crisp digital/wooden countdown tick (seconds 5 to 1)
   */
  public playTick(secondsRemaining: number) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Pitch rises as the countdown reaches 1
      const baseFreq = 600 + (5 - Math.max(1, secondsRemaining)) * 120; // 600Hz up to 1080Hz
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);

      // Snappy decay envelope (80ms duration)
      const now = ctx.currentTime;
      const vol = this.volume * 0.45;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }

  /**
   * Plays an energetic multi-tone celebratory fanfare when the winner is crowned
   */
  public playWinnerFanfare() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Celebratory Major Triad Chords: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz)
      const notes = [523.25, 659.25, 783.99, 1046.5];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = idx === notes.length - 1 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        const noteStart = now + idx * 0.08;
        const noteEnd = noteStart + 0.7;
        const vol = this.volume * 0.35;

        gain.gain.setValueAtTime(0, noteStart);
        gain.gain.linearRampToValueAtTime(vol, noteStart + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteEnd);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteEnd + 0.05);
      });
    } catch {}
  }
}

export const soundEffects = new SoundEffectsService();

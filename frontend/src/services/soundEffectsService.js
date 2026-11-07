/**
 * WAVE Web Audio API Sound Effects Engine:
 * - 0ms latency, synthesized audio cues.
 * - Works offline on iOS Safari & Android Chrome without external MP3 files.
 * - 5-Second Countdown Ticks with ascending pitch.
 * - Winner Celebration Fanfare & Chime.
 */

class SoundEffectsService {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.volume = 0.8;
  }

  getContext() {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  setMuted(muted) {
    this.isMuted = muted;
  }

  playTick(secondsRemaining) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const baseFreq = 600 + (5 - Math.max(1, secondsRemaining)) * 120;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);

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

  playWinnerFanfare() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
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
        osc.stop(noteEnd);
      });
    } catch {}
  }
}

export const soundEffects = new SoundEffectsService();

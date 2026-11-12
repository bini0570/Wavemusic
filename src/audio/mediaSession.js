/**
 * MediaSession API Integration for Android Notification Bar & Background Audio
 * Displays native Android media controls in notification drawer and lock screen.
 */

export class MediaSessionController {
  constructor() {
    this.handlers = {
      onPlay: null,
      onPause: null,
      onNext: null,
      onPrev: null,
      onSeek: null,
    };
    this.isSupported = typeof navigator !== 'undefined' && 'mediaSession' in navigator;
    this.initActionHandlers();
  }

  setHandlers({ onPlay, onPause, onNext, onPrev, onSeek }) {
    this.handlers = { onPlay, onPause, onNext, onPrev, onSeek };
  }

  initActionHandlers() {
    if (!this.isSupported) return;

    const actionMap = [
      ['play', () => this.handlers.onPlay?.()],
      ['pause', () => this.handlers.onPause?.()],
      ['previoustrack', () => this.handlers.onPrev?.()],
      ['nexttrack', () => this.handlers.onNext?.()],
      ['seekto', (details) => {
        if (details.seekTime !== undefined) {
          this.handlers.onSeek?.(details.seekTime);
        }
      }],
      ['seekbackward', (details) => {
        const offset = details.seekOffset || 10;
        this.handlers.onSeekOffset?.(-offset);
      }],
      ['seekforward', (details) => {
        const offset = details.seekOffset || 10;
        this.handlers.onSeekOffset?.(offset);
      }],
    ];

    actionMap.forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (err) {
        // Not all browsers support all action types
      }
    });
  }

  updateMetadata(track) {
    if (!this.isSupported || !track) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title || 'Wave Music',
        artist: track.artist || 'Unknown Artist',
        album: track.album || 'Wave Music Offline',
        artwork: [
          { src: '/icon.svg', sizes: '96x96', type: 'image/svg+xml' },
          { src: '/icon.svg', sizes: '128x128', type: 'image/svg+xml' },
          { src: '/icon.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: '/icon.svg', sizes: '512x512', type: 'image/svg+xml' },
        ],
      });
    } catch (err) {
      console.warn('Failed to set MediaMetadata:', err);
    }
  }

  setPlaybackState(isPlaying) {
    if (!this.isSupported) return;
    try {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    } catch {}
  }

  updatePositionState({ duration = 0, playbackRate = 1.0, position = 0 }) {
    if (!this.isSupported || !('setPositionState' in navigator.mediaSession)) return;

    if (duration > 0 && position >= 0 && position <= duration) {
      try {
        navigator.mediaSession.setPositionState({
          duration: Math.max(0, duration),
          playbackRate: Math.max(0.25, Math.min(2.0, playbackRate)),
          position: Math.max(0, Math.min(duration, position)),
        });
      } catch (err) {
        // Ignored if out of bounds during seeking
      }
    }
  }
}

export const mediaSessionController = new MediaSessionController();

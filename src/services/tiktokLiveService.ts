import { TikTokComment } from '../types';

export interface TikTokStatusEvent {
  connected: boolean;
  channel: string;
  roomId?: string;
  message?: string;
}

export type TikTokCommentCallback = (comment: TikTokComment) => void;
export type TikTokStatusCallback = (status: TikTokStatusEvent) => void;
export type TikTokErrorCallback = (error: string) => void;

class TikTokLiveService {
  private socket: WebSocket | null = null;
  private commentListeners: Set<TikTokCommentCallback> = new Set();
  private statusListeners: Set<TikTokStatusCallback> = new Set();
  private errorListeners: Set<TikTokErrorCallback> = new Set();
  private isConnected = false;
  private currentChannel = '';
  private reconnectTimer: number | null = null;

  constructor() {
    this.initWebSocket();
  }

  private initWebSocket() {
    if (typeof window === 'undefined') return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('[TikTok Service] WebSocket connected to backend');
        if (this.reconnectTimer) {
          window.clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'tiktok_comment' && data.comment) {
            this.commentListeners.forEach((cb) => cb(data.comment));
          } else if (data.type === 'tiktok_status') {
            this.isConnected = Boolean(data.connected);
            if (data.channel) this.currentChannel = data.channel;
            this.statusListeners.forEach((cb) =>
              cb({
                connected: this.isConnected,
                channel: this.currentChannel,
                roomId: data.roomId,
                message: data.message,
              })
            );
          } else if (data.type === 'tiktok_error') {
            this.errorListeners.forEach((cb) => cb(data.message || 'TikTok connection error'));
          }
        } catch (err) {
          console.warn('[TikTok Service] Failed to parse message', err);
        }
      };

      this.socket.onclose = () => {
        console.log('[TikTok Service] WebSocket disconnected, reconnecting in 3s...');
        this.socket = null;
        if (!this.reconnectTimer) {
          this.reconnectTimer = window.setTimeout(() => this.initWebSocket(), 3000);
        }
      };

      this.socket.onerror = () => {
        // Handled by onclose
      };
    } catch (err) {
      console.warn('[TikTok Service] Could not initialize WebSocket:', err);
      if (!this.reconnectTimer) {
        this.reconnectTimer = window.setTimeout(() => this.initWebSocket(), 3000);
      }
    }
  }

  public connect(channel: string) {
    const cleanChannel = channel.startsWith('@') ? channel : `@${channel}`;
    this.currentChannel = cleanChannel;

    // Send via WebSocket if open
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          action: 'connect',
          channel: cleanChannel,
        })
      );
    } else {
      // Fallback to REST endpoint
      fetch('/api/tiktok/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: cleanChannel }),
      }).catch((err) => {
        console.warn('REST connect fallback failed:', err);
      });
    }
  }

  public disconnect() {
    this.isConnected = false;
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ action: 'disconnect' }));
    } else {
      fetch('/api/tiktok/disconnect', { method: 'POST' }).catch(() => {});
    }
  }

  public onComment(callback: TikTokCommentCallback) {
    this.commentListeners.add(callback);
    return () => this.commentListeners.delete(callback);
  }

  public onStatus(callback: TikTokStatusCallback) {
    this.statusListeners.add(callback);
    callback({
      connected: this.isConnected,
      channel: this.currentChannel,
    });
    return () => this.statusListeners.delete(callback);
  }

  public onError(callback: TikTokErrorCallback) {
    this.errorListeners.add(callback);
    return () => this.errorListeners.delete(callback);
  }

  public getChannel() {
    return this.currentChannel;
  }

  public getIsConnected() {
    return this.isConnected;
  }
}

export const tiktokLiveService = new TikTokLiveService();

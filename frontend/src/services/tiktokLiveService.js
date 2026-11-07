class TikTokLiveService {
  constructor() {
    this.socket = null;
    this.commentListeners = new Set();
    this.statusListeners = new Set();
    this.errorListeners = new Set();
    this.isConnected = false;
    this.currentChannel = '';
    this.reconnectTimer = null;

    this.initWebSocket();
  }

  initWebSocket() {
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

  connect(channel, sessionId) {
    const cleanChannel = channel.startsWith('@') ? channel : `@${channel}`;
    this.currentChannel = cleanChannel;

    // Send via WebSocket if open
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          action: 'connect',
          channel: cleanChannel,
          sessionId,
        })
      );
    } else {
      // Fallback to REST endpoint
      fetch('/api/tiktok/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: cleanChannel, sessionId }),
      }).catch((err) => {
        console.warn('REST connect fallback failed:', err);
      });
    }
  }

  disconnect() {
    this.isConnected = false;
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ action: 'disconnect' }));
    } else {
      fetch('/api/tiktok/disconnect', { method: 'POST' }).catch(() => {});
    }
  }

  onComment(callback) {
    this.commentListeners.add(callback);
    return () => this.commentListeners.delete(callback);
  }

  onStatus(callback) {
    this.statusListeners.add(callback);
    callback({
      connected: this.isConnected,
      channel: this.currentChannel,
    });
    return () => this.statusListeners.delete(callback);
  }

  onError(callback) {
    this.errorListeners.add(callback);
    return () => this.errorListeners.delete(callback);
  }

  getChannel() {
    return this.currentChannel;
  }

  getIsConnected() {
    return this.isConnected;
  }
}

export const tiktokLiveService = new TikTokLiveService();

import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createRequire } from 'module';
import fs from 'fs';

dotenv.config();

const require = createRequire(import.meta.url);

let WebcastPushConnection = null;
try {
  const tlc = require('tiktok-live-connector');
  WebcastPushConnection =
    tlc.WebcastPushConnection || tlc.default?.WebcastPushConnection || tlc.default || tlc;
} catch (err) {
  console.warn('[TikTok LIVE] Could not load WebcastPushConnection via require:', err);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.use(express.json());

let currentTikTokConnection = null;
let currentChannel = '';
let isTikTokConnected = false;

// Broadcast payload to all connected frontend clients
function broadcast(data) {
  const message = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Connect to TikTok LIVE
async function connectToTikTok(uniqueId, sessionId) {
  const cleanId = uniqueId.replace(/^@/, '').trim();
  if (!cleanId) {
    return { success: false, message: 'Invalid TikTok username' };
  }

  if (!WebcastPushConnection) {
    return { success: false, message: 'TikTok Live connector is not initialized' };
  }

  // Disconnect previous session if active
  if (currentTikTokConnection) {
    try {
      currentTikTokConnection.disconnect();
    } catch {}
    currentTikTokConnection = null;
    isTikTokConnected = false;
  }

  currentChannel = `@${cleanId}`;

  try {
    const connOptions = {
      processInitialData: false,
      enableExtendedGiftInfo: false,
      enableWebsocketUpgrade: true,
      requestPollingIntervalMs: 1500,
      clientParams: {
        app_language: 'en-US',
        device_platform: 'web',
      },
    };

    if (sessionId && sessionId.trim()) {
      connOptions.sessionId = sessionId.trim();
    }

    const connection = new WebcastPushConnection(cleanId, connOptions);

    connection.on('connected', (state) => {
      console.log(`[TikTok LIVE] Connected to @${cleanId} (Room ID: ${state.roomId})`);
      isTikTokConnected = true;
      broadcast({
        type: 'tiktok_status',
        connected: true,
        channel: currentChannel,
        roomId: state.roomId,
        message: `Successfully connected to @${cleanId}'s LIVE stream!`,
      });
    });

    connection.on('disconnected', () => {
      console.log(`[TikTok LIVE] Disconnected from @${cleanId}`);
      isTikTokConnected = false;
      broadcast({
        type: 'tiktok_status',
        connected: false,
        channel: currentChannel,
        message: `Disconnected from @${cleanId}`,
      });
    });

    connection.on('streamEnd', () => {
      console.log(`[TikTok LIVE] Stream ended for @${cleanId}`);
      isTikTokConnected = false;
      broadcast({
        type: 'tiktok_status',
        connected: false,
        channel: currentChannel,
        message: `Stream ended for @${cleanId}`,
      });
    });

    connection.on('chat', (data) => {
      const chatComment = {
        id: data.msgId || `tt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        username: data.uniqueId || 'viewer',
        displayName: data.nickname || data.uniqueId || 'Viewer',
        avatar:
          data.profilePictureUrl ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
        text: data.comment || '',
        timestamp: Date.now(),
      };

      broadcast({
        type: 'tiktok_comment',
        comment: chatComment,
      });
    });

    connection.on('error', (err) => {
      console.warn(`[TikTok LIVE] Connection error for @${cleanId}:`, err?.message || err);
      let friendlyMsg = err?.message || 'Error communicating with TikTok LIVE';
      if (friendlyMsg.includes('LIVE_NOT_FOUND') || friendlyMsg.includes('offline') || friendlyMsg.includes('not found')) {
        friendlyMsg = `@${cleanId} is currently not broadcasting LIVE on TikTok. Start your stream first!`;
      }
      broadcast({
        type: 'tiktok_error',
        message: friendlyMsg,
      });
    });

    currentTikTokConnection = connection;
    await connection.connect();
    return { success: true, message: `Connecting to @${cleanId}...` };
  } catch (err) {
    console.error(`[TikTok LIVE] Failed to connect to @${cleanId}:`, err?.message || err);
    isTikTokConnected = false;
    currentTikTokConnection = null;
    let friendlyMsg = err?.message || 'Failed to connect to TikTok LIVE';
    if (friendlyMsg.includes('LIVE_NOT_FOUND') || friendlyMsg.includes('offline') || friendlyMsg.includes('not found')) {
      friendlyMsg = `@${cleanId} is currently offline. Please start your TikTok LIVE stream before connecting!`;
    }
    return { success: false, message: friendlyMsg };
  }
}

// Disconnect from TikTok LIVE
function disconnectTikTok() {
  if (currentTikTokConnection) {
    try {
      currentTikTokConnection.disconnect();
    } catch {}
    currentTikTokConnection = null;
  }
  isTikTokConnected = false;
  broadcast({
    type: 'tiktok_status',
    connected: false,
    channel: currentChannel,
    message: 'Disconnected',
  });
}

// REST Endpoints
app.post('/api/tiktok/connect', async (req, res) => {
  const { channel, sessionId } = req.body;
  if (!channel) {
    return res.status(400).json({ error: 'Username is required' });
  }
  const result = await connectToTikTok(channel, sessionId);
  return res.json(result);
});

app.post('/api/tiktok/disconnect', (req, res) => {
  disconnectTikTok();
  return res.json({ success: true, message: 'Disconnected' });
});

app.get('/api/tiktok/status', (req, res) => {
  return res.json({
    connected: isTikTokConnected,
    channel: currentChannel,
  });
});

// YouTube & Audio Resolvers
app.get('/api/resolve-video', async (req, res) => {
  try {
    const q = req.query.query || '';
    if (!q.trim()) {
      return res.status(400).json({ error: 'Missing query' });
    }
    const cleanQuery = q.replace(/[\(\)\[\]]/g, ' ') + ' audio';
    const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanQuery)}`;
    const response = await fetch(ytUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    const text = await response.text();
    const match = text.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
    return res.json({
      videoId: match ? match[1] : null,
    });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Resolution failed' });
  }
});

// Musixmatch & Lyrics Resolvers
app.get('/api/lyrics/musixmatch', async (req, res) => {
  try {
    const artist = (req.query.artist || '').trim();
    const title = (req.query.title || '').trim();

    if (!artist || !title) {
      return res.status(400).json({ error: 'Missing artist or title' });
    }

    const cleanA = artist.replace(/\(.*?\)/g, '').trim();
    const cleanT = title.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').trim();

    const slugA = cleanA.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
    const slugT = cleanT.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
    const directUrl = `https://www.musixmatch.com/lyrics/${encodeURIComponent(slugA)}/${encodeURIComponent(slugT)}`;

    const directRes = await fetch(directUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (directRes.ok) {
      const html = await directRes.text();
      const m = html.match(/"lyrics":\{"body":"([\s\S]*?)(?<!\\)"/);
      if (m) {
        let parsedText = m[1];
        try {
          parsedText = JSON.parse(`"${m[1]}"`);
        } catch {}
        return res.json({ source: 'Musixmatch', lyrics: parsedText });
      }
    }

    return res.status(404).json({ error: 'Not found on Musixmatch' });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Musixmatch lookup failed' });
  }
});

// Lyrics.ovh Fallback
app.get('/api/lyrics/ovh', async (req, res) => {
  try {
    const artist = (req.query.artist || '').trim();
    const title = (req.query.title || '').trim();

    if (!artist || !title) {
      return res.status(400).json({ error: 'Missing artist or title' });
    }

    const cleanA = artist.replace(/\(.*?\)/g, '').trim();
    const cleanT = title.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').trim();

    const ovhUrl = `https://api.lyrics.ovh/v1/${encodeURIComponent(cleanA)}/${encodeURIComponent(cleanT)}`;
    const ovhRes = await fetch(ovhUrl);

    if (ovhRes.ok) {
      const data = await ovhRes.json();
      if (data && data.lyrics && data.lyrics.trim().length > 10) {
        return res.json({ source: 'Lyrics.ovh', lyrics: data.lyrics });
      }
    }

    return res.status(404).json({ error: 'Not found on Lyrics.ovh' });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Lyrics.ovh failed' });
  }
});

// WebSocket Connection Management
wss.on('connection', (ws) => {
  ws.send(
    JSON.stringify({
      type: 'tiktok_status',
      connected: isTikTokConnected,
      channel: currentChannel,
    })
  );

  ws.on('message', async (raw) => {
    try {
      const data = JSON.parse(raw.toString());
      if (data.action === 'connect' && data.channel) {
        await connectToTikTok(data.channel, data.sessionId);
      } else if (data.action === 'disconnect') {
        disconnectTikTok();
      }
    } catch {}
  });
});

// Proxy iTunes & LRCLib
app.get('/api/itunes/*', async (req, res) => {
  try {
    const itunesPath = req.url.replace(/^\/api\/itunes/, '');
    const itunesUrl = `https://itunes.apple.com${itunesPath}`;
    const itunesRes = await fetch(itunesUrl);
    const data = await itunesRes.text();
    res.setHeader('Content-Type', itunesRes.headers.get('content-type') || 'application/json');
    res.send(data);
  } catch (err) {
    res.status(500).json({ error: err?.message || 'iTunes proxy failed' });
  }
});

app.get('/api/lrclib/*', async (req, res) => {
  try {
    const lrclibPath = req.url.replace(/^\/api\/lrclib/, '');
    const lrclibUrl = `https://lrclib.net${lrclibPath}`;
    const lrclibRes = await fetch(lrclibUrl);
    const data = await lrclibRes.text();
    res.setHeader('Content-Type', lrclibRes.headers.get('content-type') || 'application/json');
    res.send(data);
  } catch (err) {
    res.status(500).json({ error: err?.message || 'LRCLib proxy failed' });
  }
});

// Start Server with Vite Dev or Static Production
async function start() {
  const distPath = path.join(projectRoot, 'dist');
  const indexPath = path.join(distPath, 'index.html');
  const hasBuiltDist = fs.existsSync(indexPath);

  if (hasBuiltDist) {
    console.log('[WAVE Server] Serving pre-built static bundle from dist/');
    app.use(
      express.static(distPath, {
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.html') || filePath.endsWith('.js') || filePath.endsWith('.json')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          }
        },
      })
    );
    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(indexPath);
    });
  } else {
    console.log('[WAVE Server] dist/index.html not found, mounting on-the-fly Vite bundler...');
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        root: projectRoot,
        server: {
          middlewareMode: true,
          allowedHosts: true,
        },
        appType: 'spa',
      });
      app.use(vite.middlewares);

      app.use('*', async (req, res, next) => {
        try {
          const rawHtml = fs.readFileSync(path.resolve(projectRoot, 'index.html'), 'utf-8');
          const transformed = await vite.transformIndexHtml(req.originalUrl, rawHtml);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(transformed);
        } catch (e) {
          next(e);
        }
      });
    } catch (err) {
      console.warn('[WAVE Server] Could not mount Vite middleware, falling back to static dist:', err);
      app.use(express.static(distPath));
    }
  }

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`[WAVE Server] Running on http://localhost:${PORT}`);
  });
}

start();

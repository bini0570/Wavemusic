import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

function audioAndLyricsResolverPlugin(): Plugin {
  return {
    name: 'audio-and-lyrics-resolver-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // 1. YouTube Video Resolver
        if (req.url && req.url.startsWith('/api/resolve-video')) {
          try {
            const url = new URL(req.url, 'http://localhost:3000');
            const q = url.searchParams.get('query') || '';
            if (!q.trim()) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Missing query' }));
              return;
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
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                videoId: match ? match[1] : null,
              })
            );
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err?.message || 'Resolution failed' }));
          }
          return;
        }

        // 2. Musixmatch Lyrics Resolver
        if (req.url && req.url.startsWith('/api/lyrics/musixmatch')) {
          try {
            const url = new URL(req.url, 'http://localhost:3000');
            const artist = (url.searchParams.get('artist') || '').trim();
            const title = (url.searchParams.get('title') || '').trim();

            if (!artist || !title) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Missing artist or title' }));
              return;
            }

            const cleanA = artist.replace(/\(.*?\)/g, '').trim();
            const cleanT = title.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').trim();

            // Strategy A: Direct Musixmatch slug
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
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ source: 'Musixmatch', lyrics: parsedText }));
                return;
              }
            }

            // Strategy B: Fallback search via DuckDuckGo for exact Musixmatch link
            const ddgUrl = `https://html.duckduckgo.com/html/?q=site:musixmatch.com/lyrics+${encodeURIComponent(`${cleanA} ${cleanT}`)}`;
            const ddgRes = await fetch(ddgUrl, {
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
            });

            if (ddgRes.ok) {
              const ddgHtml = await ddgRes.text();
              const linkMatch = ddgHtml.match(/musixmatch\.com\/lyrics\/([a-zA-Z0-9\-_%]+)\/([a-zA-Z0-9\-_%]+)/);
              if (linkMatch) {
                const targetMxmUrl = `https://www.musixmatch.com/lyrics/${linkMatch[1]}/${linkMatch[2]}`;
                const mxmRes = await fetch(targetMxmUrl, {
                  headers: {
                    'User-Agent':
                      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                  },
                });
                if (mxmRes.ok) {
                  const mxmHtml = await mxmRes.text();
                  const m = mxmHtml.match(/"lyrics":\{"body":"([\s\S]*?)(?<!\\)"/);
                  if (m) {
                    let parsedText = m[1];
                    try {
                      parsedText = JSON.parse(`"${m[1]}"`);
                    } catch {}
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ source: 'Musixmatch', lyrics: parsedText }));
                    return;
                  }
                }
              }
            }

            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Not found on Musixmatch' }));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err?.message || 'Musixmatch failed' }));
          }
          return;
        }

        // 3. Lyrics.ovh Resolver
        if (req.url && req.url.startsWith('/api/lyrics/ovh')) {
          try {
            const url = new URL(req.url, 'http://localhost:3000');
            const artist = (url.searchParams.get('artist') || '').trim();
            const title = (url.searchParams.get('title') || '').trim();

            if (!artist || !title) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Missing artist or title' }));
              return;
            }

            const cleanA = artist.replace(/\(.*?\)/g, '').trim();
            const cleanT = title.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').trim();

            const ovhUrl = `https://api.lyrics.ovh/v1/${encodeURIComponent(cleanA)}/${encodeURIComponent(cleanT)}`;
            const ovhRes = await fetch(ovhUrl);

            if (ovhRes.ok) {
              const data = await ovhRes.json();
              if (data && data.lyrics && data.lyrics.trim().length > 10) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ source: 'Lyrics.ovh', lyrics: data.lyrics }));
                return;
              }
            }

            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Not found on Lyrics.ovh' }));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err?.message || 'Lyrics.ovh failed' }));
          }
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      audioAndLyricsResolverPlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg'],
        manifest: {
          id: '/',
          name: 'የሙዚቃ ምርጫ',
          short_name: 'የሙዚቃ ምርጫ',
          description: 'Explore Ethiopian and global music hits with studio audio and real-time synchronized lyrics.',
          theme_color: '#0d0d16',
          background_color: '#0d0d16',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api/itunes': {
          target: 'https://itunes.apple.com',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/itunes/, ''),
        },
        '/api/lrclib': {
          target: 'https://lrclib.net',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/lrclib/, ''),
        },
      },
    },
  };
});

/**
 * Centralized API & WebSocket Endpoint Resolver
 * Supports split deployment:
 * - Frontend hosted on Vercel
 * - Backend hosted on Railway (e.g., https://your-railway-app.up.railway.app)
 *
 * Configuration:
 * 1. Environment Variable: Set `VITE_BACKEND_URL` in Vercel project settings.
 * 2. Fallback: Uses `localStorage.getItem('wave_backend_url')` or defaults to current origin.
 */

export function getBackendUrl() {
  // 1. Vite environment variable (set in Vercel project settings or .env)
  const envUrl = import.meta.env.VITE_BACKEND_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // 2. Client runtime override stored in localStorage
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('wave_backend_url');
      if (stored && stored.trim()) {
        return stored.trim().replace(/\/+$/, '');
      }
    } catch {}
  }

  // 3. Same-origin fallback for local dev / unified deployments
  return '';
}

export function getWebSocketUrl() {
  const envWs = import.meta.env.VITE_WS_URL;
  if (envWs && typeof envWs === 'string' && envWs.trim()) {
    return envWs.trim();
  }

  const backend = getBackendUrl();
  if (backend) {
    const wsProto = backend.startsWith('https:') ? 'wss:' : 'ws:';
    const host = backend.replace(/^https?:\/\//, '');
    return `${wsProto}//${host}/ws`;
  }

  if (typeof window !== 'undefined') {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${window.location.host}/ws`;
  }

  return 'ws://localhost:3000/ws';
}

export function apiUrl(endpoint) {
  const base = getBackendUrl();
  const clean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${clean}`;
}

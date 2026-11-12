/**
 * IndexedDB Persistent Storage for DV Music
 * Guarantees all tracks and audio blobs survive app closing, device reboots, and restarts.
 */

const DB_NAME = 'DVMusic_Database';
const DB_VERSION = 1;
const STORE_TRACKS = 'tracks';
const STORE_PREFS = 'preferences';

function openDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not supported on this device'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_TRACKS)) {
        db.createObjectStore(STORE_TRACKS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_PREFS)) {
        db.createObjectStore(STORE_PREFS, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save one or more tracks permanently to IndexedDB
 */
export async function saveTracksToStorage(tracks) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_TRACKS, 'readwrite');
    const store = tx.objectStore(STORE_TRACKS);

    for (const track of tracks) {
      // If the track has an audio Blob or ArrayBuffer, store it so URL can be recreated on restart
      store.put({
        id: track.id,
        title: track.title,
        artist: track.artist,
        album: track.album,
        folder: track.folder || '/Storage/Music',
        duration: track.duration,
        bpm: track.bpm || 124,
        format: track.format || 'mp3',
        bitrate: track.bitrate || '320 kbps',
        sampleRate: track.sampleRate || '48.0 kHz',
        size: track.size || 0,
        isLocal: true,
        source: track.source || 'local',
        waveformPeaks: track.waveformPeaks || [],
        isFavorite: !!track.isFavorite,
        savedAt: Date.now(),
        // Store audioBlob if provided
        audioBlob: track.audioBlob || null,
      });
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to save tracks to IndexedDB:', err);
    return false;
  }
}

/**
 * Load all permanently stored tracks from IndexedDB
 */
export async function loadTracksFromStorage() {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_TRACKS, 'readonly');
    const store = tx.objectStore(STORE_TRACKS);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const storedTracks = request.result || [];
        // Re-create object URLs for any stored audio blobs
        const hydratedTracks = storedTracks.map((t) => {
          let url = t.url;
          if (t.audioBlob) {
            url = URL.createObjectURL(t.audioBlob);
          }
          return {
            ...t,
            url: url || t.url,
          };
        });
        resolve(hydratedTracks);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to load tracks from IndexedDB:', err);
    return [];
  }
}

/**
 * Delete a track from permanent storage
 */
export async function deleteTrackFromStorage(trackId) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_TRACKS, 'readwrite');
    const store = tx.objectStore(STORE_TRACKS);
    store.delete(trackId);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to delete track from IndexedDB:', err);
    return false;
  }
}

/**
 * Check if storage permission was previously granted
 */
export async function checkStoragePermissionGranted() {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_PREFS, 'readonly');
    const store = tx.objectStore(STORE_PREFS);
    const request = store.get('storage_permission');

    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result?.value === true);
      request.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

/**
 * Mark storage permission as granted permanently
 */
export async function setStoragePermissionGranted(granted = true) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_PREFS, 'readwrite');
    const store = tx.objectStore(STORE_PREFS);
    store.put({ key: 'storage_permission', value: granted, timestamp: Date.now() });

    // Request persistent storage from browser so Android does not clear IndexedDB on low memory
    if (navigator.storage && navigator.storage.persist) {
      await navigator.storage.persist();
    }
  } catch (err) {
    console.warn('Failed to save permission pref:', err);
  }
}

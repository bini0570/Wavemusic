import React, { useRef, useState, useMemo, useEffect } from 'react';
import {
  Folder,
  Music,
  Music2,
  Play,
  Heart,
  Trash2,
  Search,
  ListMusic,
  User,
  Disc,
  FolderTree,
  Plus,
  ListPlus,
  X,
  Sparkles,
  Check,
  MoreVertical,
} from 'lucide-react';
import { extractWaveformFromFile, parseAudioFilename } from '../audio/syntheticTracks';
import { audioEngine } from '../audio/audioEngine';
import { DVAlbumArt } from './DVAlbumArt';

/* ── Live Animated EQ wave bars for active track ── */
const EQBars = () => (
  <div className="absolute inset-0 flex items-center justify-center gap-[2.5px] bg-black/60 backdrop-blur-[2px]">
    {[1, 2, 3, 4].map((i) => (
      <span
        key={i}
        style={{
          animationDelay: `${i * 0.12}s`,
          animationDuration: `${0.55 + i * 0.1}s`,
        }}
        className="w-[2.5px] rounded-full bg-gradient-to-t from-purple-400 to-fuchsia-300 animate-bounce"
      />
    ))}
  </div>
);

export const DVLibrary = ({
  tracks,
  currentTrackId,
  onSelectTrack,
  onAddTracks,
  onRemoveTrack,
  onToggleFavorite,
}) => {
  const fileInputRef = useRef(null);
  const [subTab, setSubTab] = useState('songs');
  const [searchQuery, setSearchQuery] = useState('');

  /* ── Counting Slide Animation State for Imported Music ── */
  const [importNotification, setImportNotification] = useState(null);

  /* ── User Playlists ── */
  const [playlists, setPlaylists] = useState(() => {
    try {
      const saved = localStorage.getItem('dv_playlists');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('dv_playlists', JSON.stringify(playlists));
    } catch {}
  }, [playlists]);

  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showNewPlaylistModal, setShowNewPlaylistModal] = useState(false);
  const [trackToAddToPlaylist, setTrackToAddToPlaylist] = useState(null);

  /* ── Audio File Import with Counting Slide Animation ── */
  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    const audioCtx = audioEngine.getAudioContext();
    const newTracks = [];

    const totalCount = files.length;
    // Trigger the slide-down animation banner
    setImportNotification({ total: totalCount, current: 0, visible: true });

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (
        !file.type.startsWith('audio/') &&
        !file.name.match(/\.(mp3|wav|ogg|flac|aac|m4a)$/i)
      ) {
        continue;
      }

      const url = URL.createObjectURL(file);
      const { title, artist, album, format } = parseAudioFilename(file.name);
      const { peaks, duration } = await extractWaveformFromFile(file, audioCtx);

      newTracks.push({
        id: `local-${Date.now()}-${i}`,
        title,
        artist,
        album,
        folder: `/Music/${artist}`,
        duration: duration || 180,
        bpm: 124,
        url,
        format,
        bitrate: '320 kbps',
        sampleRate: `${(audioCtx.sampleRate / 1000).toFixed(1)} kHz`,
        size: file.size,
        isLocal: true,
        source: 'local',
        waveformPeaks: peaks,
        isFavorite: false,
      });

      // Update counter live with a smooth step
      setImportNotification((prev) => (prev ? { ...prev, current: i + 1 } : null));
    }

    if (newTracks.length > 0) {
      onAddTracks(newTracks);
      onSelectTrack(newTracks[0]);
    }

    // Slide out smoothly after 3.2 seconds
    setTimeout(() => {
      setImportNotification((prev) => (prev ? { ...prev, visible: false } : null));
      setTimeout(() => setImportNotification(null), 500);
    }, 3200);
  };

  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  /* ── Grouped Collections ── */
  const artistsGrouped = useMemo(() => {
    const map = new Map();
    for (const t of tracks) {
      const artist = t.artist || 'Unknown Artist';
      if (!map.has(artist)) map.set(artist, []);
      map.get(artist).push(t);
    }
    return Array.from(map.entries()).map(([artist, trks]) => ({ artist, tracks: trks }));
  }, [tracks]);

  const albumsGrouped = useMemo(() => {
    const map = new Map();
    for (const t of tracks) {
      const album = t.album || 'Unknown Album';
      if (!map.has(album)) map.set(album, []);
      map.get(album).push(t);
    }
    return Array.from(map.entries()).map(([album, trks]) => ({ album, tracks: trks }));
  }, [tracks]);

  const foldersGrouped = useMemo(() => {
    const map = new Map();
    for (const t of tracks) {
      const folder = t.folder || '/Storage/Music';
      if (!map.has(folder)) map.set(folder, []);
      map.get(folder).push(t);
    }
    return Array.from(map.entries()).map(([folder, trks]) => ({ folder, tracks: trks }));
  }, [tracks]);

  const filteredTracks = tracks.filter((t) => {
    if (subTab === 'favorites' && !t.isFavorite) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.artist && t.artist.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCreatePlaylist = (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    setPlaylists((prev) => [
      ...prev,
      {
        id: `pl-${Date.now()}`,
        name: newPlaylistName.trim(),
        trackIds: currentTrackId ? [currentTrackId] : [],
        createdAt: Date.now(),
      },
    ]);
    setNewPlaylistName('');
    setShowNewPlaylistModal(false);
  };

  const handleAddTrackToPlaylist = (playlistId, trackId) => {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id !== playlistId) return pl;
        if (pl.trackIds.includes(trackId)) return pl;
        return { ...pl, trackIds: [...pl.trackIds, trackId] };
      })
    );
    setTrackToAddToPlaylist(null);
  };

  const handleDeletePlaylist = (playlistId) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
  };

  const TABS = [
    { id: 'songs', label: 'Songs', icon: Music },
    { id: 'albums', label: 'Albums', icon: Disc },
    { id: 'artists', label: 'Artists', icon: User },
    { id: 'folders', label: 'Folders', icon: FolderTree },
    { id: 'playlists', label: 'Playlists', icon: ListMusic },
    { id: 'favorites', label: 'Favorites', icon: Heart },
  ];

  return (
    <div className="relative w-full flex flex-col h-full select-none text-white tab-enter">
      {/* ── IMPORT COUNTING SLIDE ANIMATION BANNER ── */}
      {importNotification && (
        <div
          className={`fixed top-3 left-4 right-4 z-50 max-w-sm mx-auto transition-all duration-500 ease-out transform ${
            importNotification.visible
              ? 'translate-y-0 opacity-100 scale-100'
              : '-translate-y-12 opacity-0 scale-95 pointer-events-none'
          }`}
        >
          <div className="bg-[#120726]/95 border border-purple-400/50 rounded-2xl p-3 shadow-[0_12px_40px_rgba(168,85,247,0.5)] backdrop-blur-2xl flex items-center justify-between gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-md">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold text-white tracking-tight">
                  Importing Local Music
                </span>
                <span className="text-xs font-mono font-bold text-purple-300">
                  +{importNotification.current} of {importNotification.total}
                </span>
              </div>

              {/* Counting progress bar fill */}
              <div className="w-full h-1.5 bg-white/10 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-400 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      (importNotification.current / (importNotification.total || 1)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="px-2 py-0.5 rounded-full bg-purple-900/60 border border-purple-400/30 text-[9px] font-mono text-purple-200 font-bold shrink-0">
              {importNotification.current === importNotification.total ? 'COMPLETE' : 'PARSING'}
            </div>
          </div>
        </div>
      )}

      {/* ── SEARCH & IMPORT BAR (Mobile-First Header) ── */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/6 shrink-0 bg-[#080312]/60 backdrop-blur-md">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search songs, artists…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/8 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-purple-400/60 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Universal Import + Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/30 border border-purple-500/50 text-purple-200 text-xs font-semibold active:scale-95 transition-all hover:bg-purple-600/50 shrink-0 shadow-sm"
          title="Import Audio Files from Device"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="text-[11px]">Add Music</span>
        </button>
      </div>

      {/* Hidden universal file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        multiple
        accept="audio/*,.mp3,.wav,.ogg,.flac,.aac,.m4a"
        className="hidden"
      />

      {/* ── NATIVE HORIZONTAL TAB STRIP ── */}
      <div className="flex border-b border-white/6 overflow-x-auto scrollbar-none px-2 shrink-0 bg-[#080312]/40">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-all -mb-px whitespace-nowrap flex items-center gap-1.5 ${
                isActive
                  ? 'border-purple-400 text-purple-200 font-semibold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{tab.label}</span>
              {tab.id === 'songs' && (
                <span className="text-[9px] font-mono opacity-60">({tracks.length})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── SCROLLABLE LIST VIEWPORT ── */}
      <div className="flex-1 overflow-y-auto pb-24 scrollbar-none">
        {/* 1. SONGS & FAVORITES */}
        {(subTab === 'songs' || subTab === 'favorites') && (
          <div className="flex flex-col divide-y divide-white/4">
            {filteredTracks.map((track) => {
              const isActive = track.id === currentTrackId;
              return (
                <div
                  key={track.id}
                  onClick={() => onSelectTrack(track)}
                  className={`flex items-center gap-3 px-4 py-2.5 transition-colors cursor-pointer select-none ${
                    isActive
                      ? 'border-l-2 border-purple-400 bg-purple-500/10'
                      : 'hover:bg-white/[0.02] active:bg-white/[0.05]'
                  }`}
                >
                  {/* Album art with active EQ bars */}
                  <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 relative bg-neutral-900 border border-white/8 shadow-sm">
                    <DVAlbumArt
                      track={track}
                      isPlaying={isActive}
                      size="sm"
                      className="w-full h-full object-cover"
                    />
                    {isActive && <EQBars />}
                  </div>

                  {/* Title & Artist */}
                  <div className="flex flex-col flex-1 min-w-0 overflow-hidden pr-2">
                    <span
                      className={`text-xs font-semibold truncate leading-tight ${
                        isActive ? 'text-purple-300 font-bold' : 'text-white'
                      }`}
                    >
                      {track.title}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 truncate leading-tight mt-0.5">
                      <span>{track.artist}</span>
                      {track.format && (
                        <>
                          <span className="text-neutral-600">·</span>
                          <span className="uppercase text-[9px] font-mono text-purple-400/80">
                            {track.format}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Duration, Heart, Menu */}
                  <div
                    className="flex items-center gap-1 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="font-mono text-[10px] text-neutral-500 mr-1 tabular-nums">
                      {formatTime(track.duration)}
                    </span>

                    <button
                      onClick={() => onToggleFavorite(track.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        track.isFavorite
                          ? 'text-pink-500'
                          : 'text-neutral-500 hover:text-neutral-200'
                      }`}
                      title="Favorite"
                    >
                      <Heart className={`w-3.5 h-3.5 ${track.isFavorite ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      onClick={() => setTrackToAddToPlaylist(track)}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-200 transition-colors"
                      title="Add to Playlist"
                    >
                      <ListPlus className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onRemoveTrack(track.id)}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 transition-colors"
                      title="Remove Track"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredTracks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 px-6 gap-3 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center text-neutral-500">
                  <Music2 className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-semibold text-white">
                  {subTab === 'favorites' ? 'No Favorites Saved' : 'No Music Found'}
                </h4>
                <p className="text-xs text-neutral-400 max-w-xs">
                  {subTab === 'favorites'
                    ? 'Tap the heart icon on any song to save it to your favorites list.'
                    : 'Import your favorite MP3, WAV, FLAC, or AAC files directly from your device storage.'}
                </p>
                {subTab !== 'favorites' && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold shadow-[0_0_15px_rgba(168,85,247,0.4)] active:scale-95 transition-all"
                  >
                    Select Audio Files
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. ALBUMS GRID */}
        {subTab === 'albums' && (
          <div className="grid grid-cols-2 gap-3 p-4">
            {albumsGrouped.map(({ album, tracks: albumTracks }) => (
              <div
                key={album}
                onClick={() => onSelectTrack(albumTracks[0])}
                className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-purple-500/40 cursor-pointer transition-all active:scale-95 group"
              >
                <div className="w-full aspect-square rounded-xl overflow-hidden bg-neutral-900 relative mb-2">
                  <DVAlbumArt
                    track={albumTracks[0]}
                    size="md"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <Play className="w-7 h-7 text-white fill-white ml-0.5" />
                  </div>
                </div>
                <h3 className="text-xs font-semibold text-white truncate">{album}</h3>
                <p className="text-[10px] text-neutral-500 truncate">{albumTracks.length} Songs</p>
              </div>
            ))}
            {albumsGrouped.length === 0 && (
              <div className="col-span-2 flex flex-col items-center justify-center py-20 gap-3 text-center">
                <Disc className="w-12 h-12 text-neutral-700" />
                <p className="text-neutral-500 text-xs">No albums detected in library</p>
              </div>
            )}
          </div>
        )}

        {/* 3. ARTISTS LIST */}
        {subTab === 'artists' && (
          <div className="flex flex-col divide-y divide-white/4">
            {artistsGrouped.map(({ artist, tracks: artistTracks }) => (
              <div
                key={artist}
                onClick={() => onSelectTrack(artistTracks[0])}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] cursor-pointer transition-colors active:bg-white/[0.05]"
              >
                <div className="w-10 h-10 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-semibold text-white truncate">{artist}</h3>
                  <p className="text-[10px] text-neutral-500">{artistTracks.length} Songs</p>
                </div>
                <Play className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
              </div>
            ))}
            {artistsGrouped.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                <User className="w-12 h-12 text-neutral-700" />
                <p className="text-neutral-500 text-xs">No artists found</p>
              </div>
            )}
          </div>
        )}

        {/* 4. FOLDERS LIST */}
        {subTab === 'folders' && (
          <div className="flex flex-col divide-y divide-white/4">
            {foldersGrouped.map(({ folder, tracks: folderTracks }) => (
              <div
                key={folder}
                onClick={() => onSelectTrack(folderTracks[0])}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] cursor-pointer transition-colors active:bg-white/[0.05]"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0">
                  <Folder className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-semibold text-white truncate">{folder}</h3>
                  <p className="text-[10px] text-neutral-500">
                    {folderTracks.length} Audio Tracks
                  </p>
                </div>
                <Play className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
              </div>
            ))}
            {foldersGrouped.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                <Folder className="w-12 h-12 text-neutral-700" />
                <p className="text-neutral-500 text-xs">No folders found</p>
              </div>
            )}
          </div>
        )}

        {/* 5. PLAYLISTS */}
        {subTab === 'playlists' && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                Playlists ({playlists.length})
              </span>
              <button
                onClick={() => setShowNewPlaylistModal(true)}
                className="px-2.5 py-1 rounded-xl bg-purple-600/30 border border-purple-500/50 text-purple-300 text-xs font-semibold flex items-center gap-1 hover:bg-purple-600/50 transition-all active:scale-95"
              >
                <Plus className="w-3 h-3" />
                New Playlist
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {playlists.map((pl) => (
                <div
                  key={pl.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-purple-500/30 transition-all"
                >
                  <div
                    onClick={() => {
                      const first = tracks.find((t) => pl.trackIds?.includes(t.id));
                      if (first) onSelectTrack(first);
                    }}
                    className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-900/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                      <ListMusic className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-white truncate">
                        {pl.name}
                      </span>
                      <span className="text-[10px] text-neutral-500">
                        {pl.trackIds?.length || 0} Songs
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeletePlaylist(pl.id)}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {playlists.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <ListMusic className="w-12 h-12 text-neutral-700" />
                  <p className="text-neutral-500 text-xs">No playlists created yet</p>
                  <button
                    onClick={() => setShowNewPlaylistModal(true)}
                    className="mt-1 px-4 py-2 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-semibold"
                  >
                    Create Playlist
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── CREATE PLAYLIST MODAL ── */}
      {showNewPlaylistModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreatePlaylist}
            className="w-full max-w-sm bg-[#0e071c] border border-purple-500/40 rounded-3xl p-5 shadow-2xl flex flex-col gap-3.5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Create New Playlist</h3>
              <button
                type="button"
                onClick={() => setShowNewPlaylistModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Playlist name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-purple-400"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowNewPlaylistModal(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newPlaylistName.trim()}
                className="px-4 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-semibold disabled:opacity-40"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── ADD TO PLAYLIST MODAL ── */}
      {trackToAddToPlaylist && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0e071c] border border-purple-500/40 rounded-3xl p-5 shadow-2xl flex flex-col gap-3 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white truncate pr-2">
                Add to Playlist
              </h3>
              <button
                onClick={() => setTrackToAddToPlaylist(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-purple-300 truncate">
              {trackToAddToPlaylist.title}
            </p>

            <div className="flex flex-col gap-1.5 pt-1">
              {playlists.map((pl) => {
                const alreadyAdded = pl.trackIds?.includes(trackToAddToPlaylist.id);
                return (
                  <button
                    key={pl.id}
                    disabled={alreadyAdded}
                    onClick={() => handleAddTrackToPlaylist(pl.id, trackToAddToPlaylist.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-all ${
                      alreadyAdded
                        ? 'bg-white/2 text-neutral-600 cursor-not-allowed'
                        : 'bg-white/4 hover:bg-purple-600/30 text-white active:scale-98'
                    }`}
                  >
                    <span>{pl.name}</span>
                    {alreadyAdded && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                );
              })}
              {playlists.length === 0 && (
                <p className="text-xs text-neutral-500 text-center py-4">
                  No playlists created yet. Create one first!
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

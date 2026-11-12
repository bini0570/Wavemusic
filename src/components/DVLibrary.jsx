import React, { useRef, useState, useMemo, useEffect } from 'react';
import {
  Folder,
  Music,
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
} from 'lucide-react';
import { extractWaveformFromFile, parseAudioFilename } from '../audio/syntheticTracks';
import { audioEngine } from '../audio/audioEngine';
import { DVAlbumArt } from './DVAlbumArt';

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

  // User-created playlists with localStorage persistence
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

  // Handle files selected
  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    const audioCtx = audioEngine.getAudioContext();
    const newTracks = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|ogg|flac|aac|m4a)$/i)) {
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
    }

    if (newTracks.length > 0) {
      onAddTracks(newTracks);
      onSelectTrack(newTracks[0]);
    }
  };

  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Grouped datasets
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
      return (t.title && t.title.toLowerCase().includes(q)) || (t.artist && t.artist.toLowerCase().includes(q));
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

  return (
    <div className="w-full flex flex-col gap-3 px-4 sm:px-6 pt-2 pb-24 select-none text-white max-w-2xl mx-auto tab-enter">
      {/* Header & Search Bar with Add Button */}
      <div className="flex items-center gap-2 pt-1">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#130b24]/90 border border-purple-500/20 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-400 transition-colors"
          />
        </div>

        {/* Minimalist Add Audio Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)] transition-all active:scale-95 shrink-0"
          title="Import Audio Files"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        multiple
        accept="audio/*,.mp3,.wav,.ogg,.flac,.aac,.m4a"
        className="hidden"
      />

      {/* 6 SUB-TABS: Songs | Albums | Artists | Folders | Playlists | Favorites */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-purple-500/15 text-xs">
        {[
          { id: 'songs', label: 'Songs', icon: Music },
          { id: 'albums', label: 'Albums', icon: Disc },
          { id: 'artists', label: 'Artists', icon: User },
          { id: 'folders', label: 'Folders', icon: FolderTree },
          { id: 'playlists', label: 'Playlists', icon: ListMusic },
          { id: 'favorites', label: 'Favorites', icon: Heart },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`px-3 py-1.5 font-medium whitespace-nowrap transition-all flex items-center gap-1.5 active:scale-95 border-b-2 -mb-[1px] rounded-none ${
                isActive
                  ? 'border-purple-400 text-purple-300 font-semibold'
                  : 'border-transparent text-purple-300/50 hover:text-purple-200 hover:border-purple-500/40'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: SONGS & FAVORITES */}
      {(subTab === 'songs' || subTab === 'favorites') && (
        <div className="flex flex-col gap-1.5">
          {filteredTracks.map((track) => {
            const isSelected = track.id === currentTrackId;
            return (
              <div
                key={track.id}
                onClick={() => onSelectTrack(track)}
                className={`p-2 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all border active:scale-[0.99] ${
                  isSelected
                    ? 'bg-purple-950/60 border-purple-500/60 shadow-[0_0_14px_rgba(168,85,247,0.3)]'
                    : 'bg-[#150d2b]/40 border-purple-900/20 hover:bg-[#1a0f35]/60 hover:border-purple-800/30'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden min-w-0">
                  <div className="w-11 h-11 rounded-xl overflow-hidden border border-purple-500/30 shrink-0 bg-neutral-900 relative">
                    <DVAlbumArt
                      track={track}
                      isPlaying={isSelected}
                      size="sm"
                      className="w-full h-full"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-purple-600/40 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col truncate min-w-0">
                    <span
                      className={`text-xs font-semibold truncate ${
                        isSelected ? 'text-purple-300' : 'text-white'
                      }`}
                    >
                      {track.title}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 truncate">
                      <span>{track.artist}</span>
                      <span>·</span>
                      <span className="font-mono text-purple-400">{track.format}</span>
                      <span>·</span>
                      <span className="font-mono">{formatTime(track.duration)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setTrackToAddToPlaylist(track)}
                    className="p-1.5 text-neutral-500 hover:text-purple-300 transition-colors"
                    title="Add to Playlist"
                  >
                    <ListPlus className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onToggleFavorite(track.id)}
                    className={`p-1.5 transition-colors ${
                      track.isFavorite ? 'text-pink-500 fill-pink-500' : 'text-neutral-500 hover:text-white'
                    }`}
                    title="Favorite"
                  >
                    <Heart className={`w-3.5 h-3.5 ${track.isFavorite ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    onClick={() => onRemoveTrack(track.id)}
                    className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors"
                    title="Remove Track"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredTracks.length === 0 && (
            <div className="py-14 flex flex-col items-center justify-center text-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Music className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-neutral-300">No tracks found</span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-1 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md"
              >
                Import Music
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: ALBUMS */}
      {subTab === 'albums' && (
        <div className="grid grid-cols-2 gap-3">
          {albumsGrouped.map(({ album, tracks: albumTracks }) => (
            <div
              key={album}
              onClick={() => onSelectTrack(albumTracks[0])}
              className="p-2.5 rounded-2xl bg-[#140b26]/70 border border-purple-900/30 hover:border-purple-500/40 cursor-pointer transition active:scale-95 group"
            >
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-neutral-900 relative mb-1.5">
                <DVAlbumArt
                  track={albumTracks[0]}
                  size="md"
                  className="w-full h-full group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <Play className="w-7 h-7 text-white fill-white ml-0.5" />
                </div>
              </div>
              <h3 className="text-xs font-semibold text-white truncate">{album}</h3>
              <p className="text-[10px] text-purple-300/70 truncate">{albumTracks.length} Songs</p>
            </div>
          ))}
        </div>
      )}

      {/* SUB-TAB 3: ARTISTS */}
      {subTab === 'artists' && (
        <div className="space-y-1.5">
          {artistsGrouped.map(({ artist, tracks: artistTracks }) => (
            <div
              key={artist}
              onClick={() => onSelectTrack(artistTracks[0])}
              className="p-2.5 rounded-2xl bg-[#140b26]/70 border border-purple-900/30 hover:border-purple-500/40 cursor-pointer transition flex items-center justify-between active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-200">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">{artist}</h3>
                  <p className="text-[10px] text-purple-300/60">{artistTracks.length} Songs</p>
                </div>
              </div>
              <Play className="w-3.5 h-3.5 text-purple-400 mr-2" />
            </div>
          ))}
        </div>
      )}

      {/* SUB-TAB 4: FOLDERS */}
      {subTab === 'folders' && (
        <div className="space-y-1.5">
          {foldersGrouped.map(({ folder, tracks: folderTracks }) => (
            <div
              key={folder}
              onClick={() => onSelectTrack(folderTracks[0])}
              className="p-2.5 rounded-2xl bg-[#140b26]/70 border border-purple-900/30 hover:border-purple-500/40 cursor-pointer transition flex items-center justify-between active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                  <Folder className="w-4 h-4" />
                </div>
                <div className="truncate max-w-[200px] sm:max-w-md">
                  <h3 className="text-xs font-semibold text-white truncate">{folder}</h3>
                  <p className="text-[10px] text-purple-300/60">{folderTracks.length} Audio Files</p>
                </div>
              </div>
              <Play className="w-3.5 h-3.5 text-purple-400 mr-2 shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* SUB-TAB 5: PLAYLISTS */}
      {subTab === 'playlists' && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-300/70">
              Playlists ({playlists.length})
            </span>
            <button
              onClick={() => setShowNewPlaylistModal(true)}
              className="px-2.5 py-1 rounded-xl bg-purple-600 text-white text-xs font-semibold flex items-center gap-1 shadow-md shadow-purple-900/50 hover:bg-purple-500 transition active:scale-95"
            >
              <Plus className="w-3 h-3" />
              <span>New</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {playlists.map((pl) => (
              <div
                key={pl.id}
                className="p-3 rounded-2xl bg-[#140b26]/70 border border-purple-900/30 flex items-center justify-between group hover:border-purple-500/40 transition"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-800 to-indigo-700 flex items-center justify-center shadow-md">
                    <ListMusic className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">{pl.name}</h4>
                    <p className="text-[10px] text-purple-300/60">{pl.trackIds.length} Songs</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      const first = tracks.find((t) => pl.trackIds.includes(t.id));
                      if (first) onSelectTrack(first);
                    }}
                    className="w-7 h-7 rounded-full bg-white/5 group-hover:bg-purple-600 text-white flex items-center justify-center transition active:scale-90"
                    title="Play"
                  >
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </button>
                  <button
                    onClick={() => setPlaylists((prev) => prev.filter((p) => p.id !== pl.id))}
                    className="w-7 h-7 rounded-full bg-white/5 hover:bg-red-600/40 text-neutral-400 hover:text-red-300 flex items-center justify-center transition active:scale-90"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Playlist Modal */}
      {showNewPlaylistModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleCreatePlaylist}
            className="w-full max-w-sm rounded-3xl bg-[#110722] border border-purple-500/30 p-4 space-y-3 shadow-2xl"
          >
            <h3 className="text-xs font-bold text-white">Create Playlist</h3>
            <input
              type="text"
              autoFocus
              placeholder="Playlist name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-purple-500/30 text-xs text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-400"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowNewPlaylistModal(false)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-purple-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newPlaylistName.trim()}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow-md disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Track to Playlist Picker Modal */}
      {trackToAddToPlaylist && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#110722] border border-purple-500/30 p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white">Add to Playlist</h3>
                <p className="text-[10px] text-purple-300/70 truncate max-w-[200px]">
                  {trackToAddToPlaylist.title}
                </p>
              </div>
              <button
                onClick={() => setTrackToAddToPlaylist(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-1 max-h-52 overflow-y-auto">
              {playlists.map((pl) => {
                const alreadyIn = pl.trackIds.includes(trackToAddToPlaylist.id);
                return (
                  <button
                    key={pl.id}
                    onClick={() => {
                      if (!alreadyIn) {
                        setPlaylists((prev) =>
                          prev.map((p) =>
                            p.id === pl.id ? { ...p, trackIds: [...p.trackIds, trackToAddToPlaylist.id] } : p
                          )
                        );
                      }
                      setTrackToAddToPlaylist(null);
                    }}
                    className={`p-2.5 rounded-xl flex items-center justify-between text-left transition ${
                      alreadyIn
                        ? 'bg-purple-950/30 text-purple-300/50 cursor-default'
                        : 'bg-white/5 hover:bg-purple-600/30 text-white'
                    }`}
                  >
                    <span className="text-xs font-medium">{pl.name}</span>
                    <span className="text-[9px] text-purple-300/60">
                      {alreadyIn ? 'Added' : `${pl.trackIds.length} tracks`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

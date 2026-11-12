import React, { useEffect, useState, useRef } from 'react';
import { audioEngine } from './audio/audioEngine';
import { generateDemoTrack, extractWaveformFromFile, parseAudioFilename } from './audio/syntheticTracks';
import { DVNowPlaying } from './components/DVNowPlaying';
import { DVLibrary } from './components/DVLibrary';
import { DVEqualizerTab } from './components/DVEqualizerTab';
import { DVSettingsTab } from './components/DVSettingsTab';
import { DVMiniPlayer } from './components/DVMiniPlayer';
import { DVBottomNav } from './components/DVBottomNav';

export default function App() {
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const currentTrackRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(64);
  const [masterVolume, setMasterVolume] = useState(0.9);

  // 4 Offline Destinations: 'home' | 'library' | 'equalizer' | 'settings'
  const [activeDestination, setActiveDestination] = useState('home');

  // Visualizer Mode
  const [visualizerMode, setVisualizerMode] = useState('spectrum-bars');

  // Audio Playback Settings
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('all');

  // Audio Effects & 10-Band EQ
  const [effectsEnabled, setEffectsEnabled] = useState(true);
  const [activeEffect, setActiveEffect] = useState('normal');
  const [eqPreset, setEqPreset] = useState('custom');
  const [eightDAngle, setEightDAngle] = useState(0);
  const [eightDSpeed, setEightDSpeed] = useState(8.0);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState(null);

  // 10-Band EQ initial values
  const [eqBands, setEqBands] = useState({
    b60: 1.5,
    b170: 3.5,
    b310: 5.5,
    b600: 2.0,
    b1k: -1.0,
    b3k: 4.5,
    b6k: 2.5,
    b8k: 1.0,
    b12k: 3.0,
    b14k: 1.5,
    b16k: 0.5,
  });

  const hiddenFileInputRef = useRef(null);

  // Initialize Web Audio Engine & initial offline demo track
  useEffect(() => {
    let isMounted = true;

    const initApp = async () => {
      audioEngine.init();
      const ctx = audioEngine.getAudioContext();

      // Subscribe to 8D angle updates
      audioEngine.onEightDAngle((angle) => {
        if (isMounted) setEightDAngle(angle);
      });

      // Hook into audio element events
      const audio = audioEngine.getAudioElement();
      if (audio) {
        audio.ontimeupdate = () => {
          if (isMounted) {
            setCurrentTime(audio.currentTime);
          }
        };
        audio.ondurationchange = () => {
          if (isMounted && audio.duration) {
            setDuration(audio.duration);
          }
        };
        audio.onplay = () => {
          if (isMounted) {
            setIsPlaying(true);
          }
        };
        audio.onpause = () => {
          if (isMounted) {
            setIsPlaying(false);
          }
        };
        audio.onended = () => {
          if (isMounted) {
            handleNextTrack();
          }
        };
      }

      // Initialize with offline demo track "Dreams" by Lost Sky
      try {
        const dreamsTrack = await generateDemoTrack('dreams', ctx);
        if (isMounted) {
          setTracks([dreamsTrack]);
          setCurrentTrack(dreamsTrack);
          currentTrackRef.current = dreamsTrack;
          setDuration(dreamsTrack.duration);
          audioEngine.loadTrack(dreamsTrack.url);
          const audioEl = audioEngine.getAudioElement();
          if (audioEl) audioEl.loop = true;
          audioEngine.setTenBandEq(eqBands);
          audioEngine.setEffectPreset(activeEffect, effectsEnabled);
        }
      } catch (err) {
        console.warn('Initial track synthesis notice:', err);
      }
    };

    initApp();

    return () => {
      isMounted = false;
      audioEngine.destroy();
    };
  }, []);

  // Sleep timer interval
  useEffect(() => {
    if (!sleepTimerMinutes) return;
    const interval = setInterval(() => {
      setSleepTimerMinutes((prev) => {
        if (!prev || prev <= 1) {
          audioEngine.pause();
          setIsPlaying(false);
          return null;
        }
        return prev - 1;
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [sleepTimerMinutes]);

  // Transport handlers
  const handlePlayToggle = () => {
    audioEngine.resume();
    audioEngine.togglePlay();
  };

  const handleSeek = (seconds) => {
    audioEngine.seek(seconds);
    setCurrentTime(seconds);
  };

  const handlePrevTrack = () => {
    if (tracks.length === 0) return;
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack?.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : tracks.length - 1;
    handleSelectTrack(tracks[prevIndex]);
  };

  const handleNextTrack = () => {
    if (tracks.length === 0) return;
    if (repeatMode === 'one') {
      handleSeek(0);
      handlePlayToggle();
      return;
    }
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack?.id);
    let nextIndex = (currentIndex + 1) % tracks.length;
    if (isShuffle && tracks.length > 1) {
      nextIndex = Math.floor(Math.random() * tracks.length);
    }
    handleSelectTrack(tracks[nextIndex]);
  };

  const handleVolumeChange = (vol) => {
    setMasterVolume(vol);
    audioEngine.setVolume(vol);
  };

  const handleSelectTrack = (track) => {
    setCurrentTrack(track);
    currentTrackRef.current = track;
    setCurrentTime(0);
    setDuration(track.duration || 180);

    const audioEl = audioEngine.getAudioElement();
    if (audioEl) {
      audioEl.loop = track.source === 'synthetic';
    }

    audioEngine.loadTrack(track.url);
    setTimeout(() => {
      audioEngine.play().catch(() => {});
    }, 80);
  };

  const handleShuffleToggle = () => {
    setIsShuffle(!isShuffle);
  };

  const handleRepeatToggle = () => {
    const modes = ['off', 'all', 'one'];
    const nextIdx = (modes.indexOf(repeatMode) + 1) % modes.length;
    setRepeatMode(modes[nextIdx]);
  };

  const handleFavoriteToggle = () => {
    if (!currentTrack) return;
    const updated = { ...currentTrack, isFavorite: !currentTrack.isFavorite };
    setCurrentTrack(updated);
    currentTrackRef.current = updated;
    setTracks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  // Toggle visualizer modes
  const handleToggleVisualizerMode = () => {
    const modes = ['spectrum-bars', 'circular', 'waveform', 'particles'];
    const nextIdx = (modes.indexOf(visualizerMode) + 1) % modes.length;
    setVisualizerMode(modes[nextIdx]);
  };

  // Effects & EQ handlers
  const handleToggleEffects = () => {
    const next = !effectsEnabled;
    setEffectsEnabled(next);
    audioEngine.setEffectPreset(activeEffect, next);
    audioEngine.setTenBandEq(
      next
        ? eqBands
        : {
            b60: 0,
            b170: 0,
            b310: 0,
            b600: 0,
            b1k: 0,
            b3k: 0,
            b6k: 0,
            b8k: 0,
            b12k: 0,
            b14k: 0,
            b16k: 0,
          }
    );
  };

  const handleSelectEffect = (effect) => {
    setActiveEffect(effect);
    setEffectsEnabled(true);
    audioEngine.setEffectPreset(effect, true);
  };

  const handleBandChange = (key, value) => {
    const updated = { ...eqBands, [key]: value };
    setEqBands(updated);
    setEqPreset('custom');
    if (effectsEnabled) {
      audioEngine.setTenBandEq(updated);
    }
  };

  const handleSelectEqPreset = (preset) => {
    setEqPreset(preset);
    let newBands;

    switch (preset) {
      case 'normal':
        newBands = { b60: 0, b170: 0, b310: 0, b600: 0, b1k: 0, b3k: 0, b6k: 0, b8k: 0, b12k: 0, b14k: 0, b16k: 0 };
        break;
      case 'deep_bass':
        newBands = { b60: 8, b170: 6.5, b310: 4, b600: 1, b1k: 0, b3k: -1, b6k: -1, b8k: 0, b12k: 1, b14k: 1.5, b16k: 2 };
        break;
      case 'edm':
        newBands = { b60: 6, b170: 5, b310: 2, b600: -1, b1k: -2, b3k: 2, b6k: 4, b8k: 5, b12k: 6, b14k: 5, b16k: 4 };
        break;
      case 'pop':
        newBands = { b60: -1, b170: 1.5, b310: 4, b600: 5, b1k: 4.5, b3k: 3, b6k: 1, b8k: 1.5, b12k: 2.5, b14k: 3, b16k: 3.5 };
        break;
      case 'rock':
        newBands = { b60: 5, b170: 3.5, b310: -1, b600: -2, b1k: 0, b3k: 2.5, b6k: 4, b8k: 5, b12k: 5.5, b14k: 5, b16k: 4.5 };
        break;
      case 'vocal':
        newBands = { b60: -2, b170: -1, b310: 1, b600: 4, b1k: 6, b3k: 5, b6k: 3, b8k: 1.5, b12k: 0, b14k: -1, b16k: -2 };
        break;
      case 'jazz':
        newBands = { b60: 3, b170: 2, b310: 1, b600: 2, b1k: -1, b3k: -1, b6k: 0, b8k: 2, b12k: 3, b14k: 3.5, b16k: 4 };
        break;
      case 'classical':
        newBands = { b60: 4, b170: 3, b310: 2, b600: 2, b1k: -1, b3k: -1, b6k: 0, b8k: 2.5, b12k: 3.5, b14k: 4, b16k: 4 };
        break;
      case 'custom':
      default:
        newBands = eqBands;
        break;
    }

    setEqBands(newBands);
    if (effectsEnabled) {
      audioEngine.setTenBandEq(newBands);
    }
  };

  // Local file import handler - adds offline user audio files
  const handleLocalFileSelect = async (files) => {
    if (!files || files.length === 0) return;
    const audioCtx = audioEngine.getAudioContext();
    const newTracks = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|ogg|flac|aac|m4a)$/i)) continue;
      const url = URL.createObjectURL(file);
      const { title, artist, album, format } = parseAudioFilename(file.name);
      const { peaks, duration: fileDur } = await extractWaveformFromFile(file, audioCtx);

      newTracks.push({
        id: `local-${Date.now()}-${i}`,
        title,
        artist,
        album,
        folder: `/Music/${artist}`,
        duration: fileDur || 180,
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
      setTracks((prev) => [...newTracks, ...prev]);
      handleSelectTrack(newTracks[0]);
      setActiveDestination('home');
    }
  };

  return (
    <div className="min-h-screen bg-[#07030e] text-neutral-100 flex flex-col justify-between overflow-x-hidden selection:bg-purple-500/30 font-sans">
      {/* Background Cosmic Nebula Light Glow */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] bg-purple-700/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[650px] h-[650px] bg-indigo-700/15 rounded-full blur-[160px]" />
      </div>

      {/* Hidden File Input for universal local media browsing */}
      <input
        type="file"
        ref={hiddenFileInputRef}
        onChange={(e) => handleLocalFileSelect(e.target.files)}
        multiple
        accept="audio/*,.mp3,.wav,.ogg,.flac,.aac,.m4a"
        className="hidden"
      />

      {/* MAIN BODY SWITCHER FOR THE 4 OFFLINE DESTINATIONS */}
      <main className="flex-1 w-full max-w-md mx-auto sm:max-w-xl md:max-w-2xl flex flex-col items-center">
        {/* DESTINATION 1: HOME (NOW PLAYING) */}
        {activeDestination === 'home' && (
          <div className="w-full max-w-md flex flex-col items-center">
            <DVNowPlaying
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              isShuffle={isShuffle}
              repeatMode={repeatMode}
              volume={masterVolume}
              onVolumeChange={handleVolumeChange}
              onPlayToggle={handlePlayToggle}
              onSeek={handleSeek}
              onPrevTrack={handlePrevTrack}
              onNextTrack={handleNextTrack}
              onShuffleToggle={handleShuffleToggle}
              onRepeatToggle={handleRepeatToggle}
              onFavoriteToggle={handleFavoriteToggle}
              visualizerMode={visualizerMode}
              onToggleVisualizerMode={handleToggleVisualizerMode}
              effectsEnabled={effectsEnabled}
              onToggleEffects={handleToggleEffects}
              activeEffect={activeEffect}
              onSelectEffect={handleSelectEffect}
              eightDAngle={eightDAngle}
            />
          </div>
        )}

        {/* DESTINATION 2: LIBRARY (Local media, folders, playlists) */}
        {activeDestination === 'library' && (
          <div className="w-full max-w-2xl">
            <DVLibrary
              tracks={tracks}
              currentTrackId={currentTrack?.id || null}
              onSelectTrack={(track) => {
                handleSelectTrack(track);
                setActiveDestination('home');
              }}
              onAddTracks={(newTracks) => setTracks((prev) => [...newTracks, ...prev])}
              onRemoveTrack={(trackId) => {
                setTracks((prev) => prev.filter((t) => t.id !== trackId));
                if (currentTrack?.id === trackId) {
                  const next = tracks.find((t) => t.id !== trackId);
                  if (next) handleSelectTrack(next);
                }
              }}
              onToggleFavorite={handleFavoriteToggle}
            />
          </div>
        )}

        {/* DESTINATION 3: EQUALIZER & 8D AUDIO LAB */}
        {activeDestination === 'equalizer' && (
          <div className="w-full max-w-2xl px-4 py-3 pb-24">
            <DVEqualizerTab
              effectsEnabled={effectsEnabled}
              onToggleEffects={handleToggleEffects}
              activeEffect={activeEffect}
              onSelectEffect={handleSelectEffect}
              eqPreset={eqPreset}
              onSelectEqPreset={handleSelectEqPreset}
              eqBands={eqBands}
              onBandChange={handleBandChange}
              eightDAngle={eightDAngle}
              eightDSpeed={eightDSpeed}
              onEightDSpeedChange={setEightDSpeed}
            />
          </div>
        )}

        {/* DESTINATION 4: SETTINGS & DAC */}
        {activeDestination === 'settings' && (
          <div className="w-full max-w-2xl px-4 py-3 pb-24">
            <DVSettingsTab
              sleepTimerMinutes={sleepTimerMinutes}
              onSetSleepTimer={setSleepTimerMinutes}
              eightDSpeed={eightDSpeed}
              onEightDSpeedChange={(speed) => {
                setEightDSpeed(speed);
                audioEngine.setEightDSpeed(speed);
              }}
              onTriggerScan={() => hiddenFileInputRef.current?.click()}
            />
          </div>
        )}

        {/* Persistent Mini Player shown on all non-home tabs */}
        {activeDestination !== 'home' && currentTrack && (
          <div className="fixed bottom-16 left-0 right-0 z-30 px-4 pb-2">
            <div className="max-w-2xl mx-auto">
              <DVMiniPlayer
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                onPlayToggle={handlePlayToggle}
                onNextTrack={handleNextTrack}
                onOpenNowPlaying={() => setActiveDestination('home')}
              />
            </div>
          </div>
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION (4 Clean Offline Destinations) */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <DVBottomNav
          activeTab={activeDestination}
          onTabChange={(tab) => setActiveDestination(tab)}
        />
      </div>
    </div>
  );
}

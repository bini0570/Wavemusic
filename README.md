# 🎵 DV Music — 100% Offline Web Audio Player

A high-fidelity, zero-dependency offline web music player built with **React 19, JavaScript (JSX), Tailwind CSS v4, and the Web Audio API**.

DV Music requires **no internet connection**, no external APIs, and no backend servers. All audio processing (10-Band EQ, 8D Binaural Spatializer, DSP Effects, and Real-Time Spectrum Visualizers) is computed client-side directly in the browser.

---

## ✨ Features

- **🎧 8D Spatial Audio Radar**: Real-time 360-degree binaural rotation with HRTF panner node and customizable orbit speed (4s to 24s per revolution).
- **🎚️ 10-Band Graphic Equalizer**: Studio-grade EQ (60Hz to 16kHz) with presets (*Deep Bass, EDM, Rock, Pop, Vocal, Jazz, Classical*).
- **🚀 12 Hardware DSP Effects**: Normal, 8D Audio, Bass Boost, Vocal Boost, Treble Boost, Echo/Delay, Reverb, Virtualizer, Surround, Night Mode, TruBass, and Wide Stereo.
- **📊 4-Mode Spectrum Visualizer**: High-framerate 60 FPS real-time audio visualization:
  - Neon Spectrum Bars with dynamic peak contours
  - 360° Circular Radial Beams
  - Oscilloscope Laser Waveform
  - Audio-Reactive Floating Particles
- **📁 Offline Audio Library**: Drag & drop or pick files directly from your computer or phone:
  - Supported formats: **FLAC, MP3, WAV, AAC, M4A, OGG**
  - Grouping by **Songs, Albums, Artists, Folders, Playlists, and Favorites**
  - Client-side filename and waveform peak analyzer
- **💾 Local Playlists & Persistence**: Create, add to, and delete custom playlists persisted in `localStorage`.
- **⏱️ Sleep Timer**: 15m, 30m, 45m, and 60m auto-pause sleep timer.
- **📱 PWA (Progressive Web App)**: Install directly to your Windows desktop, macOS dock, Android home screen, or iOS device as a standalone native-like app.

---

## 🚀 Quick Start & Installation

### Option 1: Run with NPM / Node.js
```bash
# 1. Clone repository from GitHub
git clone https://github.com/bini0570/DVmusic.git
cd DVmusic

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

### Option 2: Run with Bun
```bash
git clone https://github.com/bini0570/DVmusic.git
cd DVmusic
bun install
bun run dev
```

---

## 📲 How to Install as an App (PWA)

You can install DV Music as an independent app on your computer or phone:

### On Desktop (Chrome / Edge / Brave):
1. Open the app in your browser (`http://localhost:3000` or deployed URL).
2. Look at the top right of the browser address bar.
3. Click the **Install DV Music** icon (or press `Menu > More Tools > Create Shortcut / Install App`).
4. DV Music will now appear in your Start Menu / Applications as a standalone app!

### On Mobile (Android / iOS):
- **Android (Chrome)**: Tap the 3 dots in the top right > tap **Add to Home screen** / **Install app**.
- **iOS (Safari)**: Tap the **Share** button at the bottom > tap **Add to Home Screen**.

---

## 🛠️ Project Structure

```
DVmusic/
├── public/
│   ├── icon.svg               # App icon & PWA logo
│   ├── manifest.json          # PWA Standalone Web App Manifest
│   ├── sw.js                  # Offline Service Worker cache
│   └── assets/                # Default cover art and visuals
├── src/
│   ├── audio/
│   │   ├── audioEngine.js     # Web Audio API 32-bit DSP pipeline (EQ, 8D, filters)
│   │   └── syntheticTracks.js # Offline synthesizer & audio metadata decoder
│   ├── components/
│   │   ├── DVNowPlaying.jsx   # Main player screen, album art, transport, volume
│   │   ├── DVLibrary.jsx      # Offline library, playlists, folders & file picker
│   │   ├── DVEqualizerTab.jsx # 8D Radar & 10-Band EQ interface
│   │   ├── DVEffectsCard.jsx  # 12 DSP effect tiles & sliders
│   │   ├── DVSettingsTab.jsx  # Sleep timer, 8D speed, hardware DAC info
│   │   ├── DVMiniPlayer.jsx   # Persistent bottom mini-player
│   │   ├── DVSpectrumVisualizer.jsx # 4-mode canvas visualizer
│   │   └── DVBottomNav.jsx    # 4-destination navigation bar
│   ├── App.jsx                # Main application state & router
│   ├── index.css              # Custom styling & dark theme
│   └── main.jsx               # React 19 entrypoint
├── index.html                 # PWA metadata & entrypoint
├── package.json               # Pure JavaScript dependencies
└── vite.config.js             # Vite 8 config
```

---

## 🛡️ Privacy & Offline Guarantee
- **Zero Tracking**: No external analytics, trackers, or cookies.
- **Zero Cloud Uploads**: Your local audio files never leave your device. All playback and DSP rendering happen inside your device's browser memory.

---

## 📄 License
MIT License. Free and open source for everyone.

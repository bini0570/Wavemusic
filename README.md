# 🎵 DV Music — 100% Offline Music Player & Android APK

A high-fidelity, zero-dependency offline music player built with **React 19, JavaScript (JSX), Tailwind CSS v4, and the Web Audio API**.

DV Music requires **no internet connection**, no external APIs, and no backend servers. All audio processing (10-Band EQ, 8D Binaural Spatializer, DSP Effects, and Real-Time Spectrum Visualizers) is computed client-side directly in the browser or on your Android device.

---

## 📱 Download & Install Android APK

Every push to this repository automatically builds a ready-to-install Android APK using **GitHub Actions**.

### How to get the APK:
1. Go to the [**Releases**](https://github.com/bini0570/Wavemusic/releases) page of this repository.
2. Download **`DVMusic-Offline.apk`**.
3. On your Android phone, tap the file and tap **Install**.
4. (Optional) You can also find the latest APK under the [**Actions Tab**](https://github.com/bini0570/Wavemusic/actions) > click the latest workflow run > download **`DVMusic-Android-APK`** under Artifacts.

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

## 🚀 Running Locally

### Option 1: Run with NPM / Node.js
```bash
# 1. Clone repository from GitHub
git clone https://github.com/bini0570/Wavemusic.git
cd Wavemusic

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

### Option 2: Run with Bun
```bash
git clone https://github.com/bini0570/Wavemusic.git
cd Wavemusic
bun install
bun run dev
```

---

## 🤖 GitHub Actions Workflow
The automated Android APK build is defined in [`.github/workflows/build-apk.yml`](.github/workflows/build-apk.yml):
- Triggers on every push to `main` and on manual trigger (`workflow_dispatch`).
- Uses Capacitor 6 + Java 17 + Android SDK.
- Automatically compiles `DVMusic-Offline.apk` and creates a GitHub Release.

---

## 🛡️ Privacy & Offline Guarantee
- **Zero Tracking**: No external analytics, trackers, or cookies.
- **Zero Cloud Uploads**: Your local audio files never leave your device. All playback and DSP rendering happen inside your device's local memory.

---

## 📄 License
MIT License. Free and open source for everyone.

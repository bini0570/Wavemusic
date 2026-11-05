# WAVE — 60-Second TikTok LIVE DJ Streamer

A streamlined, cloud-deployable interactive music tool for real TikTok LIVE broadcasts.

---

## ⚡ How It Works

1. **Continuous 60-Second Loop:**
   - Every round lasts exactly **60 seconds**.
   - The winning track plays for 60 seconds with **synchronized karaoke lyrics** and live waveform visuals.
   - While the track is playing, the 60-second countdown ring ticks down, and viewers in TikTok LIVE chat comment song titles to vote on what plays next.
   - At 0 seconds, the #1 voted song immediately takes over for the next 60 seconds!

2. **Smart "Waiting For Votes" State:**
   - If no viewer votes or requests a song during a round, playback smoothly pauses and shows:
     > *"Waiting for your song votes in chat... Comment a song name in TikTok LIVE to start the next 60s track!"*
   - As soon as a viewer comments a valid song, the 60-second round immediately launches!

3. **Real TikTok LIVE Chat Connection:**
   - Zero fake simulated traffic or artificial users.
   - Click **DJ Controls** in the top right, enter your `@username`, and click **Connect LIVE**.
   - Real chat comments are streamed to the voting engine via WebSockets.
   - Anti-spam protection: 1 vote per viewer per round with deterministic first-to-score tie-breaking.

4. **Clean 2-Mode Interface:**
   - **Live Stage (Main Screen):** Clean, high-energy broadcast display (Now Playing artwork, animated waveform, 60s digital countdown ring, Top 3 live vote race, and synchronized lyrics).
   - **Slide-Over DJ Drawer:** Host controls for TikTok connection, pause/resume, skip round, volume control, and manual request injection.

---

## 🚀 Running Locally

### 1. Requirements
- Node.js 20+ (Install via `winget install OpenJS.NodeJS.LTS` on Windows)

### 2. Install & Start
```bash
# Install dependencies
npm install

# Start development server
npm start
```

Open your browser at `http://localhost:3000`.

---

## ☁️ Cloud Deployment (Render / Railway / Cloud Run)

This project includes a unified Express + WebSocket server (`server.ts`) ready for cloud hosting:

### Deploy to Render
1. Push this repository to GitHub.
2. In Render, select **New Web Service** and connect your repo.
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. The included `render.yaml` automatically configures this.

### Deploy to Railway
1. Click **New Project** -> **Deploy from GitHub repo**.
2. Railway will automatically detect the `Procfile` and launch `npm start`.

---

## 🛠️ Project Structure

- `server.ts`: Express + WebSocket backend with `tiktok-live-connector` and proxy resolvers.
- `src/App.tsx`: Main application coordinator connecting the audio engine, voting loop, and live chat.
- `src/components/LiveStage.tsx`: The primary broadcast stage (60s countdown gauge, Top 3 race, now-playing card).
- `src/components/DJDrawer.tsx`: Slide-over panel for host controls and TikTok connection.
- `src/components/WaveformVisualizer.tsx`: Dynamic audio frequency visualizer.
- `src/components/LyricsView.tsx`: Karaoke-style synchronized lyrics viewer.
- `src/services/votingEngine.ts`: 60-second voting loop, anti-spam, and waiting-for-votes state machine.
- `src/services/tiktokLiveService.ts`: Frontend WebSocket client for live TikTok comments.
- `src/services/fullAudioEngine.ts`: Audio crossfader and playback engine.

// Helper to convert an AudioBuffer to a WAV Blob URL
export function audioBufferToWavUrl(buffer) {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  const channels = [];
  let sample = 0;
  let offset = 0;
  let pos = 0;

  function setUint16(data) {
    out.setUint16(pos, data, true);
    pos += 2;
  }
  function setUint32(data) {
    out.setUint32(pos, data, true);
    pos += 4;
  }

  // RIFF identifier
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  // format chunk identifier
  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit precision

  // data chunk identifier
  setUint32(0x61746164); // "data"
  setUint32(length - pos - 4); // chunk length

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (offset < buffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  const blob = new Blob([out.buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

// Procedural high-energy EDM / Synthwave track generator for instant offline playback
export async function generateDemoTrack(type = 'dreams', audioCtx) {
  const sampleRate = audioCtx.sampleRate;
  const duration = 64; // 64s synthesized audio
  const totalSamples = sampleRate * duration;
  const buffer = audioCtx.createBuffer(2, totalSamples, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  let bpm = 124;
  let title = 'Hyperdrive Synthwave';
  let artist = 'DV Studio';
  let format = 'FLAC';
  let bitrate = '320 kbps';
  let sampleRateStr = '44.1 kHz';

  if (type === 'dreams') {
    bpm = 128;
    title = 'Dreams';
    artist = 'Lost Sky';
    format = 'FLAC';
    bitrate = '320 kbps';
    sampleRateStr = '44.1 kHz';
  } else if (type === 'house') {
    bpm = 128;
    title = 'Warehouse Tech Groove';
    artist = 'DV Collective';
  } else if (type === 'binaural8d') {
    bpm = 115;
    title = 'Orbital 8D Binaural Journey';
    artist = 'DV Spatial Labs';
  } else if (type === 'cyberpunk') {
    bpm = 132;
    title = 'Neon District Overdrive';
    artist = 'DV Core';
  }

  const beatSec = 60 / bpm;
  const stepSec = beatSec / 4; // 16th note

  // Bass frequencies progression (Lost Sky Dreams chord loop: F#m -> D -> A -> E)
  const rootFreqs = [92.5, 73.4, 110.0, 82.4]; // F#2, D2, A2, E2

  for (let s = 0; s < totalSamples; s++) {
    const t = s / sampleRate;
    const bar = Math.floor(t / (beatSec * 4));
    const chordIndex = bar % 4;
    const root = rootFreqs[chordIndex];

    const beatPhase = (t % beatSec) / beatSec;
    const step16Phase = (t % stepSec) / stepSec;

    // 1. Pumping Sub Bass & Mid Synth
    const subOsc = Math.sin(2 * Math.PI * (root / 2) * t);
    const midOsc = Math.sin(2 * Math.PI * root * t) * 0.6 + Math.sin(2 * Math.PI * root * 1.5 * t) * 0.3;
    const sidechainDuck = Math.pow(beatPhase, 0.45); // EDM sidechain compression
    const bass = (subOsc * 0.5 + midOsc * 0.4) * sidechainDuck;

    // 2. Punchy Kick Drum on every beat
    let kick = 0;
    if (beatPhase < 0.28) {
      const kickEnv = Math.exp(-beatPhase * 28);
      const kickFreq = 145 * Math.exp(-beatPhase * 35) + 42;
      kick = Math.sin(2 * Math.PI * kickFreq * beatPhase) * kickEnv * 0.95;
    }

    // 3. Crisp Snare / Clap on beats 2 and 4
    let snare = 0;
    const halfBarBeat = (t / beatSec) % 2;
    if (halfBarBeat >= 1.0 && halfBarBeat < 1.35) {
      const snPhase = halfBarBeat - 1.0;
      const snEnv = Math.exp(-snPhase * 18);
      const noise = (Math.random() * 2 - 1) * snEnv * 0.45;
      const body = Math.sin(2 * Math.PI * 185 * snPhase) * snEnv * 0.35;
      snare = noise + body;
    }

    // 4. Sparkling Hi-Hats on every offbeat
    let hihat = 0;
    const hatPhase = (t % (beatSec / 2)) / (beatSec / 2);
    if (hatPhase > 0.4 && hatPhase < 0.75) {
      const hEnv = Math.exp(-(hatPhase - 0.4) * 32);
      hihat = (Math.random() * 2 - 1) * hEnv * 0.22;
    }

    // 5. Melodic Synth Lead Arp (Dreams signature hook)
    const arpNotes = [1, 1.2, 1.5, 1.78, 2.0, 1.5, 1.2, 1.0];
    const arpIdx = Math.floor((t / stepSec) % arpNotes.length);
    const leadFreq = root * 2 * arpNotes[arpIdx];
    const leadEnv = Math.exp(-step16Phase * 6.5);
    const leadOsc = (Math.sin(2 * Math.PI * leadFreq * t) + Math.sin(2 * Math.PI * leadFreq * 1.004 * t) * 0.5) * leadEnv * 0.28;

    // Stereo spatial panning
    const panOffset = Math.sin(2 * Math.PI * 0.25 * t) * 0.25;
    const sigL = (kick + snare + bass * 0.9 + leadOsc * (0.5 - panOffset) + hihat * 0.7);
    const sigR = (kick + snare + bass * 0.9 + leadOsc * (0.5 + panOffset) + hihat * 0.3);

    left[s] = Math.max(-0.95, Math.min(0.95, sigL));
    right[s] = Math.max(-0.95, Math.min(0.95, sigR));
  }

  // Pre-generate waveform peaks (120 bars)
  const peaksCount = 120;
  const step = Math.floor(totalSamples / peaksCount);
  const waveformPeaks = [];
  for (let p = 0; p < peaksCount; p++) {
    let peak = 0;
    const start = p * step;
    for (let i = 0; i < step; i += 10) {
      const val = Math.max(Math.abs(left[start + i] || 0), Math.abs(right[start + i] || 0));
      if (val > peak) peak = val;
    }
    waveformPeaks.push(Math.min(1, peak * 1.4));
  }

  const url = audioBufferToWavUrl(buffer);

  return {
    id: `demo-${type}`,
    title,
    artist,
    album: 'DV Music Originals',
    duration,
    bpm,
    url,
    format,
    bitrate,
    sampleRate: sampleRateStr,
    waveformPeaks,
    hotCues: [0, 8, 16, 24],
    isLocal: type === 'dreams',
    isFavorite: type === 'dreams',
    source: 'synthetic',
  };
}

// Compute waveform peaks for user-imported audio file
export async function extractWaveformFromFile(file, audioCtx) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const peaksCount = 120;
    const channelData = audioBuffer.getChannelData(0);
    const step = Math.floor(channelData.length / peaksCount);
    const peaks = [];

    for (let p = 0; p < peaksCount; p++) {
      let max = 0;
      const start = p * step;
      for (let i = 0; i < step; i += 15) {
        const val = Math.abs(channelData[start + i] || 0);
        if (val > max) max = val;
      }
      peaks.push(Math.min(1, max * 1.3));
    }

    return {
      peaks,
      duration: audioBuffer.duration,
    };
  } catch {
    const fallbackPeaks = Array.from({ length: 120 }, () => 0.2 + Math.random() * 0.7);
    return {
      peaks: fallbackPeaks,
      duration: 180,
    };
  }
}

// Cleanly extracts artist, title, album, and format from audio file names
export function parseAudioFilename(filename) {
  const ext = filename.split('.').pop()?.toUpperCase() || 'MP3';
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '').trim();

  // Handle "Artist - Title" pattern
  const parts = nameWithoutExt.split(/\s*[-–—]\s*/);
  if (parts.length >= 2) {
    const artist = parts[0].trim();
    const title = parts.slice(1).join(' - ').trim();
    return {
      artist: artist || 'Local Media',
      title: title || nameWithoutExt,
      album: `${artist} Tracks`,
      format: ext,
    };
  }

  return {
    artist: 'Local Media',
    title: nameWithoutExt,
    album: 'My Storage',
    format: ext,
  };
}

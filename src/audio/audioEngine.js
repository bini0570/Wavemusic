class AudioEngine {
  constructor() {
    this.ctx = null;
    this.audio = null;
    this.sourceNode = null;

    // 10-Band EQ filters
    this.eqFilters = new Map();
    this.eqFrequencies = [60, 170, 310, 600, 1000, 3000, 6000, 8000, 12000, 14000, 16000];

    // Effect nodes
    this.preGainNode = null;
    this.bassBoostNode = null;
    this.vocalBoostFilter = null;
    this.trebleBoostFilter = null;

    // Echo / Delay
    this.delayNode = null;
    this.delayFeedback = null;
    this.delayWetGain = null;

    // Reverb
    this.convolverNode = null;
    this.reverbWetGain = null;
    this.reverbDryGain = null;
    this.reverbOutputGain = null;

    // 8D Audio Panner Node
    this.pannerNode = null;
    this.stereoPannerNode = null;
    this.eightDAnimationId = null;
    this.eightDAngle = 0;
    this.eightDEnabled = false;
    this.eightDSpeed = 8.0; // seconds per rev
    this.onEightDAngleUpdate = null;

    // Night Mode / Master Compressor
    this.compressorNode = null;
    this.masterGainNode = null;
    this.analyserNode = null;

    // State
    this.effectsActive = true;
    this.currentEffect = 'normal';
  }

  init() {
    if (this.ctx) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.audio = new Audio();
    this.audio.crossOrigin = 'anonymous';
    this.audio.preload = 'auto';

    this.sourceNode = this.ctx.createMediaElementSource(this.audio);

    this.preGainNode = this.ctx.createGain();
    this.preGainNode.gain.value = 1.0;

    // 1. Build 10-Band Graphic Equalizer Chain
    let lastNode = this.preGainNode;
    this.sourceNode.connect(this.preGainNode);

    this.eqFrequencies.forEach((freq, idx) => {
      const filter = this.ctx.createBiquadFilter();
      if (idx === 0) {
        filter.type = 'lowshelf';
      } else if (idx === this.eqFrequencies.length - 1) {
        filter.type = 'highshelf';
      } else {
        filter.type = 'peaking';
        filter.Q.value = 1.4;
      }
      filter.frequency.value = freq;
      filter.gain.value = 0;

      lastNode.connect(filter);
      lastNode = filter;
      this.eqFilters.set(freq, filter);
    });

    // 2. Bass Boost Filter Node
    this.bassBoostNode = this.ctx.createBiquadFilter();
    this.bassBoostNode.type = 'lowshelf';
    this.bassBoostNode.frequency.value = 95;
    this.bassBoostNode.gain.value = 0;
    lastNode.connect(this.bassBoostNode);
    lastNode = this.bassBoostNode;

    // 2b. Vocal Boost Peaking Filter (1.8 kHz - 3.5 kHz)
    this.vocalBoostFilter = this.ctx.createBiquadFilter();
    this.vocalBoostFilter.type = 'peaking';
    this.vocalBoostFilter.frequency.value = 2400;
    this.vocalBoostFilter.Q.value = 1.6;
    this.vocalBoostFilter.gain.value = 0;
    lastNode.connect(this.vocalBoostFilter);
    lastNode = this.vocalBoostFilter;

    // 2c. Treble Boost Highshelf Filter (8 kHz+)
    this.trebleBoostFilter = this.ctx.createBiquadFilter();
    this.trebleBoostFilter.type = 'highshelf';
    this.trebleBoostFilter.frequency.value = 8000;
    this.trebleBoostFilter.gain.value = 0;
    lastNode.connect(this.trebleBoostFilter);
    lastNode = this.trebleBoostFilter;

    // 2d. Echo / Delay Effect Node Chain
    this.delayNode = this.ctx.createDelay(1.0);
    this.delayNode.delayTime.value = 0.28; // 280ms tempo delay
    this.delayFeedback = this.ctx.createGain();
    this.delayFeedback.gain.value = 0.35; // feedback decay
    this.delayWetGain = this.ctx.createGain();
    this.delayWetGain.gain.value = 0;

    lastNode.connect(this.delayNode);
    this.delayNode.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);
    this.delayNode.connect(this.delayWetGain);

    // 3. Convolver & Reverb Nodes for 3D Ambience
    this.convolverNode = this.ctx.createConvolver();
    this.reverbWetGain = this.ctx.createGain();
    this.reverbDryGain = this.ctx.createGain();
    this.reverbOutputGain = this.ctx.createGain();

    this.reverbWetGain.gain.value = 0;
    this.reverbDryGain.gain.value = 1.0;
    this.reverbOutputGain.gain.value = 1.0;

    this.createSyntheticImpulse(1.8);

    lastNode.connect(this.reverbDryGain);
    lastNode.connect(this.convolverNode);
    this.convolverNode.connect(this.reverbWetGain);

    this.reverbDryGain.connect(this.reverbOutputGain);
    this.reverbWetGain.connect(this.reverbOutputGain);
    this.delayWetGain.connect(this.reverbOutputGain);
    lastNode = this.reverbOutputGain;

    // 4. 8D Audio Binaural Spatializer
    try {
      this.pannerNode = this.ctx.createPanner();
      this.pannerNode.panningModel = 'HRTF';
      this.pannerNode.distanceModel = 'inverse';
      this.pannerNode.positionX.value = 0;
      this.pannerNode.positionY.value = 0;
      this.pannerNode.positionZ.value = -1;
      lastNode.connect(this.pannerNode);
      lastNode = this.pannerNode;
    } catch {
      if (this.ctx.createStereoPanner) {
        this.stereoPannerNode = this.ctx.createStereoPanner();
        lastNode.connect(this.stereoPannerNode);
        lastNode = this.stereoPannerNode;
      }
    }

    // 5. Dynamics Compressor (Limiter & Night Mode leveler)
    this.compressorNode = this.ctx.createDynamicsCompressor();
    this.compressorNode.threshold.value = -3;
    this.compressorNode.knee.value = 6;
    this.compressorNode.ratio.value = 6;
    this.compressorNode.attack.value = 0.005;
    this.compressorNode.release.value = 0.15;
    lastNode.connect(this.compressorNode);

    // 6. Master Gain
    this.masterGainNode = this.ctx.createGain();
    this.masterGainNode.gain.value = 0.9;
    this.compressorNode.connect(this.masterGainNode);

    // 7. Analyser for Real-Time Visualizer
    this.analyserNode = this.ctx.createAnalyser();
    this.analyserNode.fftSize = 256;
    this.analyserNode.smoothingTimeConstant = 0.78;
    this.analyserNode.minDecibels = -85;
    this.analyserNode.maxDecibels = -15;

    this.masterGainNode.connect(this.analyserNode);
    this.analyserNode.connect(this.ctx.destination);

    // Start 8D orbital tick
    this.start8DAnimation();
  }

  createSyntheticImpulse(durationSec) {
    if (!this.ctx || !this.convolverNode) return;
    const rate = this.ctx.sampleRate;
    const len = Math.floor(rate * durationSec);
    const impulse = this.ctx.createBuffer(2, len, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < len; i++) {
      const decay = Math.exp((-i / rate) * 3.5);
      left[i] = (Math.random() * 2 - 1) * decay * 0.8;
      right[i] = (Math.random() * 2 - 1) * decay * 0.8;
    }
    this.convolverNode.buffer = impulse;
  }

  getAudioContext() {
    if (!this.ctx) this.init();
    return this.ctx;
  }

  getAudioElement() {
    return this.audio;
  }

  getAnalyser() {
    return this.analyserNode;
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  loadTrack(url) {
    if (!this.audio) this.init();
    if (!this.audio) return;
    this.audio.src = url;
    this.audio.load();
  }

  async play() {
    if (!this.audio) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    return this.audio?.play();
  }

  pause() {
    this.audio?.pause();
  }

  togglePlay() {
    if (!this.audio) return;
    if (this.audio.paused) {
      this.play();
    } else {
      this.pause();
    }
  }

  seek(seconds) {
    if (!this.audio) return;
    this.audio.currentTime = Math.max(0, Math.min(this.audio.duration || 0, seconds));
  }

  setVolume(vol) {
    if (this.masterGainNode && this.ctx) {
      this.masterGainNode.gain.setTargetAtTime(Math.max(0, Math.min(1.0, vol)), this.ctx.currentTime, 0.02);
    }
  }

  getVolume() {
    return this.masterGainNode ? this.masterGainNode.gain.value : 0.9;
  }

  getSampleRate() {
    return this.ctx ? this.ctx.sampleRate : 48000;
  }

  // 10-Band Graphic EQ update
  setTenBandEq(bands) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const bandMap = {
      60: bands.b60,
      170: bands.b170,
      310: bands.b310,
      600: bands.b600,
      1000: bands.b1k,
      3000: bands.b3k,
      6000: bands.b6k,
      8000: bands.b8k,
      12000: bands.b12k,
      14000: bands.b14k,
      16000: bands.b16k,
    };

    this.eqFrequencies.forEach((freq) => {
      const node = this.eqFilters.get(freq);
      if (node && bandMap[freq] !== undefined) {
        node.gain.setTargetAtTime(this.effectsActive ? bandMap[freq] : 0, t, 0.03);
      }
    });
  }

  // Set Effect Preset
  setEffectPreset(preset, enabled) {
    this.effectsActive = enabled;
    this.currentEffect = preset;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Reset base parameters
    if (this.bassBoostNode) this.bassBoostNode.gain.setTargetAtTime(0, t, 0.03);
    if (this.vocalBoostFilter) this.vocalBoostFilter.gain.setTargetAtTime(0, t, 0.03);
    if (this.trebleBoostFilter) this.trebleBoostFilter.gain.setTargetAtTime(0, t, 0.03);
    if (this.delayWetGain) this.delayWetGain.gain.setTargetAtTime(0, t, 0.03);
    if (this.reverbWetGain) this.reverbWetGain.gain.setTargetAtTime(0, t, 0.03);
    if (this.reverbDryGain) this.reverbDryGain.gain.setTargetAtTime(1.0, t, 0.03);
    if (this.compressorNode) {
      this.compressorNode.threshold.setTargetAtTime(-3, t, 0.03);
      this.compressorNode.ratio.setTargetAtTime(6, t, 0.03);
    }
    this.eightDEnabled = false;

    if (!enabled) return;

    switch (preset) {
      case '8d':
        this.eightDEnabled = true;
        if (this.reverbWetGain) this.reverbWetGain.gain.setTargetAtTime(0.24, t, 0.03);
        break;

      case 'bass_boost':
        if (this.bassBoostNode) this.bassBoostNode.gain.setTargetAtTime(8.5, t, 0.03);
        break;

      case 'trubass':
        if (this.bassBoostNode) this.bassBoostNode.gain.setTargetAtTime(12.0, t, 0.03);
        break;

      case 'vocal_boost':
        if (this.vocalBoostFilter) this.vocalBoostFilter.gain.setTargetAtTime(7.0, t, 0.03);
        break;

      case 'treble_boost':
        if (this.trebleBoostFilter) this.trebleBoostFilter.gain.setTargetAtTime(8.0, t, 0.03);
        break;

      case 'echo':
        if (this.delayWetGain) this.delayWetGain.gain.setTargetAtTime(0.45, t, 0.03);
        break;

      case 'reverb':
        if (this.reverbWetGain) this.reverbWetGain.gain.setTargetAtTime(0.55, t, 0.03);
        break;

      case 'virtualizer':
      case 'wide_stereo':
        if (this.reverbWetGain) this.reverbWetGain.gain.setTargetAtTime(0.32, t, 0.03);
        if (this.delayWetGain) this.delayWetGain.gain.setTargetAtTime(0.18, t, 0.03);
        break;

      case 'surround':
        if (this.reverbWetGain) this.reverbWetGain.gain.setTargetAtTime(0.48, t, 0.03);
        break;

      case 'night_mode':
        if (this.compressorNode) {
          this.compressorNode.threshold.setTargetAtTime(-18, t, 0.03);
          this.compressorNode.ratio.setTargetAtTime(12, t, 0.03);
        }
        break;

      case 'normal':
      default:
        break;
    }
  }

  // 8D Audio Animation loop
  onEightDAngle(callback) {
    this.onEightDAngleUpdate = callback;
  }

  setEightDSpeed(speedSeconds) {
    this.eightDSpeed = Math.max(2, Math.min(24, speedSeconds));
  }

  start8DAnimation() {
    let lastTime = performance.now();

    const loop = (now) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (this.eightDEnabled && (!this.audio || !this.audio.paused)) {
        const delta = (360 / this.eightDSpeed) * dt;
        this.eightDAngle = (this.eightDAngle + delta) % 360;

        const rad = (this.eightDAngle * Math.PI) / 180;
        const x = Math.cos(rad);
        const z = Math.sin(rad);

        if (this.pannerNode && this.ctx) {
          this.pannerNode.positionX.setTargetAtTime(x * 1.2, this.ctx.currentTime, 0.05);
          this.pannerNode.positionZ.setTargetAtTime(z * 1.2, this.ctx.currentTime, 0.05);
        } else if (this.stereoPannerNode && this.ctx) {
          this.stereoPannerNode.pan.setTargetAtTime(x, this.ctx.currentTime, 0.05);
        }

        if (this.onEightDAngleUpdate) {
          this.onEightDAngleUpdate(this.eightDAngle);
        }
      } else if (!this.eightDEnabled && this.pannerNode && this.ctx) {
        this.pannerNode.positionX.setTargetAtTime(0, this.ctx.currentTime, 0.05);
        this.pannerNode.positionZ.setTargetAtTime(-1, this.ctx.currentTime, 0.05);
      }

      this.eightDAnimationId = requestAnimationFrame(loop);
    };

    this.eightDAnimationId = requestAnimationFrame(loop);
  }

  destroy() {
    if (this.eightDAnimationId) cancelAnimationFrame(this.eightDAnimationId);
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
    }
    if (this.ctx) this.ctx.close();
  }
}

export const audioEngine = new AudioEngine();

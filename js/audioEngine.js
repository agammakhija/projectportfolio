/**
 * Audio Engine for AgamOS & 3D Retro Room
 * Pure Web Audio API synthesis - zero external audio asset dependencies!
 */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.masterGain = null;
    this.bgmGain = null;
    this.sfxGain = null;
    this.isPlayingMusic = false;
    this.currentTrackIndex = 0;
    this.musicTimer = null;
    this.stepIndex = 0;
    this.analyser = null;
    this.dataArray = null;

    this.tracks = [
      {
        id: 1,
        name: "Spider-Man '67 Theme (Classic Chiptune)",
        bpm: 130,
        totalSteps: 128,
        leadWave: "square",
        leadFilterFreq: 2200,
        leadVol: 0.18,
        bassWave: "sawtooth",
        melody: {
          // Bar 1: Spi-der-Man, Spi-der-Man
          0: { note: 62, dur: 2 }, 3: { note: 65, dur: 2 }, 6: { note: 67, dur: 5 },
          8: { note: 62, dur: 2 }, 11: { note: 65, dur: 2 }, 14: { note: 67, dur: 5 },
          // Bar 2: Does whatever a spider can
          16: { note: 62, dur: 2 }, 18: { note: 65, dur: 2 }, 20: { note: 67, dur: 2 },
          22: { note: 69, dur: 2 }, 24: { note: 67, dur: 2 }, 26: { note: 65, dur: 2 },
          28: { note: 62, dur: 4 },
          // Bar 3: Spins a web, any size
          32: { note: 67, dur: 2 }, 35: { note: 70, dur: 2 }, 38: { note: 72, dur: 5 },
          40: { note: 67, dur: 2 }, 43: { note: 70, dur: 2 }, 46: { note: 72, dur: 5 },
          // Bar 4: Catches thieves just like flies
          48: { note: 67, dur: 2 }, 50: { note: 70, dur: 2 }, 52: { note: 72, dur: 2 },
          54: { note: 74, dur: 2 }, 56: { note: 72, dur: 2 }, 58: { note: 70, dur: 2 },
          60: { note: 67, dur: 4 },
          // Bar 5: Look out! Here comes the Spi-
          64: { note: 69, dur: 3 }, 68: { note: 69, dur: 3 },
          72: { note: 72, dur: 2 }, 74: { note: 69, dur: 2 }, 76: { note: 67, dur: 2 }, 78: { note: 65, dur: 2 },
          // Bar 6: -der-Man!
          80: { note: 62, dur: 6 }, 88: { note: 62, dur: 2 }, 90: { note: 65, dur: 2 }, 92: { note: 67, dur: 2 }, 94: { note: 69, dur: 2 },
          // Bar 7: Is he strong? Listen bud,
          96: { note: 62, dur: 2 }, 99: { note: 65, dur: 2 }, 102: { note: 67, dur: 5 },
          104: { note: 62, dur: 2 }, 107: { note: 65, dur: 2 }, 110: { note: 67, dur: 5 },
          // Bar 8: He's got radioactive blood!
          112: { note: 62, dur: 2 }, 114: { note: 65, dur: 2 }, 116: { note: 67, dur: 2 },
          118: { note: 69, dur: 2 }, 120: { note: 67, dur: 2 }, 122: { note: 65, dur: 2 },
          124: { note: 62, dur: 4 }
        },
        bass: {
          // Walking Blues Bass (D minor, G minor, A dominant)
          0: { note: 38, dur: 3 }, 4: { note: 41, dur: 3 }, 8: { note: 43, dur: 3 }, 12: { note: 44, dur: 3 },
          16: { note: 45, dur: 3 }, 20: { note: 44, dur: 3 }, 24: { note: 43, dur: 3 }, 28: { note: 41, dur: 3 },
          32: { note: 43, dur: 3 }, 36: { note: 46, dur: 3 }, 40: { note: 48, dur: 3 }, 44: { note: 49, dur: 3 },
          48: { note: 50, dur: 3 }, 52: { note: 49, dur: 3 }, 56: { note: 48, dur: 3 }, 60: { note: 46, dur: 3 },
          64: { note: 45, dur: 3 }, 68: { note: 43, dur: 3 }, 72: { note: 41, dur: 3 }, 76: { note: 40, dur: 3 },
          80: { note: 38, dur: 3 }, 84: { note: 41, dur: 3 }, 88: { note: 43, dur: 3 }, 92: { note: 45, dur: 3 },
          96: { note: 38, dur: 3 }, 100: { note: 41, dur: 3 }, 104: { note: 43, dur: 3 }, 108: { note: 44, dur: 3 },
          112: { note: 45, dur: 3 }, 116: { note: 44, dur: 3 }, 120: { note: 43, dur: 3 }, 124: { note: 38, dur: 4 }
        }
      },
      {
        id: 2,
        name: "Spider-Man '02 Theme (Danny Elfman)",
        bpm: 104,
        totalSteps: 128,
        leadWave: "sawtooth",
        leadFilterFreq: 1900,
        leadVol: 0.20,
        bassWave: "sawtooth",
        melody: {
          // Bar 1: Heroic horn motif
          0: { note: 50, dur: 3 }, 4: { note: 57, dur: 2 }, 6: { note: 58, dur: 2 }, 8: { note: 57, dur: 3 }, 12: { note: 55, dur: 3 },
          // Bar 2
          16: { note: 53, dur: 3 }, 20: { note: 52, dur: 3 }, 24: { note: 50, dur: 6 }, 30: { note: 52, dur: 2 },
          // Bar 3: Octave leap
          32: { note: 50, dur: 3 }, 36: { note: 57, dur: 2 }, 38: { note: 58, dur: 2 }, 40: { note: 62, dur: 3 }, 44: { note: 60, dur: 3 },
          // Bar 4
          48: { note: 58, dur: 3 }, 52: { note: 57, dur: 2 }, 54: { note: 55, dur: 2 }, 56: { note: 57, dur: 6 },
          // Bar 5: Web swinging climb
          64: { note: 53, dur: 2 }, 66: { note: 55, dur: 2 }, 68: { note: 57, dur: 3 }, 72: { note: 62, dur: 3 }, 76: { note: 61, dur: 3 },
          // Bar 6
          80: { note: 62, dur: 3 }, 84: { note: 64, dur: 2 }, 86: { note: 65, dur: 2 }, 88: { note: 62, dur: 6 }, 94: { note: 57, dur: 2 },
          // Bar 7: Soaring brass
          96: { note: 65, dur: 3 }, 100: { note: 64, dur: 2 }, 102: { note: 62, dur: 2 }, 104: { note: 60, dur: 3 }, 108: { note: 58, dur: 3 },
          // Bar 8: Resolution
          112: { note: 57, dur: 3 }, 116: { note: 55, dur: 2 }, 118: { note: 53, dur: 2 }, 120: { note: 50, dur: 7 }
        },
        bass: {
          // Driving orchestral sixteenths in D minor
          0: { note: 26, dur: 2 }, 2: { note: 26, dur: 2 }, 4: { note: 26, dur: 2 }, 6: { note: 26, dur: 2 },
          8: { note: 26, dur: 2 }, 10: { note: 26, dur: 2 }, 12: { note: 26, dur: 2 }, 14: { note: 26, dur: 2 },
          16: { note: 29, dur: 2 }, 18: { note: 29, dur: 2 }, 20: { note: 28, dur: 2 }, 22: { note: 28, dur: 2 },
          24: { note: 26, dur: 2 }, 26: { note: 26, dur: 2 }, 28: { note: 26, dur: 2 }, 30: { note: 28, dur: 2 },
          32: { note: 26, dur: 2 }, 34: { note: 26, dur: 2 }, 36: { note: 26, dur: 2 }, 38: { note: 26, dur: 2 },
          40: { note: 26, dur: 2 }, 42: { note: 26, dur: 2 }, 44: { note: 26, dur: 2 }, 46: { note: 26, dur: 2 },
          48: { note: 34, dur: 2 }, 50: { note: 34, dur: 2 }, 52: { note: 33, dur: 2 }, 54: { note: 31, dur: 2 },
          56: { note: 33, dur: 2 }, 58: { note: 33, dur: 2 }, 60: { note: 33, dur: 2 }, 62: { note: 33, dur: 2 },
          64: { note: 29, dur: 2 }, 66: { note: 31, dur: 2 }, 68: { note: 33, dur: 2 }, 70: { note: 33, dur: 2 },
          72: { note: 38, dur: 2 }, 74: { note: 38, dur: 2 }, 76: { note: 37, dur: 2 }, 78: { note: 37, dur: 2 },
          80: { note: 38, dur: 2 }, 82: { note: 38, dur: 2 }, 84: { note: 40, dur: 2 }, 86: { note: 41, dur: 2 },
          88: { note: 38, dur: 2 }, 90: { note: 38, dur: 2 }, 92: { note: 38, dur: 2 }, 94: { note: 33, dur: 2 },
          96: { note: 41, dur: 2 }, 98: { note: 41, dur: 2 }, 100: { note: 40, dur: 2 }, 102: { note: 38, dur: 2 },
          104: { note: 36, dur: 2 }, 106: { note: 36, dur: 2 }, 108: { note: 34, dur: 2 }, 110: { note: 34, dur: 2 },
          112: { note: 33, dur: 2 }, 114: { note: 33, dur: 2 }, 116: { note: 31, dur: 2 }, 118: { note: 29, dur: 2 },
          120: { note: 26, dur: 3 }, 124: { note: 26, dur: 3 }
        }
      },
      {
        id: 3,
        name: "Spider-Man '94 (Radioactive Synth)",
        bpm: 136,
        totalSteps: 128,
        leadWave: "sawtooth",
        leadFilterFreq: 2600,
        leadVol: 0.19,
        bassWave: "sawtooth",
        melody: {
          // Bar 1: Spi-der-Man, Spi-der-Man
          0: { note: 64, dur: 2 }, 2: { note: 64, dur: 2 }, 4: { note: 67, dur: 2 }, 6: { note: 69, dur: 2 },
          8: { note: 70, dur: 2 }, 10: { note: 69, dur: 2 }, 12: { note: 67, dur: 2 }, 14: { note: 64, dur: 2 },
          // Bar 2
          16: { note: 64, dur: 2 }, 18: { note: 64, dur: 2 }, 20: { note: 67, dur: 2 }, 22: { note: 69, dur: 2 },
          24: { note: 74, dur: 2 }, 26: { note: 71, dur: 2 }, 28: { note: 69, dur: 2 }, 30: { note: 67, dur: 2 },
          // Bar 3: Ra-di-o-ac-tive Spi-der-Man!
          32: { note: 71, dur: 2 }, 34: { note: 71, dur: 2 }, 36: { note: 69, dur: 2 }, 38: { note: 67, dur: 2 },
          40: { note: 64, dur: 2 }, 42: { note: 64, dur: 2 }, 44: { note: 67, dur: 2 }, 46: { note: 69, dur: 2 },
          // Bar 4
          48: { note: 70, dur: 2 }, 50: { note: 69, dur: 2 }, 52: { note: 67, dur: 2 }, 56: { note: 64, dur: 4 },
          // Bar 5: Solo synth lick
          64: { note: 64, dur: 2 }, 66: { note: 67, dur: 2 }, 68: { note: 69, dur: 2 }, 70: { note: 71, dur: 2 },
          72: { note: 74, dur: 2 }, 74: { note: 71, dur: 2 }, 76: { note: 74, dur: 2 }, 78: { note: 76, dur: 2 },
          // Bar 6
          80: { note: 76, dur: 3 }, 84: { note: 74, dur: 3 }, 88: { note: 71, dur: 3 }, 92: { note: 69, dur: 3 },
          // Bar 7: Chromatic descent
          96: { note: 70, dur: 2 }, 98: { note: 69, dur: 2 }, 100: { note: 67, dur: 2 }, 102: { note: 64, dur: 2 },
          104: { note: 67, dur: 2 }, 106: { note: 69, dur: 2 }, 108: { note: 70, dur: 2 }, 110: { note: 71, dur: 2 },
          // Bar 8: Final punch
          112: { note: 64, dur: 3 }, 116: { note: 64, dur: 3 }, 120: { note: 64, dur: 3 }, 124: { note: 64, dur: 4 }
        },
        bass: {
          // Pumping E minor 16th-note synth rock bass
          0: { note: 28, dur: 2 }, 2: { note: 28, dur: 2 }, 4: { note: 28, dur: 2 }, 6: { note: 28, dur: 2 },
          8: { note: 31, dur: 2 }, 10: { note: 31, dur: 2 }, 12: { note: 33, dur: 2 }, 14: { note: 33, dur: 2 },
          16: { note: 28, dur: 2 }, 18: { note: 28, dur: 2 }, 20: { note: 28, dur: 2 }, 22: { note: 28, dur: 2 },
          24: { note: 38, dur: 2 }, 26: { note: 35, dur: 2 }, 28: { note: 33, dur: 2 }, 30: { note: 31, dur: 2 },
          32: { note: 35, dur: 2 }, 34: { note: 35, dur: 2 }, 36: { note: 33, dur: 2 }, 38: { note: 31, dur: 2 },
          40: { note: 28, dur: 2 }, 42: { note: 28, dur: 2 }, 44: { note: 31, dur: 2 }, 46: { note: 33, dur: 2 },
          48: { note: 34, dur: 2 }, 50: { note: 33, dur: 2 }, 52: { note: 31, dur: 2 }, 56: { note: 28, dur: 4 },
          64: { note: 28, dur: 2 }, 66: { note: 28, dur: 2 }, 68: { note: 28, dur: 2 }, 70: { note: 28, dur: 2 },
          72: { note: 31, dur: 2 }, 74: { note: 31, dur: 2 }, 76: { note: 33, dur: 2 }, 78: { note: 33, dur: 2 },
          80: { note: 35, dur: 2 }, 84: { note: 33, dur: 2 }, 88: { note: 31, dur: 2 }, 92: { note: 28, dur: 2 },
          96: { note: 34, dur: 2 }, 98: { note: 33, dur: 2 }, 100: { note: 31, dur: 2 }, 102: { note: 28, dur: 2 },
          104: { note: 31, dur: 2 }, 106: { note: 33, dur: 2 }, 108: { note: 34, dur: 2 }, 110: { note: 35, dur: 2 },
          112: { note: 28, dur: 3 }, 116: { note: 28, dur: 3 }, 120: { note: 28, dur: 3 }, 124: { note: 28, dur: 4 }
        }
      }
    ];
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      // Master output
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

      // Separate BGM and SFX gains
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // Analyser for visualizer
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    } catch (e) {
      console.warn("Web Audio API not supported in this browser:", e);
    }
  }

  ensureContext() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  setMute(mute) {
    this.isMuted = mute;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(mute ? 0 : 0.7, this.ctx.currentTime);
    }
  }

  toggleMute() {
    this.setMute(!this.isMuted);
    return this.isMuted;
  }

  midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  // --- Retro Sound Effects ---

  playClick() {
    this.ensureContext();
    if (this.isMuted || !this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = "sine";
    osc.frequency.setValueAtTime(900, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.03);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.035);
  }

  playBlockBreak() {
    this.ensureContext();
    if (this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.08);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1200, t);
    filter.frequency.exponentialRampToValueAtTime(300, t + 0.08);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(t);
  }

  playBlockPlace() {
    this.ensureContext();
    if (this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.06);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.07);
  }

  playWindowOpen() {
    this.ensureContext();
    if (this.isMuted || !this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(620, t + 0.09);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.11);
  }

  playWindowClose() {
    this.ensureContext();
    if (this.isMuted || !this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(540, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.08);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.095);
  }

  playBeep(freq = 440, duration = 0.15) {
    this.ensureContext();
    if (this.isMuted || !this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + duration + 0.01);
  }

  playLampClick() {
    this.ensureContext();
    if (this.isMuted || !this.ctx) return;

    const t = this.ctx.currentTime;
    // Heavy mechanical switch sound
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(140, t);
    osc1.frequency.exponentialRampToValueAtTime(40, t + 0.05);

    osc2.type = "square";
    osc2.frequency.setValueAtTime(800, t);
    osc2.frequency.exponentialRampToValueAtTime(100, t + 0.02);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.07);
    osc2.stop(t + 0.07);
  }

  playPaperInspect() {
    this.ensureContext();
    if (this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.15);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1400, t);
    filter.frequency.exponentialRampToValueAtTime(2800, t + 0.12);
    filter.Q.value = 1.8;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(t);
  }

  playPaperPutDown() {
    this.ensureContext();
    if (this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.12);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1000, t);
    filter.frequency.exponentialRampToValueAtTime(250, t + 0.1);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(t);
  }

  playStartupChime() {
    this.ensureContext();
    if (this.isMuted || !this.ctx) return;

    // Authentic Windows 98 / 95 inspired warm polyphonic chime
    // Notes: Eb3, Bb3, Eb4, G4, Bb4, Eb5 chords with delay
    const chords = [
      { notes: [51, 58, 63], time: 0, dur: 1.8 },
      { notes: [55, 62, 67], time: 0.4, dur: 2.0 },
      { notes: [58, 65, 70, 75], time: 0.9, dur: 3.2 }
    ];

    chords.forEach(ch => {
      ch.notes.forEach(note => {
        const t = this.ctx.currentTime + ch.time;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(this.midiToFreq(note), t);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(400, t);
        filter.frequency.exponentialRampToValueAtTime(2400, t + 0.4);
        filter.frequency.exponentialRampToValueAtTime(700, t + ch.dur);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.12, t + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + ch.dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + ch.dur + 0.1);
      });
    });
  }

  // --- Algorithmic Music Player ---

  playTrack(index = null) {
    this.ensureContext();
    if (index !== null) {
      this.currentTrackIndex = index % this.tracks.length;
    }
    this.isPlayingMusic = true;
    this.stepIndex = 0;

    if (this.musicTimer) clearInterval(this.musicTimer);

    const track = this.tracks[this.currentTrackIndex];
    const totalSteps = track.totalSteps || 128;
    const stepInterval = (60 / track.bpm / 4) * 1000; // 16th notes

    this.musicTimer = setInterval(() => {
      if (!this.isPlayingMusic || !this.ctx || this.isMuted) return;
      this.playMusicStep(track);
      this.stepIndex = (this.stepIndex + 1) % totalSteps;
    }, stepInterval);
  }

  playMusicStep(track) {
    const t = this.ctx.currentTime;
    const step = this.stepIndex;
    const stepTime = 60 / track.bpm / 4;

    // 1. Drum Sequence
    // Kick drum
    if (step % 4 === 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(32, t + 0.1);
      gain.gain.setValueAtTime(0.38, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.connect(gain);
      gain.connect(this.bgmGain);
      osc.start(t);
      osc.stop(t + 0.13);
    }

    // Snare drum on 4, 12 of each 16-step bar
    if (step % 8 === 4) {
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.05);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.28));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 2000;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.055);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmGain);
      noise.start(t);
    }

    // Hi-hat on every odd step
    if (step % 2 === 1) {
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.025);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 7500;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.07, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.022);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmGain);
      noise.start(t);
    }

    // 2. Bassline
    const bass = track.bass ? track.bass[step] : null;
    if (bass) {
      const note = typeof bass === "object" ? bass.note : bass;
      const durSteps = typeof bass === "object" && bass.dur ? bass.dur : 2;
      const noteDuration = durSteps * stepTime * 0.88;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = track.bassWave || "sawtooth";
      osc.frequency.setValueAtTime(this.midiToFreq(note), t);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(450, t);
      filter.frequency.exponentialRampToValueAtTime(120, t + noteDuration);

      gain.gain.setValueAtTime(0.24, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + noteDuration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmGain);

      osc.start(t);
      osc.stop(t + noteDuration + 0.02);
    }

    // 3. Lead Melody Note
    const lead = track.melody ? track.melody[step] : null;
    if (lead) {
      const note = typeof lead === "object" ? lead.note : lead;
      const durSteps = typeof lead === "object" && lead.dur ? lead.dur : 2;
      const noteDuration = durSteps * stepTime * 0.92;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = track.leadWave || "square";
      osc.frequency.setValueAtTime(this.midiToFreq(note), t);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(track.leadFilterFreq || 2000, t);
      filter.Q.value = 1.8;

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(track.leadVol || 0.17, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, t + noteDuration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmGain);

      osc.start(t);
      osc.stop(t + noteDuration + 0.02);
    }
  }

  pauseTrack() {
    this.isPlayingMusic = false;
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  toggleTrack() {
    if (this.isPlayingMusic) {
      this.pauseTrack();
    } else {
      this.playTrack();
    }
    return this.isPlayingMusic;
  }

  nextTrack() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
    this.playTrack(this.currentTrackIndex);
    return this.tracks[this.currentTrackIndex];
  }

  prevTrack() {
    this.currentTrackIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
    this.playTrack(this.currentTrackIndex);
    return this.tracks[this.currentTrackIndex];
  }

  getCurrentTrack() {
    return this.tracks[this.currentTrackIndex];
  }

  getSpectrumData() {
    if (!this.analyser || !this.dataArray) {
      return new Uint8Array(32).fill(0);
    }
    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }
}

window.audioEngine = new AudioEngine();


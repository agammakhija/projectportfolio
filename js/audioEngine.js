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
        name: "Midnight Coder (Synthwave)",
        bpm: 115,
        bassScale: [36, 36, 43, 41, 36, 36, 44, 43], // MIDI notes
        leadScale: [60, 63, 67, 70, 72, 67, 63, 60, 65, 68, 72, 70, 67, 65, 63, 62],
        padChord: [48, 55, 60, 63]
      },
      {
        name: "8-Bit Nostalgia (Chiptune)",
        bpm: 130,
        bassScale: [48, 48, 51, 53, 48, 48, 55, 53],
        leadScale: [72, 75, 79, 82, 84, 79, 75, 79, 77, 80, 84, 82, 79, 77, 75, 74],
        padChord: [60, 64, 67, 71]
      },
      {
        name: "Cyber Sunset (Lo-Fi)",
        bpm: 85,
        bassScale: [36, 40, 41, 43, 36, 40, 43, 45],
        leadScale: [64, 67, 71, 72, 71, 67, 64, 62, 64, 69, 72, 76, 74, 71, 69, 67],
        padChord: [48, 52, 59, 64]
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
    const stepInterval = (60 / track.bpm / 4) * 1000; // 16th notes

    this.musicTimer = setInterval(() => {
      if (!this.isPlayingMusic || !this.ctx || this.isMuted) return;
      this.playMusicStep(track);
      this.stepIndex = (this.stepIndex + 1) % 16;
    }, stepInterval);
  }

  playMusicStep(track) {
    const t = this.ctx.currentTime;
    const step = this.stepIndex;

    // 1. Kick on 0, 4, 8, 12
    if (step % 4 === 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.1);
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.connect(gain);
      gain.connect(this.bgmGain);
      osc.start(t);
      osc.stop(t + 0.13);
    }

    // 2. Snare / HiHat on 2, 6, 10, 14
    if (step % 2 === 1) {
      const bufferSize = this.ctx.sampleRate * 0.04;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 6000;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmGain);

      whiteNoise.start(t);
    }

    // 3. Bassline
    const bassNote = track.bassScale[(Math.floor(step / 2)) % track.bassScale.length];
    if (step % 2 === 0 && bassNote) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(this.midiToFreq(bassNote), t);

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(320, t);
      filter.frequency.exponentialRampToValueAtTime(140, t + 0.15);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmGain);

      osc.start(t);
      osc.stop(t + 0.19);
    }

    // 4. Arpeggiated Melody
    const leadNote = track.leadScale[step % track.leadScale.length];
    if (leadNote && step % 2 === 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(this.midiToFreq(leadNote), t);

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 1600;

      gain.gain.setValueAtTime(0.09, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmGain);

      osc.start(t);
      osc.stop(t + 0.15);
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


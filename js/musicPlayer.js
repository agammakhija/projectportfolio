/**
 * Retro Winamp / CD Player App
 * Real-time spectrum visualizer & algorithmic synth player!
 */

class MusicPlayerApp {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.playBtn = this.container.querySelector(".player-btn-play");
    this.prevBtn = this.container.querySelector(".player-btn-prev");
    this.nextBtn = this.container.querySelector(".player-btn-next");
    this.titleMarquee = this.container.querySelector(".player-track-title");
    this.timeDisplay = this.container.querySelector(".player-time-display");
    this.volumeSlider = this.container.querySelector(".player-volume");
    this.canvas = this.container.querySelector(".player-visualizer-canvas");
    this.ctx = this.canvas ? this.canvas.getContext("2d") : null;

    this.secondsElapsed = 0;
    this.timer = null;

    this.init();
  }

  init() {
    if (this.playBtn) {
      this.playBtn.addEventListener("click", () => this.togglePlay());
    }
    if (this.prevBtn) {
      this.prevBtn.addEventListener("click", () => this.prevTrack());
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener("click", () => this.nextTrack());
    }
    if (this.volumeSlider) {
      this.volumeSlider.addEventListener("input", (e) => {
        const val = parseFloat(e.target.value);
        if (window.audioEngine && window.audioEngine.masterGain && window.audioEngine.ctx) {
          window.audioEngine.masterGain.gain.setValueAtTime(val, window.audioEngine.ctx.currentTime);
        }
      });
    }

    this.updateTrackInfo();
    this.startVisualizer();
  }

  togglePlay() {
    if (!window.audioEngine) return;
    const isPlaying = window.audioEngine.toggleTrack();

    if (isPlaying) {
      this.playBtn.innerHTML = "⏸";
      this.startTimer();
    } else {
      this.playBtn.innerHTML = "▶";
      this.stopTimer();
    }
    this.updateTrackInfo();
  }

  nextTrack() {
    if (!window.audioEngine) return;
    window.audioEngine.nextTrack();
    this.secondsElapsed = 0;
    this.playBtn.innerHTML = "⏸";
    this.startTimer();
    this.updateTrackInfo();
  }

  prevTrack() {
    if (!window.audioEngine) return;
    window.audioEngine.prevTrack();
    this.secondsElapsed = 0;
    this.playBtn.innerHTML = "⏸";
    this.startTimer();
    this.updateTrackInfo();
  }

  updateTrackInfo() {
    if (!window.audioEngine) return;
    const track = window.audioEngine.getCurrentTrack();
    if (track && this.titleMarquee) {
      this.titleMarquee.textContent = `${track.id}. ${track.name} [${track.bpm} BPM]`;
    }
  }

  startTimer() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.secondsElapsed++;
      const mins = Math.floor(this.secondsElapsed / 60).toString().padStart(2, "0");
      const secs = (this.secondsElapsed % 60).toString().padStart(2, "0");
      if (this.timeDisplay) {
        this.timeDisplay.textContent = `${mins}:${secs}`;
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  startVisualizer() {
    const render = () => {
      requestAnimationFrame(render);
      if (!this.ctx || !this.canvas) return;

      const w = this.canvas.width;
      const h = this.canvas.height;
      this.ctx.fillStyle = "#0c1117";
      this.ctx.fillRect(0, 0, w, h);

      const freqData = window.audioEngine ? window.audioEngine.getSpectrumData() : null;
      const numBars = 16;
      const barWidth = Math.floor(w / numBars) - 2;

      for (let i = 0; i < numBars; i++) {
        let val = 0;
        if (freqData && window.audioEngine.isPlayingMusic) {
          val = freqData[i * 2] || 0;
        } else {
          // Idle low resting wave
          val = Math.sin(Date.now() * 0.003 + i) * 10 + 12;
        }

        const barHeight = Math.max(3, (val / 255) * h);
        const x = i * (barWidth + 2) + 2;
        const y = h - barHeight;

        // Gradient coloring: green -> yellow -> red peak
        const grad = this.ctx.createLinearGradient(0, h, 0, 0);
        grad.addColorStop(0, "#22c55e");
        grad.addColorStop(0.65, "#eab308");
        grad.addColorStop(1, "#ef4444");

        this.ctx.fillStyle = grad;
        this.ctx.fillRect(x, y, barWidth, barHeight);

        // Top cap peak
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillRect(x, Math.max(0, y - 2), barWidth, 1);
      }
    };
    render();
  }
}

window.MusicPlayerApp = MusicPlayerApp;


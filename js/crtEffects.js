/**
 * CRT Visual Effects, Themes & Wallpaper Controller
 */

class CrtEffects {
  constructor() {
    this.crtContainer = document.getElementById("crt-screen-wrapper");
    this.desktop = document.getElementById("desktop");

    this.isCrtEnabled = true;
    this.isScanlinesEnabled = true;
    this.isCurvatureEnabled = true;
    this.currentTheme = "color"; // "color", "green", "amber"
    this.currentWallpaper = "teal";

    this.init();
  }

  init() {
    this.setupThemeSelectors();
    this.setupWallpaperSelectors();
    this.setupEffectToggles();
  }

  setupThemeSelectors() {
    const themeSelects = document.querySelectorAll(".crt-theme-option");
    themeSelects.forEach(opt => {
      opt.addEventListener("click", () => {
        const theme = opt.dataset.theme;
        this.setTheme(theme);
        themeSelects.forEach(o => o.classList.remove("selected"));
        opt.classList.add("selected");
        if (window.audioEngine) window.audioEngine.playClick();
      });
    });
  }

  setupWallpaperSelectors() {
    const wpOptions = document.querySelectorAll(".wallpaper-option");
    wpOptions.forEach(opt => {
      opt.addEventListener("click", () => {
        const wp = opt.dataset.wallpaper;
        this.setWallpaper(wp);
        wpOptions.forEach(o => o.classList.remove("selected"));
        opt.classList.add("selected");
        if (window.audioEngine) window.audioEngine.playClick();
      });
    });
  }

  setupEffectToggles() {
    const scanlineToggle = document.getElementById("toggle-scanlines");
    if (scanlineToggle) {
      scanlineToggle.addEventListener("change", (e) => {
        this.toggleScanlines(e.target.checked);
      });
    }

    const curveToggle = document.getElementById("toggle-curvature");
    if (curveToggle) {
      curveToggle.addEventListener("change", (e) => {
        this.toggleCurvature(e.target.checked);
      });
    }
  }

  toggleScanlines(enable) {
    this.isScanlinesEnabled = enable;
    if (this.crtContainer) {
      this.crtContainer.classList.toggle("no-scanlines", !enable);
    }
  }

  toggleCurvature(enable) {
    this.isCurvatureEnabled = enable;
    if (this.crtContainer) {
      this.crtContainer.classList.toggle("no-curve", !enable);
    }
  }

  setTheme(theme) {
    this.currentTheme = theme;
    if (!this.crtContainer) return;

    this.crtContainer.classList.remove("crt-green", "crt-amber", "crt-color");
    if (theme === "green") {
      this.crtContainer.classList.add("crt-green");
    } else if (theme === "amber") {
      this.crtContainer.classList.add("crt-amber");
    } else {
      this.crtContainer.classList.add("crt-color");
    }
  }

  setWallpaper(wp) {
    this.currentWallpaper = wp;
    if (!this.desktop) return;

    this.desktop.className = "desktop";
    this.desktop.classList.add(`wp-${wp}`);
  }
}

window.CrtEffects = CrtEffects;


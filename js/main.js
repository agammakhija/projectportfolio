/**
 * AgamOS & 3D Retro Workstation Entry Point
 * Orchestrates Boot Sequence, View Switching, App Populating, and Event Handlers
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Subsystems
  window.retroScene = new RetroScene("canvas-container");
  window.windowManager = new WindowManager();
  window.crtEffects = new CrtEffects();
  window.terminalApp = new TerminalApp("win-terminal");
  window.musicPlayerApp = new MusicPlayerApp("win-music");
  window.minesweeperApp = new MinesweeperApp("win-minesweeper");
  window.paintApp = new PaintApp("win-paint");
  window.minecraftApp = new MinecraftApp("win-minecraft");

  // 2. Populate Apps with Dynamic Data
  populateAboutApp();
  populateProjectsApp();
  populateResumeApp();
  populateContactApp();
  populateRecycleBin();

  // 3. Setup BIOS & Boot Sequence
  setupBootSequence();

  // 4. Setup HUD Navigation & Controls
  setupHudControls();

  // 5. Open Welcome / About Window by default
  setTimeout(() => {
    if (window.windowManager) {
      window.windowManager.openApp("about");
    }
  }, 1200);
});

// --- Dynamic App Content Populators ---

function populateAboutApp() {
  const data = window.PORTFOLIO_DATA.profile;
  const skills = window.PORTFOLIO_DATA.skills;

  const nameEl = document.getElementById("about-name");
  const titleEl = document.getElementById("about-title");
  const taglineEl = document.getElementById("about-tagline");
  const bioContainer = document.getElementById("about-bio");
  const statsContainer = document.getElementById("about-stats");
  const skillsContainer = document.getElementById("about-skills");

  if (nameEl) nameEl.textContent = data.name;
  if (titleEl) titleEl.textContent = data.title;
  if (taglineEl) taglineEl.textContent = data.tagline;

  if (bioContainer) {
    bioContainer.innerHTML = data.bio.map(p => `<p>${p}</p>`).join("");
  }

  if (statsContainer) {
    statsContainer.innerHTML = data.stats.map(s => `
      <div class="stat-card">
        <span class="stat-label">${s.label}</span>
        <span class="stat-value">${s.value}</span>
      </div>
    `).join("");
  }

  if (skillsContainer) {
    let html = "";
    Object.keys(skills).forEach(cat => {
      html += `<div class="skill-category">
        <h4>${cat}</h4>
        <div class="skill-bars">
          ${skills[cat].map(item => `
            <div class="skill-row">
              <span class="skill-name">${item.name}</span>
              <div class="skill-bar-track">
                <div class="skill-bar-fill" style="width: ${item.level}%"></div>
              </div>
              <span class="skill-pct">${item.level}%</span>
            </div>
          `).join("")}
        </div>
      </div>`;
    });
    skillsContainer.innerHTML = html;
  }
}

function populateProjectsApp() {
  const projects = window.PORTFOLIO_DATA.projects;
  const container = document.getElementById("projects-grid");
  const filterBtns = document.querySelectorAll(".project-filter-btn");

  const renderProjects = (filter = "all") => {
    if (!container) return;
    const filtered = filter === "all"
      ? projects
      : projects.filter(p => p.category.toLowerCase().includes(filter.toLowerCase()));

    container.innerHTML = filtered.map(p => `
      <div class="project-card" style="border-top: 3px solid ${p.accent}">
        <div class="project-card-header">
          <div class="project-title-row">
            <h3>${p.title}</h3>
            <span class="project-tag" style="background:${p.accent}22; color:${p.accent}">${p.tag}</span>
          </div>
          <span class="project-period">${p.period}</span>
        </div>
        <p class="project-desc">${p.description}</p>
        <div class="project-metrics">
          <span class="metric-icon">⚡</span> ${p.metrics}
        </div>
        <div class="project-tech-tags">
          ${p.tech.map(t => `<span class="tech-pill">${t}</span>`).join("")}
        </div>
        <div class="project-card-actions">
          <a href="${p.githubUrl}" target="_blank" rel="noopener noreferrer" class="retro-btn btn-sm">
            <span>🐙 GitHub</span>
          </a>
          <a href="${p.demoUrl}" target="_blank" rel="noopener noreferrer" class="retro-btn btn-sm btn-primary">
            <span>🚀 Live Demo</span>
          </a>
        </div>
      </div>
    `).join("");
  };

  renderProjects("all");

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const category = btn.dataset.filter;
      renderProjects(category);
      if (window.audioEngine) window.audioEngine.playClick();
    });
  });
}

function populateResumeApp() {
  const exp = window.PORTFOLIO_DATA.experience;
  const edu = window.PORTFOLIO_DATA.education;
  const expContainer = document.getElementById("resume-experience");
  const eduContainer = document.getElementById("resume-education");

  if (expContainer) {
    expContainer.innerHTML = exp.map(e => `
      <div class="resume-item">
        <div class="resume-item-header">
          <h4>${e.role}</h4>
          <span class="resume-dates">${e.period}</span>
        </div>
        <div class="resume-company">${e.company} • <i>${e.location}</i></div>
        <ul class="resume-bullets">
          ${e.bullets.map(b => `<li>${b}</li>`).join("")}
        </ul>
      </div>
    `).join("");
  }

  if (eduContainer) {
    eduContainer.innerHTML = edu.map(ed => `
      <div class="resume-item">
        <div class="resume-item-header">
          <h4>${ed.degree}</h4>
          <span class="resume-dates">${ed.period}</span>
        </div>
        <div class="resume-company">${ed.institution}</div>
        <p class="resume-details">${ed.details}</p>
      </div>
    `).join("");
  }

  // Print button
  const printBtn = document.getElementById("resume-btn-print");
  if (printBtn) {
    printBtn.addEventListener("click", () => {
      window.print();
    });
  }
}

function populateContactApp() {
  const p = window.PORTFOLIO_DATA.profile;
  const form = document.getElementById("contact-form");
  const emailLink = document.getElementById("contact-direct-email");

  if (emailLink) {
    emailLink.href = `mailto:${p.email}`;
    emailLink.textContent = p.email;
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("contact-name").value;
      const email = document.getElementById("contact-email").value;
      const subject = document.getElementById("contact-subject").value;
      const msg = document.getElementById("contact-msg").value;

      // Construct mailto link as reliable zero-backend client
      const mailtoUrl = `mailto:${p.email}?subject=${encodeURIComponent(subject || "Portfolio Contact: " + name)}&body=${encodeURIComponent("From: " + name + " (" + email + ")\n\n" + msg)}`;
      window.location.href = mailtoUrl;

      // Show confirmation dialog
      alert(`Thank you, ${name}! Your default email client will open with your message for ${p.email}.`);
      form.reset();
      if (window.audioEngine) window.audioEngine.playStartupChime();
    });
  }
}

function populateRecycleBin() {
  const container = document.getElementById("recycle-bin-items");
  const files = window.PORTFOLIO_DATA.easterEggs.trashFiles;

  if (container) {
    container.innerHTML = files.map(f => `
      <div class="trash-file-item" data-info="${f.info}">
        <span class="trash-icon">🗑️</span>
        <span class="trash-name">${f.name}</span>
      </div>
    `).join("");

    container.querySelectorAll(".trash-file-item").forEach(item => {
      item.addEventListener("dblclick", () => {
        alert(item.dataset.info);
        if (window.audioEngine) window.audioEngine.playBeep(640, 0.1);
      });
    });
  }
}

// --- BIOS & Boot Sequence ---

function setupBootSequence() {
  const bootOverlay = document.getElementById("boot-overlay");
  const biosScreen = document.getElementById("bios-screen");
  const splashScreen = document.getElementById("splash-screen");
  const progressFill = document.getElementById("boot-progress-fill");

  const startBoot = () => {
    if (!bootOverlay) return;

    bootOverlay.style.display = "flex";
    bootOverlay.style.opacity = "1";
    if (biosScreen) biosScreen.style.display = "block";
    if (splashScreen) splashScreen.style.display = "none";

    // Play stepper / floppy buzz
    if (window.audioEngine) {
      window.audioEngine.playBeep(120, 0.08);
    }

    setTimeout(() => {
      if (biosScreen) biosScreen.style.display = "none";
      if (splashScreen) splashScreen.style.display = "flex";

      let progress = 0;
      const progTimer = setInterval(() => {
        progress += 15;
        if (progressFill) progressFill.style.width = `${progress}%`;

        if (progress >= 100) {
          clearInterval(progTimer);
          setTimeout(() => {
            bootOverlay.style.opacity = "0";
            setTimeout(() => {
              bootOverlay.style.display = "none";
              if (window.audioEngine) {
                window.audioEngine.playStartupChime();
              }
            }, 600);
          }, 300);
        }
      }, 100);
    }, 1200);
  };

  // Run on initial load
  startBoot();

  // Listen for reboot requests
  window.addEventListener("rebootAgamOS", () => {
    startBoot();
  });
}

// --- HUD & View Transitions ---

function setupHudControls() {
  const viewToggleBtn = document.getElementById("hud-btn-view");
  const lampToggleBtn = document.getElementById("hud-btn-lamp");
  const soundToggleBtn = document.getElementById("hud-btn-sound");
  const crtToggleBtn = document.getElementById("hud-btn-crt");
  const crtWrapper = document.getElementById("crt-screen-wrapper");

  let currentView = "desk"; // "desk" or "monitor"

  const setView = (mode) => {
    currentView = mode;
    if (window.retroScene) {
      window.retroScene.setCameraView(mode);
    }

    if (viewToggleBtn) {
      viewToggleBtn.innerHTML = mode === "desk"
        ? `<span>📺 Enter AgamOS (Screen)</span>`
        : `<span>🪑 Desk Overview (3D Room)</span>`;
    }

    // When in monitor mode, elevate CRT wrapper for crisp high-density interaction
    if (crtWrapper) {
      crtWrapper.classList.toggle("fullscreen-mode", mode === "monitor");
    }
  };

  if (viewToggleBtn) {
    viewToggleBtn.addEventListener("click", () => {
      setView(currentView === "desk" ? "monitor" : "desk");
      if (window.audioEngine) window.audioEngine.playClick();
    });
  }

  const crtExitBtn = document.getElementById("crt-exit-btn");
  if (crtExitBtn) {
    crtExitBtn.addEventListener("click", () => {
      setView("desk");
      if (window.audioEngine) window.audioEngine.playClick();
    });
  }

  // Custom Event from 3D scene when monitor is clicked
  window.addEventListener("enterAgamOS", () => {
    setView("monitor");
  });

  // Desk Lamp Toggle
  if (lampToggleBtn) {
    lampToggleBtn.addEventListener("click", () => {
      if (window.retroScene) {
        const isOn = window.retroScene.toggleLamp();
        lampToggleBtn.classList.toggle("active", isOn);
      }
    });
  }

  // Sound Mute Toggle
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener("click", () => {
      if (window.audioEngine) {
        const isMuted = window.audioEngine.toggleMute();
        soundToggleBtn.innerHTML = isMuted ? `<span>🔇 Sound: OFF</span>` : `<span>🔊 Sound: ON</span>`;
        soundToggleBtn.classList.toggle("muted", isMuted);
      }
    });
  }

  // CRT Scanlines Toggle
  if (crtToggleBtn) {
    crtToggleBtn.addEventListener("click", () => {
      if (window.crtEffects) {
        const newState = !window.crtEffects.isScanlinesEnabled;
        window.crtEffects.toggleScanlines(newState);
        crtToggleBtn.innerHTML = newState ? `<span>📺 CRT FX: ON</span>` : `<span>💻 CRT FX: OFF</span>`;
        if (window.audioEngine) window.audioEngine.playClick();
      }
    });
  }
}


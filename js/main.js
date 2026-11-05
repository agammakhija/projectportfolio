/**
 * AgamOS & 3D Retro Workstation Entry Point
 * Orchestrates Boot Sequence, View Switching, App Populating, and Event Handlers
 * 
 * Inspired by and adapted from Henry Heffernan's 3D portfolio (https://github.com/henryjeff/portfolio-website)
 * Licensed under the MIT License (see LICENSE and ATTRIBUTION.md).
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
  window.guideBar = new GuideBar();

  // 2. Populate Apps with Dynamic Data
  populateAboutApp();
  populateSkillsApp();
  populateEducationApp();
  setupPortfolioBrowser();
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

function populateSkillsApp() {
  const skills = window.PORTFOLIO_DATA.skills;
  const container = document.getElementById("skills-page-content");
  if (!container) return;

  let html = `
    <div class="skills-header-banner">
      <div class="skills-banner-icon">🐍</div>
      <div>
        <h3>Agam Makhija — Technical Skills & Competencies</h3>
        <p>Specializing exclusively in <b>Python 3 programming</b> and <b>AI Prompt Engineering</b>.</p>
      </div>
    </div>
  `;

  Object.keys(skills).forEach(category => {
    html += `
      <div class="skill-card-box">
        <h4>${category}</h4>
        <div class="skill-bars">
          ${skills[category].map(item => `
            <div class="skill-row" style="margin-bottom: 8px;">
              <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                  <span class="skill-name" style="width: auto; font-weight: 700; color: #1e293b;">${item.name}</span>
                  <span class="skill-pct">${item.level}%</span>
                </div>
                <div class="skill-bar-track">
                  <div class="skill-bar-fill" style="width: ${item.level}%"></div>
                </div>
                <div class="skill-desc-text">${item.desc}</div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  });

  html += `
    <div style="display: flex; justify-content: flex-end; margin-top: 8px;">
      <button class="retro-btn btn-sm" onclick="if (window.terminalApp) window.terminalApp.downloadFile('skills');">
        💾 Download Skills Matrix (.txt)
      </button>
    </div>
  `;

  container.innerHTML = html;
}

function populateEducationApp() {
  const edu = window.PORTFOLIO_DATA.education;
  const container = document.getElementById("education-page-content");
  if (!container) return;

  let html = `
    <div class="education-header-banner">
      <div class="education-banner-icon">🎓</div>
      <div>
        <h3>Agam Makhija — Academic Education & Chronicles</h3>
        <p>Newton School of Technology (2026–2030) &bull; Prodigy Public School (2024–2026)</p>
      </div>
    </div>
  `;

  if (edu) {
    edu.forEach(ed => {
      const isCurrent = ed.status && ed.status.toLowerCase().includes("ongoing");
      html += `
        <div class="edu-card ${isCurrent ? 'current' : ''}">
          <div class="edu-card-top">
            <h4>${ed.degree}</h4>
            <span class="edu-card-badge">${ed.period}</span>
          </div>
          <div class="edu-inst">${ed.institution} ${ed.status ? `• <i>${ed.status}</i>` : ""}</div>
          <div class="edu-details">${ed.details}</div>
          ${ed.highlights ? `
            <ul class="edu-bullets-list">
              ${ed.highlights.map(h => `<li>${h}</li>`).join("")}
            </ul>
          ` : ""}
        </div>
      `;
    });
  }

  html += `
    <div style="display: flex; justify-content: flex-end; margin-top: 8px;">
      <button class="retro-btn btn-sm" onclick="if (window.terminalApp) window.terminalApp.downloadFile('education');">
        🎓 Download Education Record (.txt)
      </button>
    </div>
  `;

  container.innerHTML = html;
}

function setupPortfolioBrowser() {
  const reloadBtn = document.getElementById("portfolio-browser-reload");
  const closeBtn = document.getElementById("portfolio-browser-close");
  const iframe = document.getElementById("portfolio-iframe");
  const winPortfolio = document.getElementById("win-portfolio");

  if (reloadBtn && iframe) {
    reloadBtn.addEventListener("click", () => {
      iframe.src = window.PORTFOLIO_DATA.profile.spidermanPortfolioUrl || "https://portfolio-swart-pi-47.vercel.app/";
      if (window.audioEngine) window.audioEngine.playClick();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      if (window.windowManager) {
        window.windowManager.closeWindow("portfolio");
      }
    });
  }

  // Prevent iframe scrollIntoView transitions from pushing parent desktop / CRT container off-screen
  const desktop = document.getElementById("desktop");
  const crtFrame = document.getElementById("crt-screen-frame");
  const crtWrapper = document.getElementById("crt-screen-wrapper");

  const preventUnwantedScroll = () => {
    if (desktop && (desktop.scrollTop !== 0 || desktop.scrollLeft !== 0)) {
      desktop.scrollTop = 0;
      desktop.scrollLeft = 0;
    }
    if (crtFrame && (crtFrame.scrollTop !== 0 || crtFrame.scrollLeft !== 0)) {
      crtFrame.scrollTop = 0;
      crtFrame.scrollLeft = 0;
    }
    if (crtWrapper && crtWrapper.scrollTop !== 0) {
      crtWrapper.scrollTop = 0;
    }
    if (window.scrollY !== 0 || window.scrollX !== 0) {
      window.scrollTo(0, 0);
    }
    if (winPortfolio && winPortfolio.style.display !== "none") {
      const topVal = parseInt(winPortfolio.style.top, 10);
      if (!winPortfolio.classList.contains("maximized")) {
        if (!isNaN(topVal) && topVal < 15) {
          winPortfolio.style.top = "15px";
        }
      } else {
        if (!isNaN(topVal) && topVal < 0) {
          winPortfolio.style.top = "0px";
        }
      }
    }
  };

  window.addEventListener("scroll", preventUnwantedScroll, { passive: true });
  if (desktop) desktop.addEventListener("scroll", preventUnwantedScroll, { passive: true });
  if (crtFrame) crtFrame.addEventListener("scroll", preventUnwantedScroll, { passive: true });

  setInterval(() => {
    if (winPortfolio && winPortfolio.style.display !== "none") {
      preventUnwantedScroll();
    }
  }, 100);
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

function playAppleBootTransition(onComplete) {
  const bootOverlay = document.getElementById("boot-overlay");
  const progressFill = document.getElementById("boot-progress-fill");
  if (!bootOverlay) {
    if (onComplete) onComplete();
    return;
  }

  bootOverlay.style.display = "flex";
  bootOverlay.style.pointerEvents = "all";
  bootOverlay.style.opacity = "1";
  if (progressFill) progressFill.style.width = "0%";

  // Play Apple startup chime
  if (window.audioEngine) {
    window.audioEngine.playStartupChime();
  }

  let progress = 0;
  const progTimer = setInterval(() => {
    progress += 20;
    if (progressFill) progressFill.style.width = `${progress}%`;

    if (progress >= 100) {
      clearInterval(progTimer);
      if (onComplete) onComplete();

      setTimeout(() => {
        bootOverlay.style.opacity = "0";
        bootOverlay.style.pointerEvents = "none";
        setTimeout(() => {
          bootOverlay.style.display = "none";
        }, 500);
      }, 250);
    }
  }, 85);
}

function setupBootSequence() {
  // Listen for system reboot requests (from  Menu > Restart)
  window.addEventListener("rebootAgamOS", () => {
    playAppleBootTransition();
  });
}

// --- HUD & View Transitions ---

function setupHudControls() {
  const crtWrapper = document.getElementById("crt-screen-wrapper");
  const menubarRoomBtn = document.getElementById("menubar-room-btn");
  const menubarSoundBtn = document.getElementById("menubar-sound-btn");

  let currentView = "desk"; // "desk" or "monitor"

  const setView = (mode) => {
    currentView = mode;
    if (window.retroScene) {
      window.retroScene.setCameraView(mode);
      if (mode === "monitor" && !window.retroScene.isLampOn) {
        window.retroScene.setLamp(true);
      }
    }

    if (window.guideBar) {
      window.guideBar.setMode(mode);
    }

    if (mode === "monitor") {
      // Play Apple loading screen when entering the desktop!
      playAppleBootTransition(() => {
        if (crtWrapper) {
          crtWrapper.classList.add("fullscreen-mode");
        }
      });
    } else {
      if (crtWrapper) {
        crtWrapper.classList.remove("fullscreen-mode");
      }
    }
  };

  // Click on desktop to turn lamp on
  const desktopEl = document.getElementById("desktop");
  if (desktopEl) {
    desktopEl.addEventListener("click", (e) => {
      if (e.target === desktopEl || e.target.id === "desktop") {
        if (window.retroScene && !window.retroScene.isLampOn) {
          window.retroScene.setLamp(true);
        }
      }
    });
  }

  const crtExitBtn = document.getElementById("crt-exit-btn");
  if (crtExitBtn) {
    crtExitBtn.addEventListener("click", () => {
      setView("desk");
      if (window.audioEngine) window.audioEngine.playClick();
    });
  }

  if (menubarRoomBtn) {
    menubarRoomBtn.addEventListener("click", () => {
      setView("desk");
      if (window.audioEngine) window.audioEngine.playClick();
    });
  }

  // Sound toggle strictly inside desktop (Menu Bar)
  if (menubarSoundBtn) {
    menubarSoundBtn.addEventListener("click", () => {
      if (window.audioEngine) {
        const isMuted = window.audioEngine.toggleMute();
        menubarSoundBtn.textContent = isMuted ? "🔇" : "🔊";
      }
    });
  }

  // Custom Event from 3D scene when Mac screen is clicked
  window.addEventListener("enterAgamOS", () => {
    setView("monitor");
  });
}


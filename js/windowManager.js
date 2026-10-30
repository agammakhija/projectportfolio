/**
 * AgamOS Window Manager
 * Handles authentic modern macOS window behaviors:
 * Traffic light window controls, Dock state synchronization,
 * Spotlight search, Apple Menu dropdown, smooth dragging, and z-index focus.
 * 
 * Inspired by and adapted from Henry Heffernan's desktop architecture (https://github.com/henryjeff/portfolio-website)
 * Licensed under the MIT License (see LICENSE and ATTRIBUTION.md).
 */

class WindowManager {
  constructor() {
    this.windows = new Map();
    this.activeWindow = null;
    this.topZ = 100;
    this.staggerOffset = 0;

    this.init();
  }

  init() {
    // 1. Setup macOS Top Clock
    this.initClock();

    // 2. Setup macOS Dock
    this.setupDock();

    // 3. Setup Apple Menu ()
    this.setupAppleMenu();

    // 4. Setup Spotlight Search (Cmd+Space / 🔍)
    this.setupSpotlight();

    // 5. Setup "About This Mac" Modal
    this.setupAboutThisMac();

    // 6. Setup Desktop Icons
    this.setupDesktopIcons();

    // 7. Setup Keyboard Shortcuts (Esc, Cmd+Space)
    this.setupKeyboardShortcuts();
  }

  initClock() {
    const clockEl = document.getElementById("tray-clock");
    const update = () => {
      if (!clockEl) return;
      const now = new Date();
      const dateStr = now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
      const timeStr = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      clockEl.textContent = `${dateStr}  ${timeStr}`;
    };
    update();
    setInterval(update, 1000);
  }

  setupDock() {
    const dockItems = document.querySelectorAll(".dock-item");
    dockItems.forEach(item => {
      const appId = item.getAttribute("data-app");
      item.addEventListener("click", () => {
        // Trigger iconic macOS bounce
        item.classList.add("dock-bounce");
        setTimeout(() => item.classList.remove("dock-bounce"), 600);

        const winObj = this.windows.get(appId);
        if (!winObj || !winObj.isOpen) {
          this.openApp(appId);
        } else if (winObj.isMinimized) {
          this.restoreWindow(appId);
        } else if (this.activeWindow === appId) {
          this.minimizeWindow(appId);
        } else {
          this.focusWindow(appId);
        }
      });
    });
  }

  updateDockIndicators() {
    const dockItems = document.querySelectorAll(".dock-item");
    dockItems.forEach(item => {
      const appId = item.getAttribute("data-app");
      const winObj = this.windows.get(appId);
      const isRunning = winObj && winObj.isOpen;
      const isActive = this.activeWindow === appId && winObj && !winObj.isMinimized;
      item.classList.toggle("running", !!isRunning);
      item.classList.toggle("active", !!isActive);
    });
  }

  setupAppleMenu() {
    const trigger = document.getElementById("apple-menu-trigger");
    const menu = document.getElementById("apple-menu");
    if (!trigger || !menu) return;

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.toggle("hidden");
      if (window.audioEngine) window.audioEngine.playClick();
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest("#apple-menu") && !e.target.closest("#apple-menu-trigger")) {
        menu.classList.add("hidden");
      }
    });

    menu.querySelectorAll(".apple-menu-item").forEach(item => {
      item.addEventListener("click", () => {
        menu.classList.add("hidden");
        const appId = item.getAttribute("data-app");
        if (appId) {
          this.openApp(appId);
        }
      });
    });

    const aboutMacBtn = document.getElementById("menu-about-mac");
    if (aboutMacBtn) {
      aboutMacBtn.addEventListener("click", () => {
        const modal = document.getElementById("about-mac-modal");
        if (modal) modal.classList.remove("hidden");
      });
    }

    const forceQuitBtn = document.getElementById("menu-force-quit");
    if (forceQuitBtn) {
      forceQuitBtn.addEventListener("click", () => {
        if (this.activeWindow) {
          this.closeWindow(this.activeWindow);
        }
      });
    }

    const spotlightItem = document.getElementById("menu-spotlight-trigger");
    if (spotlightItem) {
      spotlightItem.addEventListener("click", () => {
        this.toggleSpotlight();
      });
    }

    const roomOverview = document.getElementById("menu-room-overview");
    if (roomOverview) {
      roomOverview.addEventListener("click", () => {
        const exitBtn = document.getElementById("menubar-room-btn") || document.getElementById("crt-exit-btn");
        if (exitBtn) exitBtn.click();
      });
    }

    const sleepBtn = document.getElementById("menu-sleep");
    if (sleepBtn) {
      sleepBtn.addEventListener("click", () => {
        const screenWrapper = document.getElementById("crt-screen-wrapper");
        if (screenWrapper) {
          screenWrapper.style.filter = "brightness(0.04)";
          setTimeout(() => {
            screenWrapper.style.filter = "";
          }, 2400);
        }
      });
    }
  }

  setupSpotlight() {
    const trigger = document.getElementById("menubar-spotlight-btn");
    const overlay = document.getElementById("macos-spotlight");
    const input = document.getElementById("spotlight-input");
    const results = document.getElementById("spotlight-results");

    if (!overlay || !input || !results) return;

    const apps = [
      { id: "about", title: "About Me", desc: "Agam Makhija Developer Profile & Bio", icon: "👤" },
      { id: "portfolio", title: "Safari — Spider-Man Portfolio", desc: "Interactive 3D Spider-Man Web Experience", icon: "🕷️" },
      { id: "skills", title: "Skills Matrix", desc: "Python 3 Scripting & AI Prompt Engineering", icon: "🐍" },
      { id: "education", title: "Academic Education", desc: "Newton School of Technology & Prodigy School", icon: "🎓" },
      { id: "terminal", title: "Terminal", desc: "macOS zsh Shell & CLI Command Center", icon: "💻" },
      { id: "music", title: "Music", desc: "Spider-Man Soundtracks & Polyphonic Player", icon: "🎵" },
      { id: "minecraft", title: "Minecraft 3D", desc: "Voxel Sandbox Alpha 1.0 (Craft98)", icon: "⛏️" },
      { id: "paint", title: "Paint Studio", desc: "Creative Canvas & Drawing Suite", icon: "🎨" },
      { id: "contact", title: "Mail", desc: "Send Direct Email Message to Agam", icon: "✉️" },
      { id: "settings", title: "System Settings", desc: "Wallpapers, CRT Scanlines & Tube Curvature", icon: "⚙️" },
      { id: "recycle", title: "Trash", desc: "System Trash Bin", icon: "🗑️" }
    ];

    const renderResults = (query = "") => {
      const q = query.trim().toLowerCase();
      const filtered = q
        ? apps.filter(a => a.title.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q) || a.id.toLowerCase().includes(q))
        : apps;

      if (filtered.length === 0) {
        results.innerHTML = `<div style="padding: 14px; text-align: center; color: #94a3b8; font-size: 13px;">No applications found for "${query}"</div>`;
        return;
      }

      results.innerHTML = filtered.map((a, idx) => `
        <div class="spotlight-item ${idx === 0 ? 'active' : ''}" data-app="${a.id}">
          <span class="spotlight-item-icon">${a.icon}</span>
          <div>
            <div class="spotlight-item-title">${a.title}</div>
            <div class="spotlight-item-desc">${a.desc}</div>
          </div>
        </div>
      `).join("");

      results.querySelectorAll(".spotlight-item").forEach(item => {
        item.addEventListener("click", () => {
          this.openApp(item.getAttribute("data-app"));
          this.closeSpotlight();
        });
      });
    };

    if (trigger) {
      trigger.addEventListener("click", () => {
        this.toggleSpotlight();
      });
    }

    input.addEventListener("input", () => {
      renderResults(input.value);
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const first = results.querySelector(".spotlight-item");
        if (first) {
          this.openApp(first.getAttribute("data-app"));
          this.closeSpotlight();
        }
      } else if (e.key === "Escape") {
        this.closeSpotlight();
      }
    });

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        this.closeSpotlight();
      }
    });

    this.renderSpotlightResults = renderResults;
  }

  toggleSpotlight() {
    const overlay = document.getElementById("macos-spotlight");
    const input = document.getElementById("spotlight-input");
    if (!overlay) return;

    const isHidden = overlay.classList.contains("hidden");
    if (isHidden) {
      overlay.classList.remove("hidden");
      if (input) {
        input.value = "";
        if (this.renderSpotlightResults) this.renderSpotlightResults("");
        setTimeout(() => input.focus(), 50);
      }
      if (window.audioEngine) window.audioEngine.playClick();
    } else {
      overlay.classList.add("hidden");
    }
  }

  closeSpotlight() {
    const overlay = document.getElementById("macos-spotlight");
    if (overlay) overlay.classList.add("hidden");
  }

  setupAboutThisMac() {
    const closeBtn = document.getElementById("about-mac-close-btn");
    const modal = document.getElementById("about-mac-modal");
    if (closeBtn && modal) {
      closeBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
      });
      modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.add("hidden");
      });
    }
  }

  setupDesktopIcons() {
    const icons = document.querySelectorAll(".desktop-icon");
    icons.forEach(icon => {
      const appId = icon.getAttribute("data-app");

      // Single click selects
      icon.addEventListener("click", (e) => {
        e.stopPropagation();
        icons.forEach(i => i.classList.remove("selected"));
        icon.classList.add("selected");
        if (window.audioEngine) window.audioEngine.playClick();
      });

      // Double click opens app
      icon.addEventListener("dblclick", () => {
        this.openApp(appId);
      });
    });

    // Deselect desktop icons when clicking empty desktop area
    const desktop = document.getElementById("desktop");
    if (desktop) {
      desktop.addEventListener("click", (e) => {
        if (!e.target.closest(".desktop-icon")) {
          icons.forEach(i => i.classList.remove("selected"));
        }
      });
    }
  }

  setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      // Cmd+Space or Ctrl+Space toggles Spotlight
      if ((e.metaKey || e.ctrlKey) && e.code === "Space") {
        e.preventDefault();
        this.toggleSpotlight();
        return;
      }

      // Global Escape key
      if (e.key === "Escape") {
        const spotlight = document.getElementById("macos-spotlight");
        if (spotlight && !spotlight.classList.contains("hidden")) {
          this.closeSpotlight();
          return;
        }

        const appleMenu = document.getElementById("apple-menu");
        if (appleMenu && !appleMenu.classList.contains("hidden")) {
          appleMenu.classList.add("hidden");
          return;
        }

        const aboutMac = document.getElementById("about-mac-modal");
        if (aboutMac && !aboutMac.classList.contains("hidden")) {
          aboutMac.classList.add("hidden");
          return;
        }

        if (this.activeWindow) {
          this.closeWindow(this.activeWindow);
        }
      }
    });
  }

  // --- Window Creation & Registration ---

  registerWindow(appId, el, config = {}) {
    const titleBar = el.querySelector(".window-titlebar");
    const btnMin = el.querySelector(".win-btn-min");
    const btnMax = el.querySelector(".win-btn-max");
    const btnClose = el.querySelector(".win-btn-close");

    const winObj = {
      appId,
      el,
      title: config.title || "Application",
      icon: config.icon || "💻",
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      prevRect: null
    };

    this.windows.set(appId, winObj);

    // Make Draggable
    if (titleBar) {
      this.makeDraggable(el, titleBar);
    }

    // Bring to front on click
    el.addEventListener("mousedown", () => {
      this.focusWindow(appId);
    });

    // Control buttons (macOS Traffic Lights)
    if (btnMin) {
      btnMin.addEventListener("click", (e) => {
        e.stopPropagation();
        this.minimizeWindow(appId);
      });
    }

    if (btnMax) {
      btnMax.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleMaximizeWindow(appId);
      });
    }

    if (btnClose) {
      btnClose.addEventListener("click", (e) => {
        e.stopPropagation();
        this.closeWindow(appId);
      });
    }

    // Double click titlebar maximizes
    if (titleBar) {
      titleBar.addEventListener("dblclick", () => {
        this.toggleMaximizeWindow(appId);
      });
    }

    return winObj;
  }

  openApp(appId) {
    let winObj = this.windows.get(appId);
    if (!winObj) {
      const el = document.getElementById(`win-${appId}`);
      if (el) {
        winObj = this.registerWindow(appId, el, {
          title: el.getAttribute("data-title") || appId,
          icon: el.getAttribute("data-icon") || "📁"
        });
      }
    }

    if (!winObj) return;

    if (!winObj.isOpen) {
      winObj.isOpen = true;
      winObj.isMinimized = false;
      winObj.el.classList.remove("hidden", "minimized");
      winObj.el.style.display = "flex";

      // Calculate staggered default position
      const desktop = document.getElementById("desktop");
      const dw = desktop ? desktop.clientWidth : window.innerWidth;
      const dh = desktop ? desktop.clientHeight : window.innerHeight - 36;

      const baseWidth = Math.min(parseInt(winObj.el.style.width) || 680, dw - 40);
      const baseHeight = Math.min(parseInt(winObj.el.style.height) || 480, dh - 40);

      const offset = (this.staggerOffset % 6) * 28;
      this.staggerOffset++;

      const initialLeft = Math.max(20, Math.min(dw - baseWidth - 20, (dw - baseWidth) / 2 + offset));
      const initialTop = Math.max(15, Math.min(dh - baseHeight - 20, 30 + offset));

      winObj.el.style.left = `${initialLeft}px`;
      winObj.el.style.top = `${initialTop}px`;
      winObj.el.style.width = `${baseWidth}px`;
      winObj.el.style.height = `${baseHeight}px`;

      if (window.audioEngine) {
        window.audioEngine.playWindowOpen();
      }
    } else if (winObj.isMinimized) {
      this.restoreWindow(appId);
    }

    this.focusWindow(appId);
    this.updateDockIndicators();
  }

  focusWindow(appId) {
    const winObj = this.windows.get(appId);
    if (!winObj || !winObj.isOpen) return;

    this.topZ += 2;
    winObj.el.style.zIndex = this.topZ;

    // Update active visual classes
    this.windows.forEach(w => {
      w.el.classList.remove("active");
    });

    winObj.el.classList.add("active");
    this.activeWindow = appId;

    // Update macOS Top Menu Bar active app name
    const menubarAppName = document.getElementById("menubar-app-name");
    if (menubarAppName) {
      let name = winObj.title.split("—")[0].trim() || winObj.title;
      menubarAppName.textContent = name;
    }

    this.updateDockIndicators();
  }

  minimizeWindow(appId) {
    const winObj = this.windows.get(appId);
    if (!winObj || !winObj.isOpen) return;

    winObj.isMinimized = true;
    winObj.el.classList.add("minimized");

    if (window.audioEngine) window.audioEngine.playClick();

    // Focus next available open window
    if (this.activeWindow === appId) {
      this.activeWindow = null;
      let highestZ = 0;
      let nextFocus = null;

      this.windows.forEach(w => {
        if (w.isOpen && !w.isMinimized) {
          const z = parseInt(w.el.style.zIndex) || 0;
          if (z > highestZ) {
            highestZ = z;
            nextFocus = w.appId;
          }
        }
      });

      if (nextFocus) {
        this.focusWindow(nextFocus);
      } else {
        const menubarAppName = document.getElementById("menubar-app-name");
        if (menubarAppName) menubarAppName.textContent = "Finder";
      }
    }

    this.updateDockIndicators();
  }

  restoreWindow(appId) {
    const winObj = this.windows.get(appId);
    if (!winObj) return;

    winObj.isMinimized = false;
    winObj.el.classList.remove("minimized");
    if (window.audioEngine) window.audioEngine.playClick();
    this.focusWindow(appId);
    this.updateDockIndicators();
  }

  toggleMaximizeWindow(appId) {
    const winObj = this.windows.get(appId);
    if (!winObj || !winObj.isOpen) return;

    if (!winObj.isMaximized) {
      winObj.prevRect = {
        left: winObj.el.style.left,
        top: winObj.el.style.top,
        width: winObj.el.style.width,
        height: winObj.el.style.height
      };

      winObj.el.classList.add("maximized");
      winObj.el.style.left = "0px";
      winObj.el.style.top = "0px";
      winObj.el.style.width = "100%";
      winObj.el.style.height = "100%";
      winObj.isMaximized = true;
    } else {
      winObj.el.classList.remove("maximized");
      if (winObj.prevRect) {
        winObj.el.style.left = winObj.prevRect.left;
        winObj.el.style.top = winObj.prevRect.top || "20px";
        winObj.el.style.width = winObj.prevRect.width;
        winObj.el.style.height = winObj.prevRect.height;
      }
      winObj.isMaximized = false;
    }

    if (window.audioEngine) window.audioEngine.playClick();
  }

  closeWindow(appId) {
    const winObj = this.windows.get(appId);
    if (!winObj || !winObj.isOpen) return;

    winObj.isOpen = false;
    winObj.isMinimized = false;
    winObj.isMaximized = false;
    winObj.el.classList.remove("maximized", "active");
    winObj.el.style.display = "none";

    if (window.audioEngine) window.audioEngine.playWindowClose();

    if (this.activeWindow === appId) {
      this.activeWindow = null;
      const menubarAppName = document.getElementById("menubar-app-name");
      if (menubarAppName) menubarAppName.textContent = "Finder";
    }

    this.updateDockIndicators();
  }

  // --- Draggable Logic with Clamping ---

  makeDraggable(el, handle) {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialX = 0;
    let initialY = 0;

    const onMouseDown = (e) => {
      if (e.target.closest(".win-btn") || el.classList.contains("maximized")) return;

      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;

      const rect = el.getBoundingClientRect();
      const parentRect = el.parentElement.getBoundingClientRect();

      initialX = rect.left - parentRect.left;
      initialY = rect.top - parentRect.top;

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);

      e.preventDefault();
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      const parent = el.parentElement;
      const maxLeft = parent.clientWidth - 80;
      const maxTop = parent.clientHeight - 40;

      const newLeft = Math.max(-rectWidthHalf(), Math.min(maxLeft, initialX + dx));
      const newTop = Math.max(10, Math.min(maxTop, initialY + dy));

      el.style.left = `${newLeft}px`;
      el.style.top = `${newTop}px`;
    };

    const rectWidthHalf = () => el.clientWidth - 100;

    const onMouseUp = () => {
      isDragging = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    handle.addEventListener("mousedown", onMouseDown);
  }
}

window.WindowManager = WindowManager;

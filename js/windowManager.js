/**
 * AgamOS Window Manager
 * Handles authentic retro Windows 95/98 window behaviors:
 * dragging, z-index focus, minimize/restore, maximize, taskbar synchronization.
 * 
 * Inspired by and adapted from Henry Heffernan's desktop architecture (https://github.com/henryjeff/portfolio-website)
 * Licensed under the MIT License (see LICENSE and ATTRIBUTION.md).
 */

class WindowManager {
  constructor() {
    this.windows = new Map();
    this.activeWindow = null;
    this.topZ = 100;
    this.taskbarContainer = document.getElementById("taskbar-apps");
    this.startMenu = document.getElementById("start-menu");
    this.startBtn = document.getElementById("start-btn");

    this.isStartOpen = false;
    this.staggerOffset = 0;

    this.init();
  }

  init() {
    // 1. Setup Start Menu toggle
    if (this.startBtn) {
      this.startBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleStartMenu();
      });
    }

    // Close Start Menu on clicking outside
    document.addEventListener("click", (e) => {
      if (this.isStartOpen && !e.target.closest("#start-menu") && !e.target.closest("#start-btn")) {
        this.closeStartMenu();
      }
    });

    // 2. Setup System Tray Clock
    this.initClock();

    // 3. Setup Desktop Icons
    this.setupDesktopIcons();

    // 4. Setup Start Menu Items
    this.setupStartMenuItems();

    // 5. Global Escape key closes the active window or Start Menu
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (this.isStartOpen) {
          this.closeStartMenu();
        } else if (this.activeWindow) {
          this.closeWindow(this.activeWindow);
        }
      }
    });
  }

  initClock() {
    const clockEl = document.getElementById("tray-clock");
    const update = () => {
      if (!clockEl) return;
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };
    update();
    setInterval(update, 1000);
  }

  toggleStartMenu() {
    this.isStartOpen = !this.isStartOpen;
    if (this.startMenu) {
      this.startMenu.classList.toggle("open", this.isStartOpen);
      if (this.startBtn) this.startBtn.classList.toggle("active", this.isStartOpen);
      if (this.isStartOpen && window.audioEngine) {
        window.audioEngine.playClick();
      }
    }
  }

  closeStartMenu() {
    this.isStartOpen = false;
    if (this.startMenu) this.startMenu.classList.remove("open");
    if (this.startBtn) this.startBtn.classList.remove("active");
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

      // Double click or Enter opens app
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

  setupStartMenuItems() {
    const items = document.querySelectorAll(".start-item");
    items.forEach(item => {
      item.addEventListener("click", () => {
        const appId = item.getAttribute("data-app");
        this.closeStartMenu();
        if (appId) {
          this.openApp(appId);
        }
      });
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
      prevRect: null,
      taskbarBtn: null
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

    // Control buttons
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

      // Create Taskbar Button
      this.createTaskbarButton(winObj);

      if (window.audioEngine) {
        window.audioEngine.playWindowOpen();
      }
    } else if (winObj.isMinimized) {
      this.restoreWindow(appId);
    }

    this.focusWindow(appId);
  }

  createTaskbarButton(winObj) {
    if (winObj.taskbarBtn) return;

    const btn = document.createElement("button");
    btn.className = "taskbar-app-btn active";
    btn.innerHTML = `<span class="taskbar-icon">${winObj.icon}</span><span class="taskbar-title">${winObj.title}</span>`;

    btn.addEventListener("click", () => {
      if (this.activeWindow === winObj.appId && !winObj.isMinimized) {
        this.minimizeWindow(winObj.appId);
      } else {
        if (winObj.isMinimized) {
          this.restoreWindow(winObj.appId);
        }
        this.focusWindow(winObj.appId);
      }
    });

    if (this.taskbarContainer) {
      this.taskbarContainer.appendChild(btn);
    }
    winObj.taskbarBtn = btn;
  }

  focusWindow(appId) {
    const winObj = this.windows.get(appId);
    if (!winObj || !winObj.isOpen) return;

    this.topZ += 2;
    winObj.el.style.zIndex = this.topZ;

    // Update active visual classes
    this.windows.forEach(w => {
      w.el.classList.remove("active");
      if (w.taskbarBtn) w.taskbarBtn.classList.remove("active");
    });

    winObj.el.classList.add("active");
    if (winObj.taskbarBtn) winObj.taskbarBtn.classList.add("active");

    this.activeWindow = appId;
  }

  minimizeWindow(appId) {
    const winObj = this.windows.get(appId);
    if (!winObj || !winObj.isOpen) return;

    winObj.isMinimized = true;
    winObj.el.classList.add("minimized");
    if (winObj.taskbarBtn) winObj.taskbarBtn.classList.remove("active");

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

      if (nextFocus) this.focusWindow(nextFocus);
    }
  }

  restoreWindow(appId) {
    const winObj = this.windows.get(appId);
    if (!winObj) return;

    winObj.isMinimized = false;
    winObj.el.classList.remove("minimized");
    if (window.audioEngine) window.audioEngine.playClick();
    this.focusWindow(appId);
  }

  toggleMaximizeWindow(appId) {
    const winObj = this.windows.get(appId);
    if (!winObj || !winObj.isOpen) return;

    if (!winObj.isMaximized) {
      // Save previous coordinates
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
      winObj.el.style.height = "calc(100% - 36px)";
      winObj.isMaximized = true;
    } else {
      winObj.el.classList.remove("maximized");
      if (winObj.prevRect) {
        winObj.el.style.left = winObj.prevRect.left;
        winObj.el.style.top = winObj.prevRect.top;
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

    if (winObj.taskbarBtn) {
      winObj.taskbarBtn.remove();
      winObj.taskbarBtn = null;
    }

    if (window.audioEngine) window.audioEngine.playWindowClose();

    if (this.activeWindow === appId) {
      this.activeWindow = null;
    }
  }

  // --- Draggable Logic with Clamping ---

  makeDraggable(el, handle) {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialX = 0;
    let initialY = 0;

    const onMouseDown = (e) => {
      // Don't drag if clicking buttons or maximized
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


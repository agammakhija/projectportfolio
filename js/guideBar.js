/**
 * AgamOS & 3D Retro Workstation — Interactive Contextual Guide Bar
 * Provides real-time dynamic guidance, discoverable interactive features, and quick action chips
 * Inspired by macOS Sonoma / Sequoia Dynamic Island HUD design.
 */

class GuideBar {
  constructor() {
    this.mode = "desk"; // "desk" or "monitor"
    this.isMinimized = false;
    this.currentIndex = 0;
    this.hoverTarget = null;
    this.timer = null;
    this.cycleDuration = 4800; // 4.8s per hint

    // Desk Mode Hints (3D Room Overview)
    this.deskHints = [
      {
        icon: "🖥️",
        badge: "AgamOS",
        text: "Click the Mac screen or keyboard to boot into AgamOS desktop",
        action: { label: "Boot Mac ", type: "enterOS" }
      },
      {
        icon: "💡",
        badge: "Lamp",
        text: "Click anywhere on the articulated architect lamp to toggle warm light",
        action: { label: "Toggle Lamp 💡", type: "toggleLamp" }
      },
      {
        icon: "📝",
        badge: "Memo",
        text: "Hover cursor over the yellow memo note on the Mac to inspect Agam's notes",
        action: null
      },
      {
        icon: "☕",
        badge: "Easter Egg",
        text: "Click the coffee mug or floppy disks on the desk for retro audio cues",
        action: null
      },
      {
        icon: "🖱️",
        badge: "3D Parallax",
        text: "Glide your cursor around to feel responsive room lighting & shadows",
        action: null
      }
    ];

    // Desktop Mode Hints (macOS Sonoma / Sequoia AgamOS)
    this.monitorHints = [
      {
        icon: "🚀",
        badge: "Launchpad",
        text: "Click Launchpad next to Trash in Dock to view all apps & games",
        action: { label: "Open Launchpad 🚀", type: "openLaunchpad" }
      },
      {
        icon: "🕷️",
        badge: "Safari",
        text: "Launch Spider-Man Safari to explore live portfolio & projects",
        action: { label: "Safari 🕷️", type: "openPortfolio" }
      },
      {
        icon: "🐍",
        badge: "Skills",
        text: "Agam specializes in Python 3 programming & AI prompt engineering",
        action: { label: "Skills Matrix 🐍", type: "openSkills" }
      },
      {
        icon: "⛏️",
        badge: "Minecraft",
        text: "Play 3D voxel Minecraft Alpha or classic Minesweeper right in the browser",
        action: { label: "Play Craft98 ⛏️", type: "openMinecraft" }
      },
      {
        icon: "🔍",
        badge: "Spotlight",
        text: "Press Cmd+Space or click the magnifying glass for instant search",
        action: { label: "Spotlight 🔍", type: "openSpotlight" }
      },
      {
        icon: "🪑",
        badge: "3D Room",
        text: "Click 'Room' in the top Menu Bar anytime to return to 3D desk view",
        action: { label: "Return to Room 🪑", type: "enterRoom" }
      }
    ];

    // Real-Time Hover Overrides (When hovering 3D meshes in Room view)
    this.hoverHints = {
      crtScreen: {
        icon: "🖥️",
        badge: "Mac Screen",
        text: "Retina 5K Display — Click screen to enter AgamOS desktop",
        action: { label: "Enter OS ", type: "enterOS" }
      },
      crtMonitor: {
        icon: "🖥️",
        badge: "Mac Display",
        text: "Apple iMac Workstation — Click to boot into AgamOS",
        action: { label: "Enter OS ", type: "enterOS" }
      },
      deskLamp: {
        icon: "💡",
        badge: "Architect Lamp",
        text: "Articulated Desk Lamp — Click anywhere to turn light ON/OFF",
        action: { label: "Toggle Lamp 💡", type: "toggleLamp" }
      },
      stickyNote: {
        icon: "📝",
        badge: "Desk Memo",
        text: "Inspecting Agam's sticky note (move cursor away to set down)",
        action: null
      },
      deskSurface: {
        icon: "⌨️",
        badge: "Workstation Desk",
        text: "Desk & Peripherals — Click anywhere to enter AgamOS",
        action: { label: "Enter OS ", type: "enterOS" }
      },
      coffeeMug: {
        icon: "☕",
        badge: "Coffee Mug",
        text: "Developer Brew — Click for retro sound effect",
        action: null
      },
      floppyDisk: {
        icon: "💾",
        badge: "Floppy Disks",
        text: "3.5\" Retro Disks — Click for system floppy beep",
        action: null
      },
      pcPowerButton: {
        icon: "⚡",
        badge: "Power Button",
        text: "Power LED & Button — Click to restart AgamOS",
        action: { label: "Restart System", type: "rebootOS" }
      }
    };

    this.initDOM();
    this.startCycling();
  }

  initDOM() {
    this.container = document.getElementById("interactive-guide-bar");
    if (!this.container) return;

    this.iconEl = document.getElementById("guide-badge-icon");
    this.tagEl = document.getElementById("guide-badge-tag");
    this.textEl = document.getElementById("guide-text");
    this.actionBtn = document.getElementById("guide-action-btn");
    this.prevBtn = document.getElementById("guide-prev-btn");
    this.nextBtn = document.getElementById("guide-next-btn");
    this.minimizeBtn = document.getElementById("guide-minimize-btn");
    this.pillTrigger = document.getElementById("guide-pill-trigger");
    this.expandedView = this.container.querySelector(".guide-bar-expanded");

    // Event Listeners
    if (this.prevBtn) {
      this.prevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.prevHint();
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.nextHint();
      });
    }

    if (this.minimizeBtn) {
      this.minimizeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.setMinimized(true);
      });
    }

    if (this.pillTrigger) {
      this.pillTrigger.addEventListener("click", (e) => {
        e.stopPropagation();
        this.setMinimized(false);
      });
    }

    if (this.actionBtn) {
      this.actionBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.triggerCurrentAction();
      });
    }

    // Pause cycling on hover over guide bar
    this.container.addEventListener("mouseenter", () => this.stopCycling());
    this.container.addEventListener("mouseleave", () => {
      if (!this.hoverTarget) {
        this.startCycling();
      }
    });

    this.render();
  }

  getCurrentList() {
    return this.mode === "desk" ? this.deskHints : this.monitorHints;
  }

  setMode(mode) {
    if (this.mode === mode) return;
    this.mode = mode;
    this.currentIndex = 0;
    this.hoverTarget = null;

    if (this.container) {
      this.container.classList.remove("mode-desk", "mode-monitor");
      this.container.classList.add(`mode-${mode}`);
    }

    this.render();
  }

  setMinimized(minimized) {
    this.isMinimized = minimized;
    if (this.container) {
      this.container.classList.toggle("minimized", minimized);
    }
    if (this.expandedView) {
      this.expandedView.classList.toggle("hidden", minimized);
    }
    if (this.pillTrigger) {
      this.pillTrigger.classList.toggle("hidden", !minimized);
    }
  }

  updateHoverTarget(targetName) {
    if (this.mode !== "desk") return;

    if (targetName && this.hoverHints[targetName]) {
      this.hoverTarget = this.hoverHints[targetName];
      this.stopCycling();
      this.render();
    } else if (this.hoverTarget) {
      this.hoverTarget = null;
      this.render();
      this.startCycling();
    }
  }

  startCycling() {
    this.stopCycling();
    this.timer = setInterval(() => {
      this.nextHint();
    }, this.cycleDuration);
  }

  stopCycling() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  nextHint() {
    const list = this.getCurrentList();
    this.currentIndex = (this.currentIndex + 1) % list.length;
    this.render();
  }

  prevHint() {
    const list = this.getCurrentList();
    this.currentIndex = (this.currentIndex - 1 + list.length) % list.length;
    this.render();
  }

  render() {
    if (!this.container) return;

    const currentHint = this.hoverTarget || this.getCurrentList()[this.currentIndex];
    if (!currentHint) return;

    // Smooth subtle update
    if (this.iconEl) this.iconEl.textContent = currentHint.icon;
    if (this.tagEl) this.tagEl.textContent = currentHint.badge;

    if (this.textEl) {
      this.textEl.style.opacity = "0";
      this.textEl.style.transform = "translateY(3px)";
      setTimeout(() => {
        this.textEl.textContent = currentHint.text;
        this.textEl.style.opacity = "1";
        this.textEl.style.transform = "translateY(0)";
      }, 100);
    }

    if (this.actionBtn) {
      if (currentHint.action) {
        this.actionBtn.textContent = currentHint.action.label;
        this.actionBtn.dataset.actionType = currentHint.action.type;
        this.actionBtn.style.display = "inline-flex";
      } else {
        this.actionBtn.style.display = "none";
      }
    }
  }

  triggerCurrentAction() {
    const currentHint = this.hoverTarget || this.getCurrentList()[this.currentIndex];
    if (!currentHint || !currentHint.action) return;

    const type = currentHint.action.type;
    switch (type) {
      case "enterOS":
        window.dispatchEvent(new CustomEvent("enterAgamOS"));
        if (window.audioEngine) window.audioEngine.playStartupChime();
        break;
      case "toggleLamp":
        if (window.retroScene) window.retroScene.toggleLamp();
        break;
      case "enterRoom":
        const roomBtn = document.getElementById("menubar-room-btn");
        if (roomBtn) roomBtn.click();
        break;
      case "openLaunchpad":
        const launchpadBtn = document.getElementById("dock-launchpad-btn");
        if (launchpadBtn) launchpadBtn.click();
        break;
      case "openPortfolio":
        if (window.windowManager) window.windowManager.openApp("portfolio");
        break;
      case "openSkills":
        if (window.windowManager) window.windowManager.openApp("skills");
        break;
      case "openMinecraft":
        if (window.windowManager) window.windowManager.openApp("minecraft");
        break;
      case "openSpotlight":
        const spotlightBtn = document.getElementById("menubar-spotlight-btn");
        if (spotlightBtn) spotlightBtn.click();
        break;
      case "rebootOS":
        window.dispatchEvent(new CustomEvent("rebootAgamOS"));
        break;
      default:
        break;
    }
  }
}

window.GuideBar = GuideBar;


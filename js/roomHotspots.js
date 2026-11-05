/**
 * AgamOS & 3D Retro Workstation — Minimalist 3D Interactive Hotspot Markers
 * Displays clean animated arrows pointing towards small marker dots at interactive objects.
 * When hovered / scrolled upon, smoothly reveals how to use each interaction.
 * Exclusively active in 3D Room view — never in the laptop / AgamOS desktop.
 */

class RoomHotspots {
  constructor(retroScene) {
    this.retroScene = retroScene;
    this.isEnabled = true;
    this.mode = "desk"; // "desk" or "monitor"

    this.tempVec = new THREE.Vector3();

    // Hotspot targets in 3D world space
    this.hotspotsData = [
      {
        id: "hotspot-screen",
        target: new THREE.Vector3(0, 1.55, 0.24),
        icon: "🖥️",
        title: "Mac Retina Display",
        desc: "Click to enter AgamOS",
        arrowClass: "arrow-down",
        onClick: () => {
          if (window.retroScene) window.retroScene.setLamp(true);
          window.dispatchEvent(new CustomEvent("enterAgamOS"));
        }
      },
      {
        id: "hotspot-lamp",
        target: new THREE.Vector3(-0.76, 1.95, 0.22),
        icon: "💡",
        title: "Architect Lamp",
        desc: "Click anywhere to toggle light",
        arrowClass: "arrow-down",
        onClick: () => {
          if (window.retroScene) window.retroScene.toggleLamp();
        }
      },
      {
        id: "hotspot-note",
        target: new THREE.Vector3(-0.48, 1.88, 0.25),
        icon: "📝",
        title: "Agam's Desk Memo",
        desc: "Hover to zoom in & read notes",
        arrowClass: "arrow-down",
        onHover: (hovered) => {
          if (window.retroScene && window.retroScene.cameraMode === "desk") {
            window.retroScene.isStickyNoteHovered = hovered;
            window.retroScene.showInspectOverlay(hovered);
            if (window.audioEngine) {
              if (hovered) window.audioEngine.playPaperInspect();
              else window.audioEngine.playPaperPutDown();
            }
          }
        },
        onClick: () => {
          if (window.retroScene) window.retroScene.setLamp(true);
          window.dispatchEvent(new CustomEvent("enterAgamOS"));
        }
      },
      {
        id: "hotspot-mug",
        target: new THREE.Vector3(-0.65, 1.055, 0.55),
        icon: "☕",
        title: "Coffee & Floppies",
        desc: "Click for retro sound easter egg",
        arrowClass: "arrow-down",
        onClick: () => {
          if (window.audioEngine) window.audioEngine.playBeep(520, 0.08);
        }
      }
    ];

    this.hotspotElements = [];
    this.initDOM();
  }

  initDOM() {
    this.container = document.getElementById("room-hotspots-container");
    this.toggleBtn = document.getElementById("room-hints-toggle-btn");

    if (!this.container) return;

    this.container.innerHTML = "";
    this.hotspotElements = [];

    this.hotspotsData.forEach((item) => {
      const el = document.createElement("div");
      el.className = "room-hotspot";
      el.id = item.id;

      el.innerHTML = `
        <div class="hotspot-wrapper">
          <!-- Floating interactive instruction tooltip (reveals on hover / scroll-upon) -->
          <div class="hotspot-tooltip">
            <span class="tooltip-icon">${item.icon}</span>
            <div class="tooltip-content">
              <span class="tooltip-title">${item.title}</span>
              <span class="tooltip-desc">${item.desc}</span>
            </div>
          </div>

          <!-- Minimalist Arrow pointing towards the small marker dot -->
          <div class="hotspot-arrow-pin" role="button" tabindex="0" aria-label="${item.title}: ${item.desc}">
            <div class="hotspot-arrow">
              <svg viewBox="0 0 20 28" width="18" height="24">
                <line x1="10" y1="2" x2="10" y2="18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
                <polygon points="5,16 10,24 15,16" fill="currentColor"/>
              </svg>
            </div>
            <div class="hotspot-pin-anchor">
              <span class="hotspot-pin-dot"></span>
              <span class="hotspot-pin-ring"></span>
            </div>
          </div>
        </div>
      `;

      // Event handlers for clicking & hovering
      const wrapper = el.querySelector(".hotspot-wrapper");
      const pin = el.querySelector(".hotspot-arrow-pin");
      const tooltip = el.querySelector(".hotspot-tooltip");

      const handleClick = (e) => {
        e.stopPropagation();
        if (item.onClick) item.onClick();
      };

      if (pin) pin.addEventListener("click", handleClick);
      if (tooltip) tooltip.addEventListener("click", handleClick);

      if (wrapper && item.onHover) {
        wrapper.addEventListener("mouseenter", () => item.onHover(true));
        wrapper.addEventListener("mouseleave", () => item.onHover(false));
      }

      this.container.appendChild(el);
      this.hotspotElements.push({
        el: el,
        target: item.target
      });
    });

    // Toggle button handler
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggle();
      });
    }

    this.updateVisibility();
  }

  setHoveredTarget(targetName) {
    if (!this.isEnabled || this.mode !== "desk") return;

    const targetMap = {
      crtScreen: "hotspot-screen",
      crtMonitor: "hotspot-screen",
      deskLamp: "hotspot-lamp",
      lampSwitch: "hotspot-lamp",
      lampShade: "hotspot-lamp",
      lampBulb: "hotspot-lamp",
      stickyNote: "hotspot-note",
      coffeeMug: "hotspot-mug",
      floppyDisk: "hotspot-mug"
    };

    const activeId = targetName ? targetMap[targetName] : null;

    this.hotspotElements.forEach((item) => {
      const isTarget = activeId && item.el.id === activeId;
      item.el.classList.toggle("force-hover", Boolean(isTarget));
    });
  }

  toggle() {
    this.isEnabled = !this.isEnabled;
    if (window.audioEngine) {
      window.audioEngine.playClick();
    }
    this.updateVisibility();
  }

  setMode(mode) {
    this.mode = mode;
    this.updateVisibility();
  }

  updateVisibility() {
    // Strictly visible in desk mode — never in the laptop/desktop view
    const isDeskMode = this.mode === "desk";

    if (this.toggleBtn) {
      this.toggleBtn.style.display = isDeskMode ? "inline-flex" : "none";
      this.toggleBtn.classList.toggle("active", this.isEnabled);
      this.toggleBtn.title = this.isEnabled ? "Hide Interactive Arrows" : "Show Interactive Arrows";
      const label = this.toggleBtn.querySelector(".hints-label");
      if (label) {
        label.textContent = this.isEnabled ? "Hints ON" : "Hints OFF";
      }
    }

    if (this.container) {
      const showContainer = isDeskMode && this.isEnabled;
      this.container.style.display = showContainer ? "block" : "none";
      this.container.classList.toggle("active", showContainer);
    }
  }

  updatePositions(camera) {
    if (!this.isEnabled || this.mode !== "desk" || !camera) return;

    // Detect if the yellow memo note is currently zooming in / inspected
    const isInspecting = Boolean(
      this.retroScene &&
      (this.retroScene.isStickyNoteHovered ||
       (this.retroScene.noteZoomProgress && this.retroScene.noteZoomProgress > 0.05))
    );

    if (this.container) {
      this.container.classList.toggle("inspecting-note", isInspecting);
    }

    const w = window.innerWidth;
    const h = window.innerHeight;

    this.hotspotElements.forEach((item) => {
      // When zooming in on the note, the other arrows must disappear!
      if (isInspecting && item.el.id !== "hotspot-note") {
        item.el.style.display = "none";
        return;
      }

      // Hotspot note dynamically tracks the floating 3D note mesh
      if (item.el.id === "hotspot-note" && this.retroScene && this.retroScene.stickyNote) {
        this.tempVec.copy(this.retroScene.stickyNote.position);
        this.tempVec.y += 0.14; // Position pin cleanly above top edge of note
        const descEl = item.el.querySelector(".tooltip-desc");
        if (descEl) {
          descEl.textContent = isInspecting ? "Move cursor away to set down" : "Hover to zoom in & read notes";
        }
      } else {
        this.tempVec.copy(item.target);
      }

      this.tempVec.project(camera);

      // Check if target is in front of the camera
      if (this.tempVec.z > 1 || this.tempVec.z < -1) {
        item.el.style.display = "none";
        return;
      }

      const px = (this.tempVec.x * 0.5 + 0.5) * w;
      const py = (-this.tempVec.y * 0.5 + 0.5) * h;

      item.el.style.display = "block";
      item.el.style.transform = `translate3d(${px}px, ${py}px, 0)`;
    });
  }
}

window.RoomHotspots = RoomHotspots;

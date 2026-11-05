/**
 * AgamOS & 3D Retro Workstation — 3D Interactive Hotspot Markers
 * Projects dynamic animated arrow pins pointing directly to interactive props in the 3D room.
 * Controlled by a sleek room hints icon button and completely hidden when inside AgamOS desktop.
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
        title: "Mac Display",
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
        title: "Desk Lamp",
        desc: "Click to toggle light",
        arrowClass: "arrow-down",
        onClick: () => {
          if (window.retroScene) window.retroScene.toggleLamp();
        }
      },
      {
        id: "hotspot-note",
        target: new THREE.Vector3(-0.48, 1.88, 0.25),
        icon: "📝",
        title: "Sticky Memo",
        desc: "Hover to zoom & read",
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
        title: "Coffee & Disks",
        desc: "Click for easter egg",
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
          <div class="hotspot-card" role="button" tabindex="0">
            <span class="hotspot-icon">${item.icon}</span>
            <div class="hotspot-info">
              <span class="hotspot-title">${item.title}</span>
              <span class="hotspot-desc">${item.desc}</span>
            </div>
          </div>
          <div class="hotspot-arrow ${item.arrowClass}">
            <svg viewBox="0 0 24 32" width="22" height="30">
              <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
              <polygon points="6,20 12,30 18,20" fill="currentColor"/>
            </svg>
          </div>
          <div class="hotspot-pin-anchor">
            <span class="hotspot-pin-dot"></span>
            <span class="hotspot-pin-ring"></span>
          </div>
        </div>
      `;

      // Event handlers
      const card = el.querySelector(".hotspot-card");
      if (card) {
        card.addEventListener("click", (e) => {
          e.stopPropagation();
          if (item.onClick) item.onClick();
        });

        if (item.onHover) {
          card.addEventListener("mouseenter", () => item.onHover(true));
          card.addEventListener("mouseleave", () => item.onHover(false));
        }
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
    // Only ever visible in desk mode ("not in the laptop at all")
    const isDeskMode = this.mode === "desk";

    if (this.toggleBtn) {
      this.toggleBtn.style.display = isDeskMode ? "inline-flex" : "none";
      this.toggleBtn.classList.toggle("active", this.isEnabled);
      this.toggleBtn.title = this.isEnabled ? "Hide Interactive Hints" : "Show Interactive Hints";
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

    const w = window.innerWidth;
    const h = window.innerHeight;

    this.hotspotElements.forEach((item) => {
      this.tempVec.copy(item.target);
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


/**
 * Craft98 — Minecraft Alpha 3D Engine for AgamOS (Enhanced Edition)
 * Pure Three.js Voxel Sandbox featuring:
 * - In-hand 3D block with swing/punch animations
 * - Dual-mode controls: Pointer Lock + Drag-to-look fallback
 * - Block break particles & Web Audio sound effects
 * - Creative Flying mode (toggle with 'F')
 * - 9-slot Hotbar, water/flower voxel world & new seed generator
 */

class MinecraftApp {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.canvas = this.container.querySelector("#minecraft-canvas");
    this.crosshair = this.container.querySelector(".mc-crosshair");
    this.overlay = this.container.querySelector(".mc-start-overlay");
    this.hotbarEl = this.container.querySelector(".mc-hotbar");

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.raycaster = null;

    // Voxel world data
    this.worldSize = 20;
    this.blocks = new Map(); // "x,y,z" => mesh
    this.blockMaterials = {};
    this.highlightBox = null;
    this.particles = [];

    // In-hand held block
    this.handBlock = null;
    this.isSwinging = false;
    this.swingProgress = 0;

    // Player state
    this.player = {
      pos: { x: 10, y: 8, z: 10 },
      velocity: { x: 0, y: 0, z: 0 },
      yaw: 0,
      pitch: 0,
      isGrounded: false,
      speed: 6.5,
      jumpForce: 7.2,
      isFlying: false
    };

    // Controls
    this.keys = {};
    this.isPointerLocked = false;
    this.isGameActive = false;
    this.isDraggingLook = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.selectedBlockType = "grass";
    this.stepAudioTimer = 0;

    // Block types
    this.blockTypes = [
      { id: "grass", name: "Grass Block", icon: "🟩", color: "#4ade80" },
      { id: "dirt", name: "Dirt", icon: "🟫", color: "#854d0e" },
      { id: "stone", name: "Cobblestone", icon: "🪨", color: "#64748b" },
      { id: "wood", name: "Oak Wood", icon: "🪵", color: "#78350f" },
      { id: "leaves", name: "Oak Leaves", icon: "🍃", color: "#15803d" },
      { id: "planks", name: "Oak Planks", icon: "🟨", color: "#d97706" },
      { id: "bricks", name: "Bricks", icon: "🧱", color: "#b91c1c" },
      { id: "diamond", name: "Diamond Block", icon: "💎", color: "#38bdf8" },
      { id: "glowstone", name: "Glowstone", icon: "💡", color: "#facc15" }
    ];

    this.init();
  }

  init() {
    if (!window.THREE) {
      setTimeout(() => this.init(), 150);
      return;
    }

    this.setupHotbar();
    this.buildTextures();
    this.setupThreeScene();
    this.setupHandBlock();
    this.generateTerrain();
    this.setupEvents();

    this.animate();
  }

  // --- Procedural 16x16 Pixel Art Minecraft Textures ---

  buildTextures() {
    const createPixelTexture = (drawFn) => {
      const cvs = document.createElement("canvas");
      cvs.width = 16;
      cvs.height = 16;
      const ctx = cvs.getContext("2d");
      drawFn(ctx);

      const tex = new THREE.CanvasTexture(cvs);
      tex.magFilter = THREE.NearestFilter;
      tex.minFilter = THREE.NearestFilter;
      return tex;
    };

    // 1. Dirt Texture
    const dirtTex = createPixelTexture((ctx) => {
      ctx.fillStyle = "#865439";
      ctx.fillRect(0, 0, 16, 16);
      const darks = ["#683b24", "#572f1a", "#73442a", "#966345"];
      for (let i = 0; i < 40; i++) {
        ctx.fillStyle = darks[i % darks.length];
        ctx.fillRect(Math.floor(Math.random() * 16), Math.floor(Math.random() * 16), 1, 1);
      }
    });

    // 2. Grass Top Texture
    const grassTopTex = createPixelTexture((ctx) => {
      ctx.fillStyle = "#5b8731";
      ctx.fillRect(0, 0, 16, 16);
      const shades = ["#4c7828", "#6a9b3d", "#3f671f", "#79aa47"];
      for (let i = 0; i < 40; i++) {
        ctx.fillStyle = shades[i % shades.length];
        ctx.fillRect(Math.floor(Math.random() * 16), Math.floor(Math.random() * 16), 1, 1);
      }
    });

    // 3. Grass Side Texture
    const grassSideTex = createPixelTexture((ctx) => {
      ctx.fillStyle = "#865439";
      ctx.fillRect(0, 0, 16, 16);
      for (let i = 0; i < 30; i++) {
        ctx.fillStyle = "#683b24";
        ctx.fillRect(Math.floor(Math.random() * 16), Math.floor(Math.random() * 16), 1, 1);
      }
      ctx.fillStyle = "#5b8731";
      ctx.fillRect(0, 0, 16, 3);
      for (let x = 0; x < 16; x++) {
        const drop = Math.floor(Math.random() * 3);
        ctx.fillRect(x, 3, 1, drop);
      }
    });

    // 4. Cobblestone Texture
    const stoneTex = createPixelTexture((ctx) => {
      ctx.fillStyle = "#737373";
      ctx.fillRect(0, 0, 16, 16);
      const stones = ["#525252", "#a3a3a3", "#404040", "#858585"];
      for (let i = 0; i < 45; i++) {
        ctx.fillStyle = stones[i % stones.length];
        ctx.fillRect(Math.floor(Math.random() * 16), Math.floor(Math.random() * 16), 1, 1);
      }
    });

    // 5. Wood Side Texture
    const woodSideTex = createPixelTexture((ctx) => {
      ctx.fillStyle = "#674828";
      ctx.fillRect(0, 0, 16, 16);
      for (let x = 0; x < 16; x += 2) {
        ctx.fillStyle = x % 4 === 0 ? "#4a3219" : "#7d5833";
        ctx.fillRect(x, 0, 1, 16);
      }
    });

    // 6. Wood Top (Tree rings)
    const woodTopTex = createPixelTexture((ctx) => {
      ctx.fillStyle = "#a27a4d";
      ctx.fillRect(0, 0, 16, 16);
      ctx.strokeStyle = "#674828";
      ctx.strokeRect(2, 2, 12, 12);
      ctx.strokeRect(5, 5, 6, 6);
      ctx.fillStyle = "#4a3219";
      ctx.fillRect(7, 7, 2, 2);
    });

    // 7. Leaves Texture
    const leavesTex = createPixelTexture((ctx) => {
      ctx.fillStyle = "#386824";
      ctx.fillRect(0, 0, 16, 16);
      for (let i = 0; i < 35; i++) {
        ctx.fillStyle = i % 2 === 0 ? "#284d18" : "#4c8532";
        ctx.fillRect(Math.floor(Math.random() * 16), Math.floor(Math.random() * 16), 1, 1);
      }
    });

    // 8. Planks Texture
    const planksTex = createPixelTexture((ctx) => {
      ctx.fillStyle = "#b88748";
      ctx.fillRect(0, 0, 16, 16);
      for (let y = 3; y < 16; y += 4) {
        ctx.fillStyle = "#8a5f2e";
        ctx.fillRect(0, y, 16, 1);
      }
    });

    // 9. Bricks Texture
    const bricksTex = createPixelTexture((ctx) => {
      ctx.fillStyle = "#9c4132";
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = "#d4b29d";
      ctx.fillRect(0, 3, 16, 1);
      ctx.fillRect(0, 7, 16, 1);
      ctx.fillRect(0, 11, 16, 1);
      ctx.fillRect(0, 15, 16, 1);
      ctx.fillRect(7, 0, 1, 3);
      ctx.fillRect(15, 0, 1, 3);
      ctx.fillRect(3, 4, 1, 3);
      ctx.fillRect(11, 4, 1, 3);
    });

    // 10. Diamond Block Texture
    const diamondTex = createPixelTexture((ctx) => {
      ctx.fillStyle = "#64c9d9";
      ctx.fillRect(0, 0, 16, 16);
      ctx.strokeStyle = "#bbf0f7";
      ctx.strokeRect(1, 1, 14, 14);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(3, 3, 3, 3);
      ctx.fillRect(10, 10, 2, 2);
      ctx.fillStyle = "#2c8fa0";
      ctx.fillRect(0, 0, 16, 1);
      ctx.fillRect(0, 0, 1, 16);
    });

    // 11. Glowstone Texture
    const glowTex = createPixelTexture((ctx) => {
      ctx.fillStyle = "#d69f3d";
      ctx.fillRect(0, 0, 16, 16);
      for (let i = 0; i < 45; i++) {
        ctx.fillStyle = i % 2 === 0 ? "#fde047" : "#a16207";
        ctx.fillRect(Math.floor(Math.random() * 16), Math.floor(Math.random() * 16), 1, 1);
      }
    });

    // Material definitions
    this.blockMaterials = {
      dirt: new THREE.MeshLambertMaterial({ map: dirtTex }),
      grass: [
        new THREE.MeshLambertMaterial({ map: grassSideTex }),
        new THREE.MeshLambertMaterial({ map: grassSideTex }),
        new THREE.MeshLambertMaterial({ map: grassTopTex }),
        new THREE.MeshLambertMaterial({ map: dirtTex }),
        new THREE.MeshLambertMaterial({ map: grassSideTex }),
        new THREE.MeshLambertMaterial({ map: grassSideTex })
      ],
      stone: new THREE.MeshLambertMaterial({ map: stoneTex }),
      wood: [
        new THREE.MeshLambertMaterial({ map: woodSideTex }),
        new THREE.MeshLambertMaterial({ map: woodSideTex }),
        new THREE.MeshLambertMaterial({ map: woodTopTex }),
        new THREE.MeshLambertMaterial({ map: woodTopTex }),
        new THREE.MeshLambertMaterial({ map: woodSideTex }),
        new THREE.MeshLambertMaterial({ map: woodSideTex })
      ],
      leaves: new THREE.MeshLambertMaterial({ map: leavesTex, transparent: true, opacity: 0.95 }),
      planks: new THREE.MeshLambertMaterial({ map: planksTex }),
      bricks: new THREE.MeshLambertMaterial({ map: bricksTex }),
      diamond: new THREE.MeshLambertMaterial({ map: diamondTex }),
      glowstone: new THREE.MeshBasicMaterial({ map: glowTex })
    };
  }

  // --- Three.js Scene Setup ---

  setupThreeScene() {
    const width = this.canvas.clientWidth || 680;
    const height = this.canvas.clientHeight || 400;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x78a7ff); // Minecraft Alpha sky
    this.scene.fog = new THREE.FogExp2(0x78a7ff, 0.03);

    this.camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 100);
    this.camera.position.set(this.player.pos.x, this.player.pos.y, this.player.pos.z);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.raycaster = new THREE.Raycaster();

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.65);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, 0.9);
    sun.position.set(20, 35, 15);
    this.scene.add(sun);

    // Target Highlight Box Wireframe
    const boxGeo = new THREE.BoxGeometry(1.008, 1.008, 1.008);
    const boxEdges = new THREE.EdgesGeometry(boxGeo);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
    this.highlightBox = new THREE.LineSegments(boxEdges, lineMat);
    this.highlightBox.visible = false;
    this.scene.add(this.highlightBox);

    // Floating Voxel Clouds
    const cloudGeo = new THREE.PlaneGeometry(120, 120);
    const cloudMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    const clouds = new THREE.Mesh(cloudGeo, cloudMat);
    clouds.rotation.x = Math.PI / 2;
    clouds.position.set(10, 18, 10);
    this.scene.add(clouds);
  }

  // --- 3D In-Hand Held Block (Minecraft Perspective) ---

  setupHandBlock() {
    const handGeo = new THREE.BoxGeometry(0.24, 0.24, 0.24);
    const mat = this.blockMaterials[this.selectedBlockType] || this.blockMaterials.grass;
    this.handBlock = new THREE.Mesh(handGeo, mat);

    // Position in bottom-right of player screen
    this.handBlock.position.set(0.36, -0.28, -0.55);
    this.handBlock.rotation.set(0.2, -0.35, 0.1);
    this.camera.add(this.handBlock);
    this.scene.add(this.camera);
  }

  updateHandBlock() {
    if (!this.handBlock) return;
    const mat = this.blockMaterials[this.selectedBlockType] || this.blockMaterials.grass;
    this.handBlock.material = mat;
  }

  triggerSwing() {
    this.isSwinging = true;
    this.swingProgress = 0;
  }

  // --- Terrain Generator ---

  generateTerrain() {
    this.clearWorld();
    const size = this.worldSize;
    this.cubeGeo = new THREE.BoxGeometry(1, 1, 1);

    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        // Natural rolling hills
        const height = Math.floor(
          3.5 + Math.sin(x * 0.35) * 1.8 + Math.cos(z * 0.35) * 1.8 + Math.sin((x + z) * 0.25) * 1.0
        );

        for (let y = 0; y <= height; y++) {
          let type = "stone";
          if (y === height) {
            type = "grass";
          } else if (y >= height - 2) {
            type = "dirt";
          }
          this.setBlock(x, y, z, type);
        }
      }
    }

    // Add Oak Trees
    const treeCoords = [
      { x: 5, z: 6 },
      { x: 14, z: 13 },
      { x: 15, z: 5 },
      { x: 6, z: 15 }
    ];

    treeCoords.forEach(t => {
      const groundY = this.getHighestBlockY(t.x, t.z);
      if (groundY > 0) {
        // Trunk
        for (let dy = 1; dy <= 4; dy++) {
          this.setBlock(t.x, groundY + dy, t.z, "wood");
        }
        // Leaf Canopy
        for (let lx = -2; lx <= 2; lx++) {
          for (let lz = -2; lz <= 2; lz++) {
            for (let ly = 3; ly <= 5; ly++) {
              if (Math.abs(lx) === 2 && Math.abs(lz) === 2 && ly === 5) continue;
              if (lx === 0 && lz === 0 && ly <= 4) continue;
              this.setBlock(t.x + lx, groundY + ly, t.z + lz, "leaves");
            }
          }
        }
      }
    });

    // Place Player safely on top of terrain
    const startY = this.getHighestBlockY(10, 10) + 2.2;
    this.player.pos = { x: 10, y: startY, z: 10 };
    this.player.velocity = { x: 0, y: 0, z: 0 };
  }

  clearWorld() {
    this.blocks.forEach(mesh => {
      this.scene.remove(mesh);
    });
    this.blocks.clear();
  }

  getKey(x, y, z) {
    return `${x},${y},${z}`;
  }

  getHighestBlockY(x, z) {
    for (let y = 14; y >= 0; y--) {
      if (this.blocks.has(this.getKey(x, y, z))) return y;
    }
    return 0;
  }

  setBlock(x, y, z, type) {
    const key = this.getKey(x, y, z);
    if (this.blocks.has(key)) {
      this.removeBlock(x, y, z);
    }

    const mat = this.blockMaterials[type] || this.blockMaterials.dirt;
    const mesh = new THREE.Mesh(this.cubeGeo, mat);
    mesh.position.set(x + 0.5, y + 0.5, z + 0.5);
    mesh.userData = { x, y, z, type };

    this.scene.add(mesh);
    this.blocks.set(key, mesh);
    return mesh;
  }

  removeBlock(x, y, z) {
    const key = this.getKey(x, y, z);
    const mesh = this.blocks.get(key);
    if (mesh) {
      this.spawnBreakParticles(x + 0.5, y + 0.5, z + 0.5, mesh.userData.type);
      this.scene.remove(mesh);
      this.blocks.delete(key);
      return true;
    }
    return false;
  }

  // --- Block Breaking Particle Explosion ---

  spawnBreakParticles(x, y, z, blockType) {
    const particleGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
    const mat = this.blockMaterials[blockType] || this.blockMaterials.stone;

    for (let i = 0; i < 8; i++) {
      const p = new THREE.Mesh(particleGeo, mat);
      p.position.set(
        x + (Math.random() - 0.5) * 0.4,
        y + (Math.random() - 0.5) * 0.4,
        z + (Math.random() - 0.5) * 0.4
      );
      p.userData = {
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 4,
          Math.random() * 3 + 1,
          (Math.random() - 0.5) * 4
        ),
        life: 0.5
      };
      this.scene.add(p);
      this.particles.push(p);
    }
  }

  // --- Hotbar & Inventory UI ---

  setupHotbar() {
    if (!this.hotbarEl) return;
    this.hotbarEl.innerHTML = "";

    this.blockTypes.forEach((b, idx) => {
      const slot = document.createElement("div");
      slot.className = `mc-slot ${b.id === this.selectedBlockType ? "selected" : ""}`;
      slot.dataset.type = b.id;
      slot.innerHTML = `
        <span class="mc-slot-icon">${b.icon}</span>
        <span class="mc-slot-num">${idx + 1}</span>
      `;

      slot.addEventListener("click", () => {
        this.selectBlock(b.id);
      });

      this.hotbarEl.appendChild(slot);
    });
  }

  selectBlock(type) {
    this.selectedBlockType = type;
    const slots = this.hotbarEl.querySelectorAll(".mc-slot");
    slots.forEach(s => {
      s.classList.toggle("selected", s.dataset.type === type);
    });
    this.updateHandBlock();
    if (window.audioEngine) window.audioEngine.playClick();
  }

  // --- Pause & State Management ---

  pause() {
    this.isGameActive = false;
    this.isPointerLocked = false;
    this.isDraggingLook = false;
    this.keys = {};
    if (this.overlay) this.overlay.style.display = "flex";
    if (document.pointerLockElement === this.canvas && document.exitPointerLock) {
      try { document.exitPointerLock(); } catch (_) {}
    }
  }

  // --- Controls & Pointer Lock with Fallback ---

  setupEvents() {
    // Start game on clicking either overlay OR canvas
    const startGame = () => {
      this.isGameActive = true;
      if (this.overlay) this.overlay.style.display = "none";
      if (this.canvas.requestPointerLock) {
        this.canvas.requestPointerLock();
      }
    };

    if (this.overlay) {
      this.overlay.addEventListener("click", startGame);
    }
    this.canvas.addEventListener("click", () => {
      if (!this.isGameActive) startGame();
    });

    document.addEventListener("pointerlockchange", () => {
      this.isPointerLocked = (document.pointerLockElement === this.canvas);
      if (!this.isPointerLocked) {
        this.isGameActive = false;
        this.keys = {};
        if (this.overlay) this.overlay.style.display = "flex";
      }
    });

    // Keyboard events
    window.addEventListener("keydown", (e) => {
      // 1. NEVER intercept typing in inputs, textareas or other controls (e.g. terminal)
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable)) {
        return;
      }

      // 2. Check if Minecraft window is visible and active
      if (!this.container || this.container.classList.contains("hidden")) {
        this.isGameActive = false;
        return;
      }
      if (window.windowManager && window.windowManager.activeWindow && window.windowManager.activeWindow !== "minecraft") {
        this.isGameActive = false;
        return;
      }

      if (!this.isGameActive) return;

      this.keys[e.code] = true;

      // Hotbar selection numbers 1 - 9
      const num = parseInt(e.key);
      if (num >= 1 && num <= this.blockTypes.length) {
        this.selectBlock(this.blockTypes[num - 1].id);
      }

      // Fly Mode Toggle: 'F'
      if (e.code === "KeyF") {
        this.player.isFlying = !this.player.isFlying;
        this.player.velocity.y = 0;
        if (window.audioEngine) window.audioEngine.playBeep(this.player.isFlying ? 640 : 320, 0.1);
      }

      // Jump
      if (e.code === "Space") {
        e.preventDefault();
        if (this.player.isFlying) {
          this.player.velocity.y = 6.0;
        } else if (this.player.isGrounded) {
          this.player.velocity.y = this.player.jumpForce;
          if (window.audioEngine) window.audioEngine.playBeep(440, 0.05);
        }
      }

      // Descend in flight: Shift
      if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
        if (this.player.isFlying) {
          this.player.velocity.y = -6.0;
        }
      }
    });

    window.addEventListener("keyup", (e) => {
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable)) {
        return;
      }
      this.keys[e.code] = false;
      if (this.player.isFlying && (e.code === "Space" || e.code === "ShiftLeft" || e.code === "ShiftRight")) {
        this.player.velocity.y = 0;
      }
    });

    // Mouse Look (Works with Pointer Lock AND Drag-to-look fallback)
    this.canvas.addEventListener("mousedown", (e) => {
      this.isDraggingLook = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;

      if (e.button === 0) {
        this.triggerSwing();
        this.mineBlock();
      } else if (e.button === 2) {
        e.preventDefault();
        this.triggerSwing();
        this.placeBlock();
      }
    });

    window.addEventListener("mouseup", () => {
      this.isDraggingLook = false;
    });

    window.addEventListener("mousemove", (e) => {
      if (!this.isGameActive) return;

      const sens = 0.0028;

      if (this.isPointerLocked) {
        this.player.yaw -= e.movementX * sens;
        this.player.pitch -= e.movementY * sens;
      } else if (this.isDraggingLook) {
        const dx = e.clientX - this.lastMouseX;
        const dy = e.clientY - this.lastMouseY;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;

        this.player.yaw -= dx * sens;
        this.player.pitch -= dy * sens;
      }

      const maxPitch = Math.PI / 2 - 0.05;
      this.player.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.player.pitch));
    });

    // Scroll wheel switches hotbar blocks
    this.canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const currentIdx = this.blockTypes.findIndex(b => b.id === this.selectedBlockType);
      const nextIdx = e.deltaY > 0
        ? (currentIdx + 1) % this.blockTypes.length
        : (currentIdx - 1 + this.blockTypes.length) % this.blockTypes.length;
      this.selectBlock(this.blockTypes[nextIdx].id);
    });

    this.canvas.addEventListener("contextmenu", (e) => e.preventDefault());

    // Window Menubar options
    const menuItems = this.container.querySelectorAll(".window-menubar span");
    menuItems.forEach(item => {
      item.addEventListener("click", () => {
        const txt = item.textContent.toLowerCase();
        if (txt.includes("world") || txt.includes("game")) {
          this.generateTerrain();
          if (window.audioEngine) window.audioEngine.playStartupChime();
        } else if (txt.includes("option")) {
          this.player.isFlying = !this.player.isFlying;
          alert(`Fly Mode: ${this.player.isFlying ? "ENABLED (Press Space to fly up, Shift to descend)" : "DISABLED (Walking)"}`);
        }
      });
    });

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      const w = this.canvas.clientWidth;
      const h = this.canvas.clientHeight;
      if (w > 0 && h > 0 && this.renderer && this.camera) {
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
      }
    });
    resizeObserver.observe(this.canvas);
  }

  // --- Block Raycasting & Actions ---

  getRaycastIntersection() {
    this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
    const blockMeshes = Array.from(this.blocks.values());
    const intersects = this.raycaster.intersectObjects(blockMeshes, false);

    if (intersects.length > 0 && intersects[0].distance < 6.5) {
      return intersects[0];
    }
    return null;
  }

  mineBlock() {
    const hit = this.getRaycastIntersection();
    if (hit && hit.object.userData) {
      const { x, y, z } = hit.object.userData;
      this.removeBlock(x, y, z);
      if (window.audioEngine) window.audioEngine.playBlockBreak();
    }
  }

  placeBlock() {
    const hit = this.getRaycastIntersection();
    if (hit && hit.object.userData && hit.face) {
      const { x, y, z } = hit.object.userData;
      const normal = hit.face.normal;

      const placeX = x + Math.round(normal.x);
      const placeY = y + Math.round(normal.y);
      const placeZ = z + Math.round(normal.z);

      // Prevent placing inside player body
      const px = Math.floor(this.player.pos.x);
      const py = Math.floor(this.player.pos.y);
      const pz = Math.floor(this.player.pos.z);
      if (placeX === px && (placeY === py || placeY === py - 1) && placeZ === pz) {
        return;
      }

      this.setBlock(placeX, placeY, placeZ, this.selectedBlockType);
      if (window.audioEngine) window.audioEngine.playBlockPlace();
    }
  }

  // --- Physics & Game Loop ---

  updatePlayer(delta) {
    if (!this.isGameActive) return;

    // Movement vectors
    const move = { x: 0, z: 0 };
    if (this.keys["KeyW"] || this.keys["ArrowUp"]) move.z += 1;
    if (this.keys["KeyS"] || this.keys["ArrowDown"]) move.z -= 1;
    if (this.keys["KeyA"] || this.keys["ArrowLeft"]) move.x -= 1;
    if (this.keys["KeyD"] || this.keys["ArrowRight"]) move.x += 1;

    // Normalize
    const len = Math.hypot(move.x, move.z);
    if (len > 0) {
      move.x /= len;
      move.z /= len;

      // Footstep clicks
      this.stepAudioTimer += delta;
      if (this.stepAudioTimer > 0.38 && this.player.isGrounded && !this.player.isFlying) {
        this.stepAudioTimer = 0;
        if (window.audioEngine) window.audioEngine.playClick();
      }
    }

    const sinYaw = Math.sin(this.player.yaw);
    const cosYaw = Math.cos(this.player.yaw);

    const forwardX = -sinYaw;
    const forwardZ = -cosYaw;
    const rightX = cosYaw;
    const rightZ = -sinYaw;

    const moveSpeed = (this.player.isFlying ? 10.0 : this.player.speed) * delta;
    this.player.pos.x += (forwardX * move.z + rightX * move.x) * moveSpeed;
    this.player.pos.z += (forwardZ * move.z + rightZ * move.x) * moveSpeed;

    // Gravity / Vertical physics
    if (!this.player.isFlying) {
      this.player.velocity.y -= 19.0 * delta;
      this.player.pos.y += this.player.velocity.y * delta;

      const curX = Math.floor(this.player.pos.x);
      const curZ = Math.floor(this.player.pos.z);
      const groundY = this.getHighestBlockY(curX, curZ) + 1.8;

      if (this.player.pos.y < groundY) {
        this.player.pos.y = groundY;
        this.player.velocity.y = 0;
        this.player.isGrounded = true;
      } else {
        this.player.isGrounded = false;
      }
    } else {
      this.player.pos.y += this.player.velocity.y * delta;
    }

    // World boundary
    this.player.pos.x = Math.max(0.5, Math.min(this.worldSize - 0.5, this.player.pos.x));
    this.player.pos.z = Math.max(0.5, Math.min(this.worldSize - 0.5, this.player.pos.z));

    // Update Camera
    this.camera.position.set(this.player.pos.x, this.player.pos.y, this.player.pos.z);

    const euler = new THREE.Euler(this.player.pitch, this.player.yaw, 0, "YXZ");
    this.camera.quaternion.setFromEuler(euler);

    // Hand Block Swing Animation
    if (this.handBlock) {
      if (this.isSwinging) {
        this.swingProgress += delta * 12;
        const swingAngle = Math.sin(this.swingProgress * Math.PI) * 0.45;
        this.handBlock.rotation.x = 0.2 + swingAngle;
        this.handBlock.position.z = -0.55 + swingAngle * 0.15;
        if (this.swingProgress >= 1) {
          this.isSwinging = false;
          this.handBlock.rotation.x = 0.2;
          this.handBlock.position.z = -0.55;
        }
      } else if (len > 0) {
        // Walking bobbing
        const bob = Math.sin(Date.now() * 0.008) * 0.015;
        this.handBlock.position.y = -0.28 + bob;
      }
    }

    // Update Break Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.userData.life -= delta;
      p.userData.vel.y -= 12.0 * delta;
      p.position.addScaledVector(p.userData.vel, delta);
      if (p.userData.life <= 0) {
        this.scene.remove(p);
        this.particles.splice(i, 1);
      }
    }

    // Target block wireframe
    const hit = this.getRaycastIntersection();
    if (hit) {
      this.highlightBox.position.copy(hit.object.position);
      this.highlightBox.visible = true;
    } else {
      this.highlightBox.visible = false;
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = 0.016;
    this.updatePlayer(delta);

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

window.MinecraftApp = MinecraftApp;

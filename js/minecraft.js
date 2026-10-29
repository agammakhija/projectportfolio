/**
 * Craft98 — Minecraft Alpha 3D Engine for AgamOS
 * Pure Three.js Voxel Sandbox with procedural 16x16 pixel textures,
 * first-person player controller, block breaking & placing, and hotbar!
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
    this.worldSize = 18;
    this.worldDepth = 8;
    this.blocks = new Map(); // "x,y,z" => mesh
    this.blockMaterials = {};
    this.highlightBox = null;

    // Player state
    this.player = {
      pos: { x: 9, y: 7, z: 9 },
      velocity: { x: 0, y: 0, z: 0 },
      yaw: 0,
      pitch: 0,
      isGrounded: false,
      speed: 6.0,
      jumpForce: 7.0
    };

    // Controls
    this.keys = {};
    this.isPointerLocked = false;
    this.isGameActive = false;
    this.selectedBlockType = "grass";

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
        new THREE.MeshLambertMaterial({ map: grassSideTex }), // right
        new THREE.MeshLambertMaterial({ map: grassSideTex }), // left
        new THREE.MeshLambertMaterial({ map: grassTopTex }),  // top
        new THREE.MeshLambertMaterial({ map: dirtTex }),      // bottom
        new THREE.MeshLambertMaterial({ map: grassSideTex }), // front
        new THREE.MeshLambertMaterial({ map: grassSideTex })  // back
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
    const width = this.canvas.clientWidth || 580;
    const height = this.canvas.clientHeight || 360;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x78a7ff); // Minecraft sky blue
    this.scene.fog = new THREE.FogExp2(0x78a7ff, 0.035);

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
    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, 0.85);
    sun.position.set(15, 30, 20);
    this.scene.add(sun);

    // Target Highlight Box Wireframe
    const boxGeo = new THREE.BoxGeometry(1.005, 1.005, 1.005);
    const boxEdges = new THREE.EdgesGeometry(boxGeo);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
    this.highlightBox = new THREE.LineSegments(boxEdges, lineMat);
    this.highlightBox.visible = false;
    this.scene.add(this.highlightBox);

    // Clouds
    const cloudGeo = new THREE.PlaneGeometry(80, 80);
    const cloudMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide
    });
    const clouds = new THREE.Mesh(cloudGeo, cloudMat);
    clouds.rotation.x = Math.PI / 2;
    clouds.position.set(10, 16, 10);
    this.scene.add(clouds);
  }

  // --- Terrain Generator ---

  generateTerrain() {
    this.clearWorld();
    const size = this.worldSize;

    // Voxel Geometry shared across blocks
    this.cubeGeo = new THREE.BoxGeometry(1, 1, 1);

    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        // Height formula with sine waves
        const height = Math.floor(
          3 + Math.sin(x * 0.4) * 1.5 + Math.cos(z * 0.4) * 1.5 + Math.sin((x + z) * 0.3) * 0.8
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
    const treeSpots = [
      { x: 5, z: 5 },
      { x: 13, z: 12 },
      { x: 12, z: 4 }
    ];

    treeSpots.forEach(t => {
      const groundY = this.getHighestBlockY(t.x, t.z);
      if (groundY > 0) {
        // Trunk (height 4)
        for (let dy = 1; dy <= 4; dy++) {
          this.setBlock(t.x, groundY + dy, t.z, "wood");
        }
        // Leaf Canopy
        for (let lx = -2; lx <= 2; lx++) {
          for (let lz = -2; lz <= 2; lz++) {
            for (let ly = 3; ly <= 5; ly++) {
              if (Math.abs(lx) === 2 && Math.abs(lz) === 2 && ly === 5) continue;
              if (lx === 0 && lz === 0 && ly <= 4) continue; // tree trunk
              this.setBlock(t.x + lx, groundY + ly, t.z + lz, "leaves");
            }
          }
        }
      }
    });

    // Place Player on safe ground
    const startY = this.getHighestBlockY(9, 9) + 2;
    this.player.pos = { x: 9, y: startY, z: 9 };
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
      this.scene.remove(mesh);
      this.blocks.delete(key);
      return true;
    }
    return false;
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
    if (window.audioEngine) window.audioEngine.playClick();
  }

  // --- Controls & Pointer Lock ---

  setupEvents() {
    // Start Overlay Click (locks pointer)
    if (this.overlay) {
      this.overlay.addEventListener("click", () => {
        this.canvas.requestPointerLock = this.canvas.requestPointerLock || this.canvas.mozRequestPointerLock;
        if (this.canvas.requestPointerLock) {
          this.canvas.requestPointerLock();
        }
      });
    }

    document.addEventListener("pointerlockchange", () => {
      this.isPointerLocked = (document.pointerLockElement === this.canvas);
      if (this.overlay) {
        this.overlay.style.display = this.isPointerLocked ? "none" : "flex";
      }
      this.isGameActive = this.isPointerLocked;
    });

    // Keyboard events
    window.addEventListener("keydown", (e) => {
      this.keys[e.code] = true;

      // Hotbar selection numbers 1 - 9
      const num = parseInt(e.key);
      if (num >= 1 && num <= this.blockTypes.length) {
        this.selectBlock(this.blockTypes[num - 1].id);
      }

      // Space jump
      if (e.code === "Space" && this.isGameActive) {
        e.preventDefault();
        this.player.velocity.y = this.player.jumpForce;
      }
    });

    window.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
    });

    // Mouse Look
    window.addEventListener("mousemove", (e) => {
      if (!this.isPointerLocked) return;

      const sens = 0.0025;
      this.player.yaw -= e.movementX * sens;
      this.player.pitch -= e.movementY * sens;

      // Clamp pitch to avoid neck snap
      const maxPitch = Math.PI / 2 - 0.05;
      this.player.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.player.pitch));
    });

    // Mouse Clicks (Left = Break, Right = Place)
    this.canvas.addEventListener("mousedown", (e) => {
      if (!this.isPointerLocked) return;

      if (e.button === 0) {
        // Mine / Break
        this.mineBlock();
      } else if (e.button === 2) {
        // Place block
        e.preventDefault();
        this.placeBlock();
      }
    });

    this.canvas.addEventListener("contextmenu", (e) => e.preventDefault());

    // Resize event
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

      // Don't place inside the player's head/body
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

    // Normalize diagonal movement
    const len = Math.hypot(move.x, move.z);
    if (len > 0) {
      move.x /= len;
      move.z /= len;
    }

    // Camera forward and right vectors projected onto XZ plane
    const sinYaw = Math.sin(this.player.yaw);
    const cosYaw = Math.cos(this.player.yaw);

    const forwardX = -sinYaw;
    const forwardZ = -cosYaw;
    const rightX = cosYaw;
    const rightZ = -sinYaw;

    const dx = (forwardX * move.z + rightX * move.x) * this.player.speed * delta;
    const dz = (forwardZ * move.z + rightZ * move.x) * this.player.speed * delta;

    this.player.pos.x += dx;
    this.player.pos.z += dz;

    // Gravity
    this.player.velocity.y -= 18.0 * delta;
    this.player.pos.y += this.player.velocity.y * delta;

    // Floor collision
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

    // World Boundary constraint
    this.player.pos.x = Math.max(0.5, Math.min(this.worldSize - 0.5, this.player.pos.x));
    this.player.pos.z = Math.max(0.5, Math.min(this.worldSize - 0.5, this.player.pos.z));

    // Update Camera
    this.camera.position.set(this.player.pos.x, this.player.pos.y, this.player.pos.z);

    const euler = new THREE.Euler(this.player.pitch, this.player.yaw, 0, "YXZ");
    this.camera.quaternion.setFromEuler(euler);

    // Target Block Outline highlight
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

    const delta = 0.016; // smooth 60fps delta
    this.updatePlayer(delta);

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

window.MinecraftApp = MinecraftApp;


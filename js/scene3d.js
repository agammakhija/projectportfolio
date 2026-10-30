/**
 * 3D Scene Controller for Agam's Retro Room & CRT Workstation
 * Built with Three.js - Procedural 3D models with zero external asset dependencies!
 * 
 * Inspired by and adapted from Henry Heffernan's 3D portfolio (https://github.com/henryjeff/portfolio-website)
 * Licensed under the MIT License (see LICENSE and ATTRIBUTION.md).
 */

class RetroScene {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.raycaster = null;
    this.mouse = null;
    this.hoveredObject = null;
    this.interactiveObjects = [];

    // Lighting objects
    this.lampLight = null;
    this.lampBulb = null;
    this.screenLight = null;
    this.ambientLight = null;
    this.dirLight = null;
    this.isLampOn = true;

    // References to animated parts
    this.hddLed = null;
    this.crtScreenMesh = null;
    this.screenCanvas = null;
    this.screenTexture = null;
    this.clock = null;

    // Camera targets
    this.cameraMode = "desk"; // "desk" or "monitor"
    this.targetPos = null;
    this.targetLookAt = null;
    this.currentLookAt = null;

    // Mouse parallax
    this.mouseTarget = { x: 0, y: 0 };
    this.mouseCurrent = { x: 0, y: 0 };

    this.retryCount = 0;
    this.init();
  }

  init() {
    if (!window.THREE) {
      this.retryCount++;
      if (this.retryCount < 30) {
        setTimeout(() => this.init(), 100);
        return;
      } else {
        console.warn("Three.js not available. Defaulting directly to AgamOS mode.");
        window.dispatchEvent(new CustomEvent("enterAgamOS"));
        return;
      }
    }

    // Initialize THREE instances safely
    this.mouse = new THREE.Vector2();
    this.clock = new THREE.Clock();
    this.targetPos = new THREE.Vector3(0, 1.8, 3.8);
    this.targetLookAt = new THREE.Vector3(0, 1.35, 0);
    this.currentLookAt = new THREE.Vector3(0, 1.35, 0);
    this.raycaster = new THREE.Raycaster();

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f0b1e);
    this.scene.fog = new THREE.FogExp2(0x0f0b1e, 0.065);

    // 2. Camera
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(48, aspect, 0.1, 100);
    this.camera.position.set(0, 1.8, 3.8);
    this.camera.lookAt(0, 1.35, 0);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: "high-performance",
      antialias: true,
      alpha: false
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.container.appendChild(this.renderer.domElement);

    // 4. Raycaster
    this.raycaster = new THREE.Raycaster();

    // 5. Build Environment & Props
    this.createProceduralTextures();
    this.setupLighting();
    this.buildRoom();
    this.buildDesk();
    this.buildCrtMonitor();
    this.buildPcTower();
    this.buildPeripherals();
    this.buildDeskLamp();
    this.buildDeskProps();

    // 6. Event Listeners
    window.addEventListener("resize", () => this.onWindowResize());
    window.addEventListener("mousemove", (e) => this.onMouseMove(e));
    window.addEventListener("click", (e) => this.onSceneClick(e));

    // 7. Start Animation Loop
    this.animate();
  }

  // --- Procedural Canvas Textures (High Fidelity, Zero Asset Loading) ---

  createProceduralTextures() {
    // 1. Wood Desk Texture
    const woodCanvas = document.createElement("canvas");
    woodCanvas.width = 512;
    woodCanvas.height = 512;
    const wctx = woodCanvas.getContext("2d");
    wctx.fillStyle = "#4a2d1d";
    wctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 500; i++) {
      wctx.fillStyle = i % 2 === 0 ? "rgba(60, 32, 18, 0.15)" : "rgba(105, 62, 38, 0.12)";
      wctx.fillRect(0, Math.random() * 512, 512, Math.random() * 8 + 2);
    }
    this.woodTexture = new THREE.CanvasTexture(woodCanvas);
    this.woodTexture.wrapS = THREE.RepeatWrapping;
    this.woodTexture.wrapT = THREE.RepeatWrapping;
    this.woodTexture.repeat.set(2, 1);

    // 2. Wall Wallpaper Texture
    const wallCanvas = document.createElement("canvas");
    wallCanvas.width = 256;
    wallCanvas.height = 256;
    const wallCtx = wallCanvas.getContext("2d");
    wallCtx.fillStyle = "#1e2230";
    wallCtx.fillRect(0, 0, 256, 256);
    wallCtx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    wallCtx.lineWidth = 2;
    for (let x = 0; x < 256; x += 32) {
      wallCtx.beginPath();
      wallCtx.moveTo(x, 0);
      wallCtx.lineTo(x, 256);
      wallCtx.stroke();
    }
    for (let y = 0; y < 256; y += 32) {
      wallCtx.beginPath();
      wallCtx.moveTo(0, y);
      wallCtx.lineTo(256, y);
      wallCtx.stroke();
    }
    this.wallTexture = new THREE.CanvasTexture(wallCanvas);
    this.wallTexture.wrapS = THREE.RepeatWrapping;
    this.wallTexture.wrapT = THREE.RepeatWrapping;
    this.wallTexture.repeat.set(6, 4);

    // 3. Cyber Poster Texture
    const posterCanvas = document.createElement("canvas");
    posterCanvas.width = 512;
    posterCanvas.height = 768;
    const pctx = posterCanvas.getContext("2d");
    // Neon Cyberpunk Gradient
    const grad = pctx.createLinearGradient(0, 0, 512, 768);
    grad.addColorStop(0, "#0b0c26");
    grad.addColorStop(0.5, "#4c1d95");
    grad.addColorStop(1, "#f43f5e");
    pctx.fillStyle = grad;
    pctx.fillRect(0, 0, 512, 768);

    // Grid lines
    pctx.strokeStyle = "rgba(0, 255, 255, 0.35)";
    pctx.lineWidth = 3;
    for (let y = 400; y < 768; y += 25) {
      pctx.beginPath();
      pctx.moveTo(0, y);
      pctx.lineTo(512, y);
      pctx.stroke();
    }
    for (let x = 0; x < 512; x += 40) {
      pctx.beginPath();
      pctx.moveTo(x, 400);
      pctx.lineTo((x - 256) * 2.5 + 256, 768);
      pctx.stroke();
    }

    // Glowing Sun
    pctx.fillStyle = "#fbbf24";
    pctx.beginPath();
    pctx.arc(256, 380, 110, 0, Math.PI * 2);
    pctx.fill();

    // Synthwave typography
    pctx.fillStyle = "#ffffff";
    pctx.font = "bold 44px 'Courier New', monospace";
    pctx.textAlign = "center";
    pctx.fillText("AGAM MAKHIJA", 256, 140);
    pctx.font = "bold 24px 'Courier New', monospace";
    pctx.fillStyle = "#38bdf8";
    pctx.fillText("PORTFOLIO 1998 // 3D", 256, 185);

    this.posterTexture = new THREE.CanvasTexture(posterCanvas);
  }

  // --- Lighting Setup ---

  setupLighting() {
    // 1. Low Ambience Purple Lighting
    this.ambientLight = new THREE.AmbientLight(0x2e1065, 0.45);
    this.scene.add(this.ambientLight);

    const ambientPurple = new THREE.AmbientLight(0x581c87, 0.35);
    this.scene.add(ambientPurple);

    // 2. Room Window Moonlight / Key Light (Soft violet-tinted beam)
    this.dirLight = new THREE.DirectionalLight(0x8b5cf6, 0.28);
    this.dirLight.position.set(-5, 6, 4);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 15;
    this.dirLight.shadow.bias = -0.0005;
    this.scene.add(this.dirLight);

    // 3. Background Wall Low Ambient Purple Wash Lights
    const bgPurpleCenter = new THREE.PointLight(0x9333ea, 0.85, 8.0, 1.4);
    bgPurpleCenter.position.set(0, 2.3, -1.3);
    this.scene.add(bgPurpleCenter);

    const bgPurpleLeft = new THREE.PointLight(0x6b21a8, 0.55, 6.0, 1.5);
    bgPurpleLeft.position.set(-2.2, 2.0, -1.1);
    this.scene.add(bgPurpleLeft);

    const bgPurpleRight = new THREE.PointLight(0x7e22ce, 0.55, 6.0, 1.5);
    bgPurpleRight.position.set(2.2, 2.0, -1.1);
    this.scene.add(bgPurpleRight);

    // 4. Desk Lamp Spotlight (Warm vintage beam, ON by default)
    this.lampLight = new THREE.SpotLight(0xffedd5, 2.6, 5.5, Math.PI / 3.4, 0.45, 1.2);
    this.lampLight.position.set(-0.72, 1.95, 0.26);
    this.lampLight.target.position.set(-0.16, 0.98, 0.44);
    this.lampLight.castShadow = true;
    this.lampLight.shadow.mapSize.width = 1024;
    this.lampLight.shadow.mapSize.height = 1024;
    this.lampLight.shadow.bias = -0.001;
    this.scene.add(this.lampLight);
    this.scene.add(this.lampLight.target);

    // 5. CRT / Mac Screen Glow (Dynamic point light)
    this.screenLight = new THREE.PointLight(0x6366f1, 0.65, 2.0, 1.5);
    this.screenLight.position.set(0, 1.35, 0.5);
    this.scene.add(this.screenLight);
  }

  // --- Room & Desk Geometry ---

  buildRoom() {
    // Back Wall
    const wallGeo = new THREE.PlaneGeometry(12, 8);
    const wallMat = new THREE.MeshStandardMaterial({
      map: this.wallTexture,
      roughness: 0.9,
      metalness: 0.1
    });
    const backWall = new THREE.Mesh(wallGeo, wallMat);
    backWall.position.set(0, 3, -1.8);
    backWall.receiveShadow = true;
    this.scene.add(backWall);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(12, 10);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x181a20,
      roughness: 0.75,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 2);
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Retro Poster on the Wall
    const posterGeo = new THREE.PlaneGeometry(1.2, 1.8);
    const posterMat = new THREE.MeshStandardMaterial({
      map: this.posterTexture,
      roughness: 0.4,
      metalness: 0.1
    });
    const poster = new THREE.Mesh(posterGeo, posterMat);
    poster.position.set(1.5, 2.6, -1.78);
    this.scene.add(poster);

    // Poster Frame
    const frameGeo = new THREE.BoxGeometry(1.26, 1.86, 0.03);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(1.5, 2.6, -1.79);
    this.scene.add(frame);
  }

  buildDesk() {
    // Desktop Surface
    const topGeo = new THREE.BoxGeometry(3.2, 0.08, 1.6);
    const topMat = new THREE.MeshStandardMaterial({
      map: this.woodTexture,
      roughness: 0.6,
      metalness: 0.05
    });
    const deskTop = new THREE.Mesh(topGeo, topMat);
    deskTop.position.set(0, 0.96, 0.1);
    deskTop.receiveShadow = true;
    deskTop.castShadow = true;
    deskTop.name = "deskSurface";
    this.scene.add(deskTop);
    this.interactiveObjects.push(deskTop);

    // Metal Legs
    const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.96, 16);
    const legMat = new THREE.MeshStandardMaterial({
      color: 0x222226,
      roughness: 0.4,
      metalness: 0.8
    });

    const legPositions = [
      [-1.48, 0.48, -0.6],
      [1.48, 0.48, -0.6],
      [-1.48, 0.48, 0.75],
      [1.48, 0.48, 0.75]
    ];

    legPositions.forEach(pos => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(...pos);
      leg.castShadow = true;
      leg.receiveShadow = true;
      this.scene.add(leg);
    });

    // Desk Modesty Panel (Back plate)
    const panelGeo = new THREE.BoxGeometry(2.8, 0.5, 0.02);
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x2c1d14, roughness: 0.8 });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.set(0, 0.65, -0.58);
    this.scene.add(panel);
  }

  // --- Apple Mac (iMac All-In-One Workstation) ---

  buildCrtMonitor() {
    const monitorGroup = new THREE.Group();
    monitorGroup.name = "crtMonitor";

    // Apple Silver Aluminum Materials
    const aluminumMat = new THREE.MeshStandardMaterial({
      color: 0xdde3ec,
      metalness: 0.85,
      roughness: 0.22
    });
    const darkGlassMat = new THREE.MeshStandardMaterial({
      color: 0x050505,
      metalness: 0.4,
      roughness: 0.08
    });
    const appleLogoMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.9,
      roughness: 0.15
    });

    // 1. Apple L-Stand (Precision-milled aluminum)
    const baseStand = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 0.012, 0.28),
      aluminumMat
    );
    baseStand.position.set(0, 1.006, 0.06);
    baseStand.castShadow = true;
    baseStand.receiveShadow = true;
    baseStand.name = "crtScreen";
    monitorGroup.add(baseStand);

    const standNeck = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.42, 0.016),
      aluminumMat
    );
    standNeck.position.set(0, 1.20, 0.02);
    standNeck.rotation.x = -0.15;
    standNeck.castShadow = true;
    standNeck.name = "crtScreen";
    monitorGroup.add(standNeck);

    // Cable passthrough hole cutout on stand
    const cutout = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.02, 24),
      new THREE.MeshBasicMaterial({ color: 0x1e293b })
    );
    cutout.rotateX(Math.PI / 2);
    cutout.position.set(0, 1.15, 0.02);
    cutout.name = "crtScreen";
    monitorGroup.add(cutout);

    // 2. iMac Unibody Display Enclosure (Ultra-slim aluminum profile)
    const displayBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.24, 0.78, 0.024),
      aluminumMat
    );
    displayBody.position.set(0, 1.54, 0.22);
    displayBody.rotation.x = -0.03;
    displayBody.castShadow = true;
    displayBody.receiveShadow = true;
    displayBody.name = "crtScreen";
    monitorGroup.add(displayBody);

    // Front Glass Bezel (Edge-to-edge glossy dark border)
    const glassBezel = new THREE.Mesh(
      new THREE.BoxGeometry(1.22, 0.64, 0.005),
      darkGlassMat
    );
    glassBezel.position.set(0, 1.59, 0.235);
    glassBezel.rotation.x = -0.03;
    glassBezel.name = "crtScreen";
    monitorGroup.add(glassBezel);

    // Front Aluminum Chin
    const chin = new THREE.Mesh(
      new THREE.BoxGeometry(1.24, 0.12, 0.006),
      aluminumMat
    );
    chin.position.set(0, 1.21, 0.235);
    chin.rotation.x = -0.03;
    chin.name = "crtScreen";
    monitorGroup.add(chin);

    // Polished Apple Logo on Chin
    const chinLogo = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.022, 0.004, 24),
      appleLogoMat
    );
    chinLogo.rotateX(Math.PI / 2);
    chinLogo.position.set(0, 1.21, 0.24);
    chinLogo.name = "crtScreen";
    monitorGroup.add(chinLogo);

    // FaceTime HD Camera Lens (Top bezel center)
    const cameraLens = new THREE.Mesh(
      new THREE.SphereGeometry(0.005, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x0284c7 })
    );
    cameraLens.position.set(0, 1.93, 0.24);
    cameraLens.name = "crtScreen";
    monitorGroup.add(cameraLens);

    // Large Polished Apple Logo on Rear of Mac
    const backLogo = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 0.004, 32),
      appleLogoMat
    );
    backLogo.rotateX(Math.PI / 2);
    backLogo.position.set(0, 1.54, 0.205);
    monitorGroup.add(backLogo);

    // 3. Active Retina Display Plane with Dynamic macOS Texture
    this.createCrtScreenTexture();
    const screenGeo = new THREE.PlaneGeometry(1.16, 0.58);
    const screenMat = new THREE.MeshBasicMaterial({
      map: this.screenTexture,
      toneMapped: false
    });
    this.crtScreenMesh = new THREE.Mesh(screenGeo, screenMat);
    this.crtScreenMesh.position.set(0, 1.59, 0.24);
    this.crtScreenMesh.rotation.x = -0.03;
    this.crtScreenMesh.name = "crtScreen";
    monitorGroup.add(this.crtScreenMesh);

    // 4. Interactive high-res sticky note pinned to Mac bezel
    const noteCanvas = document.createElement("canvas");
    noteCanvas.width = 512;
    noteCanvas.height = 512;
    const nctx = noteCanvas.getContext("2d");

    // Vibrant post-it yellow with subtle paper gradient
    const paperGrad = nctx.createLinearGradient(0, 0, 0, 512);
    paperGrad.addColorStop(0, "#fef08a");
    paperGrad.addColorStop(0.12, "#fef9c3");
    paperGrad.addColorStop(1, "#fde047");
    nctx.fillStyle = paperGrad;
    nctx.fillRect(0, 0, 512, 512);

    // Subtle faint notebook lines
    nctx.strokeStyle = "rgba(180, 130, 20, 0.15)";
    nctx.lineWidth = 1.5;
    for (let y = 145; y < 450; y += 42) {
      nctx.beginPath();
      nctx.moveTo(35, y);
      nctx.lineTo(477, y);
      nctx.stroke();
    }

    // Top glue strip shadow
    nctx.fillStyle = "rgba(202, 138, 4, 0.35)";
    nctx.fillRect(0, 0, 512, 48);

    // Red push pin at top center
    nctx.fillStyle = "#dc2626";
    nctx.beginPath();
    nctx.arc(256, 25, 14, 0, Math.PI * 2);
    nctx.fill();
    nctx.fillStyle = "#ffffff";
    nctx.beginPath();
    nctx.arc(251, 21, 5, 0, Math.PI * 2);
    nctx.fill();

    // Subtle drop shadow under pin
    nctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    nctx.beginPath();
    nctx.arc(258, 36, 8, 0, Math.PI * 2);
    nctx.fill();

    // Handwritten header
    nctx.fillStyle = "#1e1b4b";
    nctx.font = "bold 32px 'Comic Sans MS', 'Chalkboard SE', 'Marker Felt', cursive, sans-serif";
    nctx.fillText("📌 MEMO // AGAM:", 45, 100);

    // Bullet points
    nctx.font = "bold 23px 'Comic Sans MS', 'Chalkboard SE', cursive, sans-serif";
    nctx.fillStyle = "#0f172a";
    nctx.fillText("• Click screen to enter AgamOS", 45, 160);
    nctx.fillText("• Spider-Man portfolio in Safari 🕷️", 45, 204);
    nctx.fillText("• Play Minecraft 3D voxel world ⛏️", 45, 248);
    nctx.fillText("• Python 3 & AI Prompt Specialist 🐍", 45, 292);
    nctx.fillText("• Terminal commands: 'agam skills'", 45, 336);
    nctx.fillText("• Spider-Man music & sound track 🎵", 45, 380);

    nctx.fillStyle = "#7c3aed";
    nctx.font = "bold 26px 'Comic Sans MS', 'Chalkboard SE', cursive, sans-serif";
    nctx.fillText("✨ Agam Makhija — macOS", 120, 460);

    const noteTex = new THREE.CanvasTexture(noteCanvas);
    noteTex.minFilter = THREE.LinearFilter;
    noteTex.magFilter = THREE.LinearFilter;

    const noteMat = new THREE.MeshStandardMaterial({
      map: noteTex,
      roughness: 0.85,
      emissive: new THREE.Color(0x181404),
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2
    });

    // Main sticky note pinned to top-left of Mac
    const stickyNote = new THREE.Mesh(
      new THREE.PlaneGeometry(0.26, 0.24),
      noteMat
    );
    stickyNote.position.set(-0.48, 1.88, 0.248);
    stickyNote.rotation.z = -0.05;
    stickyNote.rotation.y = 0.02;
    stickyNote.name = "stickyNote";
    monitorGroup.add(stickyNote);

    // Drop shadow behind sticky note
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35
    });
    const noteShadow = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.24), shadowMat);
    noteShadow.position.set(-0.475, 1.875, 0.242);
    noteShadow.rotation.z = -0.05;
    monitorGroup.add(noteShadow);

    this.scene.add(monitorGroup);
    this.interactiveObjects.push(
      this.crtScreenMesh,
      glassBezel,
      displayBody,
      chin,
      chinLogo,
      cameraLens,
      baseStand,
      standNeck,
      stickyNote
    );

    // Resident Evil inspection references & state
    this.stickyNote = stickyNote;
    this.noteShadow = noteShadow;
    this.isStickyNoteHovered = false;
    this.noteZoomProgress = 0;

    // Resting pinned state on Mac bezel
    this.stickyBasePos = new THREE.Vector3(-0.48, 1.88, 0.248);
    this.stickyBaseRot = new THREE.Vector3(0, 0.02, -0.05);
    this.stickyBaseScale = new THREE.Vector3(1.0, 1.0, 1.0);

    // Resident Evil Close-up Inspect state
    this.stickyInspectPos = new THREE.Vector3(0, 1.58, 2.12);
    this.stickyInspectRot = new THREE.Vector3(0.12, 0, -0.015);
    this.stickyInspectScale = new THREE.Vector3(2.85, 2.85, 2.85);

    this.inspectOverlayEl = document.getElementById("sticky-inspect-overlay");
  }

  // --- Dynamic macOS Screen Texture Generator ---

  createCrtScreenTexture() {
    this.screenCanvas = document.createElement("canvas");
    this.screenCanvas.width = 512;
    this.screenCanvas.height = 288; // 16:9 widescreen Retina ratio
    this.screenCtx = this.screenCanvas.getContext("2d");

    this.renderScreenFrame(0);

    this.screenTexture = new THREE.CanvasTexture(this.screenCanvas);
    this.screenTexture.minFilter = THREE.LinearFilter;
    this.screenTexture.magFilter = THREE.LinearFilter;
  }

  renderScreenFrame(time) {
    const ctx = this.screenCtx;
    const w = 512;
    const h = 288;

    const drawRoundRect = (x, y, rw, rh, rad) => {
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(x, y, rw, rh, rad);
      } else {
        ctx.beginPath();
        ctx.rect(x, y, rw, rh);
      }
    };

    // macOS Sequoia Twilight Gradient Wallpaper
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, "#1e1b4b");
    bgGrad.addColorStop(0.3, "#312e81");
    bgGrad.addColorStop(0.65, "#4338ca");
    bgGrad.addColorStop(0.85, "#6366f1");
    bgGrad.addColorStop(1, "#ec4899");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Top Apple Menu Bar
    ctx.fillStyle = "rgba(20, 24, 33, 0.85)";
    ctx.fillRect(0, 0, w, 22);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText("", 10, 15);

    ctx.font = "bold 10px sans-serif";
    ctx.fillText("Finder", 28, 15);

    ctx.font = "10px sans-serif";
    ctx.fillStyle = "#e2e8f0";
    ctx.fillText("File   Edit   View   Go   Window   Help", 75, 15);

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    ctx.fillText(timeStr, w - 50, 15);

    // Open macOS Frosted Glass Window
    const wx = 80;
    const wy = 42;
    const ww = 352;
    const wh = 180;

    // Window shadow & body
    ctx.fillStyle = "rgba(24, 28, 38, 0.94)";
    drawRoundRect(wx, wy, ww, wh, 10);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Titlebar
    ctx.fillStyle = "rgba(36, 40, 54, 0.96)";
    drawRoundRect(wx, wy, ww, 26, [10, 10, 0, 0]);
    ctx.fill();

    // Traffic Lights (🔴 🟡 🟢)
    ctx.fillStyle = "#ff5f56";
    ctx.beginPath();
    ctx.arc(wx + 14, wy + 13, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffbd2e";
    ctx.beginPath();
    ctx.arc(wx + 28, wy + 13, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#27c93f";
    ctx.beginPath();
    ctx.arc(wx + 42, wy + 13, 5, 0, Math.PI * 2);
    ctx.fill();

    // Centered Title
    ctx.fillStyle = "#f1f5f9";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("About Agam Makhija — Portfolio", wx + 105, wy + 17);

    // Window Inner Content
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("Agam Makhija — Python 3 & AI Specialist", wx + 20, wy + 54);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "11px sans-serif";
    ctx.fillText("Newton School of Technology • B.Tech CSE (AI/ML)", wx + 20, wy + 72);

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "10px sans-serif";
    ctx.fillText("• Click screen to enter macOS desktop environment", wx + 20, wy + 96);
    ctx.fillText("• Spider-Man portfolio inside Safari browser", wx + 20, wy + 112);
    ctx.fillText("• Interactive 3D voxel sandbox (Minecraft Craft98)", wx + 20, wy + 128);

    // Call to Action Button
    ctx.fillStyle = "#0284c7";
    drawRoundRect(wx + 20, wy + 142, 140, 24, 6);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px sans-serif";
    ctx.fillText("ENTER AGAMOS >>", wx + 32, wy + 158);

    // Bottom macOS Dock (Floating frosted shelf)
    const dockW = 260;
    const dockH = 28;
    const dockX = (w - dockW) / 2;
    const dockY = h - dockH - 6;

    ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
    drawRoundRect(dockX, dockY, dockW, dockH, 10);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.stroke();

    // Colorful Dock Icons
    const dockColors = ["#0284c7", "#ef4444", "#10b981", "#6366f1", "#1e293b", "#f43f5e", "#15803d", "#ea580c", "#38bdf8", "#64748b", "#334155"];
    dockColors.forEach((color, idx) => {
      const ix = dockX + 12 + idx * 22;
      ctx.fillStyle = color;
      drawRoundRect(ix, dockY + 4, 18, 18, 4);
      ctx.fill();
    });
  }

  // --- Mac Studio (Compact Aluminum Desktop Powerhouse) ---

  buildPcTower() {
    const pcGroup = new THREE.Group();
    pcGroup.name = "macStudio";

    const aluminumMat = new THREE.MeshStandardMaterial({
      color: 0xdde3ec,
      metalness: 0.85,
      roughness: 0.22
    });

    // Mac Studio Body (Precision-milled aluminum cube)
    const studioBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.13, 0.24),
      aluminumMat
    );
    studioBody.position.set(0.72, 1.065, 0.12);
    studioBody.castShadow = true;
    studioBody.receiveShadow = true;
    pcGroup.add(studioBody);

    // Top Apple Logo
    const topLogo = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 0.003, 24),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.1 })
    );
    topLogo.position.set(0.72, 1.132, 0.12);
    pcGroup.add(topLogo);

    // Front Dual Thunderbolt USB-C Ports
    [-0.03, 0.03].forEach(xOff => {
      const port = new THREE.Mesh(
        new THREE.BoxGeometry(0.015, 0.006, 0.005),
        new THREE.MeshBasicMaterial({ color: 0x0f172a })
      );
      port.position.set(0.72 + xOff, 1.04, 0.242);
      pcGroup.add(port);
    });

    // Status Power LED (Sleek Apple white dot)
    const powerLed = new THREE.Mesh(
      new THREE.SphereGeometry(0.004, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    powerLed.position.set(0.81, 1.04, 0.242);
    powerLed.name = "pcPowerButton";
    pcGroup.add(powerLed);

    this.scene.add(pcGroup);
    this.interactiveObjects.push(powerLed);
  }

  // --- Apple Magic Keyboard, Magic Mouse & Studio Speakers ---

  buildPeripherals() {
    const periGroup = new THREE.Group();

    const aluminumMat = new THREE.MeshStandardMaterial({
      color: 0xdde3ec,
      metalness: 0.85,
      roughness: 0.22
    });

    // 1. Apple Magic Keyboard (Ultra-slim aluminum wedge)
    const kbBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 0.014, 0.20),
      aluminumMat
    );
    kbBody.position.set(0, 1.008, 0.54);
    kbBody.rotation.x = 0.02;
    kbBody.castShadow = true;
    periGroup.add(kbBody);

    // Chiclet Keycaps Tray (Crisp White Apple Keys)
    const keysTray = new THREE.Mesh(
      new THREE.BoxGeometry(0.64, 0.008, 0.17),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 })
    );
    keysTray.position.set(0, 1.018, 0.54);
    keysTray.rotation.x = 0.02;
    periGroup.add(keysTray);

    // 2. Apple Magic Mouse (Glossy white continuous surface, wireless)
    const mouseBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.024, 0.14),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.08, metalness: 0.1 })
    );
    mouseBody.position.set(0.52, 1.012, 0.54);
    mouseBody.castShadow = true;
    mouseBody.name = "deskMouse";
    periGroup.add(mouseBody);

    // 3. Apple HomePod Mini Speakers (Space Gray Spheres)
    [-0.68, 0.68].forEach(x => {
      const homePod = new THREE.Mesh(
        new THREE.SphereGeometry(0.075, 24, 24),
        new THREE.MeshStandardMaterial({ color: 0x1e2430, roughness: 0.85 })
      );
      homePod.position.set(x, 1.075, 0.2);
      homePod.castShadow = true;
      periGroup.add(homePod);

      // Top Touch Surface
      const touchTop = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.004, 24),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.5 })
      );
      touchTop.position.set(x, 1.15, 0.2);
      periGroup.add(touchTop);
    });

    this.scene.add(periGroup);
    this.interactiveObjects.push(mouseBody);
  }

  // --- High-End Articulated Architect Desk Lamp ---

  buildDeskLamp() {
    const lampGroup = new THREE.Group();
    lampGroup.name = "deskLamp";

    // Premium PBR Materials
    const darkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x1c2128,
      roughness: 0.32,
      metalness: 0.85
    });
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xdfab35,
      roughness: 0.22,
      metalness: 0.95
    });
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.12,
      metalness: 0.98
    });
    const whiteEnamelMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.18,
      metalness: 0.05
    });

    // 1. Weighted Tiered Base (Heavy cast iron with chamfered edge)
    const baseBottom = new THREE.Mesh(
      new THREE.CylinderGeometry(0.165, 0.18, 0.024, 32),
      darkMetalMat
    );
    baseBottom.position.set(-1.15, 1.012, 0.15);
    baseBottom.castShadow = true;
    baseBottom.receiveShadow = true;
    baseBottom.name = "deskLamp";
    lampGroup.add(baseBottom);

    const baseTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.145, 0.02, 32),
      darkMetalMat
    );
    baseTop.position.set(-1.15, 1.032, 0.15);
    baseTop.castShadow = true;
    baseTop.name = "deskLamp";
    lampGroup.add(baseTop);

    // Brass Turret Collar / Swivel Mount
    const turret = new THREE.Mesh(
      new THREE.CylinderGeometry(0.038, 0.038, 0.036, 24),
      brassMat
    );
    turret.position.set(-1.15, 1.055, 0.15);
    turret.name = "deskLamp";
    lampGroup.add(turret);

    // Tactile Brass Toggle Switch
    const switchBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.016, 0.016, 0.008, 16),
      brassMat
    );
    switchBase.position.set(-1.08, 1.045, 0.18);
    switchBase.name = "deskLamp";
    lampGroup.add(switchBase);

    const switchLever = new THREE.Mesh(
      new THREE.CylinderGeometry(0.004, 0.006, 0.03, 12),
      brassMat
    );
    switchLever.position.set(-1.075, 1.06, 0.185);
    switchLever.rotation.z = -0.35;
    switchLever.name = "deskLamp";
    lampGroup.add(switchLever);

    // 2. Base Bracket Flanges (Brass twin brackets holding lower struts)
    [-0.022, 0.022].forEach(zOffset => {
      const bracket = new THREE.Mesh(
        new THREE.BoxGeometry(0.012, 0.06, 0.018),
        brassMat
      );
      bracket.position.set(-1.15, 1.085, 0.15 + zOffset);
      bracket.name = "deskLamp";
      lampGroup.add(bracket);
    });

    // 3. Lower Cantilever Twin Struts (Iconic dual parallel tubular rods)
    [-0.02, 0.02].forEach(zOffset => {
      const rod = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0065, 0.0065, 0.68, 12),
        darkMetalMat
      );
      rod.position.set(-1.11, 1.35, 0.15 + zOffset);
      rod.rotation.z = -0.32;
      rod.castShadow = true;
      rod.name = "deskLamp";
      lampGroup.add(rod);
    });

    // Lower Stabilizer Crossbars
    [1.18, 1.52].forEach(yPos => {
      const bar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.005, 0.005, 0.05, 8),
        brassMat
      );
      bar.rotation.x = Math.PI / 2;
      bar.position.set(-1.15 + (yPos - 1.08) * 0.11, yPos, 0.15);
      bar.name = "deskLamp";
      lampGroup.add(bar);
    });

    // Lower Chrome Counterbalance Tension Springs
    [-0.012, 0.012].forEach(zOffset => {
      const spring = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0075, 0.0075, 0.40, 16),
        chromeMat
      );
      spring.position.set(-1.13, 1.28, 0.15 + zOffset);
      spring.rotation.z = -0.22;
      spring.name = "deskLamp";
      lampGroup.add(spring);
    });

    // 4. Center Articulated Elbow Joint (Twin brass disc plates + adjustment knob)
    const elbowCenter = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.032, 0.06, 20),
      brassMat
    );
    elbowCenter.rotation.x = Math.PI / 2;
    elbowCenter.position.set(-1.0, 1.62, 0.15);
    elbowCenter.name = "deskLamp";
    lampGroup.add(elbowCenter);

    // Brass Wingnut / Adjustment thumbscrew on elbow
    const thumbKnob = new THREE.Mesh(
      new THREE.CylinderGeometry(0.016, 0.016, 0.02, 16),
      brassMat
    );
    thumbKnob.rotation.x = Math.PI / 2;
    thumbKnob.position.set(-1.0, 1.62, 0.19);
    thumbKnob.name = "deskLamp";
    lampGroup.add(thumbKnob);

    const thumbWing = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.012, 0.006),
      brassMat
    );
    thumbWing.position.set(-1.0, 1.62, 0.202);
    thumbWing.name = "deskLamp";
    lampGroup.add(thumbWing);

    // 5. Upper Cantilever Twin Struts (Dual parallel tubular rods angling forward)
    [-0.018, 0.018].forEach(zOffset => {
      const rod = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0065, 0.0065, 0.62, 12),
        darkMetalMat
      );
      rod.position.set(-0.86, 1.84, 0.18 + zOffset);
      rod.rotation.z = 0.52;
      rod.castShadow = true;
      rod.name = "deskLamp";
      lampGroup.add(rod);
    });

    // Upper Crossbar Braces
    [1.72, 1.94].forEach(yPos => {
      const bar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.005, 0.005, 0.045, 8),
        brassMat
      );
      bar.rotation.x = Math.PI / 2;
      bar.position.set(-1.0 + (yPos - 1.62) * 0.44, yPos, 0.18);
      bar.name = "deskLamp";
      lampGroup.add(bar);
    });

    // Upper Chrome Tension Springs
    const upperSpring = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0075, 0.0075, 0.36, 16),
      chromeMat
    );
    upperSpring.position.set(-0.91, 1.78, 0.18);
    upperSpring.rotation.z = 0.42;
    upperSpring.name = "deskLamp";
    lampGroup.add(upperSpring);

    // 6. Wrist Swivel Joint (Brass 2-axis coupler)
    const wrist = new THREE.Mesh(
      new THREE.SphereGeometry(0.026, 16, 16),
      brassMat
    );
    wrist.position.set(-0.73, 2.03, 0.20);
    wrist.name = "deskLamp";
    lampGroup.add(wrist);

    // 7. Architect Bell Shade (Flared dome with crown vent & white reflector)
    const shadeGroup = new THREE.Group();
    shadeGroup.position.set(-0.71, 2.02, 0.22);
    shadeGroup.rotation.z = 0.88;
    shadeGroup.rotation.x = 0.24;
    shadeGroup.name = "deskLamp";

    // Shade Crown Cap (Ventilated neck)
    const shadeCrown = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.065, 0.05, 24),
      darkMetalMat
    );
    shadeCrown.position.set(0, 0.11, 0);
    shadeCrown.castShadow = true;
    shadeCrown.name = "deskLamp";
    shadeGroup.add(shadeCrown);

    // Brass cooling ring on crown
    const ventRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.056, 0.006, 8, 24),
      brassMat
    );
    ventRing.rotation.x = Math.PI / 2;
    ventRing.position.set(0, 0.09, 0);
    ventRing.name = "deskLamp";
    shadeGroup.add(ventRing);

    // Main Flared Cone Shade (Dark gunmetal exterior)
    const shadeOuter = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.165, 0.20, 32, 1, true),
      darkMetalMat
    );
    shadeOuter.position.set(0, 0, 0);
    shadeOuter.castShadow = true;
    shadeOuter.name = "deskLamp";
    shadeGroup.add(shadeOuter);

    // White Enamel Interior Reflector
    const shadeInner = new THREE.Mesh(
      new THREE.CylinderGeometry(0.063, 0.163, 0.198, 32, 1, true),
      whiteEnamelMat
    );
    shadeInner.position.set(0, 0, 0);
    shadeInner.name = "deskLamp";
    shadeGroup.add(shadeInner);

    // Rolled Brass Rim at Shade Opening
    const shadeRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.165, 0.006, 12, 32),
      brassMat
    );
    shadeRim.rotation.x = Math.PI / 2;
    shadeRim.position.set(0, -0.10, 0);
    shadeRim.name = "deskLamp";
    shadeGroup.add(shadeRim);

    // Brass Bulb Socket Collar
    const socket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.026, 0.026, 0.03, 16),
      brassMat
    );
    socket.position.set(0, 0.05, 0);
    socket.name = "deskLamp";
    shadeGroup.add(socket);

    // Warm Glowing Frosted Light Bulb
    this.lampBulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.046, 20, 20),
      new THREE.MeshBasicMaterial({ color: 0xfffaed })
    );
    this.lampBulb.position.set(0, -0.01, 0);
    this.lampBulb.name = "deskLamp";
    shadeGroup.add(this.lampBulb);

    lampGroup.add(shadeGroup);
    this.scene.add(lampGroup);

    // Register all interactive meshes for raycast clicks
    this.interactiveObjects.push(
      baseBottom,
      baseTop,
      turret,
      switchBase,
      switchLever,
      elbowCenter,
      thumbKnob,
      thumbWing,
      wrist,
      shadeCrown,
      shadeOuter,
      shadeRim,
      this.lampBulb
    );
  }

  // --- Desk Props (Coffee Mug, Floppy Disks) ---

  buildDeskProps() {
    const propGroup = new THREE.Group();

    // 1. Ceramic Coffee Mug
    const mugGeo = new THREE.CylinderGeometry(0.055, 0.05, 0.11, 20);
    const mugMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.2,
      metalness: 0.1
    });
    const mug = new THREE.Mesh(mugGeo, mugMat);
    mug.position.set(-0.65, 1.055, 0.55);
    mug.castShadow = true;
    mug.name = "coffeeMug";
    propGroup.add(mug);

    // Mug handle
    const handleGeo = new THREE.TorusGeometry(0.035, 0.01, 8, 16, Math.PI);
    const handle = new THREE.Mesh(handleGeo, mugMat);
    handle.position.set(-0.71, 1.055, 0.55);
    handle.rotation.z = -Math.PI / 2;
    propGroup.add(handle);

    // 2. Stack of 3.5" Floppy Disks
    const diskColors = [0x2563eb, 0xdc2626, 0x16a34a];
    diskColors.forEach((col, idx) => {
      const disk = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.008, 0.14),
        new THREE.MeshStandardMaterial({ color: col, roughness: 0.7 })
      );
      disk.position.set(-0.95, 1.004 + idx * 0.009, 0.45);
      disk.rotation.y = 0.15 * idx - 0.1;
      disk.castShadow = true;
      disk.name = "floppyDisk";
      propGroup.add(disk);
      this.interactiveObjects.push(disk);
    });

    this.scene.add(propGroup);
    this.interactiveObjects.push(mug);
  }

  // --- User Interactions & Camera Transitions ---

  setLamp(isOn) {
    if (this.isLampOn === isOn) return this.isLampOn;
    this.isLampOn = isOn;
    if (this.lampLight) {
      this.lampLight.intensity = this.isLampOn ? 2.2 : 0;
    }
    if (this.lampBulb) {
      this.lampBulb.material.color.setHex(this.isLampOn ? 0xfff4d6 : 0x444444);
    }
    if (window.audioEngine) {
      window.audioEngine.playLampClick();
    }
    const hudLamp = document.getElementById("hud-btn-lamp");
    if (hudLamp) {
      hudLamp.classList.toggle("active", this.isLampOn);
      hudLamp.innerHTML = this.isLampOn ? "<span>💡 Lamp: ON</span>" : "<span>💡 Lamp: OFF</span>";
    }
    return this.isLampOn;
  }

  toggleLamp() {
    return this.setLamp(!this.isLampOn);
  }

  setCameraView(mode) {
    this.cameraMode = mode;
    if (mode === "monitor") {
      this.isStickyNoteHovered = false;
      this.showInspectOverlay(false);
      // Zoom directly into CRT monitor screen
      if (this.targetPos && this.targetLookAt) {
        this.targetPos.set(0, 1.54, 1.25);
        this.targetLookAt.set(0, 1.54, 0.33);
      }
    } else {
      // Overview Desk Mode
      if (this.targetPos && this.targetLookAt) {
        this.targetPos.set(0, 1.8, 3.8);
        this.targetLookAt.set(0, 1.35, 0);
      }
    }
  }

  showInspectOverlay(show) {
    if (!this.inspectOverlayEl) {
      this.inspectOverlayEl = document.getElementById("sticky-inspect-overlay");
    }
    if (this.inspectOverlayEl) {
      this.inspectOverlayEl.classList.toggle("active", show);
    }
  }

  onMouseMove(e) {
    if (!this.mouse || !this.camera || !this.raycaster) return;
    // Normalized coordinates for raycasting
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    // Smooth parallax in desk view (subtly reduced when inspecting note for reading comfort)
    if (this.cameraMode === "desk") {
      const parallaxFactor = this.isStickyNoteHovered ? 0.15 : 0.4;
      this.mouseTarget.x = (e.clientX / window.innerWidth - 0.5) * parallaxFactor;
      this.mouseTarget.y = (e.clientY / window.innerHeight - 0.5) * (parallaxFactor * 0.65);
    }

    // Raycast hover check
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);

    let isNoteHit = false;
    if (this.cameraMode === "desk" && intersects.length > 0) {
      let hit = intersects[0].object;
      while (hit && !hit.name && hit.parent) {
        hit = hit.parent;
      }
      if (hit && hit.name === "stickyNote") {
        isNoteHit = true;
      }
    }

    // Resident Evil Style Sticky Note Zoom Inspection Trigger
    if (isNoteHit) {
      if (!this.isStickyNoteHovered) {
        this.isStickyNoteHovered = true;
        if (window.audioEngine) window.audioEngine.playPaperInspect();
        this.showInspectOverlay(true);
      }
    } else {
      if (this.isStickyNoteHovered) {
        this.isStickyNoteHovered = false;
        if (window.audioEngine) window.audioEngine.playPaperPutDown();
        this.showInspectOverlay(false);
      }
    }

    if (intersects.length > 0) {
      document.body.style.cursor = "pointer";
      this.hoveredObject = intersects[0].object;
    } else {
      document.body.style.cursor = "default";
      this.hoveredObject = null;
    }
  }

  onSceneClick(e) {
    if (!this.mouse || !this.camera || !this.raycaster) return;
    if (e.target.closest(".hud-btn") || e.target.closest(".window") || e.target.closest(".taskbar")) {
      return;
    }

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);

    if (intersects.length > 0) {
      let hit = intersects[0].object;
      while (hit && !hit.name && hit.parent) {
        hit = hit.parent;
      }
      const name = hit ? hit.name : "";

      if (name === "crtScreen" || name === "crtMonitor" || name === "stickyNote") {
        this.setLamp(true); // Clicking onto the computer desktop turns lamp on
        if (this.cameraMode === "desk") {
          this.isStickyNoteHovered = false;
          this.showInspectOverlay(false);
          window.dispatchEvent(new CustomEvent("enterAgamOS"));
        }
      } else if (name === "deskLamp" || name === "lampSwitch" || name === "lampShade" || name === "lampBulb") {
        this.setLamp(false); // Click at the lamp to close/turn it off
      } else if (name === "deskSurface" || name === "deskTop") {
        this.setLamp(true); // Click onto the desktop to turn it on
      } else if (name === "coffeeMug") {
        if (window.audioEngine) window.audioEngine.playBeep(520, 0.08);
      } else if (name === "floppyDisk") {
        if (window.audioEngine) window.audioEngine.playBeep(320, 0.1);
      } else if (name === "pcPowerButton" || name === "monitorPowerButton") {
        window.dispatchEvent(new CustomEvent("rebootAgamOS"));
      }
    }
  }

  onWindowResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // --- Main Animation Loop ---

  animate() {
    requestAnimationFrame(() => this.animate());
    if (!this.clock || !this.renderer || !this.scene || !this.camera || !this.targetPos) return;

    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();

    // 1. Blinking HDD LED on PC tower
    if (this.hddLed) {
      const isBlinking = Math.sin(elapsed * 12) > 0.4 && Math.random() > 0.3;
      this.hddLed.material.color.setHex(isBlinking ? 0xf59e0b : 0x221500);
    }

    // 2. Refresh Screen Texture canvas
    if (elapsed % 0.5 < 0.03 && this.screenTexture) {
      this.renderScreenFrame(elapsed);
      this.screenTexture.needsUpdate = true;
    }

    // 3. Resident Evil Style Sticky Note Zoom & Inspection Animation
    if (this.stickyNote && this.stickyBasePos && this.stickyInspectPos) {
      const targetProgress = (this.isStickyNoteHovered && this.cameraMode === "desk") ? 1.0 : 0.0;
      this.noteZoomProgress += (targetProgress - this.noteZoomProgress) * 0.12;

      const p = this.noteZoomProgress;
      // Smooth cubic ease-out
      const easeP = 1 - Math.pow(1 - p, 3);

      // Interpolate position from monitor bezel towards player's view
      this.stickyNote.position.lerpVectors(this.stickyBasePos, this.stickyInspectPos, easeP);

      // Subtle atmospheric floating/breathing sway when inspected
      if (p > 0.01) {
        const floatY = Math.sin(elapsed * 2.4) * 0.007 * easeP;
        const floatRotZ = Math.cos(elapsed * 1.8) * 0.004 * easeP;
        this.stickyNote.position.y += floatY;

        this.stickyNote.rotation.x = THREE.MathUtils.lerp(this.stickyBaseRot.x, this.stickyInspectRot.x, easeP);
        this.stickyNote.rotation.y = THREE.MathUtils.lerp(this.stickyBaseRot.y, this.stickyInspectRot.y, easeP);
        this.stickyNote.rotation.z = THREE.MathUtils.lerp(this.stickyBaseRot.z, this.stickyInspectRot.z + floatRotZ, easeP);
      } else {
        this.stickyNote.rotation.set(this.stickyBaseRot.x, this.stickyBaseRot.y, this.stickyBaseRot.z);
      }

      // Interpolate scale (magnify by 2.85x for full legible examination)
      this.stickyNote.scale.lerpVectors(this.stickyBaseScale, this.stickyInspectScale, easeP);

      // Note shadow fades and expands as note lifts off the monitor
      if (this.noteShadow) {
        this.noteShadow.material.opacity = 0.35 * (1 - easeP * 0.85);
        const shadowScale = 1.0 + easeP * 0.4;
        this.noteShadow.scale.set(shadowScale, shadowScale, 1.0);
      }
    }

    // 4. Smooth Camera Transitions & Parallax
    this.mouseCurrent.x += (this.mouseTarget.x - this.mouseCurrent.x) * 0.05;
    this.mouseCurrent.y += (this.mouseTarget.y - this.mouseCurrent.y) * 0.05;

    const currentX = this.targetPos.x + (this.cameraMode === "desk" ? this.mouseCurrent.x : 0);
    const currentY = this.targetPos.y - (this.cameraMode === "desk" ? this.mouseCurrent.y : 0);

    this.camera.position.x += (currentX - this.camera.position.x) * 0.07;
    this.camera.position.y += (currentY - this.camera.position.y) * 0.07;
    this.camera.position.z += (this.targetPos.z - this.camera.position.z) * 0.07;

    this.currentLookAt.x += (this.targetLookAt.x - this.currentLookAt.x) * 0.07;
    this.currentLookAt.y += (this.targetLookAt.y - this.currentLookAt.y) * 0.07;
    this.currentLookAt.z += (this.targetLookAt.z - this.currentLookAt.z) * 0.07;

    this.camera.lookAt(this.currentLookAt);

    // 5. Render Scene
    this.renderer.render(this.scene, this.camera);
  }
}

window.RetroScene = RetroScene;


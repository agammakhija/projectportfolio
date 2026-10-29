/**
 * 3D Scene Controller for Agam's Retro Room & CRT Workstation
 * Built with Three.js - Procedural 3D models with zero external asset dependencies!
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
    this.scene.background = new THREE.Color(0x0a0c14);
    this.scene.fog = new THREE.FogExp2(0x0a0c14, 0.08);

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
    // 1. Soft Ambient Light
    this.ambientLight = new THREE.AmbientLight(0x404860, 0.7);
    this.scene.add(this.ambientLight);

    // 2. Room Window Moonlight / Key Light
    this.dirLight = new THREE.DirectionalLight(0x7090b0, 0.45);
    this.dirLight.position.set(-5, 6, 4);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 15;
    this.dirLight.shadow.bias = -0.0005;
    this.scene.add(this.dirLight);

    // 3. Desk Lamp Spotlight (Warm vintage beam)
    this.lampLight = new THREE.SpotLight(0xffecc4, 2.2, 5.5, Math.PI / 4, 0.4, 1.2);
    this.lampLight.position.set(-1.1, 2.05, 0.25);
    this.lampLight.target.position.set(-0.2, 0.8, 0.4);
    this.lampLight.castShadow = true;
    this.lampLight.shadow.mapSize.width = 1024;
    this.lampLight.shadow.mapSize.height = 1024;
    this.lampLight.shadow.bias = -0.001;
    this.scene.add(this.lampLight);
    this.scene.add(this.lampLight.target);

    // 4. CRT Screen Glow (Dynamic point light)
    this.screenLight = new THREE.PointLight(0x5eead4, 0.6, 2.0, 1.5);
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
    this.scene.add(deskTop);

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

  // --- CRT Monitor (Beige 90s Tube Monitor) ---

  buildCrtMonitor() {
    const monitorGroup = new THREE.Group();
    monitorGroup.name = "crtMonitor";

    // Beige plastic material
    const beigeMat = new THREE.MeshStandardMaterial({
      color: 0xd8ceb8,
      roughness: 0.55,
      metalness: 0.05
    });
    const darkGrayMat = new THREE.MeshStandardMaterial({
      color: 0x282828,
      roughness: 0.8
    });

    // 1. Monitor Base / Swivel Stand
    const baseStand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.28, 0.05, 24),
      beigeMat
    );
    baseStand.position.set(0, 1.025, 0.05);
    baseStand.castShadow = true;
    baseStand.receiveShadow = true;
    monitorGroup.add(baseStand);

    const standNeck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16),
      darkGrayMat
    );
    standNeck.position.set(0, 1.1, 0.05);
    monitorGroup.add(standNeck);

    // 2. Main CRT Housing (Tapered trapezoidal box)
    const housingFront = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 0.88, 0.45),
      beigeMat
    );
    housingFront.position.set(0, 1.52, 0.08);
    housingFront.castShadow = true;
    housingFront.receiveShadow = true;
    monitorGroup.add(housingFront);

    // Back Cathode Ray Tube bulge (funnel shape)
    const backHousing = new THREE.Mesh(
      new THREE.ConeGeometry(0.52, 0.5, 4),
      beigeMat
    );
    backHousing.rotation.x = -Math.PI / 2;
    backHousing.rotation.y = Math.PI / 4;
    backHousing.position.set(0, 1.52, -0.35);
    backHousing.castShadow = true;
    monitorGroup.add(backHousing);

    // Vent louvers on the back/top
    const ventGeo = new THREE.BoxGeometry(0.7, 0.02, 0.25);
    const ventMat = new THREE.MeshStandardMaterial({ color: 0x8a7f6c, roughness: 0.9 });
    const vents = new THREE.Mesh(ventGeo, ventMat);
    vents.position.set(0, 1.97, 0.0);
    monitorGroup.add(vents);

    // 3. Screen Bezel Recess
    const bezelRecess = new THREE.Mesh(
      new THREE.BoxGeometry(0.96, 0.72, 0.04),
      darkGrayMat
    );
    bezelRecess.position.set(0, 1.54, 0.31);
    monitorGroup.add(bezelRecess);

    // 4. CRT Curved Glass Screen with Dynamic Canvas Texture
    this.createCrtScreenTexture();
    const screenGeo = new THREE.PlaneGeometry(0.92, 0.68);
    const screenMat = new THREE.MeshBasicMaterial({
      map: this.screenTexture,
      toneMapped: false
    });
    this.crtScreenMesh = new THREE.Mesh(screenGeo, screenMat);
    this.crtScreenMesh.position.set(0, 1.54, 0.335);
    this.crtScreenMesh.name = "crtScreen";
    monitorGroup.add(this.crtScreenMesh);

    // 5. Monitor Control Panel (Bottom Bezel)
    // Brand Badge "AGAM 98"
    const badgeGeo = new THREE.BoxGeometry(0.12, 0.03, 0.01);
    const badgeMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.5 });
    const badge = new THREE.Mesh(badgeGeo, badgeMat);
    badge.position.set(-0.35, 1.13, 0.315);
    monitorGroup.add(badge);

    // Power Button
    const powerBtnGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.015, 16);
    powerBtnGeo.rotateX(Math.PI / 2);
    const powerBtnMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.5 });
    const powerBtn = new THREE.Mesh(powerBtnGeo, powerBtnMat);
    powerBtn.position.set(0.42, 1.13, 0.315);
    powerBtn.name = "monitorPowerButton";
    monitorGroup.add(powerBtn);

    // Glowing Power LED
    const ledGeo = new THREE.SphereGeometry(0.008, 12, 12);
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    const powerLed = new THREE.Mesh(ledGeo, ledMat);
    powerLed.position.set(0.38, 1.13, 0.315);
    monitorGroup.add(powerLed);

    // Interactive high-res sticky note on the monitor bezel
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

    // Top glue strip shadow
    nctx.fillStyle = "rgba(234, 179, 8, 0.4)";
    nctx.fillRect(0, 0, 512, 45);

    // Pin badge at top
    nctx.fillStyle = "#ef4444";
    nctx.beginPath();
    nctx.arc(256, 25, 14, 0, Math.PI * 2);
    nctx.fill();
    nctx.fillStyle = "#ffffff";
    nctx.beginPath();
    nctx.arc(252, 21, 4, 0, Math.PI * 2);
    nctx.fill();

    // Handwritten note text
    nctx.fillStyle = "#0f172a";
    nctx.font = "bold 34px 'Comic Sans MS', 'Chalkboard SE', cursive, sans-serif";
    nctx.fillText("📌 QUICK NOTE:", 45, 95);

    nctx.font = "bold 26px 'Comic Sans MS', 'Chalkboard SE', cursive, sans-serif";
    nctx.fillStyle = "#1e293b";
    nctx.fillText("• Click screen to enter", 45, 160);
    nctx.fillText("  AgamOS 98 desktop!", 75, 200);

    nctx.fillStyle = "#0369a1";
    nctx.fillText("• Play Minecraft 3D! ⛏️", 45, 260);

    nctx.fillStyle = "#1e293b";
    nctx.fillText("• Drag & resize windows", 45, 320);
    nctx.fillText("• Winamp has 8-bit tracks", 45, 370);

    nctx.fillStyle = "#7c3aed";
    nctx.font = "bold 28px 'Comic Sans MS', 'Chalkboard SE', cursive, sans-serif";
    nctx.fillText("✨ Agam Makhija '98", 160, 455);

    const noteTex = new THREE.CanvasTexture(noteCanvas);
    noteTex.minFilter = THREE.LinearFilter;
    noteTex.magFilter = THREE.LinearFilter;

    const noteMat = new THREE.MeshStandardMaterial({
      map: noteTex,
      roughness: 0.8,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2
    });

    // Main sticky note
    const stickyNote = new THREE.Mesh(
      new THREE.PlaneGeometry(0.26, 0.24),
      noteMat
    );
    // Positioned prominently on top-left of monitor bezel, clearly in front of screen
    stickyNote.position.set(-0.44, 1.88, 0.348);
    stickyNote.rotation.z = -0.06;
    stickyNote.rotation.y = 0.03;
    stickyNote.name = "stickyNote";
    monitorGroup.add(stickyNote);

    // Subtle drop shadow behind sticky note for depth
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35
    });
    const noteShadow = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.24), shadowMat);
    noteShadow.position.set(-0.435, 1.875, 0.342);
    noteShadow.rotation.z = -0.06;
    monitorGroup.add(noteShadow);

    this.scene.add(monitorGroup);
    this.interactiveObjects.push(this.crtScreenMesh);
    this.interactiveObjects.push(powerBtn);
    this.interactiveObjects.push(stickyNote);
  }

  // --- Dynamic CRT Screen Texture Generator ---

  createCrtScreenTexture() {
    this.screenCanvas = document.createElement("canvas");
    this.screenCanvas.width = 512;
    this.screenCanvas.height = 384;
    this.screenCtx = this.screenCanvas.getContext("2d");

    this.renderScreenFrame(0);

    this.screenTexture = new THREE.CanvasTexture(this.screenCanvas);
    this.screenTexture.minFilter = THREE.LinearFilter;
    this.screenTexture.magFilter = THREE.LinearFilter;
  }

  renderScreenFrame(time) {
    const ctx = this.screenCtx;
    const w = 512;
    const h = 384;

    // Classic Windows 95/98 Teal Desktop
    ctx.fillStyle = "#008080";
    ctx.fillRect(0, 0, w, h);

    // Desktop Icons
    const icons = [
      { name: "About Me", x: 28, y: 30, color: "#38bdf8" },
      { name: "Projects", x: 28, y: 110, color: "#fbbf24" },
      { name: "Resume", x: 28, y: 190, color: "#f472b6" },
      { name: "Terminal", x: 28, y: 270, color: "#22c55e" }
    ];

    icons.forEach(ic => {
      // Icon square
      ctx.fillStyle = ic.color;
      ctx.fillRect(ic.x, ic.y, 34, 34);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.strokeRect(ic.x, ic.y, 34, 34);

      // Label
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText(ic.name, ic.x - 4, ic.y + 48);
    });

    // Open Window: "AgamOS v1.0"
    const wx = 120;
    const wy = 50;
    const ww = 350;
    const wh = 240;

    // Window shadow & body
    ctx.fillStyle = "#c0c0c0";
    ctx.fillRect(wx, wy, ww, wh);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(wx, wy, ww, wh);

    // Titlebar
    const titleGrad = ctx.createLinearGradient(wx, wy, wx + ww, wy);
    titleGrad.addColorStop(0, "#000080");
    titleGrad.addColorStop(1, "#1084d0");
    ctx.fillStyle = titleGrad;
    ctx.fillRect(wx + 3, wy + 3, ww - 6, 22);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText("👋 Welcome to Agam Makhija's Portfolio", wx + 10, wy + 18);

    // Inner document
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(wx + 10, wy + 32, ww - 20, wh - 42);

    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("Agam Makhija — Software Engineer", wx + 20, wy + 58);
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#475569";
    ctx.fillText("Full-Stack, Three.js 3D & Systems Architect", wx + 20, wy + 78);
    ctx.fillText("• Click screen to zoom in & enter AgamOS", wx + 20, wy + 110);
    ctx.fillText("• Launch full interactive apps & terminal", wx + 20, wy + 130);
    ctx.fillText("• Play retro games & listen to synthesized 8-bit tracks", wx + 20, wy + 150);

    // Button
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(wx + 20, wy + 175, 150, 30);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText("ENTER AGAMOS >>", wx + 32, wy + 195);

    // Taskbar at the bottom
    ctx.fillStyle = "#c0c0c0";
    ctx.fillRect(0, h - 28, w, 28);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.strokeRect(0, h - 28, w, 28);

    // Start Button
    ctx.fillStyle = "#d4d4d8";
    ctx.fillRect(4, h - 24, 60, 20);
    ctx.fillStyle = "#000000";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("▶ Start", 14, h - 10);

    // System Tray Clock
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    ctx.fillStyle = "#333333";
    ctx.fillText(timeStr, w - 55, h - 10);

    // CRT Scanlines
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, w, 2);
    }
  }

  // --- PC Tower (Beige Mid-Tower) ---

  buildPcTower() {
    const pcGroup = new THREE.Group();
    pcGroup.name = "pcTower";

    const beigeMat = new THREE.MeshStandardMaterial({
      color: 0xdfd6c3,
      roughness: 0.6,
      metalness: 0.05
    });
    const driveMat = new THREE.MeshStandardMaterial({
      color: 0xcec4b0,
      roughness: 0.7
    });

    // Tower Body
    const towerBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.82, 0.75),
      beigeMat
    );
    towerBody.position.set(1.15, 0.5, -0.05);
    towerBody.castShadow = true;
    towerBody.receiveShadow = true;
    pcGroup.add(towerBody);

    // CD-ROM Drive (5.25")
    const cdDrive = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 0.07, 0.02),
      driveMat
    );
    cdDrive.position.set(1.15, 0.78, 0.33);
    pcGroup.add(cdDrive);

    // 3.5" Floppy Drive
    const floppyDrive = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.045, 0.02),
      driveMat
    );
    floppyDrive.position.set(1.15, 0.68, 0.33);
    pcGroup.add(floppyDrive);

    // Floppy slot recess
    const slot = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.008, 0.025),
      new THREE.MeshBasicMaterial({ color: 0x111111 })
    );
    slot.position.set(1.15, 0.68, 0.335);
    pcGroup.add(slot);

    // Power & Reset Buttons
    const powerBtn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 0.02, 16),
      new THREE.MeshStandardMaterial({ color: 0x555555 })
    );
    powerBtn.rotateX(Math.PI / 2);
    powerBtn.position.set(1.04, 0.52, 0.33);
    powerBtn.name = "pcPowerButton";
    pcGroup.add(powerBtn);

    // Power LED (Green)
    const powerLed = new THREE.Mesh(
      new THREE.SphereGeometry(0.007, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x22c55e })
    );
    powerLed.position.set(1.04, 0.47, 0.33);
    pcGroup.add(powerLed);

    // HDD Activity LED (Amber / Blinks in animation loop)
    this.hddLed = new THREE.Mesh(
      new THREE.SphereGeometry(0.007, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b })
    );
    this.hddLed.position.set(1.07, 0.47, 0.33);
    pcGroup.add(this.hddLed);

    this.scene.add(pcGroup);
    this.interactiveObjects.push(powerBtn);
  }

  // --- Keyboard, Mouse & Peripherals ---

  buildPeripherals() {
    const periGroup = new THREE.Group();

    // 1. Mechanical Keyboard
    const kbBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.78, 0.035, 0.28),
      new THREE.MeshStandardMaterial({ color: 0xd6cdba, roughness: 0.6 })
    );
    kbBody.position.set(0, 1.018, 0.52);
    kbBody.rotation.x = 0.04;
    kbBody.castShadow = true;
    periGroup.add(kbBody);

    // Keycaps Tray
    const keysTray = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.02, 0.22),
      new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7 })
    );
    keysTray.position.set(0, 1.035, 0.52);
    keysTray.rotation.x = 0.04;
    periGroup.add(keysTray);

    // 2. Mousepad
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.005, 0.36),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 })
    );
    pad.position.set(0.62, 1.003, 0.52);
    pad.receiveShadow = true;
    periGroup.add(pad);

    // 3. Ergonomic Ball Mouse
    const mouseBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.04, 0.15),
      new THREE.MeshStandardMaterial({ color: 0xd6cdba, roughness: 0.6 })
    );
    mouseBody.position.set(0.62, 1.025, 0.52);
    mouseBody.castShadow = true;
    mouseBody.name = "deskMouse";
    periGroup.add(mouseBody);

    // Mouse cord (Curving tube)
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.62, 1.01, 0.44),
      new THREE.Vector3(0.68, 1.01, 0.2),
      new THREE.Vector3(0.95, 1.01, 0.0)
    ]);
    const cordGeo = new THREE.TubeGeometry(curve, 20, 0.003, 8, false);
    const cordMat = new THREE.MeshStandardMaterial({ color: 0x1e1e1e, roughness: 0.8 });
    const cord = new THREE.Mesh(cordGeo, cordMat);
    periGroup.add(cord);

    // 4. Desktop Stereo Speakers
    [-0.72, 0.72].forEach(x => {
      const spk = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.35, 0.18),
        new THREE.MeshStandardMaterial({ color: 0xdfd6c3, roughness: 0.6 })
      );
      spk.position.set(x, 1.18, 0.18);
      spk.rotation.y = x > 0 ? -0.2 : 0.2;
      spk.castShadow = true;
      periGroup.add(spk);

      // Speaker fabric grille
      const grille = new THREE.Mesh(
        new THREE.BoxGeometry(0.13, 0.28, 0.01),
        new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.95 })
      );
      grille.position.set(x, 1.18, 0.275);
      grille.rotation.y = x > 0 ? -0.2 : 0.2;
      periGroup.add(grille);
    });

    this.scene.add(periGroup);
    this.interactiveObjects.push(mouseBody);
  }

  // --- Architect Desk Lamp (Interactive Switch & SpotLight) ---

  buildDeskLamp() {
    const lampGroup = new THREE.Group();
    lampGroup.name = "deskLamp";

    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x1f242d,
      roughness: 0.35,
      metalness: 0.85
    });
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.3,
      metalness: 0.9
    });

    // Base
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.16, 0.04, 24),
      metalMat
    );
    base.position.set(-1.15, 1.02, 0.15);
    base.castShadow = true;
    lampGroup.add(base);

    // Switch on base
    const lampSwitch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.02, 12),
      brassMat
    );
    lampSwitch.position.set(-1.1, 1.045, 0.15);
    lampSwitch.name = "lampSwitch";
    lampGroup.add(lampSwitch);

    // Lower Arm
    const arm1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.65, 12),
      metalMat
    );
    arm1.position.set(-1.15, 1.34, 0.15);
    arm1.rotation.z = -0.35;
    arm1.castShadow = true;
    lampGroup.add(arm1);

    // Elbow Joint
    const elbow = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 16, 16),
      brassMat
    );
    elbow.position.set(-1.05, 1.62, 0.15);
    lampGroup.add(elbow);

    // Upper Arm
    const arm2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.58, 12),
      metalMat
    );
    arm2.position.set(-0.92, 1.84, 0.2);
    arm2.rotation.z = 0.55;
    arm2.castShadow = true;
    lampGroup.add(arm2);

    // Lamp Shade (Cone)
    const shade = new THREE.Mesh(
      new THREE.ConeGeometry(0.16, 0.22, 24, 1, true),
      metalMat
    );
    shade.position.set(-0.78, 2.02, 0.25);
    shade.rotation.z = 0.95;
    shade.rotation.x = 0.2;
    shade.castShadow = true;
    shade.name = "lampShade";
    lampGroup.add(shade);

    // Glowing Bulb inside shade
    this.lampBulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xfff4d6 })
    );
    this.lampBulb.position.set(-0.76, 2.0, 0.25);
    lampGroup.add(this.lampBulb);

    this.scene.add(lampGroup);
    this.interactiveObjects.push(lampSwitch);
    this.interactiveObjects.push(shade);
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

  toggleLamp() {
    this.isLampOn = !this.isLampOn;
    if (this.lampLight) {
      this.lampLight.intensity = this.isLampOn ? 2.2 : 0;
    }
    if (this.lampBulb) {
      this.lampBulb.material.color.setHex(this.isLampOn ? 0xfff4d6 : 0x444444);
    }
    if (window.audioEngine) {
      window.audioEngine.playLampClick();
    }
    return this.isLampOn;
  }

  setCameraView(mode) {
    this.cameraMode = mode;
    if (!this.targetPos || !this.targetLookAt) return;
    if (mode === "monitor") {
      // Zoom directly into CRT monitor screen
      this.targetPos.set(0, 1.54, 1.25);
      this.targetLookAt.set(0, 1.54, 0.33);
    } else {
      // Overview Desk Mode
      this.targetPos.set(0, 1.8, 3.8);
      this.targetLookAt.set(0, 1.35, 0);
    }
  }

  onMouseMove(e) {
    if (!this.mouse || !this.camera || !this.raycaster) return;
    // Normalized coordinates for raycasting
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    // Smooth parallax in desk view
    if (this.cameraMode === "desk") {
      this.mouseTarget.x = (e.clientX / window.innerWidth - 0.5) * 0.4;
      this.mouseTarget.y = (e.clientY / window.innerHeight - 0.5) * 0.25;
    }

    // Raycast hover check
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);

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
        if (this.cameraMode === "desk") {
          window.dispatchEvent(new CustomEvent("enterAgamOS"));
        }
      } else if (name === "lampSwitch" || name === "lampShade" || name === "deskLamp") {
        this.toggleLamp();
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

    // 3. Smooth Camera Transitions & Parallax
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

    // 4. Render
    this.renderer.render(this.scene, this.camera);
  }
}

window.RetroScene = RetroScene;


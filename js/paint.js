/**
 * MS Paint Clone for AgamOS
 */

class PaintApp {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.canvas = this.container.querySelector(".paint-canvas");
    this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
    this.colorPalette = this.container.querySelector(".paint-palette");
    this.toolBtns = this.container.querySelectorAll(".paint-tool-btn");
    this.sizeSelect = this.container.querySelector(".paint-brush-size");
    this.clearBtn = this.container.querySelector(".paint-btn-clear");
    this.saveBtn = this.container.querySelector(".paint-btn-save");

    this.currentColor = "#000000";
    this.currentTool = "brush"; // "brush", "pencil", "eraser"
    this.brushSize = 4;
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;

    this.colors = [
      "#000000", "#787c82", "#b81c1c", "#a85400", "#008800", "#008888", "#000088", "#880088",
      "#ffffff", "#c0c0c0", "#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff"
    ];

    this.init();
  }

  init() {
    if (!this.canvas || !this.ctx) return;

    // Set white background initially
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Build palette
    if (this.colorPalette) {
      this.colorPalette.innerHTML = "";
      this.colors.forEach(col => {
        const swatch = document.createElement("button");
        swatch.className = "paint-swatch";
        swatch.style.backgroundColor = col;
        if (col === this.currentColor) swatch.classList.add("selected");

        swatch.addEventListener("click", () => {
          this.currentColor = col;
          this.colorPalette.querySelectorAll(".paint-swatch").forEach(s => s.classList.remove("selected"));
          swatch.classList.add("selected");
          if (window.audioEngine) window.audioEngine.playClick();
        });

        this.colorPalette.appendChild(swatch);
      });
    }

    // Tool Buttons
    this.toolBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const tool = btn.dataset.tool;
        this.currentTool = tool;
        this.toolBtns.forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        if (window.audioEngine) window.audioEngine.playClick();
      });
    });

    // Brush Size
    if (this.sizeSelect) {
      this.sizeSelect.addEventListener("change", (e) => {
        this.brushSize = parseInt(e.target.value);
      });
    }

    // Clear Canvas
    if (this.clearBtn) {
      this.clearBtn.addEventListener("click", () => {
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        if (window.audioEngine) window.audioEngine.playWindowClose();
      });
    }

    // Save Canvas
    if (this.saveBtn) {
      this.saveBtn.addEventListener("click", () => {
        const link = document.createElement("a");
        link.download = "agam-paint-artwork.png";
        link.href = this.canvas.toDataURL("image/png");
        link.click();
        if (window.audioEngine) window.audioEngine.playClick();
      });
    }

    // Drawing Events
    this.canvas.addEventListener("mousedown", (e) => this.startDraw(e));
    this.canvas.addEventListener("mousemove", (e) => this.draw(e));
    this.canvas.addEventListener("mouseup", () => this.stopDraw());
    this.canvas.addEventListener("mouseleave", () => this.stopDraw());

    // Touch support
    this.canvas.addEventListener("touchstart", (e) => {
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent("mousedown", {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.canvas.dispatchEvent(mouseEvent);
      e.preventDefault();
    });
    this.canvas.addEventListener("touchmove", (e) => {
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent("mousemove", {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.canvas.dispatchEvent(mouseEvent);
      e.preventDefault();
    });
    this.canvas.addEventListener("touchend", () => {
      const mouseEvent = new MouseEvent("mouseup", {});
      this.canvas.dispatchEvent(mouseEvent);
    });
  }

  getCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  startDraw(e) {
    this.isDrawing = true;
    const { x, y } = this.getCoords(e);
    this.lastX = x;
    this.lastY = y;
    this.draw(e);
  }

  draw(e) {
    if (!this.isDrawing) return;
    const { x, y } = this.getCoords(e);

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);

    if (this.currentTool === "eraser") {
      this.ctx.strokeStyle = "#ffffff";
      this.ctx.lineWidth = this.brushSize * 3;
    } else if (this.currentTool === "pencil") {
      this.ctx.strokeStyle = this.currentColor;
      this.ctx.lineWidth = 1;
    } else {
      this.ctx.strokeStyle = this.currentColor;
      this.ctx.lineWidth = this.brushSize;
    }

    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.ctx.stroke();

    this.lastX = x;
    this.lastY = y;
  }

  stopDraw() {
    this.isDrawing = false;
  }
}

window.PaintApp = PaintApp;


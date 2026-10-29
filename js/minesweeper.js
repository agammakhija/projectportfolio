/**
 * Authentic Windows 95/98 Minesweeper Game
 */

class MinesweeperApp {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.gridEl = this.container.querySelector(".mine-grid");
    this.faceBtn = this.container.querySelector(".mine-face-btn");
    this.flagCountEl = this.container.querySelector(".mine-counter-mines");
    this.timerEl = this.container.querySelector(".mine-counter-timer");

    this.rows = 9;
    this.cols = 9;
    this.totalMines = 10;

    this.grid = [];
    this.isGameOver = false;
    this.isGameStarted = false;
    this.flagCount = this.totalMines;
    this.seconds = 0;
    this.timer = null;

    this.init();
  }

  init() {
    if (this.faceBtn) {
      this.faceBtn.addEventListener("click", () => this.resetGame());
    }
    this.resetGame();
  }

  resetGame() {
    this.isGameOver = false;
    this.isGameStarted = false;
    this.flagCount = this.totalMines;
    this.seconds = 0;
    this.stopTimer();

    if (this.faceBtn) this.faceBtn.textContent = "🙂";
    if (this.flagCountEl) this.flagCountEl.textContent = this.formatNum(this.flagCount);
    if (this.timerEl) this.timerEl.textContent = "000";

    this.createGrid();
  }

  formatNum(n) {
    return Math.max(0, Math.min(999, n)).toString().padStart(3, "0");
  }

  startTimer() {
    this.stopTimer();
    this.timer = setInterval(() => {
      this.seconds++;
      if (this.timerEl) this.timerEl.textContent = this.formatNum(this.seconds);
      if (this.seconds >= 999) this.stopTimer();
    }, 1000);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  createGrid() {
    if (!this.gridEl) return;
    this.gridEl.innerHTML = "";
    this.grid = [];

    for (let r = 0; r < this.rows; r++) {
      this.grid[r] = [];
      for (let c = 0; c < this.cols; c++) {
        const cell = {
          row: r,
          col: c,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          adjacentCount: 0,
          el: null
        };

        const btn = document.createElement("button");
        btn.className = "mine-cell";
        btn.dataset.row = r;
        btn.dataset.col = c;

        btn.addEventListener("mousedown", (e) => {
          if (this.isGameOver) return;
          if (e.button === 0 && this.faceBtn) this.faceBtn.textContent = "😮";
        });

        btn.addEventListener("mouseup", () => {
          if (!this.isGameOver && this.faceBtn) this.faceBtn.textContent = "🙂";
        });

        btn.addEventListener("click", () => this.handleCellClick(r, c));
        btn.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          this.handleRightClick(r, c);
        });

        cell.el = btn;
        this.grid[r][c] = cell;
        this.gridEl.appendChild(btn);
      }
    }
  }

  plantMines(firstR, firstC) {
    let planted = 0;
    while (planted < this.totalMines) {
      const r = Math.floor(Math.random() * this.rows);
      const c = Math.floor(Math.random() * this.cols);

      // Safe first click and surrounding
      if ((Math.abs(r - firstR) <= 1 && Math.abs(c - firstC) <= 1) || this.grid[r][c].isMine) {
        continue;
      }

      this.grid[r][c].isMine = true;
      planted++;
    }

    // Calculate adjacents
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (!this.grid[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols && this.grid[nr][nc].isMine) {
                count++;
              }
            }
          }
          this.grid[r][c].adjacentCount = count;
        }
      }
    }
  }

  handleCellClick(r, c) {
    if (this.isGameOver) return;
    const cell = this.grid[r][c];
    if (cell.isRevealed || cell.isFlagged) return;

    if (!this.isGameStarted) {
      this.isGameStarted = true;
      this.plantMines(r, c);
      this.startTimer();
    }

    if (window.audioEngine) window.audioEngine.playClick();

    if (cell.isMine) {
      this.gameOver(false);
      cell.el.classList.add("mine-hit");
      return;
    }

    this.revealCell(r, c);
    this.checkWinCondition();
  }

  revealCell(r, c) {
    const cell = this.grid[r][c];
    if (cell.isRevealed || cell.isFlagged) return;

    cell.isRevealed = true;
    cell.el.classList.add("revealed");

    if (cell.adjacentCount > 0) {
      cell.el.textContent = cell.adjacentCount;
      cell.el.dataset.count = cell.adjacentCount;
    } else {
      // Empty cascade
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
            this.revealCell(nr, nc);
          }
        }
      }
    }
  }

  handleRightClick(r, c) {
    if (this.isGameOver) return;
    const cell = this.grid[r][c];
    if (cell.isRevealed) return;

    cell.isFlagged = !cell.isFlagged;
    cell.el.classList.toggle("flagged", cell.isFlagged);
    cell.el.textContent = cell.isFlagged ? "🚩" : "";

    this.flagCount += cell.isFlagged ? -1 : 1;
    if (this.flagCountEl) this.flagCountEl.textContent = this.formatNum(this.flagCount);

    if (window.audioEngine) window.audioEngine.playClick();
  }

  checkWinCondition() {
    let unrevealedSafe = 0;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (!this.grid[r][c].isMine && !this.grid[r][c].isRevealed) {
          unrevealedSafe++;
        }
      }
    }

    if (unrevealedSafe === 0) {
      this.gameOver(true);
    }
  }

  gameOver(isWin) {
    this.isGameOver = true;
    this.stopTimer();

    if (isWin) {
      if (this.faceBtn) this.faceBtn.textContent = "😎";
      if (window.audioEngine) window.audioEngine.playStartupChime();
    } else {
      if (this.faceBtn) this.faceBtn.textContent = "😵";
      if (window.audioEngine) window.audioEngine.playBeep(180, 0.4);

      // Reveal all mines
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const cl = this.grid[r][c];
          if (cl.isMine) {
            cl.el.classList.add("revealed");
            cl.el.textContent = "💣";
          }
        }
      }
    }
  }
}

window.MinesweeperApp = MinesweeperApp;


/**
 * Tetris Neo - Game Engine
 * Features: SRS Rotation with Wall Kicks, 7-Bag Randomizer, Ghost Piece, Hold System,
 * Lock Delay, Smooth DAS/ARR Movement, Particle Effects, Screen Shake, Local High Scores.
 */

const COLS = 10;
const ROWS = 20;
const BUFFER_ROWS = 2; // Extra hidden rows at top for piece spawn / rotation
const TOTAL_ROWS = ROWS + BUFFER_ROWS;
const BLOCK_SIZE = 30; // Canvas base scale

// Colors for each tetromino (Neon palette)
const TETROMINO_COLORS = {
  I: { main: '#00f0ff', light: '#80f8ff', dark: '#0099aa', shadow: 'rgba(0, 240, 255, 0.4)' },
  J: { main: '#0066ff', light: '#66a3ff', dark: '#003d99', shadow: 'rgba(0, 102, 255, 0.4)' },
  L: { main: '#ff7700', light: '#ffa347', dark: '#b35300', shadow: 'rgba(255, 119, 0, 0.4)' },
  O: { main: '#ffe600', light: '#fff066', dark: '#b3a100', shadow: 'rgba(255, 230, 0, 0.4)' },
  S: { main: '#00ff66', light: '#66ff9f', dark: '#00b347', shadow: 'rgba(0, 255, 102, 0.4)' },
  T: { main: '#9900ff', light: '#c466ff', dark: '#6600b3', shadow: 'rgba(153, 0, 255, 0.4)' },
  Z: { main: '#ff3366', light: '#ff7a9e', dark: '#b31e40', shadow: 'rgba(255, 51, 102, 0.4)' }
};

// Tetromino matrices (0: Spawn state)
const TETROMINO_SHAPES = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0]
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0]
  ],
  O: [
    [1, 1],
    [1, 1]
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0]
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0]
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0]
  ]
};

// SRS Wall Kick Offsets [dx, dy] where dy is inverted for canvas (downwards is +)
const WALL_KICKS_NORMAL = {
  '0->1': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '1->0': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '1->2': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '2->1': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '2->3': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '3->2': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '3->0': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '0->3': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]]
};

const WALL_KICKS_I = {
  '0->1': [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
  '1->0': [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
  '1->2': [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
  '2->1': [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
  '2->3': [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
  '3->2': [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
  '3->0': [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
  '0->3': [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]]
};

class TetrisGame {
  constructor() {
    this.canvas = document.getElementById('tetris-canvas');
    this.ctx = this.canvas.getContext('2d');

    this.holdCanvas = document.getElementById('hold-canvas');
    this.holdCtx = this.holdCanvas.getContext('2d');

    this.nextCanvas = document.getElementById('next-canvas');
    this.nextCtx = this.nextCanvas.getContext('2d');

    this.boardFrame = document.getElementById('board-frame');

    // UI elements
    this.scoreEl = document.getElementById('score-display');
    this.highScoreEl = document.getElementById('high-score-display');
    this.levelEl = document.getElementById('level-display');
    this.linesEl = document.getElementById('lines-display');

    this.startOverlay = document.getElementById('start-overlay');
    this.pauseOverlay = document.getElementById('pause-overlay');
    this.gameoverOverlay = document.getElementById('gameover-overlay');
    this.finalScoreEl = document.getElementById('final-score');
    this.finalLevelEl = document.getElementById('final-level');
    this.finalLinesEl = document.getElementById('final-lines');
    this.newHighBadge = document.getElementById('new-high-badge');

    // Sound buttons
    this.btnMusic = document.getElementById('btn-music');
    this.btnSound = document.getElementById('btn-sound');
    this.btnPause = document.getElementById('btn-pause');
    this.soundOnIcon = this.btnSound.querySelector('.sound-on-icon');
    this.soundOffIcon = this.btnSound.querySelector('.sound-off-icon');
    this.pauseIcon = this.btnPause.querySelector('.pause-icon');
    this.playIcon = this.btnPause.querySelector('.play-icon');

    // Action buttons
    document.getElementById('btn-start').addEventListener('click', () => this.startGame());
    document.getElementById('btn-resume').addEventListener('click', () => this.togglePause());
    document.getElementById('btn-restart-pause').addEventListener('click', () => {
      this.togglePause();
      this.startGame();
    });
    document.getElementById('btn-play-again').addEventListener('click', () => this.startGame());

    this.btnMusic.addEventListener('click', () => this.toggleMusic());
    this.btnSound.addEventListener('click', () => this.toggleSound());
    this.btnPause.addEventListener('click', () => this.togglePause());

    // Game state
    this.grid = [];
    this.currentPiece = null;
    this.ghostPieceY = 0;
    this.holdPieceType = null;
    this.canHold = true;
    this.bag = [];
    this.nextQueue = [];

    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('tetris_high_score') || '0', 10);
    this.highScoreEl.textContent = this.highScore.toLocaleString();
    this.level = 1;
    this.lines = 0;
    this.combo = -1;
    this.isBackToBack = false;

    this.isPlaying = false;
    this.isPaused = false;
    this.isGameOver = false;

    // Timing & Gravity
    this.lastFrameTime = 0;
    this.dropCounter = 0;
    this.lockDelay = 500; // ms to lock once landed
    this.lockTimer = null;
    this.lockResets = 0;
    this.maxLockResets = 15;

    // Visuals
    this.particles = [];
    this.floatingTexts = [];
    this.clearingLines = [];
    this.clearAnimationTimer = 0;
    this.shakeIntensity = 0;

    // Input Handling (DAS / ARR)
    this.keys = {};
    this.dasTimer = null;
    this.arrTimer = null;
    this.arrDownTimer = null;
    this.dasDelay = 150; // ms before auto-repeat
    this.arrSpeed = 38;  // ms between repeat steps

    this.initGrid();
    this.initInputs();
    this.initTouchControls();
    this.render();
  }

  initGrid() {
    this.grid = Array.from({ length: TOTAL_ROWS }, () => Array(COLS).fill(null));
  }

  /* 7-Bag Randomizer */
  fillBag() {
    const pieces = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    // Fisher-Yates shuffle
    for (let i = pieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
    }
    this.bag.push(...pieces);
  }

  getNextPieceType() {
    if (this.bag.length < 7) {
      this.fillBag();
    }
    return this.bag.shift();
  }

  initQueue() {
    this.bag = [];
    this.fillBag();
    this.fillBag();
    this.nextQueue = [];
    for (let i = 0; i < 4; i++) {
      this.nextQueue.push(this.getNextPieceType());
    }
  }

  /* Start / Reset Game */
  startGame() {
    window.soundEngine.init();
    window.soundEngine.resume();

    this.initGrid();
    this.initQueue();

    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.combo = -1;
    this.isBackToBack = false;
    this.holdPieceType = null;
    this.canHold = true;
    this.particles = [];
    this.floatingTexts = [];
    this.clearingLines = [];

    // Clear active movement keys and timers
    clearTimeout(this.dasTimer);
    clearInterval(this.arrTimer);
    clearInterval(this.arrDownTimer);
    this.keys = {};

    this.updateStatsUI();
    this.startOverlay.classList.add('hidden');
    this.gameoverOverlay.classList.add('hidden');
    this.pauseOverlay.classList.add('hidden');

    this.isPlaying = true;
    this.isPaused = false;
    this.isGameOver = false;

    this.spawnPiece();
    this.lastFrameTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  getGravity() {
    // Official Tetris formula or smooth exponential curve (ms per cell)
    return Math.max(70, Math.pow(0.8 - ((this.level - 1) * 0.007), this.level - 1) * 1000);
  }

  spawnPiece() {
    const type = this.nextQueue.shift();
    this.nextQueue.push(this.getNextPieceType());

    const shape = TETROMINO_SHAPES[type].map(row => [...row]);
    const width = shape[0].length;
    const x = Math.floor((COLS - width) / 2);
    const y = BUFFER_ROWS - 1;

    this.currentPiece = {
      type,
      shape,
      rotation: 0,
      x,
      y
    };

    this.canHold = true;
    this.resetLockState();
    this.updateGhostPiece();

    // Check immediate game over (spawn collision)
    if (this.checkCollision(this.currentPiece.x, this.currentPiece.y, this.currentPiece.shape)) {
      this.gameOver();
    }

    this.drawHold();
    this.drawNext();
  }

  resetLockState() {
    this.lockTimer = null;
    this.lockResets = 0;
  }

  checkCollision(x, y, shape) {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const newX = x + c;
          const newY = y + r;

          // Out of horizontal bounds
          if (newX < 0 || newX >= COLS) return true;
          // Out of bottom bounds
          if (newY >= TOTAL_ROWS) return true;
          // Colliding with stacked blocks
          if (newY >= 0 && this.grid[newY][newX]) return true;
        }
      }
    }
    return false;
  }

  updateGhostPiece() {
    if (!this.currentPiece) return;
    let ghostY = this.currentPiece.y;
    while (!this.checkCollision(this.currentPiece.x, ghostY + 1, this.currentPiece.shape)) {
      ghostY++;
    }
    this.ghostPieceY = ghostY;
  }

  /* Movement & Rotation */
  moveLeft() {
    if (!this.isPlaying || this.isPaused || !this.currentPiece) return false;
    if (!this.checkCollision(this.currentPiece.x - 1, this.currentPiece.y, this.currentPiece.shape)) {
      this.currentPiece.x--;
      this.handleLockDelayExtension();
      this.updateGhostPiece();
      window.soundEngine.playMove();
      return true;
    }
    return false;
  }

  moveRight() {
    if (!this.isPlaying || this.isPaused || !this.currentPiece) return false;
    if (!this.checkCollision(this.currentPiece.x + 1, this.currentPiece.y, this.currentPiece.shape)) {
      this.currentPiece.x++;
      this.handleLockDelayExtension();
      this.updateGhostPiece();
      window.soundEngine.playMove();
      return true;
    }
    return false;
  }

  softDrop() {
    if (!this.isPlaying || this.isPaused || !this.currentPiece) return false;
    if (!this.checkCollision(this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.shape)) {
      this.currentPiece.y++;
      this.score += 1;
      this.updateStatsUI();
      window.soundEngine.playDrop();
      return true;
    }
    return false;
  }

  hardDrop() {
    if (!this.isPlaying || this.isPaused || !this.currentPiece) return;
    let cellsDropped = 0;
    while (!this.checkCollision(this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.shape)) {
      this.currentPiece.y++;
      cellsDropped++;
    }

    this.score += cellsDropped * 2;
    this.updateStatsUI();

    // Visual impact & sound
    window.soundEngine.playHardDrop();
    this.triggerScreenShake(5);
    this.createImpactParticles(this.currentPiece);

    this.lockPiece();
  }

  rotate(clockwise = true) {
    if (!this.isPlaying || this.isPaused || !this.currentPiece) return;
    const { type, shape, rotation, x, y } = this.currentPiece;

    if (type === 'O') return; // O does not rotate

    // Rotate matrix
    const newShape = this.rotateMatrix(shape, clockwise);
    const newRotation = (rotation + (clockwise ? 1 : 3)) % 4;
    const kickKey = `${rotation}->${newRotation}`;
    const kicks = (type === 'I' ? WALL_KICKS_I : WALL_KICKS_NORMAL)[kickKey] || [[0, 0]];

    let kicked = false;
    for (const [dx, dy] of kicks) {
      if (!this.checkCollision(x + dx, y - dy, newShape)) {
        this.currentPiece.x = x + dx;
        this.currentPiece.y = y - dy;
        this.currentPiece.shape = newShape;
        this.currentPiece.rotation = newRotation;
        kicked = true;
        break;
      }
    }

    if (kicked) {
      window.soundEngine.playRotate();
      this.handleLockDelayExtension();
      this.updateGhostPiece();
    }
  }

  rotateMatrix(matrix, clockwise) {
    const N = matrix.length;
    const result = Array.from({ length: N }, () => Array(N).fill(0));
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (clockwise) {
          result[c][N - 1 - r] = matrix[r][c];
        } else {
          result[N - 1 - c][r] = matrix[r][c];
        }
      }
    }
    return result;
  }

  hold() {
    if (!this.isPlaying || this.isPaused || !this.canHold || !this.currentPiece) return;

    window.soundEngine.playHold();
    const currentType = this.currentPiece.type;

    if (this.holdPieceType === null) {
      this.holdPieceType = currentType;
      this.spawnPiece();
    } else {
      const temp = this.holdPieceType;
      this.holdPieceType = currentType;
      const shape = TETROMINO_SHAPES[temp].map(row => [...row]);
      this.currentPiece = {
        type: temp,
        shape,
        rotation: 0,
        x: Math.floor((COLS - shape[0].length) / 2),
        y: BUFFER_ROWS - 1
      };
      this.resetLockState();
      this.updateGhostPiece();
    }

    this.canHold = false;
    this.drawHold();
  }

  handleLockDelayExtension() {
    if (this.checkCollision(this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.shape)) {
      if (this.lockResets < this.maxLockResets) {
        this.lockTimer = performance.now();
        this.lockResets++;
      }
    }
  }

  /* Lock Piece & Clear Lines */
  lockPiece() {
    if (!this.currentPiece) return;

    const { x, y, shape, type } = this.currentPiece;
    const color = TETROMINO_COLORS[type];

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const boardY = y + r;
          const boardX = x + c;
          if (boardY >= 0 && boardY < TOTAL_ROWS) {
            this.grid[boardY][boardX] = color;
          }
        }
      }
    }

    this.currentPiece = null;
    this.checkLines();
  }

  checkLines() {
    const fullLines = [];
    for (let r = 0; r < TOTAL_ROWS; r++) {
      if (this.grid[r].every(cell => cell !== null)) {
        fullLines.push(r);
      }
    }

    if (fullLines.length > 0) {
      this.clearingLines = fullLines;
      this.clearAnimationTimer = 160; // ms line clear flash
      window.soundEngine.playLineClear(fullLines.length);

      // Create line burst particles
      fullLines.forEach(lineY => {
        for (let c = 0; c < COLS; c++) {
          const cellColor = this.grid[lineY][c];
          this.createExplosionParticles(
            c * BLOCK_SIZE + BLOCK_SIZE / 2,
            (lineY - BUFFER_ROWS) * BLOCK_SIZE + BLOCK_SIZE / 2,
            cellColor ? cellColor.main : '#00f0ff'
          );
        }
      });

      if (fullLines.length === 4) {
        this.triggerScreenShake(10);
      }
    } else {
      this.combo = -1;
      this.spawnPiece();
    }
  }

  processCompletedLines() {
    const count = this.clearingLines.length;
    if (count === 0) return;

    // Filter out cleared rows
    this.grid = this.grid.filter((_, idx) => !this.clearingLines.includes(idx));
    // Add empty rows on top
    while (this.grid.length < TOTAL_ROWS) {
      this.grid.unshift(Array(COLS).fill(null));
    }

    this.clearingLines = [];

    // Calculate score
    const baseScores = [0, 100, 300, 500, 800];
    let earned = baseScores[count] * this.level;

    this.combo++;
    if (this.combo > 0) {
      earned += 50 * this.combo * this.level;
    }

    let actionText = '';
    if (count === 4) {
      if (this.isBackToBack) {
        earned = Math.floor(earned * 1.5);
        actionText = 'B2B TETRIS!';
      } else {
        actionText = 'TETRIS!';
      }
      this.isBackToBack = true;
    } else {
      this.isBackToBack = false;
      if (count === 1) actionText = 'SINGLE';
      else if (count === 2) actionText = 'DOUBLE';
      else if (count === 3) actionText = 'TRIPLE';
    }

    if (this.combo > 0) {
      actionText += ` COMBO x${this.combo}`;
    }

    this.addFloatingText(actionText, earned);
    this.score += earned;
    this.lines += count;

    // Level progression (every 10 lines)
    const newLevel = Math.floor(this.lines / 10) + 1;
    if (newLevel > this.level) {
      this.level = newLevel;
      window.soundEngine.playLevelUp();
      this.addFloatingText('LEVEL UP!', null, '#00ff66');
    }

    this.updateStatsUI();
    this.spawnPiece();
  }

  addFloatingText(title, points = null, color = '#ffe600') {
    this.floatingTexts.push({
      title,
      points: points ? `+${points.toLocaleString()}` : '',
      x: 150,
      y: 280,
      opacity: 1,
      vy: -1.2,
      color
    });
  }

  triggerScreenShake(intensity) {
    this.shakeIntensity = intensity;
  }

  createImpactParticles(piece) {
    const { x, y, shape, type } = piece;
    const color = TETROMINO_COLORS[type].main;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const px = (x + c) * BLOCK_SIZE + BLOCK_SIZE / 2;
          const py = (y + r - BUFFER_ROWS) * BLOCK_SIZE + BLOCK_SIZE;
          for (let i = 0; i < 4; i++) {
            this.particles.push({
              x: px,
              y: py,
              vx: (Math.random() - 0.5) * 5,
              vy: -Math.random() * 3 - 1,
              size: Math.random() * 3 + 2,
              color,
              life: 1,
              decay: 0.04
            });
          }
        }
      }
    }
  }

  createExplosionParticles(x, y, color) {
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3.5 + 2,
        color,
        life: 1,
        decay: 0.035
      });
    }
  }

  updateStatsUI() {
    this.scoreEl.textContent = this.score.toLocaleString();
    this.levelEl.textContent = this.level;
    this.linesEl.textContent = this.lines;

    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.highScoreEl.textContent = this.highScore.toLocaleString();
      localStorage.setItem('tetris_high_score', this.highScore.toString());
    }
  }

  gameOver() {
    this.isPlaying = false;
    this.isGameOver = true;
    window.soundEngine.playGameOver();

    const isNewHigh = this.score > 0 && this.score >= this.highScore;
    this.finalScoreEl.textContent = this.score.toLocaleString();
    this.finalLevelEl.textContent = this.level;
    this.finalLinesEl.textContent = this.lines;

    if (isNewHigh) {
      this.newHighBadge.classList.remove('hidden');
    } else {
      this.newHighBadge.classList.add('hidden');
    }

    this.gameoverOverlay.classList.remove('hidden');
  }

  togglePause() {
    if (!this.isPlaying || this.isGameOver) return;
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.pauseOverlay.classList.remove('hidden');
      this.pauseIcon.classList.add('hidden');
      this.playIcon.classList.remove('hidden');
      this.btnPause.classList.add('active');
    } else {
      this.pauseOverlay.classList.add('hidden');
      this.pauseIcon.classList.remove('hidden');
      this.playIcon.classList.add('hidden');
      this.btnPause.classList.remove('active');
      this.lastFrameTime = performance.now();
      requestAnimationFrame((t) => this.gameLoop(t));
    }
  }

  toggleMusic() {
    const isPlaying = window.soundEngine.toggleMusic();
    if (isPlaying) {
      this.btnMusic.classList.add('active');
    } else {
      this.btnMusic.classList.remove('active');
    }
  }

  toggleSound() {
    const isEnabled = window.soundEngine.toggleSound();
    if (isEnabled) {
      this.soundOnIcon.classList.remove('hidden');
      this.soundOffIcon.classList.add('hidden');
      this.btnSound.classList.remove('active');
    } else {
      this.soundOnIcon.classList.add('hidden');
      this.soundOffIcon.classList.remove('hidden');
      this.btnSound.classList.add('active');
    }
  }

  /* Game Loop */
  gameLoop(currentTime) {
    if (!this.isPlaying || this.isPaused) return;

    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    // Handle line clear animation pause
    if (this.clearAnimationTimer > 0) {
      this.clearAnimationTimer -= deltaTime;
      if (this.clearAnimationTimer <= 0) {
        this.processCompletedLines();
      }
    } else if (this.currentPiece) {
      // Gravity step
      this.dropCounter += deltaTime;
      const gravity = this.getGravity();

      if (this.dropCounter >= gravity) {
        this.dropCounter = 0;
        if (!this.checkCollision(this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.shape)) {
          this.currentPiece.y++;
          this.updateGhostPiece();
          this.resetLockState();
        } else {
          // Bottom reached, start lock delay timer
          if (this.lockTimer === null) {
            this.lockTimer = currentTime;
          }
        }
      }

      // Check lock delay expiration
      if (this.lockTimer !== null && (currentTime - this.lockTimer >= this.lockDelay)) {
        if (this.checkCollision(this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.shape)) {
          this.lockPiece();
        } else {
          this.lockTimer = null;
        }
      }
    }

    // Update Particles & Floating Text
    this.updateVisuals(deltaTime);

    // Render Frame
    this.render();

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  updateVisuals(deltaTime) {
    // Screen shake decay
    if (this.shakeIntensity > 0) {
      const shakeX = (Math.random() - 0.5) * this.shakeIntensity;
      const shakeY = (Math.random() - 0.5) * this.shakeIntensity;
      this.boardFrame.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
      this.shakeIntensity = Math.max(0, this.shakeIntensity - 0.4);
      if (this.shakeIntensity === 0) {
        this.boardFrame.style.transform = 'translate(0, 0)';
      }
    }

    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.opacity -= 0.018;
      if (ft.opacity <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  /* Rendering */
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw Grid Lines
    this.drawGridLines();

    // Draw Locked Blocks
    for (let r = BUFFER_ROWS; r < TOTAL_ROWS; r++) {
      const drawY = (r - BUFFER_ROWS) * BLOCK_SIZE;
      const isClearing = this.clearingLines.includes(r);

      for (let c = 0; c < COLS; c++) {
        const cell = this.grid[r][c];
        if (cell) {
          if (isClearing) {
            // Flash white on clear
            this.drawBlock(this.ctx, c * BLOCK_SIZE, drawY, {
              main: '#ffffff',
              light: '#ffffff',
              dark: '#e0e0e0',
              shadow: 'rgba(255, 255, 255, 0.8)'
            }, 1);
          } else {
            this.drawBlock(this.ctx, c * BLOCK_SIZE, drawY, cell);
          }
        }
      }
    }

    // Draw Ghost Piece
    if (this.currentPiece && !this.clearingLines.length) {
      this.drawGhostPiece();
      this.drawActivePiece();
    }

    // Draw Particles
    this.drawParticles();

    // Draw Floating Scores
    this.drawFloatingTexts();
  }

  drawGridLines() {
    this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
    this.ctx.lineWidth = 1;

    for (let c = 0; c <= COLS; c++) {
      this.ctx.beginPath();
      this.ctx.moveTo(c * BLOCK_SIZE, 0);
      this.ctx.lineTo(c * BLOCK_SIZE, ROWS * BLOCK_SIZE);
      this.ctx.stroke();
    }

    for (let r = 0; r <= ROWS; r++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, r * BLOCK_SIZE);
      this.ctx.lineTo(COLS * BLOCK_SIZE, r * BLOCK_SIZE);
      this.ctx.stroke();
    }
  }

  drawBlock(ctx, x, y, color, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;

    // Block base
    ctx.fillStyle = color.main;
    ctx.fillRect(x + 1, y + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);

    // Top & Left highlight bevel
    ctx.fillStyle = color.light;
    ctx.fillRect(x + 1, y + 1, BLOCK_SIZE - 2, 3);
    ctx.fillRect(x + 1, y + 1, 3, BLOCK_SIZE - 2);

    // Bottom & Right shadow bevel
    ctx.fillStyle = color.dark;
    ctx.fillRect(x + 1, y + BLOCK_SIZE - 4, BLOCK_SIZE - 2, 3);
    ctx.fillRect(x + BLOCK_SIZE - 4, y + 1, 3, BLOCK_SIZE - 2);

    // Subtle neon center gem
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(x + 6, y + 6, BLOCK_SIZE - 12, BLOCK_SIZE - 12);

    ctx.restore();
  }

  drawGhostPiece() {
    const { shape, x, type } = this.currentPiece;
    const color = TETROMINO_COLORS[type];

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const boardY = this.ghostPieceY + r;
          if (boardY >= BUFFER_ROWS) {
            const px = (x + c) * BLOCK_SIZE;
            const py = (boardY - BUFFER_ROWS) * BLOCK_SIZE;

            this.ctx.save();
            this.ctx.strokeStyle = color.main;
            this.ctx.lineWidth = 1.5;
            this.ctx.fillStyle = color.shadow;
            this.ctx.fillRect(px + 2, py + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
            this.ctx.strokeRect(px + 2, py + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
            this.ctx.restore();
          }
        }
      }
    }
  }

  drawActivePiece() {
    const { shape, x, y, type } = this.currentPiece;
    const color = TETROMINO_COLORS[type];

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const boardY = y + r;
          if (boardY >= BUFFER_ROWS) {
            const px = (x + c) * BLOCK_SIZE;
            const py = (boardY - BUFFER_ROWS) * BLOCK_SIZE;
            this.drawBlock(this.ctx, px, py, color);
          }
        }
      }
    }
  }

  drawParticles() {
    this.particles.forEach(p => {
      this.ctx.save();
      this.ctx.globalAlpha = p.life;
      this.ctx.fillStyle = p.color;
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = 8;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  }

  drawFloatingTexts() {
    this.floatingTexts.forEach(ft => {
      this.ctx.save();
      this.ctx.globalAlpha = ft.opacity;
      this.ctx.font = 'bold 16px "Press Start 2P", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = ft.color;
      this.ctx.shadowColor = ft.color;
      this.ctx.shadowBlur = 10;
      this.ctx.fillText(ft.title, ft.x, ft.y);

      if (ft.points) {
        this.ctx.font = 'bold 12px "Press Start 2P", monospace';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(ft.points, ft.x, ft.y + 20);
      }
      this.ctx.restore();
    });
  }

  /* Hold & Next Canvases */
  drawHold() {
    this.holdCtx.clearRect(0, 0, this.holdCanvas.width, this.holdCanvas.height);
    if (!this.holdPieceType) return;

    const shape = TETROMINO_SHAPES[this.holdPieceType];
    const color = TETROMINO_COLORS[this.holdPieceType];
    const size = 22;
    const offsetX = (this.holdCanvas.width - shape[0].length * size) / 2;
    const offsetY = (this.holdCanvas.height - shape.length * size) / 2;

    this.drawPreviewPiece(this.holdCtx, shape, color, offsetX, offsetY, size, this.canHold ? 1 : 0.4);
  }

  drawNext() {
    this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
    const size = 20;

    this.nextQueue.slice(0, 4).forEach((type, idx) => {
      const shape = TETROMINO_SHAPES[type];
      const color = TETROMINO_COLORS[type];
      const offsetX = (this.nextCanvas.width - shape[0].length * size) / 2;
      const offsetY = 14 + idx * 80;

      this.drawPreviewPiece(this.nextCtx, shape, color, offsetX, offsetY, size, 1);
    });
  }

  drawPreviewPiece(ctx, shape, color, offsetX, offsetY, size, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const px = offsetX + c * size;
          const py = offsetY + r * size;

          ctx.fillStyle = color.main;
          ctx.fillRect(px + 1, py + 1, size - 2, size - 2);

          ctx.fillStyle = color.light;
          ctx.fillRect(px + 1, py + 1, size - 2, 2);
          ctx.fillRect(px + 1, py + 1, 2, size - 2);

          ctx.fillStyle = color.dark;
          ctx.fillRect(px + 1, py + size - 3, size - 2, 2);
          ctx.fillRect(px + size - 3, py + 1, 2, size - 2);
        }
      }
    }
    ctx.restore();
  }

  /* Keyboard & DAS/ARR Input Handling */
  initInputs() {
    window.addEventListener('keydown', (e) => {
      // Prevent page scrolling on game keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.repeat && ['ArrowUp', 'KeyW', 'KeyX', 'KeyZ', 'Space', 'KeyC'].includes(e.code)) {
        return; // Don't repeat rotation, hard drop, hold
      }

      this.handleKeyDown(e.code);
    });

    window.addEventListener('keyup', (e) => {
      this.handleKeyUp(e.code);
    });
  }

  handleKeyDown(code) {
    // Global toggles
    if (code === 'KeyP' || code === 'Escape') {
      this.togglePause();
      return;
    }
    if (code === 'KeyR') {
      this.startGame();
      return;
    }

    if (!this.isPlaying || this.isPaused) return;

    if (code === 'ArrowLeft' || code === 'KeyA') {
      if (!this.keys['left']) {
        this.keys['left'] = true;
        this.moveLeft();
        clearTimeout(this.dasTimer);
        clearInterval(this.arrTimer);
        this.dasTimer = setTimeout(() => {
          this.arrTimer = setInterval(() => {
            if (this.keys['left']) this.moveLeft();
          }, this.arrSpeed);
        }, this.dasDelay);
      }
    } else if (code === 'ArrowRight' || code === 'KeyD') {
      if (!this.keys['right']) {
        this.keys['right'] = true;
        this.moveRight();
        clearTimeout(this.dasTimer);
        clearInterval(this.arrTimer);
        this.dasTimer = setTimeout(() => {
          this.arrTimer = setInterval(() => {
            if (this.keys['right']) this.moveRight();
          }, this.arrSpeed);
        }, this.dasDelay);
      }
    } else if (code === 'ArrowDown' || code === 'KeyS') {
      if (!this.keys['down']) {
        this.keys['down'] = true;
        this.softDrop();
        clearInterval(this.arrDownTimer);
        this.arrDownTimer = setInterval(() => {
          if (this.keys['down']) this.softDrop();
        }, 45);
      }
    } else if (code === 'ArrowUp' || code === 'KeyW' || code === 'KeyX') {
      this.rotate(true);
    } else if (code === 'KeyZ' || code === 'ControlLeft' || code === 'ControlRight') {
      this.rotate(false);
    } else if (code === 'Space') {
      this.hardDrop();
    } else if (code === 'KeyC' || code === 'ShiftLeft' || code === 'ShiftRight') {
      this.hold();
    }
  }

  handleKeyUp(code) {
    if (code === 'ArrowLeft' || code === 'KeyA') {
      this.keys['left'] = false;
      clearTimeout(this.dasTimer);
      clearInterval(this.arrTimer);
    } else if (code === 'ArrowRight' || code === 'KeyD') {
      this.keys['right'] = false;
      clearTimeout(this.dasTimer);
      clearInterval(this.arrTimer);
    } else if (code === 'ArrowDown' || code === 'KeyS') {
      this.keys['down'] = false;
      clearInterval(this.arrDownTimer);
    }
  }

  /* On-Screen Touch Controls */
  initTouchControls() {
    const bindTouch = (id, onDown, onUp = null) => {
      const el = document.getElementById(id);
      if (!el) return;

      const triggerDown = (e) => {
        e.preventDefault();
        el.classList.add('active-touch');
        onDown();
      };

      const triggerUp = (e) => {
        e.preventDefault();
        el.classList.remove('active-touch');
        if (onUp) onUp();
      };

      el.addEventListener('touchstart', triggerDown, { passive: false });
      el.addEventListener('touchend', triggerUp, { passive: false });
      el.addEventListener('touchcancel', triggerUp, { passive: false });
      el.addEventListener('mousedown', triggerDown);
      el.addEventListener('mouseup', triggerUp);
      el.addEventListener('mouseleave', triggerUp);
    };

    bindTouch('t-left', 
      () => {
        this.moveLeft();
        this.touchLeftTimer = setInterval(() => this.moveLeft(), 80);
      },
      () => clearInterval(this.touchLeftTimer)
    );

    bindTouch('t-right', 
      () => {
        this.moveRight();
        this.touchRightTimer = setInterval(() => this.moveRight(), 80);
      },
      () => clearInterval(this.touchRightTimer)
    );

    bindTouch('t-down', 
      () => {
        this.softDrop();
        this.touchDownTimer = setInterval(() => this.softDrop(), 50);
      },
      () => clearInterval(this.touchDownTimer)
    );

    bindTouch('t-up', () => this.rotate(true));
    bindTouch('t-rot-cw', () => this.rotate(true));
    bindTouch('t-rot-ccw', () => this.rotate(false));
    bindTouch('t-hold', () => this.hold());
    bindTouch('t-harddrop', () => this.hardDrop());
  }
}

// Instantiate game once window is ready
window.addEventListener('DOMContentLoaded', () => {
  window.tetrisGame = new TetrisGame();
});

const phaserModule = require('phaser');
const Phaser = phaserModule.default || phaserModule;

const MATERIAL_PROPS = {
  wood: { mass: 0.7, stiffness: 0.45, flexibility: 0.95, friction: 0.5, strength: 32, damping: 0.58 },
  brick: { mass: 1.15, stiffness: 0.78, flexibility: 0.32, friction: 0.72, strength: 46, damping: 0.48 },
  concrete: { mass: 1.35, stiffness: 0.88, flexibility: 0.22, friction: 0.82, strength: 58, damping: 0.62 },
  steel: { mass: 1.05, stiffness: 0.7, flexibility: 0.9, friction: 0.86, strength: 74, damping: 0.76 },
  base: { mass: 1.8, stiffness: 0.96, flexibility: 0.08, friction: 0.95, strength: 90, damping: 0.85 },
  roof: { mass: 0.9, stiffness: 0.58, flexibility: 0.42, friction: 0.6, strength: 34, damping: 0.42 },
};

const LEVEL_COMPLETE_BLOCKS = 4;

export class EarthquakeScene extends Phaser.Scene {
  constructor() {
    super('EarthquakeScene');
    this.config = null;
    this.structureParts = [];
    this.isShaking = false;
    this.shakeTimer = 0;
    this.groundBody = null;
    
    // Fixed Grid Dimensions (7 Columns x 7 Levels)
    this.GRID_COLS = 7;
    this.GRID_ROWS = 7;
    this.CELL_WIDTH = 52;
    this.CELL_HEIGHT = 42;
    
    // Authoritative Grid Matrix: gridBlocks[row][col] = { row, col, material, gameObj, baseX, baseY }
    this.gridBlocks = []; 
    
    this.selectedMaterial = 'wood'; // Active material selector
    this.dragPreviewGraphics = null;
    this.dragGhost = null;
    this.isExternalDragging = false;
    this.isPointerDragging = false;
    this.lastPlacedPos = { row: -1, col: -1 };
    this.maxStressRatio = 0;
    this.activeLevel = 1;
    this.pointerOffset = { x: 0, y: 0 };
    
    this.COLLAPSE_TILT_RADIANS = 0.75; 
    this.FALLEN_MARGIN_FROM_GROUND = 35;
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;

    if (this.matter && this.matter.world) {
      this.matter.world.setBounds(-500, -1000, 3000, 2000);
      this.matter.world.setGravity(0, 0); // Static during Build Mode
    }

    this.resetGridArray();

    // 1. Dark City Night Sky Background
    this.drawCitySkyline(w, h);

    // 2. Dust Particles for Earthquakes
    const g = this.make.graphics({x: 0, y: 0});
    g.fillStyle(0x94a3b8, 0.6);
    g.fillCircle(4, 4, 4);
    g.generateTexture('dust_part', 8, 8);
    
    this.dustEmitter = this.add.particles(0, 0, 'dust_part', {
      x: { min: 40, max: w - 40 },
      y: h - 45,
      lifespan: 1500,
      speedY: { min: -120, max: -20 },
      speedX: { min: -40, max: 40 },
      scale: { start: 1.2, end: 0 },
      emitting: false
    });

    // 3. Static Ground Bed
    const groundY = h - 22;
    const gRect = this.add.rectangle(w / 2, groundY, w + 400, 44, 0x1e293b).setDepth(2);
    gRect.setStrokeStyle(3, 0x334155);
    const gObj = this.matter.add.gameObject(gRect, { isStatic: true, label: 'Ground' });
    this.groundBody = gObj.body;

    // Roadway & Sidewalk Visual Overlays
    this.drawRoadAndSidewalk(w, h, groundY);

    // 4. Construction Grid Platform Base
    this.gridOriginX = w / 2 - (this.GRID_COLS * this.CELL_WIDTH) / 2;
    this.gridOriginY = groundY - 20;
    this.drawVoxelGridPlatform(w, h);

    // 5. Pre-fill Foundation Row 0 across all 7 columns
    this.initFoundationRow();

    // 6. UI Layer (Magnitude Text, Stress Gauge, Level Badge, Clear Button)
    this.createUIElements(w, h);

    // 7. Click & Drag Input Handlers
    this.setupInputHandlers();

    this.scale.on('resize', this.handleResize, this);
  }

  resetGridArray() {
    this.gridBlocks = [];
    for (let r = 0; r < this.GRID_ROWS; r++) {
      this.gridBlocks[r] = new Array(this.GRID_COLS).fill(null);
    }
  }

  initFoundationRow() {
    for (let c = 0; c < this.GRID_COLS; c++) {
      this.placeBlockAt(0, c, 'base');
    }
  }

  setSelectedMaterial(matId) {
    this.selectedMaterial = matId;
  }

  beginExternalMaterialDrag(matId, pointerOffset = { x: 0, y: 0 }) {
    if (this.isShaking) return;
    this.selectedMaterial = matId;
    this.isExternalDragging = true;
    this.pointerOffset = pointerOffset;

    if (this.dragGhost) this.dragGhost.destroy();
    this.dragGhost = this.render3DVoxelBlock(0, 0, this.CELL_WIDTH, this.CELL_HEIGHT, matId);
    this.dragGhost.setDepth(280).setAlpha(0.82).setVisible(false);
  }

  moveExternalMaterialDrag(px, py, isInside) {
    if (!this.isExternalDragging || this.isShaking) return;

    const ghostX = px + this.pointerOffset.x;
    const ghostY = py + this.pointerOffset.y;
    if (this.dragGhost) {
      this.dragGhost.setPosition(ghostX, ghostY);
      this.dragGhost.setVisible(Boolean(isInside));
    }

    if (isInside) this.updateDragPreview(ghostX, ghostY);
    else if (this.dragPreviewGraphics) this.dragPreviewGraphics.setVisible(false);
  }

  endExternalMaterialDrag(px, py, isInside) {
    if (!this.isExternalDragging) return;

    if (isInside && !this.isShaking) {
      this.tryPlaceOrModifyBlockAtPointer(px + this.pointerOffset.x, py + this.pointerOffset.y);
    }

    this.isExternalDragging = false;
    this.lastPlacedPos = { row: -1, col: -1 };
    if (this.dragPreviewGraphics) this.dragPreviewGraphics.setVisible(false);
    if (this.dragGhost) {
      this.dragGhost.destroy();
      this.dragGhost = null;
    }
  }

  drawCitySkyline(w, h) {
    const bg = this.add.graphics();
    bg.setDepth(-20);

    bg.fillGradientStyle(0x0b132b, 0x0b132b, 0x1c2541, 0x1c2541, 1);
    bg.fillRect(0, 0, w, h);

    bg.fillStyle(0x0f172a, 0.85);
    bg.fillRect(w * 0.04, h - 260, 50, 220);
    bg.fillRect(w * 0.12, h - 310, 65, 270);
    bg.fillRect(w * 0.82, h - 250, 60, 210);
    bg.fillRect(w * 0.90, h - 320, 75, 280);

    bg.fillStyle(0xfef08a, 0.25);
    for (let i = 0; i < 20; i++) {
      const rx = Phaser.Math.Between(20, w - 20);
      const ry = Phaser.Math.Between(h - 290, h - 100);
      bg.fillRect(rx, ry, 5, 7);
    }
  }

  drawRoadAndSidewalk(w, h, groundY) {
    const roadG = this.add.graphics();
    roadG.setDepth(-2);

    roadG.fillStyle(0x475569, 1);
    roadG.fillRect(0, groundY - 20, w, 6);

    roadG.fillStyle(0x0f172a, 0.9);
    roadG.fillRect(0, groundY - 14, w, 34);

    roadG.lineStyle(2, 0xf59e0b, 0.7);
    for (let x = 10; x < w; x += 35) {
      roadG.lineBetween(x, groundY, x + 18, groundY);
    }

    [w * 0.05, w * 0.95].forEach(lx => {
      roadG.lineStyle(2, 0x94a3b8, 1);
      roadG.lineBetween(lx, groundY - 20, lx, groundY - 65);
      roadG.lineBetween(lx, groundY - 65, lx + 10, groundY - 65);
      roadG.fillStyle(0xfef08a, 0.95);
      roadG.fillCircle(lx + 10, groundY - 63, 5);
    });
  }

  // Render Grid Platform behind building blocks (Depth 5)
  drawVoxelGridPlatform(w, h) {
    if (this.gridGraphics) this.gridGraphics.destroy();

    this.gridGraphics = this.add.graphics();
    this.gridGraphics.setDepth(5);

    const platformW = this.GRID_COLS * this.CELL_WIDTH + 24;
    const platformX = w / 2 - platformW / 2;

    // Platform Concrete Base
    this.gridGraphics.fillStyle(0x1e293b, 0.95);
    this.gridGraphics.fillRect(platformX, this.gridOriginY, platformW, 14);
    this.gridGraphics.lineStyle(2, 0x06b6d4, 0.9);
    this.gridGraphics.strokeRect(platformX, this.gridOriginY, platformW, 14);

    // Grid Guides for all 7 Rows x 7 Columns
    for (let r = 0; r < this.GRID_ROWS; r++) {
      for (let c = 0; c < this.GRID_COLS; c++) {
        const cx = this.gridOriginX + c * this.CELL_WIDTH;
        const cy = this.gridOriginY - (r + 1) * this.CELL_HEIGHT;
        const isFoundation = r === 0;
        const isCompleted = r > 0 && r < this.activeLevel;
        const isActive = r === this.activeLevel;
        const isLocked = r > this.activeLevel;

        if (isActive) {
          this.gridGraphics.fillStyle(0x06b6d4, 0.08);
          this.gridGraphics.fillRect(cx, cy, this.CELL_WIDTH, this.CELL_HEIGHT);
          this.gridGraphics.lineStyle(2, 0x06b6d4, 0.75);
        } else if (isCompleted || isFoundation) {
          this.gridGraphics.fillStyle(0x10b981, isFoundation ? 0.08 : 0.04);
          this.gridGraphics.fillRect(cx, cy, this.CELL_WIDTH, this.CELL_HEIGHT);
          this.gridGraphics.lineStyle(1, 0x10b981, 0.32);
        } else if (isLocked) {
          this.gridGraphics.fillStyle(0x020617, 0.2);
          this.gridGraphics.fillRect(cx, cy, this.CELL_WIDTH, this.CELL_HEIGHT);
          this.gridGraphics.lineStyle(1, 0x334155, 0.22);
        } else {
          this.gridGraphics.lineStyle(1, 0x334155, 0.5);
        }
        this.gridGraphics.strokeRect(cx, cy, this.CELL_WIDTH, this.CELL_HEIGHT);
      }
    }
  }

  createUIElements(w, h) {
    this.magText = this.add.text(w / 2, 70, '', { 
      fontSize: '22px', 
      color: '#f43f5e', 
      fontStyle: '900', 
      fontFamily: 'system-ui, sans-serif',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setAlpha(0).setDepth(300);

    const stressBg = this.add.rectangle(w / 2, 54, 180, 8, 0x1e1b18).setOrigin(0.5).setDepth(300);
    stressBg.setStrokeStyle(2, 0x332724);
    this.stressBarFill = this.add.rectangle(w / 2 - 90, 54, 0, 8, 0x10b981).setOrigin(0, 0.5).setDepth(301);
    this.add.text(w / 2, 44, 'STRUCTURAL STRESS', { 
      fontSize: '9px', 
      color: '#cbd5e1', 
      fontStyle: 'bold',
      fontFamily: 'system-ui, sans-serif'
    }).setOrigin(0.5).setDepth(300);
    this.stressStateText = this.add.text(w / 2 + 104, 54, 'STABLE', {
      fontSize: '9px',
      color: '#10b981',
      fontStyle: 'bold',
      fontFamily: 'system-ui, sans-serif'
    }).setOrigin(0, 0.5).setDepth(300);

    this.levelBadgeText = this.add.text(14, h - 34, 'BUILD LEVEL: 1 / 7  |  BLOCKS: 7', {
      fontSize: '11px',
      color: '#38bdf8',
      fontStyle: 'bold',
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: '#0f172a',
      padding: { x: 8, y: 4 }
    }).setDepth(300);
    this.levelToast = this.add.text(w / 2, h - 74, 'LEVEL COMPLETE', {
      fontSize: '13px',
      color: '#34d399',
      fontStyle: 'bold',
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: '#052e2b',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setDepth(300).setAlpha(0);

    const clearBtn = this.add.text(w - 14, h - 34, '🗑️ CLEAR BUILD', {
      fontSize: '11px',
      color: '#f43f5e',
      fontStyle: 'bold',
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: '#1e1b18',
      padding: { x: 10, y: 5 }
    }).setOrigin(1, 0).setDepth(300).setInteractive({ useHandCursor: true });

    clearBtn.on('pointerdown', (pointer, localX, localY, event) => {
      if (event && event.stopPropagation) event.stopPropagation();
      this.clearAllPlacedBlocks();
    });
  }

  // Click & Drag Input Handlers
  setupInputHandlers() {
    this.lastPlacedPos = { row: -1, col: -1 };

    this.input.on('pointerdown', (pointer) => {
      if (this.isShaking) return;
      if (pointer.y < 50) return; // Skip top toolbar area

      this.isPointerDragging = true;
      this.lastPlacedPos = { row: -1, col: -1 };
      this.tryPlaceOrModifyBlockAtPointer(pointer.x, pointer.y);
    });

    this.input.on('pointermove', (pointer) => {
      if (this.isShaking) return;
      this.updateDragPreview(pointer.x, pointer.y);

      if (this.isPointerDragging && pointer.y >= 50) {
        this.tryPlaceOrModifyBlockAtPointer(pointer.x, pointer.y);
      }
    });

    this.input.on('pointerup', () => {
      this.isPointerDragging = false;
      this.lastPlacedPos = { row: -1, col: -1 };
    });

    // Right click removes block cleanly
    const canvas = this.sys.canvas || (this.game && this.game.canvas);
    if (canvas) {
      canvas.oncontextmenu = (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;
        const gridPos = this.getGridPosFromPointer(px, py);
        if (gridPos && gridPos.row > 0) {
          this.removeBlockAt(gridPos.row, gridPos.col);
        }
      };
    }
  }

  getGridPosFromPointer(px, py) {
    const relX = px - this.gridOriginX;
    const relY = this.gridOriginY - py;

    if (relX < 0 || relX >= this.GRID_COLS * this.CELL_WIDTH) return null;
    if (relY < 0 || relY >= this.GRID_ROWS * this.CELL_HEIGHT) return null;

    const col = Math.floor(relX / this.CELL_WIDTH);
    const row = Math.floor(relY / this.CELL_HEIGHT);

    if (row < 0 || row >= this.GRID_ROWS || col < 0 || col >= this.GRID_COLS) return null;

    return { row, col };
  }

  canPlaceBlockAt(row, col) {
    if (row < 0 || row >= this.GRID_ROWS || col < 0 || col >= this.GRID_COLS) return false;
    if (row === 0) return this.selectedMaterial === 'base' || this.selectedMaterial === 'foundation';
    if (row !== this.activeLevel) return false;
    return Boolean(this.gridBlocks[row - 1] && this.gridBlocks[row - 1][col]);
  }

  tryPlaceOrModifyBlockAtPointer(px, py) {
    const gridPos = this.getGridPosFromPointer(px, py);
    if (!gridPos) return;

    const { row, col } = gridPos;
    
    // Deduplicate drag placements on the same cell
    if (this.lastPlacedPos.row === row && this.lastPlacedPos.col === col) return;

    if (this.gridBlocks[row] && this.gridBlocks[row][col]) {
      if (row === 0 && this.selectedMaterial !== 'base' && this.selectedMaterial !== 'foundation') return;
      if (this.gridBlocks[row][col].material !== this.selectedMaterial) {
        this.removeBlockAt(row, col, { pruneUnsupported: false, recalcLevel: false });
        this.placeBlockAt(row, col, this.selectedMaterial);
        this.lastPlacedPos = { row, col };
      }
    } else if (this.canPlaceBlockAt(row, col)) {
      this.placeBlockAt(row, col, this.selectedMaterial);
      this.lastPlacedPos = { row, col };
    }
  }

  updateDragPreview(px, py) {
    const gridPos = this.getGridPosFromPointer(px, py);

    if (!gridPos || py < 50) {
      if (this.dragPreviewGraphics) this.dragPreviewGraphics.setVisible(false);
      return;
    }

    if (!this.dragPreviewGraphics) {
      this.dragPreviewGraphics = this.add.graphics().setDepth(250);
    }

    const { row, col } = gridPos;
    const cx = this.gridOriginX + col * this.CELL_WIDTH;
    const cy = this.gridOriginY - (row + 1) * this.CELL_HEIGHT;
    const isValid = !this.gridBlocks[row][col] || this.gridBlocks[row][col].material !== this.selectedMaterial
      ? this.canPlaceBlockAt(row, col)
      : true;

    this.dragPreviewGraphics.clear();
    this.dragPreviewGraphics.setVisible(true);
    this.dragPreviewGraphics.fillStyle(isValid ? 0x06b6d4 : 0xef4444, 0.40);
    this.dragPreviewGraphics.fillRect(cx, cy, this.CELL_WIDTH, this.CELL_HEIGHT);
    this.dragPreviewGraphics.lineStyle(2, isValid ? 0x38bdf8 : 0xf87171, 1);
    this.dragPreviewGraphics.strokeRect(cx, cy, this.CELL_WIDTH, this.CELL_HEIGHT);
  }

  placeBlockAt(row, col, materialType) {
    const cx = this.gridOriginX + col * this.CELL_WIDTH + this.CELL_WIDTH / 2;
    const cy = this.gridOriginY - (row + 1) * this.CELL_HEIGHT + this.CELL_HEIGHT / 2;

    const blockVisual = this.render3DVoxelBlock(cx, cy, this.CELL_WIDTH, this.CELL_HEIGHT, materialType);
    
    // Depth Ordering: Higher rows get higher depth (Depth 20 + row)
    blockVisual.setDepth(20 + row);

    const physicsProps = this.getMaterialPhysicsProps(materialType);
    const bodyObj = this.matter.add.gameObject(blockVisual, {
      label: materialType === 'base' || materialType === 'foundation' ? 'Foundation' : 'Block',
      isStatic: true,
      ...physicsProps
    });

    this.gridBlocks[row][col] = {
      row,
      col,
      material: materialType,
      gameObj: bodyObj,
      baseX: cx,
      baseY: cy
    };

    this.structureParts.push(bodyObj.body);
    this.updateLevelAndBlockCount();
    this.maybeAdvanceActiveLevel(row);
  }

  render3DVoxelBlock(x, y, w, h, materialType) {
    const container = this.add.container(x, y);

    const faceRect = this.add.rectangle(0, 0, w - 2, h - 2, 0x1e293b);
    const g = this.add.graphics();
    container.add([faceRect, g]);

    let baseColor = 0x475569;
    let strokeColor = 0x64748b;

    if (materialType === 'wood') {
      baseColor = 0x8b5a2b; strokeColor = 0x5f3b1b;
      faceRect.setFillStyle(baseColor);
      g.lineStyle(2, strokeColor, 1);
      g.strokeRect(-w/2 + 1, -h/2 + 1, w - 2, h - 2);
      g.lineStyle(1, 0xd19a5f, 0.6);
      g.lineBetween(-w/2 + 4, -4, w/2 - 4, -4);
      g.lineBetween(-w/2 + 4, 4, w/2 - 4, 4);
    } else if (materialType === 'brick') {
      baseColor = 0xb33a2f; strokeColor = 0x7f1d1d;
      faceRect.setFillStyle(baseColor);
      g.lineStyle(2, strokeColor, 1);
      g.strokeRect(-w/2 + 1, -h/2 + 1, w - 2, h - 2);
      g.lineStyle(1, 0xf8fafc, 0.4);
      g.lineBetween(-w/2 + 2, 0, w/2 - 2, 0);
      g.lineBetween(0, -h/2 + 2, 0, 0);
    } else if (materialType === 'steel') {
      baseColor = 0xc0c7d1; strokeColor = 0x64748b;
      faceRect.setFillStyle(baseColor);
      g.lineStyle(2, strokeColor, 1);
      g.strokeRect(-w/2 + 1, -h/2 + 1, w - 2, h - 2);
      g.lineStyle(2, 0xf8fafc, 0.75);
      g.lineBetween(-w/2 + 4, -h/2 + 4, w/2 - 4, h/2 - 4);
      g.lineBetween(w/2 - 4, -h/2 + 4, -w/2 + 4, h/2 - 4);
    } else if (materialType === 'concrete') {
      baseColor = 0x9ca3af; strokeColor = 0x6b7280;
      faceRect.setFillStyle(baseColor);
      g.lineStyle(2, strokeColor, 1);
      g.strokeRect(-w/2 + 1, -h/2 + 1, w - 2, h - 2);
      g.fillStyle(0x6b7280, 1);
      g.fillCircle(-w/2 + 6, -h/2 + 6, 2);
      g.fillCircle(w/2 - 6, -h/2 + 6, 2);
    } else if (materialType === 'base' || materialType === 'foundation') {
      const fColor = this.config?.foundation === 'weak' ? 0x7c8796 : this.config?.foundation === 'strong' ? 0x4b5563 : 0x6b7280;
      faceRect.setFillStyle(fColor);
      g.lineStyle(2, 0xd1d5db, 1);
      g.strokeRect(-w/2 + 1, -h/2 + 1, w - 2, h - 2);
      g.lineStyle(1, 0x374151, 0.65);
      g.lineBetween(-w/2 + 5, h/2 - 8, w/2 - 5, h/2 - 8);
    } else if (materialType === 'roof') {
      baseColor = 0xb45309; strokeColor = 0x7c2d12;
      faceRect.setFillStyle(baseColor);
      g.lineStyle(2, strokeColor, 1);
      g.strokeRect(-w/2 + 1, -h/2 + 1, w - 2, h - 2);
      g.lineStyle(1, 0xf59e0b, 0.65);
      g.lineBetween(-w/2 + 4, -h/2 + 8, w/2 - 4, -h/2 + 8);
    }

    // 3D Voxel Top Bevel Highlight & Side Shadow Edge
    g.fillStyle(0xffffff, 0.15);
    g.fillRect(-w/2 + 1, -h/2 + 1, w - 2, 4); 
    g.fillStyle(0x000000, 0.25);
    g.fillRect(w/2 - 5, -h/2 + 1, 4, h - 2); 

    return container;
  }

  getMaterialPhysicsProps(materialType) {
    if (materialType === 'steel') return { density: 0.08, friction: 0.85 };
    if (materialType === 'concrete') return { density: 0.06, friction: 0.80 };
    if (materialType === 'brick') return { density: 0.05, friction: 0.70 };
    if (materialType === 'wood') return { density: 0.025, friction: 0.50 };
    if (materialType === 'base' || materialType === 'foundation') return { density: 0.12, friction: 0.95 };
    return { density: 0.03, friction: 0.60 };
  }

  removeBlockAt(row, col, options = {}) {
    const { pruneUnsupported = true, recalcLevel = true } = options;
    if (!this.gridBlocks[row]) return;
    const blockData = this.gridBlocks[row][col];
    if (!blockData) return;

    if (blockData.gameObj) {
      if (blockData.gameObj.body && this.matter && this.matter.world) {
        this.matter.world.remove(blockData.gameObj.body);
        const idx = this.structureParts.indexOf(blockData.gameObj.body);
        if (idx !== -1) this.structureParts.splice(idx, 1);
      }
      blockData.gameObj.destroy();
    }

    this.gridBlocks[row][col] = null;
    if (pruneUnsupported) this.removeUnsupportedBlocks();
    if (recalcLevel) this.recalculateActiveLevel();
    this.updateLevelAndBlockCount();
  }

  clearAllPlacedBlocks() {
    for (let r = 0; r < this.GRID_ROWS; r++) {
      for (let c = 0; c < this.GRID_COLS; c++) {
        if (this.gridBlocks[r] && this.gridBlocks[r][c]) {
          this.removeBlockAt(r, c);
        }
      }
    }
    this.resetGridArray();
    this.activeLevel = 1;
    this.initFoundationRow();
    this.drawVoxelGridPlatform(this.scale.width, this.scale.height);
    this.updateLevelAndBlockCount();
  }

  removeUnsupportedBlocks() {
    for (let r = 1; r < this.GRID_ROWS; r++) {
      for (let c = 0; c < this.GRID_COLS; c++) {
        const block = this.gridBlocks[r] ? this.gridBlocks[r][c] : null;
        const supported = this.gridBlocks[r - 1] && this.gridBlocks[r - 1][c];
        if (block && !supported) {
          if (block.gameObj) {
            if (block.gameObj.body && this.matter && this.matter.world) {
              this.matter.world.remove(block.gameObj.body);
              const idx = this.structureParts.indexOf(block.gameObj.body);
              if (idx !== -1) this.structureParts.splice(idx, 1);
            }
            block.gameObj.destroy();
          }
          this.gridBlocks[r][c] = null;
        }
      }
    }
  }

  recalculateActiveLevel() {
    for (let r = 1; r < this.GRID_ROWS; r++) {
      const levelBlocks = this.gridBlocks[r].filter(Boolean).length;
      if (levelBlocks < LEVEL_COMPLETE_BLOCKS) {
        this.activeLevel = r;
        this.drawVoxelGridPlatform(this.scale.width, this.scale.height);
        return;
      }
    }
    this.activeLevel = this.GRID_ROWS - 1;
    this.drawVoxelGridPlatform(this.scale.width, this.scale.height);
  }

  updateLevelAndBlockCount() {
    let maxRow = -1;
    let count = 0;

    for (let r = 0; r < this.GRID_ROWS; r++) {
      for (let c = 0; c < this.GRID_COLS; c++) {
        if (this.gridBlocks[r] && this.gridBlocks[r][c] !== null) {
          count++;
          if (r > maxRow) maxRow = r;
        }
      }
    }

    const currentLvl = maxRow >= 0 ? maxRow + 1 : 0;
    if (this.levelBadgeText && this.levelBadgeText.active) {
      const shownLevel = Math.min(this.GRID_ROWS, Math.max(currentLvl, this.activeLevel + 1));
      this.levelBadgeText.setText(`BUILD LEVEL: ${shownLevel} / ${this.GRID_ROWS}  |  BLOCKS: ${count}`);
    }
  }

  maybeAdvanceActiveLevel(row) {
    if (row !== this.activeLevel || this.activeLevel >= this.GRID_ROWS - 1) return;
    const levelBlocks = this.gridBlocks[row].filter(Boolean).length;
    if (levelBlocks < LEVEL_COMPLETE_BLOCKS) return;

    this.activeLevel += 1;
    this.drawVoxelGridPlatform(this.scale.width, this.scale.height);
    this.updateLevelAndBlockCount();
    this.showLevelCompleteToast();
  }

  showLevelCompleteToast() {
    if (!this.levelToast || !this.levelToast.active) return;
    this.tweens.killTweensOf(this.levelToast);
    this.levelToast.setText(`LEVEL ${this.activeLevel} UNLOCKED`);
    this.levelToast.setAlpha(0);
    this.tweens.add({
      targets: this.levelToast,
      alpha: { from: 0, to: 1 },
      yoyo: true,
      hold: 650,
      duration: 220,
      ease: 'Sine.easeOut',
    });
  }

  updateConfig(newConfig) {
    const previousFoundation = this.config?.foundation;
    this.config = newConfig;
    if (previousFoundation && previousFoundation !== newConfig?.foundation) {
      this.refreshFoundationRow();
    }
  }

  handleResize(gameSize) {
    const w = gameSize.width;
    const h = gameSize.height;
    const groundY = h - 22;

    this.gridOriginX = w / 2 - (this.GRID_COLS * this.CELL_WIDTH) / 2;
    this.gridOriginY = groundY - 20;

    if (this.groundBody && this.matter && this.matter.body) {
      this.matter.body.setPosition(this.groundBody, { x: w / 2, y: groundY });
    }
    if (this.magText && this.magText.active) this.magText.setPosition(w / 2, 70);

    this.drawVoxelGridPlatform(w, h);
    this.repositionBlocksToGrid();
  }

  refreshFoundationRow() {
    for (let c = 0; c < this.GRID_COLS; c++) {
      if (this.gridBlocks[0] && this.gridBlocks[0][c]) {
        this.removeBlockAt(0, c, { pruneUnsupported: false, recalcLevel: false });
      }
      this.placeBlockAt(0, c, 'base');
    }
    this.recalculateActiveLevel();
  }

  repositionBlocksToGrid() {
    for (let r = 0; r < this.GRID_ROWS; r++) {
      for (let c = 0; c < this.GRID_COLS; c++) {
        const block = this.gridBlocks[r] ? this.gridBlocks[r][c] : null;
        if (block && block.gameObj) {
          block.baseX = this.gridOriginX + c * this.CELL_WIDTH + this.CELL_WIDTH / 2;
          block.baseY = this.gridOriginY - (r + 1) * this.CELL_HEIGHT + this.CELL_HEIGHT / 2;
          block.gameObj.setPosition(block.baseX, block.baseY);
        }
      }
    }
  }

  triggerEarthquake() {
    if (this.isShaking) return;
    this.isShaking = true;
    this.shakeTimer = 0;
    this.maxStressRatio = 0;
    this.resetBlocksToGrid();

    const magLevel = this.config?.magnitude ? Number(this.config.magnitude) : 6.5;
    const durationMs = 6000;
    
    if (this.magText && this.magText.active) {
      this.magText.setText(`MAGNITUDE ${magLevel}`).setAlpha(1);
    }
    if (this.dustEmitter) this.dustEmitter.start();
    
    this.cameras.main.shake(durationMs, 0.00045 * Math.pow(magLevel - 3, 1.25));

    this.events.on('update', this.shakeUpdate, this);

    this.time.delayedCall(durationMs, () => {
      this.isShaking = false;
      this.events.off('update', this.shakeUpdate, this);
      if (this.dustEmitter) this.dustEmitter.stop();
      if (this.magText && this.magText.active) this.magText.setAlpha(0);
      this.settleBlocksToGrid();
      
      this.time.delayedCall(900, () => {
        const survived = this.evaluateSurvival();
        if (this.config?.onSimulationComplete) {
          this.config.onSimulationComplete(survived);
        }
      });
    });
  }

  evaluateSurvival() {
    const magLevel = this.config?.magnitude ? Number(this.config.magnitude) : 6.5;
    let strength = 35;

    const foundationStrength = { weak: 5, normal: 14, strong: 24 };
    const materialStrength = { wood: 3, brick: 6, concrete: 9, steel: 13, base: 16, roof: 4 };
    const pillarBonus = { wood: 3, concrete: 8, steel: 13 };
    const roofPenalty = { flat: 2, sloped: 0, heavy: 8 };

    strength += foundationStrength[this.config?.foundation] ?? 10;
    strength += pillarBonus[this.config?.pillars] ?? 6;
    strength -= roofPenalty[this.config?.roof] ?? 2;

    for (let r = 0; r < this.GRID_ROWS; r++) {
      for (let c = 0; c < this.GRID_COLS; c++) {
        const block = this.gridBlocks[r] ? this.gridBlocks[r][c] : null;
        if (block) {
          strength += (materialStrength[block.material] ?? 4) / (r + 1);
        }
      }
    }

    const demand = 16 + Math.pow(magLevel - 3.5, 2) * 5.2 + this.maxStressRatio * 30;
    return strength >= demand;
  }

  shakeUpdate(time, delta) {
    if (!this.isShaking || !this.config?.magnitude) return;

    this.shakeTimer += delta;
    
    const durationMs = 6000;
    const magLevel = Number(this.config.magnitude);
    const magScale = Math.max(0.25, Math.pow(magLevel - 3.5, 1.35));
    const progress = Math.min(1, this.shakeTimer / durationMs);
    const rampIn = Math.min(1, progress * 4);
    const rampOut = Math.min(1, (1 - progress) * 5);
    const envelope = Math.sin(progress * Math.PI) * Math.min(rampIn, rampOut);
    const frequency = 0.012 + magLevel * 0.0009;
    const baseAmplitude = magScale * envelope;
    
    let currentMaxAngle = 0;

    for (let r = 0; r < this.GRID_ROWS; r++) {
      for (let c = 0; c < this.GRID_COLS; c++) {
        const block = this.gridBlocks[r] ? this.gridBlocks[r][c] : null;
        if (block && block.gameObj) {
          const container = block.gameObj;
          
          const heightMult = (r + 1) * 0.42;
          const swayX = Math.sin(this.shakeTimer * frequency + r * 0.35 + c * 0.08) * baseAmplitude * heightMult;
          const swayY = Math.cos(this.shakeTimer * frequency * 1.4 + c * 0.2) * baseAmplitude * 0.08 * r;
          const angleSway = Math.sin(this.shakeTimer * frequency * 0.75 + r * 0.1) * 0.006 * heightMult * magScale * envelope;

          container.x = block.baseX + swayX;
          container.y = block.baseY + swayY;
          container.rotation = angleSway;

          const absAngle = Math.abs(angleSway);
          if (absAngle > currentMaxAngle) currentMaxAngle = absAngle;
        }
      }
    }

    if (this.stressBarFill && this.stressBarFill.active) {
      const stressRatio = Math.min(1, currentMaxAngle / 0.15);
      this.maxStressRatio = Math.max(this.maxStressRatio, stressRatio);
      this.stressBarFill.width = 180 * stressRatio;
      const stressColor = stressRatio > 0.8 ? 0xef4444 : stressRatio > 0.5 ? 0xf59e0b : 0x10b981;
      this.stressBarFill.fillColor = stressColor;
    }
  }

  resetBlocksToGrid() {
    for (let r = 0; r < this.GRID_ROWS; r++) {
      for (let c = 0; c < this.GRID_COLS; c++) {
        const block = this.gridBlocks[r] ? this.gridBlocks[r][c] : null;
        if (block && block.gameObj) {
          this.tweens.killTweensOf(block.gameObj);
          block.gameObj.setPosition(block.baseX, block.baseY);
          block.gameObj.setRotation(0);
        }
      }
    }
  }

  settleBlocksToGrid() {
    for (let r = 0; r < this.GRID_ROWS; r++) {
      for (let c = 0; c < this.GRID_COLS; c++) {
        const block = this.gridBlocks[r] ? this.gridBlocks[r][c] : null;
        if (block && block.gameObj) {
          this.tweens.add({
            targets: block.gameObj,
            x: block.baseX,
            y: block.baseY,
            rotation: 0,
            duration: 550,
            ease: 'Sine.easeOut',
          });
        }
      }
    }
  }
}

export function initPhaser(containerId) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    scale: {
       mode: Phaser.Scale.RESIZE,
       parent: containerId,
       width: '100%',
       height: '100%'
    },
    backgroundColor: 'transparent',
    audio: {
      noAudio: true
    },
    physics: {
      default: 'matter',
      matter: {
        gravity: { x: 0, y: 0 },
        debug: false
      }
    },
    scene: [EarthquakeScene]
  });
}

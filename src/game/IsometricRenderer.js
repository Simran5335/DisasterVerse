// Advanced 3D Voxel Engine & Camera Renderer for River Defender Rebuild
import { DEFENSES_DATA } from '../data/defenses.js';

export class IsometricRenderer {
  constructor(canvas, grid) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.grid = grid;

    this.tileWidth = 60;
    this.tileHeight = 30;
    this.blockHeightScale = 9;

    this.cameraOffsetX = canvas.width / 2;
    this.cameraOffsetY = 120;
    this.zoom = 1.1;

    // Smooth camera focus panning & lerp
    this.targetCameraX = this.cameraOffsetX;
    this.targetCameraY = this.cameraOffsetY;

    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;

    this.animTime = 0;
    this.floatingTexts = [];
    this.vehicles = [];
    this.rainParticles = [];

    this.initVehicles();
    this.initRain();
    this.bindMousePan();
  }

  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    if (this.targetCameraX === this.cameraOffsetX) {
      this.cameraOffsetX = width / 2;
      this.targetCameraX = width / 2;
    }
  }

  bindMousePan() {
    const canvas = this.canvas;
    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0 && !e.shiftKey) {
        this.isDragging = true;
        this.dragStartX = e.clientX - this.targetCameraX;
        this.dragStartY = e.clientY - this.targetCameraY;
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        this.targetCameraX = e.clientX - this.dragStartX;
        this.targetCameraY = e.clientY - this.dragStartY;
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        this.zoomIn();
      } else {
        this.zoomOut();
      }
    }, { passive: false });
  }

  zoomIn() {
    this.zoom = Math.min(1.85, this.zoom + 0.12);
  }

  zoomOut() {
    this.zoom = Math.max(0.75, this.zoom - 0.12);
  }

  focusOnCell(col, row) {
    const pos = this.gridToScreenRaw(col, row, this.grid.getCell(col, row)?.height || 5);
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    this.targetCameraX = this.cameraOffsetX + (centerX - pos.x);
    this.targetCameraY = this.cameraOffsetY + (centerY - pos.y);
  }

  initVehicles() {
    this.vehicles = [];
    const evacRow = Math.floor(this.grid.rows / 2);
    for (let i = 0; i < 8; i++) {
      this.vehicles.push({
        id: `veh_${i}`,
        type: i === 0 ? 'ambulance' : (i === 1 ? 'fire_truck' : (i === 2 ? 'school_bus' : 'car')),
        col: 2 + i * 3,
        row: evacRow,
        speed: 0.5 + Math.random() * 0.4,
        color: i === 0 ? '#ef4444' : (i === 1 ? '#dc2626' : (i === 2 ? '#f59e0b' : '#3b82f6'))
      });
    }
  }

  initRain() {
    this.rainParticles = [];
    for (let i = 0; i < 240; i++) {
      this.rainParticles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        length: 14 + Math.random() * 18,
        speed: 22 + Math.random() * 14
      });
    }
  }

  addFloatingText(text, col, row, color = '#22c55e') {
    const pos = this.gridToScreen(col, row, this.grid.getCell(col, row) ? this.grid.getCell(col, row).height : 5);
    this.floatingTexts.push({
      text,
      x: pos.x,
      y: pos.y - 20,
      color,
      alpha: 1.0,
      life: 1.6
    });
  }

  gridToScreenRaw(col, row, height = 0) {
    const isoX = (col - row) * (this.tileWidth / 2) * this.zoom + this.cameraOffsetX;
    const isoY = (col + row) * (this.tileHeight / 2) * this.zoom + this.cameraOffsetY - (height * this.blockHeightScale * this.zoom);
    return { x: isoX, y: isoY };
  }

  gridToScreen(col, row, height = 0) {
    return this.gridToScreenRaw(col, row, height);
  }

  screenToGrid(screenX, screenY) {
    const adjX = (screenX - this.cameraOffsetX) / this.zoom;
    const adjY = (screenY - this.cameraOffsetY) / this.zoom;

    const col = Math.floor((adjX / (this.tileWidth / 2) + adjY / (this.tileHeight / 2)) / 2);
    const row = Math.floor((adjY / (this.tileHeight / 2) - adjX / (this.tileWidth / 2)) / 2);

    return { col, row };
  }

  render(dt, weatherStats, hoverCell, selectedDefense) {
    this.animTime += dt;
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Smooth camera lerp
    this.cameraOffsetX += (this.targetCameraX - this.cameraOffsetX) * dt * 4.5;
    this.cameraOffsetY += (this.targetCameraY - this.cameraOffsetY) * dt * 4.5;

    // Rich Environment Sky Gradient
    let skyGradient = ctx.createLinearGradient(0, 0, 0, height);
    if (weatherStats.phase === 'NORMAL') {
      skyGradient.addColorStop(0, '#1e293b');
      skyGradient.addColorStop(0.5, '#0f172a');
      skyGradient.addColorStop(1, '#020617');
    } else if (weatherStats.phase === 'HEAVY_RAIN') {
      skyGradient.addColorStop(0, '#334155');
      skyGradient.addColorStop(1, '#0f172a');
    } else {
      skyGradient.addColorStop(0, '#1e1b4b');
      skyGradient.addColorStop(1, '#020617');
    }
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);

    // Lightning Flash Overlay
    if (weatherStats.isLightning) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.fillRect(0, 0, width, height);
    }

    // Depth Sorting (col + row)
    const sortedCells = [];
    for (let r = 0; r < this.grid.rows; r++) {
      for (let c = 0; c < this.grid.cols; c++) {
        sortedCells.push(this.grid.cells[r][c]);
      }
    }
    sortedCells.sort((a, b) => (a.x + a.y) - (b.x + b.y));

    // 1. Render Natural 3D Voxel Terrain (No harsh technical grid lines)
    for (let cell of sortedCells) {
      this.renderVoxelCell(cell);
    }

    // 2. Render Upstream Dam Wall at Top-Left
    this.renderUpstreamDam();

    // 3. Render Zone & Building Labels
    this.renderZoneLabels();

    // 4. Render City Vehicles
    this.renderVehicles(dt);

    // 5. Render Interactive Hover Ghost Placement Grid
    if (hoverCell) {
      this.renderHoverPreview(hoverCell, selectedDefense);
    }

    // 6. Render Floating Text Popups (+XP / Status)
    this.renderFloatingTexts(dt);

    // 7. Render Weather Rain Particles
    this.renderWeatherOverlay(weatherStats, dt);
  }

  renderVoxelCell(cell) {
    const ctx = this.ctx;
    const pos = this.gridToScreen(cell.x, cell.y, cell.height);
    const tw = this.tileWidth * this.zoom;
    const th = this.tileHeight * this.zoom;
    const bh = cell.height * this.blockHeightScale * this.zoom;

    // Stylized Voxel Top & Side Colors
    let topColor = '#3f6212'; // Lush grass top
    let sideLeftColor = '#273812';
    let sideRightColor = '#1e290f';

    if (cell.isRiver) {
      topColor = '#1d4ed8'; // River channel bed
      sideLeftColor = '#1e40af';
      sideRightColor = '#1e3a8a';
    } else if (cell.isEvacRoad) {
      topColor = '#334155'; // Asphalt road
      sideLeftColor = '#1e293b';
      sideRightColor = '#0f172a';
    } else if (cell.height <= 3) {
      topColor = '#65a30d'; // Low-lying grass
      sideLeftColor = '#4d7c0f';
      sideRightColor = '#3f6212';
    } else if (cell.height >= 8) {
      topColor = '#15803d'; // High elevation hill
      sideLeftColor = '#166534';
      sideRightColor = '#14532d';
    }

    // Risk Zone Tint
    if (cell.riskZone === 'EXTREME' && !cell.isRiver) {
      topColor = '#7f1d1d';
    } else if (cell.riskZone === 'HIGH' && !cell.isRiver) {
      topColor = '#9a3412';
    }

    // 1. Top Diamond Face (Seamless natural grass surface)
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(pos.x + tw / 2, pos.y + th / 2);
    ctx.lineTo(pos.x, pos.y + th);
    ctx.lineTo(pos.x - tw / 2, pos.y + th / 2);
    ctx.closePath();
    ctx.fillStyle = topColor;
    ctx.fill();

    // 2. Front 3D Voxel Side Faces
    if (bh > 0) {
      // Left Side Face
      ctx.beginPath();
      ctx.moveTo(pos.x - tw / 2, pos.y + th / 2);
      ctx.lineTo(pos.x, pos.y + th);
      ctx.lineTo(pos.x, pos.y + th + bh);
      ctx.lineTo(pos.x - tw / 2, pos.y + th / 2 + bh);
      ctx.closePath();
      ctx.fillStyle = sideLeftColor;
      ctx.fill();

      // Right Side Face
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y + th);
      ctx.lineTo(pos.x + tw / 2, pos.y + th / 2);
      ctx.lineTo(pos.x + tw / 2, pos.y + th / 2 + bh);
      ctx.lineTo(pos.x, pos.y + th + bh);
      ctx.closePath();
      ctx.fillStyle = sideRightColor;
      ctx.fill();
    }

    // 3. Render Large Recognizable 3D Buildings
    if (cell.building) {
      this.renderStylizedBuilding(cell, pos, tw, th);
    }

    // 4. Render 3D Defenses
    if (cell.defense) {
      this.renderDefense(cell, pos, tw, th);
    }

    // 5. Render Fluid Water Layer & Flowing Direction Arrows
    if (cell.waterDepth > 0.05 || cell.isRiver) {
      this.renderFluidWater(cell, pos, tw, th);
    }
  }

  renderStylizedBuilding(cell, pos, tw, th) {
    const ctx = this.ctx;
    const bld = cell.building;
    const bScale = this.zoom;

    const bx = pos.x;
    const by = pos.y - 10 * bScale;

    ctx.save();

    if (bld.type === 'hospital') {
      // VERY LARGE Multi-Story 3D Hospital with Red Cross, Windows, and Helipad
      const hw = 24 * bScale;
      const hh = 42 * bScale;

      // Hospital Threat Glow Outline
      if (bld.status === 'THREATENED' || bld.status === 'DAMAGED') {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 4;
        ctx.strokeRect(bx - hw - 2, by - hh - 2, hw * 2 + 4, hh + 4);
      }

      // Main White Building Block
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(bx - hw, by - hh, hw * 2, hh);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bx - hw, by - hh, hw * 2, hh);

      // Blue Glass Windows
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(bx - 18 * bScale, by - 34 * bScale, 10 * bScale, 10 * bScale);
      ctx.fillRect(bx + 8 * bScale, by - 34 * bScale, 10 * bScale, 10 * bScale);
      ctx.fillRect(bx - 18 * bScale, by - 20 * bScale, 10 * bScale, 10 * bScale);
      ctx.fillRect(bx + 8 * bScale, by - 20 * bScale, 10 * bScale, 10 * bScale);

      // Red Cross Emblem
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(bx - 5 * bScale, by - hh - 12 * bScale, 10 * bScale, 10 * bScale);
      ctx.fillRect(bx - 10 * bScale, by - hh - 8 * bScale, 20 * bScale, 4 * bScale);

      // Helipad H on roof
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(bx, by - hh - 16 * bScale, 12 * bScale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.font = `bold ${12 * bScale}px sans-serif`;
      ctx.fillText('H', bx - 4 * bScale, by - hh - 12 * bScale);

    } else if (bld.type === 'school') {
      // LARGE 2-Story Yellow Schoolhouse with Clock Tower
      const sw = 20 * bScale;
      const sh = 32 * bScale;

      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(bx - sw, by - sh, sw * 2, sh);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(bx - 8 * bScale, by - sh - 12 * bScale, 16 * bScale, 12 * bScale); // Clock tower

      // Clock face
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(bx, by - sh - 6 * bScale, 4 * bScale, 0, Math.PI * 2);
      ctx.fill();

    } else if (bld.type === 'fire_station') {
      // LARGE Red Brick Fire Station with Garage Doors
      const fw = 20 * bScale;
      const fh = 28 * bScale;

      ctx.fillStyle = '#dc2626';
      ctx.fillRect(bx - fw, by - fh, fw * 2, fh);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(bx - 14 * bScale, by - 16 * bScale, 28 * bScale, 16 * bScale); // Garage Doors

    } else if (bld.type === 'emergency_center') {
      // LARGE Emergency Rescue Center
      const ew = 20 * bScale;
      const eh = 28 * bScale;

      ctx.fillStyle = '#0284c7';
      ctx.fillRect(bx - ew, by - eh, ew * 2, eh);
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(bx - 12 * bScale, by - 20 * bScale, 24 * bScale, 10 * bScale);

    } else if (bld.type === 'residential') {
      // Varied Voxel Cottages with Pitched Roofs
      const rw = 12 * bScale;
      const rh = (14 + (bld.floors || 1) * 4) * bScale;

      ctx.fillStyle = bld.roofColor || '#38bdf8';
      ctx.fillRect(bx - rw, by - rh, rw * 2, rh);

      // Pitched Roof
      ctx.beginPath();
      ctx.moveTo(bx - rw - 2 * bScale, by - rh);
      ctx.lineTo(bx, by - rh - 10 * bScale);
      ctx.lineTo(bx + rw + 2 * bScale, by - rh);
      ctx.closePath();
      ctx.fillStyle = '#b91c1c';
      ctx.fill();

    } else {
      // Pine Trees / Park
      ctx.font = `${20 * bScale}px sans-serif`;
      ctx.fillText('🌳', bx - 10, by - 4);
    }

    // Threat / Submerged Status Badge
    if (bld.status === 'DAMAGED' || bld.status === 'SUBMERGED') {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(bx + 14 * bScale, by - 32 * bScale, 9 * bScale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('⚠️', bx + 9 * bScale, by - 28 * bScale);
    }

    ctx.restore();
  }

  renderDefense(cell, pos, tw, th) {
    const ctx = this.ctx;
    const def = cell.defense;
    const meta = DEFENSES_DATA[def.type];
    if (!meta) return;

    const bScale = this.zoom;
    const scale = def.constructionProgress || 1.0;
    const dh = (meta.blockHeight * 9 + 16) * bScale * scale;

    ctx.save();
    if (def.type === 'flood_wall') {
      // 3D Concrete Wall Segment
      ctx.fillStyle = '#64748b';
      ctx.fillRect(pos.x - 15 * bScale, pos.y - dh, 30 * bScale, dh);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(pos.x - 15 * bScale, pos.y - dh, 30 * bScale, dh);

      // Top Wall Cap
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(pos.x - 17 * bScale, pos.y - dh - 3 * bScale, 34 * bScale, 4 * bScale);

    } else if (def.type === 'pump') {
      // Animated 3D Industrial Pump Station with Whirlpool Suction Effect
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y - 14 * bScale, 15 * bScale, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = `${20 * bScale}px sans-serif`;
      ctx.fillText('⚙️', pos.x - 10 * bScale, pos.y - 7 * bScale);

      // Active Water Suction Particles
      const ringSize = 8 + (this.animTime * 30) % 16;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y - 10 * bScale, ringSize, 0, Math.PI * 2);
      ctx.stroke();

    } else if (def.type === 'wetland') {
      ctx.font = `${22 * bScale}px sans-serif`;
      ctx.fillText('🌾', pos.x - 11, pos.y - 11);

    } else if (def.type === 'sandbag') {
      ctx.fillStyle = '#d97706';
      ctx.fillRect(pos.x - 14 * bScale, pos.y - 12 * bScale, 28 * bScale, 12 * bScale);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(pos.x - 12 * bScale, pos.y - 18 * bScale, 24 * bScale, 6 * bScale);

    } else {
      ctx.font = `${20 * bScale}px sans-serif`;
      ctx.fillText(meta.icon, pos.x - 10, pos.y - 10);
    }
    ctx.restore();
  }

  renderFluidWater(cell, pos, tw, th) {
    const ctx = this.ctx;
    const depth = cell.isRiver ? Math.max(14, cell.waterDepth) : cell.waterDepth;
    const wHeight = Math.min(36, depth * 0.9) * this.zoom;
    const wy = pos.y - wHeight;

    let waterColor = 'rgba(56, 189, 248, 0.65)'; // Bright cyan
    if (depth > 22) {
      waterColor = 'rgba(29, 78, 216, 0.85)'; // Deep storm navy
    } else if (depth > 10) {
      waterColor = 'rgba(2, 132, 199, 0.75)';
    }

    ctx.beginPath();
    ctx.moveTo(pos.x, wy);
    ctx.lineTo(pos.x + tw / 2, wy + th / 2);
    ctx.lineTo(pos.x, wy + th);
    ctx.lineTo(pos.x - tw / 2, wy + th / 2);
    ctx.closePath();
    ctx.fillStyle = waterColor;
    ctx.fill();

    // Flowing Direction Arrows (>>>) along River Channel
    if (cell.isRiver || depth > 5) {
      const arrowOffset = (this.animTime * 50) % 24;
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('❯❯', pos.x - 6 + (arrowOffset % 12), wy + th / 2 + 2);
      ctx.restore();
    }
  }

  renderUpstreamDam() {
    const ctx = this.ctx;
    const pos = this.gridToScreen(2, 2, 8);
    const bScale = this.zoom;

    ctx.save();
    // Concrete Dam Wall Structure
    ctx.fillStyle = '#475569';
    ctx.fillRect(pos.x - 34 * bScale, pos.y - 50 * bScale, 68 * bScale, 34 * bScale);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.strokeRect(pos.x - 34 * bScale, pos.y - 50 * bScale, 68 * bScale, 34 * bScale);

    // Sluice Gate Spillways
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(pos.x - 22 * bScale, pos.y - 34 * bScale, 12 * bScale, 22 * bScale);
    ctx.fillRect(pos.x + 10 * bScale, pos.y - 34 * bScale, 12 * bScale, 22 * bScale);
    ctx.restore();
  }

  renderZoneLabels() {
    const ctx = this.ctx;
    const labels = [
      { text: 'UPSTREAM DAM', col: 2, row: 2, height: 9 },
      { text: 'HOSPITAL', col: 14, row: 11, height: 7 },
      { text: 'SCHOOL', col: 12, row: 17, height: 6 },
      { text: 'FIRE STATION', col: 18, row: 18, height: 6 },
      { text: 'EMERGENCY CENTER', col: 20, row: 10, height: 6 },
      { text: 'RESIDENTIAL AREA', col: 22, row: 6, height: 6 },
      { text: 'LOW-LYING AREA', col: 8, row: 16, height: 3, alert: true },
      { text: 'WETLAND', col: 12, row: 22, height: 4 }
    ];

    for (let l of labels) {
      const pos = this.gridToScreen(l.col, l.row, l.height);
      ctx.save();
      ctx.font = 'bold 10px sans-serif';
      const textWidth = ctx.measureText(l.text).width;

      // Dark Badge Background
      ctx.fillStyle = l.alert ? 'rgba(220, 38, 38, 0.85)' : 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(pos.x - textWidth / 2 - 6, pos.y - 46, textWidth + 12, 18);
      ctx.strokeStyle = l.alert ? '#ef4444' : '#38bdf8';
      ctx.lineWidth = 1;
      ctx.strokeRect(pos.x - textWidth / 2 - 6, pos.y - 46, textWidth + 12, 18);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(l.text, pos.x - textWidth / 2, pos.y - 33);
      ctx.restore();
    }
  }

  renderVehicles(dt) {
    const ctx = this.ctx;
    for (let v of this.vehicles) {
      v.col += dt * v.speed;
      if (v.col >= this.grid.cols - 2) v.col = 2;

      const pos = this.gridToScreen(v.col, v.row, this.grid.getCell(Math.floor(v.col), v.row)?.height || 5);
      ctx.fillStyle = v.color;
      ctx.fillRect(pos.x - 7, pos.y - 9, 14, 8);

      if (v.type === 'ambulance') {
        const flash = Math.floor(this.animTime * 10) % 2 === 0;
        ctx.fillStyle = flash ? '#ef4444' : '#3b82f6';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y - 11, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  renderHoverPreview(hoverCell, selectedDefense) {
    if (!hoverCell) return;
    const ctx = this.ctx;
    const pos = this.gridToScreen(hoverCell.x, hoverCell.y, hoverCell.height);
    const tw = this.tileWidth * this.zoom;
    const th = this.tileHeight * this.zoom;

    const isValid = !hoverCell.isRiver && !hoverCell.defense;

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(pos.x + tw / 2, pos.y + th / 2);
    ctx.lineTo(pos.x, pos.y + th);
    ctx.lineTo(pos.x - tw / 2, pos.y + th / 2);
    ctx.closePath();

    ctx.fillStyle = isValid ? 'rgba(34, 197, 94, 0.45)' : 'rgba(239, 68, 68, 0.45)';
    ctx.fill();
    ctx.strokeStyle = isValid ? '#22c55e' : '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    if (isValid && selectedDefense) {
      const meta = DEFENSES_DATA[selectedDefense];
      if (meta) {
        ctx.font = `${22 * this.zoom}px sans-serif`;
        ctx.fillText(meta.icon, pos.x - 11, pos.y - 15);
      }
    }
  }

  renderFloatingTexts(dt) {
    const ctx = this.ctx;
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      ft.y -= dt * 24;
      ft.alpha = Math.max(0, ft.life / 1.6);

      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.font = 'bold 15px sans-serif';
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = ft.alpha;
      ctx.fillText(ft.text, ft.x - 26, ft.y);
      ctx.restore();
    }
  }

  renderWeatherOverlay(weatherStats, dt) {
    const ctx = this.ctx;
    if (weatherStats.phase === 'NORMAL') return;

    ctx.strokeStyle = 'rgba(186, 230, 253, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let p of this.rainParticles) {
      p.y += p.speed;
      p.x -= (weatherStats.windSpeed / 7);
      if (p.y > this.canvas.height) {
        p.y = -20;
        p.x = Math.random() * this.canvas.width;
      }
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - 5, p.y + p.length);
    }
    ctx.stroke();
  }
}

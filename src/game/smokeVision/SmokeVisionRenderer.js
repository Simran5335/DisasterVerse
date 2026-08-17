// Enhanced 3D Renderer for Smoke Vision (Kid-Friendly 3D Fire Escape)
import { SMOKE_LEVELS } from './SmokeEngine.js';

export class SmokeVisionRenderer {
  constructor(canvas, layout) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.layout = layout;

    this.tileScale = 40;
    this.cameraX = 0;
    this.cameraZ = 0;
    this.zoom = 1.1;

    // Floating smoke particles for atmospheric 3D effect
    this.smokeParticles = Array.from({ length: 45 }, () => ({
      x: Math.random() * 26,
      z: Math.random() * 22,
      size: Math.random() * 18 + 12,
      alpha: Math.random() * 0.4 + 0.1,
      speedX: (Math.random() - 0.5) * 0.4,
      speedZ: (Math.random() - 0.5) * 0.4
    }));
  }

  resize(w, h) {
    this.canvas.width = w;
    this.canvas.height = h;
  }

  worldToScreen(x, z) {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    const isoX = (x - z) * (this.tileScale / 2) * this.zoom + cx - this.cameraX;
    const isoY = (x + z) * (this.tileScale / 4) * this.zoom + cy - this.cameraZ;
    return { x: isoX, y: isoY };
  }

  render(player, smokeEngine, fireEngine, dt, activeTarget) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Smooth follow camera
    const pPos = this.worldToScreen(player.x, player.z);
    this.cameraX += (pPos.x - w / 2) * dt * 5.0;
    this.cameraZ += (pPos.y - h / 2) * dt * 5.0;

    // Dark Building Atmosphere
    ctx.fillStyle = '#070a12';
    ctx.fillRect(0, 0, w, h);

    const currentSmoke = smokeEngine.getSmokeAt(player.x, player.z);
    const visRadius = smokeEngine.getVisibilityRadius(currentSmoke, player.flashlightOn, player.batteryPct);

    // 1. Render 3D Rooms, Floors & Walls
    for (let room of this.layout.rooms) {
      this.renderRoom(room, player, visRadius);
    }

    // 2. Render Doors with 3D Frames & Heat Indicators
    for (let door of this.layout.doors) {
      this.renderDoor(door, player, fireEngine, visRadius);
    }

    // 3. Render Green Illuminated Emergency Exit Signs
    for (let exit of this.layout.exits) {
      this.renderExitSign(exit, player, visRadius);
    }

    // 4. Render NPCs
    for (let npc of this.layout.npcs) {
      this.renderNPC(npc, player, visRadius);
    }

    // 5. Render 3D Flashlight Beam
    if (player.flashlightOn && player.batteryPct > 0) {
      this.renderFlashlightBeam(player);
    }

    // 6. Render Child Player Character (Adjust height for crouch)
    this.renderPlayerCharacter(player);

    // 7. Render Floating 3D Volumetric Smoke Particles
    this.renderSmokeParticles(player, dt, currentSmoke);

    // 8. Volumetric Fog Gradient Mask
    this.renderVolumetricSmoke(player, visRadius);
  }

  renderRoom(room, player, visRadius) {
    const ctx = this.ctx;
    const b = room.bounds;

    const p1 = this.worldToScreen(b.x, b.z);
    const p2 = this.worldToScreen(b.x + b.w, b.z);
    const p3 = this.worldToScreen(b.x + b.w, b.z + b.d);
    const p4 = this.worldToScreen(b.x, b.z + b.d);

    const rx = b.x + b.w / 2;
    const rz = b.z + b.d / 2;
    const dist = Math.sqrt((player.x - rx) ** 2 + (player.z - rz) ** 2);

    if (dist > visRadius + 7) return;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.closePath();

    ctx.fillStyle = room.color || '#1e293b';
    ctx.globalAlpha = Math.max(0.25, 1.0 - (dist / visRadius) * 0.65);
    ctx.fill();

    // 3D Walls Grid Outline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Room Label
    const center = this.worldToScreen(rx, rz);
    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(room.name, center.x - 35, center.y);
    ctx.restore();
  }

  renderDoor(door, player, fireEngine, visRadius) {
    const ctx = this.ctx;
    const pos = this.worldToScreen(door.x, door.z);
    const dist = Math.sqrt((player.x - door.x) ** 2 + (player.z - door.z) ** 2);

    if (dist > visRadius) return;

    const tempState = fireEngine.checkDoorTemperature(door);
    let tempColor = '#38bdf8'; // 🔵 Cool
    if (tempState === 'WARM') tempColor = '#f59e0b'; // 🟡 Warm
    if (tempState === 'VERY_HOT') tempColor = '#ef4444'; // 🔴 Very Hot

    ctx.save();
    // 3D Door Frame
    ctx.fillStyle = '#334155';
    ctx.fillRect(pos.x - 10, pos.y - 24, 20, 24);

    // Door Handle & Temperature Circle
    ctx.fillStyle = tempColor;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y - 12, 7, 0, Math.PI * 2);
    ctx.fill();

    if (tempState === 'VERY_HOT') {
      // Heat Glow Particle Effect around door handle
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y - 12, 14, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText(door.label, pos.x - 24, pos.y - 28);

    // Prompt if player is nearby
    if (dist <= 2.2) {
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('✋ PRESS E TO CHECK', pos.x - 45, pos.y - 42);
    }
    ctx.restore();
  }

  renderExitSign(exit, player, visRadius) {
    const ctx = this.ctx;
    const pos = this.worldToScreen(exit.x, exit.z);
    const dist = Math.sqrt((player.x - exit.x) ** 2 + (player.z - exit.z) ** 2);

    if (dist > visRadius + 4) return;

    ctx.save();
    // Green Illuminated Box
    ctx.fillStyle = exit.isBlocked ? '#dc2626' : '#22c55e';
    ctx.fillRect(pos.x - 26, pos.y - 34, 52, 20);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(pos.x - 26, pos.y - 34, 52, 20);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(exit.isBlocked ? '❌ BLOCKED' : '🏃 EXIT →', pos.x - 22, pos.y - 20);
    ctx.restore();
  }

  renderNPC(npc, player, visRadius) {
    const ctx = this.ctx;
    const pos = this.worldToScreen(npc.x, npc.z);
    const dist = Math.sqrt((player.x - npc.x) ** 2 + (player.z - npc.z) ** 2);

    if (dist > visRadius) return;

    ctx.save();
    ctx.fillStyle = npc.status === 'RESCUED' ? '#22c55e' : '#a855f7';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y - 10, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(pos.x - 40, pos.y - 36, 80, 18);
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText(npc.status === 'RESCUED' ? '✓ SAFE!' : '🗣️ Help me!', pos.x - 28, pos.y - 24);
    ctx.restore();
  }

  renderFlashlightBeam(player) {
    const ctx = this.ctx;
    const pPos = this.worldToScreen(player.x, player.z);

    ctx.save();
    let angle = 0;
    if (player.dir === 'RIGHT') angle = 0;
    if (player.dir === 'DOWN') angle = Math.PI / 2;
    if (player.dir === 'LEFT') angle = Math.PI;
    if (player.dir === 'UP') angle = -Math.PI / 2;

    const beamGradient = ctx.createRadialGradient(
      pPos.x, pPos.y, 10,
      pPos.x + Math.cos(angle) * 140, pPos.y + Math.sin(angle) * 140, 120
    );
    beamGradient.addColorStop(0, 'rgba(254, 240, 138, 0.7)');
    beamGradient.addColorStop(1, 'rgba(254, 240, 138, 0.0)');

    ctx.beginPath();
    ctx.moveTo(pPos.x, pPos.y);
    ctx.arc(pPos.x, pPos.y, 150, angle - 0.45, angle + 0.45);
    ctx.closePath();
    ctx.fillStyle = beamGradient;
    ctx.fill();
    ctx.restore();
  }

  renderPlayerCharacter(player) {
    const ctx = this.ctx;
    const pos = this.worldToScreen(player.x, player.z);
    const pHeight = player.isCrouching ? 12 : 24;

    ctx.save();
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.ellipse(pos.x, pos.y + 2, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Red Backpack
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(pos.x - 10, pos.y - pHeight + 4, 6, 11);

    // Blue Uniform
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(pos.x - 6, pos.y - pHeight + 6, 12, pHeight - 6);

    // Head
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y - pHeight, 7, 0, Math.PI * 2);
    ctx.fill();

    if (player.isCrouching) {
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('🧎 CROUCHING', pos.x - 30, pos.y - pHeight - 12);
    }
    ctx.restore();
  }

  renderSmokeParticles(player, dt, currentSmoke) {
    if (currentSmoke === 'LOW') return;
    const ctx = this.ctx;

    this.smokeParticles.forEach((p) => {
      p.x += p.speedX * dt;
      p.z += p.speedZ * dt;

      if (p.x < 0 || p.x > 26) p.x = Math.random() * 26;
      if (p.z < 0 || p.z > 22) p.z = Math.random() * 22;

      const pos = this.worldToScreen(p.x, p.z);
      const dist = Math.sqrt((player.x - p.x) ** 2 + (player.z - p.z) ** 2);

      if (dist < 15) {
        ctx.save();
        ctx.fillStyle = 'rgba(148, 163, 184, 0.25)';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });
  }

  renderVolumetricSmoke(player, visRadius) {
    const ctx = this.ctx;
    const pPos = this.worldToScreen(player.x, player.z);

    const maskGradient = ctx.createRadialGradient(
      pPos.x, pPos.y, visRadius * 10,
      pPos.x, pPos.y, visRadius * 24
    );
    maskGradient.addColorStop(0, 'rgba(7, 10, 18, 0.0)');
    maskGradient.addColorStop(0.7, 'rgba(7, 10, 18, 0.8)');
    maskGradient.addColorStop(1, 'rgba(7, 10, 18, 0.99)');

    ctx.fillStyle = maskGradient;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

// 3D Canvas Isometric & 3rd Person Renderer for Smoke Vision
import { SMOKE_LEVELS } from './SmokeEngine.js';

export class SmokeVisionRenderer {
  constructor(canvas, layout) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.layout = layout;

    this.tileScale = 36;
    this.cameraX = 0;
    this.cameraZ = 0;
    this.zoom = 1.05;
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

    // Follow camera centering on child player position
    const pPos = this.worldToScreen(player.x, player.z);
    this.cameraX += (pPos.x - w / 2) * dt * 4.0;
    this.cameraZ += (pPos.y - h / 2) * dt * 4.0;

    // Dark Background Environment (Warm indoor lighting turned dark during smoke/fire)
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);

    const visibilityRadius = smokeEngine.getVisibilityRadius(
      smokeEngine.getSmokeAt(player.x, player.z),
      player.flashlightOn,
      player.batteryPct
    );

    // 1. Render 3D Rooms & Floors
    for (let room of this.layout.rooms) {
      this.renderRoom(room, player, visibilityRadius);
    }

    // 2. Render Doors (with Temperature Highlights)
    for (let door of this.layout.doors) {
      this.renderDoor(door, player, fireEngine, visibilityRadius);
    }

    // 3. Render Emergency Green Exit Signs (Glowing illuminated signs)
    for (let exit of this.layout.exits) {
      this.renderExitSign(exit, player, visibilityRadius);
    }

    // 4. Render NPCs needing help
    for (let npc of this.layout.npcs) {
      this.renderNPC(npc, player, visibilityRadius);
    }

    // 5. Render Handheld Flashlight Cone Beam
    if (player.flashlightOn && player.batteryPct > 0) {
      this.renderFlashlightBeam(player);
    }

    // 6. Render Child Character with Backpack & Crouching State
    this.renderPlayerCharacter(player);

    // 7. Render 3D Volumetric Smoke Haze Layer
    this.renderVolumetricSmoke(player, smokeEngine, visibilityRadius);
  }

  renderRoom(room, player, visRadius) {
    const ctx = this.ctx;
    const b = room.bounds;

    const p1 = this.worldToScreen(b.x, b.z);
    const p2 = this.worldToScreen(b.x + b.w, b.z);
    const p3 = this.worldToScreen(b.x + b.w, b.z + b.d);
    const p4 = this.worldToScreen(b.x, b.z + b.d);

    // Calculate distance to player for visibility mask
    const rx = b.x + b.w / 2;
    const rz = b.z + b.d / 2;
    const dist = Math.sqrt((player.x - rx) ** 2 + (player.z - rz) ** 2);

    if (dist > visRadius + 6) return; // Hide outside fog of war

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.closePath();

    ctx.fillStyle = room.color || '#1e293b';
    ctx.globalAlpha = Math.max(0.2, 1.0 - (dist / visRadius) * 0.7);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Room Name Label
    const center = this.worldToScreen(rx, rz);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(room.name, center.x - 30, center.y);
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
    ctx.fillStyle = '#475569';
    ctx.fillRect(pos.x - 8, pos.y - 20, 16, 20);

    // Door Handle & Temperature Indicator Ring
    ctx.fillStyle = tempColor;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y - 10, 6, 0, Math.PI * 2);
    ctx.fill();

    if (tempState === 'VERY_HOT') {
      // Red Heat Glow
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y - 10, 12, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText(door.label, pos.x - 22, pos.y - 24);
    ctx.restore();
  }

  renderExitSign(exit, player, visRadius) {
    const ctx = this.ctx;
    const pos = this.worldToScreen(exit.x, exit.z);
    const dist = Math.sqrt((player.x - exit.x) ** 2 + (player.z - exit.z) ** 2);

    if (dist > visRadius + 4) return;

    ctx.save();
    // Illuminated Green Exit Box
    ctx.fillStyle = exit.isBlocked ? '#dc2626' : '#22c55e';
    ctx.fillRect(pos.x - 24, pos.y - 32, 48, 18);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(pos.x - 24, pos.y - 32, 48, 18);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(exit.isBlocked ? '❌ BLOCKED' : '🏃 EXIT →', pos.x - 20, pos.y - 20);
    ctx.restore();
  }

  renderNPC(npc, player, visRadius) {
    const ctx = this.ctx;
    const pos = this.worldToScreen(npc.x, npc.y || npc.z);
    const dist = Math.sqrt((player.x - npc.x) ** 2 + (player.z - (npc.z || 0)) ** 2);

    if (dist > visRadius) return;

    ctx.save();
    // NPC Avatar Dot
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y - 8, 10, 0, Math.PI * 2);
    ctx.fill();

    // Call for help speech bubble
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(pos.x - 36, pos.y - 34, 72, 16);
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('🗣️ Help!', pos.x - 24, pos.y - 22);
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
      pPos.x + Math.cos(angle) * 120, pPos.y + Math.sin(angle) * 120, 110
    );
    beamGradient.addColorStop(0, 'rgba(254, 240, 138, 0.65)');
    beamGradient.addColorStop(1, 'rgba(254, 240, 138, 0.0)');

    ctx.beginPath();
    ctx.moveTo(pPos.x, pPos.y);
    ctx.arc(pPos.x, pPos.y, 140, angle - 0.45, angle + 0.45);
    ctx.closePath();
    ctx.fillStyle = beamGradient;
    ctx.fill();
    ctx.restore();
  }

  renderPlayerCharacter(player) {
    const ctx = this.ctx;
    const pos = this.worldToScreen(player.x, player.z);
    const pHeight = player.isCrouching ? 12 : 22;

    ctx.save();
    // Character Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(pos.x, pos.y + 2, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Backpack (Red)
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(pos.x - 9, pos.y - pHeight + 4, 6, 10);

    // Cute Child Character Body (Blue School Uniform)
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(pos.x - 6, pos.y - pHeight + 6, 12, pHeight - 6);

    // Head
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y - pHeight, 7, 0, Math.PI * 2);
    ctx.fill();

    // Crouching/Standing Indicator Text
    if (player.isCrouching) {
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('🧎 CROUCHING', pos.x - 30, pos.y - pHeight - 12);
    }
    ctx.restore();
  }

  renderVolumetricSmoke(player, smokeEngine, visRadius) {
    const ctx = this.ctx;
    const pPos = this.worldToScreen(player.x, player.z);

    // Radial Smoke Haze Fog of War Mask
    const maskGradient = ctx.createRadialGradient(
      pPos.x, pPos.y, visRadius * 10,
      pPos.x, pPos.y, visRadius * 22
    );
    maskGradient.addColorStop(0, 'rgba(15, 23, 42, 0.0)');
    maskGradient.addColorStop(0.7, 'rgba(15, 23, 42, 0.75)');
    maskGradient.addColorStop(1, 'rgba(15, 23, 42, 0.98)');

    ctx.fillStyle = maskGradient;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

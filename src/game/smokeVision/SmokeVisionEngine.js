// Core Game Engine for Smoke Vision
import { BuildingLayout } from './BuildingLayout.js';
import { SmokeEngine } from './SmokeEngine.js';
import { FireEngine } from './FireEngine.js';
import { soundEngine } from './SoundEngine.js';
import { awardXP } from '../../services/gamificationService.js';

export class SmokeVisionEngine {
  constructor() {
    this.layout = BuildingLayout.getLayout();
    this.smokeEngine = new SmokeEngine();
    this.fireEngine = new FireEngine();

    this.player = {
      x: 4,
      z: 4,
      dir: 'RIGHT',
      health: 100,
      maxHealth: 100,
      isCrouching: false,
      flashlightOn: true,
      batteryPct: 100,
      hasExtinguisher: false
    };

    this.timerSeconds = 0;
    this.isGameOver = false;
    this.isVictory = false;
    this.failReason = '';

    this.checkedDoors = new Set();
    this.helpedNPCs = new Set();
    this.routeHistory = [];
    this.userScoreXP = 0;
    this.decisionLogs = [];
    this.toastNotification = null; // { message, type: 'success'|'warning'|'xp' }
  }

  reset() {
    this.layout = BuildingLayout.getLayout();
    this.smokeEngine.reset();
    this.fireEngine.reset();

    this.player = {
      x: 4,
      z: 4,
      dir: 'RIGHT',
      health: 100,
      maxHealth: 100,
      isCrouching: false,
      flashlightOn: true,
      batteryPct: 100,
      hasExtinguisher: false
    };

    this.timerSeconds = 0;
    this.isGameOver = false;
    this.isVictory = false;
    this.failReason = '';

    this.checkedDoors.clear();
    this.helpedNPCs.clear();
    this.routeHistory = [{ x: 4, z: 4, t: 0, status: 'START' }];
    this.userScoreXP = 0;
    this.decisionLogs = [];
    this.toastNotification = null;
  }

  showToast(message, type = 'success') {
    this.toastNotification = { message, type, id: Date.now() };
  }

  movePlayer(dx, dz) {
    if (this.isGameOver) return;

    const newX = Math.max(1, Math.min(24, this.player.x + dx));
    const newZ = Math.max(1, Math.min(20, this.player.z + dz));

    if (dx > 0) this.player.dir = 'RIGHT';
    if (dx < 0) this.player.dir = 'LEFT';
    if (dz > 0) this.player.dir = 'DOWN';
    if (dz < 0) this.player.dir = 'UP';

    this.player.x = newX;
    this.player.z = newZ;

    soundEngine.playFootstep();
    this.routeHistory.push({ x: newX, z: newZ, t: this.timerSeconds, status: 'MOVE' });
  }

  toggleCrouch() {
    this.player.isCrouching = !this.player.isCrouching;
    if (this.player.isCrouching) {
      awardXP(30, 'CRAWL_THROUGH_SMOKE');
      this.userScoreXP += 30;
      this.decisionLogs.push('✓ Stayed low under smoke layer (+30 XP)');
      this.showToast('🧎 STAYING LOW IN SMOKE (+30 XP)', 'success');
    }
  }

  toggleFlashlight() {
    this.player.flashlightOn = !this.player.flashlightOn;
  }

  interact() {
    if (this.isGameOver) return null;

    const px = this.player.x;
    const pz = this.player.z;

    // 1. Check Door
    for (let door of this.layout.doors) {
      const dist = Math.sqrt((px - door.x) ** 2 + (pz - door.z) ** 2);
      if (dist <= 2.2) {
        const tempState = this.fireEngine.checkDoorTemperature(door);
        soundEngine.playDoorCheckSound(tempState);

        this.checkedDoors.add(door.id);
        if (tempState === 'COOL') {
          awardXP(40, 'CORRECTLY_CHECKED_DOOR');
          this.userScoreXP += 40;
          this.decisionLogs.push(`✓ Checked ${door.label}: COOL & SAFE (+40 XP)`);
          this.showToast(`🚪 CHECKED DOOR: SAFE (+40 XP)`, 'success');
        } else if (tempState === 'VERY_HOT') {
          this.userScoreXP += 40; // Rewarded for avoiding dangerous door!
          this.decisionLogs.push(`⚠️ Checked ${door.label}: VERY HOT! Avoided fire door (+40 XP)`);
          this.showToast(`🔴 VERY HOT DOOR! AVOID OPENING! (+40 XP)`, 'warning');
        }

        return { type: 'DOOR_CHECK', door, tempState };
      }
    }

    // 2. Check NPC
    for (let npc of this.layout.npcs) {
      const dist = Math.sqrt((px - npc.x) ** 2 + (pz - npc.z) ** 2);
      if (dist <= 2.5 && !this.helpedNPCs.has(npc.id)) {
        this.helpedNPCs.add(npc.id);
        npc.status = 'RESCUED';
        awardXP(50, 'HELP_NPC');
        this.userScoreXP += 50;
        this.decisionLogs.push(`✓ Rescued ${npc.name} (+50 XP)`);
        this.showToast(`🤝 RESCUED ${npc.name}! (+50 XP)`, 'success');
        return { type: 'NPC_HELP', npc };
      }
    }

    // 3. Check Exits
    for (let exit of this.layout.exits) {
      const dist = Math.sqrt((px - exit.x) ** 2 + (pz - exit.z) ** 2);
      if (dist <= 2.5) {
        if (exit.isBlocked) {
          awardXP(40, 'AVOIDED_BLOCKED_EXIT');
          this.userScoreXP += 40;
          this.decisionLogs.push(`❌ Avoided blocked exit ${exit.name} (+40 XP)`);
          this.showToast(`❌ BLOCKED EXIT! FIND ANOTHER ROUTE (+40 XP)`, 'warning');
          return { type: 'EXIT_BLOCKED', exit };
        } else {
          this.triggerVictory(exit);
          return { type: 'EVACUATION_SUCCESS', exit };
        }
      }
    }

    return null;
  }

  update(dt) {
    if (this.isGameOver) return;

    this.timerSeconds += dt;
    this.smokeEngine.update(dt, this.fireEngine.fireOrigin);
    this.fireEngine.update(dt);

    // Battery Drain
    if (this.player.flashlightOn && this.player.batteryPct > 0) {
      this.player.batteryPct = Math.max(0, this.player.batteryPct - dt * 0.8);
      if (Math.round(this.player.batteryPct) === 25) {
        this.showToast('🔋 FLASHLIGHT BATTERY LOW (25%)', 'warning');
      }
    }

    // Damage & Crouching Health System
    const currentSmoke = this.smokeEngine.getSmokeAt(this.player.x, this.player.z);
    const damageRate = this.smokeEngine.getDamageRate(currentSmoke, this.player.isCrouching);

    if (damageRate > 0) {
      this.player.health = Math.max(0, this.player.health - damageRate * dt);
      if (!this.player.isCrouching && currentSmoke !== 'LOW') {
        if (Math.floor(this.timerSeconds) % 5 === 0) {
          this.showToast('🧎 STAY LOW! PRESS C TO CROUCH UNDER SMOKE!', 'warning');
        }
      }

      if (this.player.health <= 0) {
        this.triggerDefeat('You spent too long in heavy smoke. Remember to stay low and find a safe exit.');
      }
    }
  }

  triggerVictory(exit) {
    this.isGameOver = true;
    this.isVictory = true;
    soundEngine.stopFireAlarm();

    awardXP(100, 'SAFE_EVACUATION_EXIT');
    this.userScoreXP += 100;
    this.decisionLogs.push(`🎉 Reached safe exit ${exit.name}! (+100 XP)`);
    this.showToast(`🎉 EVACUATION SUCCESSFUL! (+100 XP)`, 'success');
  }

  triggerDefeat(reason) {
    this.isGameOver = true;
    this.isVictory = false;
    this.failReason = reason;
    soundEngine.stopFireAlarm();
  }
}

// Core Game Engine & Logic for Smoke Vision
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
    this.routeHistory = []; // Tracks player (x,z) positions for 2D disaster replay
    this.userScoreXP = 0;
    this.decisionLogs = [];
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
    }
  }

  toggleFlashlight() {
    this.player.flashlightOn = !this.player.flashlightOn;
  }

  interact() {
    if (this.isGameOver) return null;

    const px = this.player.x;
    const pz = this.player.z;

    // 1. Check Nearby Door
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
        } else if (tempState === 'VERY_HOT') {
          this.decisionLogs.push(`⚠️ Checked ${door.label}: VERY HOT! Avoided opening fire door!`);
        }

        return { type: 'DOOR_CHECK', door, tempState };
      }
    }

    // 2. Check Nearby NPC
    for (let npc of this.layout.npcs) {
      const dist = Math.sqrt((px - npc.x) ** 2 + (pz - npc.z) ** 2);
      if (dist <= 2.5 && !this.helpedNPCs.has(npc.id)) {
        this.helpedNPCs.add(npc.id);
        npc.status = 'RESCUED';
        awardXP(50, 'HELP_NPC');
        this.userScoreXP += 50;
        this.decisionLogs.push(`✓ Rescued ${npc.name} (+50 XP)`);
        return { type: 'NPC_HELP', npc };
      }
    }

    // 3. Check Primary/Secondary Exits
    for (let exit of this.layout.exits) {
      const dist = Math.sqrt((px - exit.x) ** 2 + (pz - exit.z) ** 2);
      if (dist <= 2.5) {
        if (exit.isBlocked) {
          this.decisionLogs.push(`❌ Attempted blocked exit ${exit.name}`);
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

    // Flashlight Battery Drain
    if (this.player.flashlightOn && this.player.batteryPct > 0) {
      this.player.batteryPct = Math.max(0, this.player.batteryPct - dt * 0.8);
    }

    // Health Drain based on Smoke Exposure
    const currentSmoke = this.smokeEngine.getSmokeAt(this.player.x, this.player.z);
    const damageRate = this.smokeEngine.getDamageRate(currentSmoke, this.player.isCrouching);

    if (damageRate > 0) {
      this.player.health = Math.max(0, this.player.health - damageRate * dt);
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
  }

  triggerDefeat(reason) {
    this.isGameOver = true;
    this.isVictory = false;
    this.failReason = reason;
    soundEngine.stopFireAlarm();
  }
}

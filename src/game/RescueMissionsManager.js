import { RESCUE_MISSIONS } from '../data/missions.js';
import { soundManager } from './SoundManager.js';

export class RescueMissionsManager {
  constructor(defensesManager) {
    this.defensesManager = defensesManager;
    this.activeMission = null;
    this.completedCount = 0;
    this.missionTimer = 30; // seconds before mission triggers
    this.bonusScoreEarned = 0;
    this.bonusXPEarned = 0;
  }

  update(dt, isPrepPhase) {
    if (isPrepPhase || this.activeMission) return;

    this.missionTimer -= dt;
    if (this.missionTimer <= 0) {
      const available = RESCUE_MISSIONS[Math.floor(Math.random() * RESCUE_MISSIONS.length)];
      this.activeMission = { ...available, remainingTime: available.timeLimitSeconds };
      this.missionTimer = 40 + Math.random() * 20;
      soundManager.playSiren();
    }
  }

  acceptMission() {
    if (!this.activeMission) return false;
    if (this.defensesManager.budget < this.activeMission.cost) return false;

    this.defensesManager.budget -= this.activeMission.cost;
    this.bonusScoreEarned += this.activeMission.rewardScore;
    this.bonusXPEarned += this.activeMission.rewardXP;
    this.completedCount++;

    soundManager.playVictory();
    const result = { ...this.activeMission };
    this.activeMission = null;
    return result;
  }

  declineMission() {
    this.activeMission = null;
    soundManager.playClick();
  }
}

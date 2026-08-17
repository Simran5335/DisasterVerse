import { soundManager } from './SoundManager.js';

export class EmergencyEventsManager {
  constructor(simulation, defensesManager) {
    this.simulation = simulation;
    this.defensesManager = defensesManager;
    this.activeEvent = null;
    this.eventCooldown = 25; // seconds between events
    this.timer = 15; // first event triggers ~15s into flood
    this.completedEventsCount = 0;
  }

  update(dt, isPrepPhase) {
    if (isPrepPhase || this.activeEvent) return;

    this.timer -= dt;
    if (this.timer <= 0) {
      this.triggerRandomEvent();
      this.timer = this.eventCooldown + Math.random() * 15;
    }
  }

  triggerRandomEvent() {
    const events = [
      {
        id: 'blocked_drain',
        title: '⚠️ EMERGENCY: Blocked Drain Sector B',
        message: 'Debris has clogged drainage in Sector B. Water flow is backing up toward houses!',
        type: 'CHOICE',
        cost: 300,
        optionA: 'FIX DRAIN (₹300)',
        optionB: 'IGNORE RISK',
        onApprove: () => {
          this.defensesManager.budget -= 300;
          this.completedEventsCount++;
          soundManager.playClick();
        },
        onIgnore: () => {
          // Add surge to residential sector
          const cell = this.simulation.grid.getCell(10, 10);
          if (cell) cell.waterDepth += 25;
        }
      },
      {
        id: 'power_failure',
        title: '⚡ POWER FAILURE: Grid Blackout',
        message: 'Severe storm damage disabled the power grid! All water pumps are offline for 10 seconds.',
        type: 'NOTIFY',
        onAcknowledge: () => {
          this.simulation.setPumpStatus(false, 10);
          this.completedEventsCount++;
          soundManager.playSiren();
        }
      },
      {
        id: 'hospital_threat',
        title: '🚨 CRITICAL: Hospital Access Road Flooding',
        message: 'Water is surging near the general hospital entrance! Emergency ambulances are at risk of being blocked.',
        type: 'CHOICE',
        cost: 400,
        optionA: 'RUSH SANDBAG BUND (₹400)',
        optionB: 'RISK ACCESS',
        onApprove: () => {
          this.defensesManager.budget -= 400;
          const cell = this.simulation.grid.getCell(14, 10);
          if (cell) cell.waterDepth = Math.max(0, cell.waterDepth - 20);
          this.completedEventsCount++;
          soundManager.playPlacement('sandbag');
        },
        onIgnore: () => {}
      }
    ];

    const chosen = events[Math.floor(Math.random() * events.length)];
    this.activeEvent = chosen;
    soundManager.playSiren();
  }

  handleChoice(approved) {
    if (!this.activeEvent) return;
    if (approved) {
      this.activeEvent.onApprove && this.activeEvent.onApprove();
    } else {
      this.activeEvent.onIgnore && this.activeEvent.onIgnore();
    }
    if (this.activeEvent.onAcknowledge) {
      this.activeEvent.onAcknowledge();
    }
    this.activeEvent = null;
  }
}

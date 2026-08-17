// Training Mode Manager for River Defender
import { soundManager } from './SoundManager.js';

export const TRAINING_TASKS = [
  {
    id: 1,
    title: 'TASK 1: PLACE A FLOOD WALL',
    instruction: 'Select the Flood Wall (🛡️) from the toolbar and place it on the green highlight near the river.',
    targetDefense: 'flood_wall',
    targetCol: 4,
    targetRow: 6,
    check: (defenses) => defenses.some(d => d.type === 'flood_wall')
  },
  {
    id: 2,
    title: 'TASK 2: START FLOOD SIMULATION',
    instruction: 'Click the "🌊 START FLOOD NOW" button at the top to trigger heavy rainfall.',
    check: (defenses, isPrepPhase) => !isPrepPhase
  },
  {
    id: 3,
    title: 'TASK 3: OBSERVE WATER REDIRECTION',
    instruction: 'Watch the river surge hit your Flood Wall and redirect toward lower ground.',
    timerSeconds: 8,
    check: (defenses, isPrepPhase, elapsedTime) => elapsedTime >= 8
  },
  {
    id: 4,
    title: 'TASK 4: DEPLOY A PUMP STATION',
    instruction: 'Select the Pump (⚙️) and place it near the low-lying residential houses to extract water.',
    targetDefense: 'pump',
    check: (defenses) => defenses.some(d => d.type === 'pump')
  },
  {
    id: 5,
    title: 'TASK 5: DEPLOY A WETLAND RESERVE',
    instruction: 'Select the Wetland (🌿) and place it in the open park zone to absorb excess flood volume.',
    targetDefense: 'wetland',
    check: (defenses) => defenses.some(d => d.type === 'wetland')
  },
  {
    id: 6,
    title: 'TASK 6: SURVIVE FLOOD PEAK',
    instruction: 'Keep the City General Hospital safe until the flood clears!',
    timerSeconds: 15,
    check: (defenses, isPrepPhase, elapsedTime) => elapsedTime >= 25
  }
];

export class TrainingModeManager {
  constructor() {
    this.currentTaskIdx = 0;
    this.elapsedTime = 0;
    this.isTrainingComplete = false;
  }

  getCurrentTask() {
    return TRAINING_TASKS[this.currentTaskIdx] || null;
  }

  update(dt, defenses, isPrepPhase) {
    if (this.isTrainingComplete) return;

    this.elapsedTime += dt;
    const task = this.getCurrentTask();
    if (!task) return;

    if (task.check(defenses, isPrepPhase, this.elapsedTime)) {
      soundManager.playVictory();
      this.currentTaskIdx++;
      if (this.currentTaskIdx >= TRAINING_TASKS.length) {
        this.isTrainingComplete = true;
      }
    }
  }
}

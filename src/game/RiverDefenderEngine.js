// Central Game Engine & State Manager for River Defender Rebuild
import { WaterGrid } from './WaterGrid.js';
import { BuildingsManager } from './BuildingsManager.js';
import { DefensesManager } from './DefensesManager.js';
import { FloodSimulation } from './FloodSimulation.js';
import { WeatherSystem } from './WeatherSystem.js';
import { EmergencyEventsManager } from './EmergencyEventsManager.js';
import { RescueMissionsManager } from './RescueMissionsManager.js';
import { ComboSystem } from './ComboSystem.js';
import { ScoringEngine } from './ScoringEngine.js';
import { soundManager } from './SoundManager.js';

export class RiverDefenderEngine {
  constructor(scenario = null) {
    this.scenario = scenario;
    this.grid = new WaterGrid(28, 28, scenario);
    this.buildingsManager = new BuildingsManager(this.grid);
    this.defensesManager = new DefensesManager(this.grid, scenario ? scenario.initialBudget : 10000);
    this.floodSim = new FloodSimulation(this.grid, this.defensesManager, this.buildingsManager);
    this.weatherSystem = new WeatherSystem(scenario ? scenario.weatherPhases : null);
    this.emergencyManager = new EmergencyEventsManager();
    this.rescueManager = new RescueMissionsManager();
    this.comboSystem = new ComboSystem();

    this.buildingsManager.placeDefaultCityStructures();

    this.isPaused = false;
    this.gameSpeed = 1; // 1x, 2x, 3x
    this.timerSeconds = 180; // 3 minute simulation round
    this.isPrepPhase = true;
    this.prepTimeRemaining = 30; // 30s preparation phase

    this.score = 0;
    this.xp = 0;
    this.selectedDefense = null;
    this.historyDecisions = [];
    this.unlockedAchievements = [];
  }

  setPause(paused) {
    this.isPaused = paused;
  }

  setGameSpeed(speed) {
    this.gameSpeed = speed;
  }

  selectDefense(defenseType) {
    this.selectedDefense = defenseType;
    soundManager.playClick();
  }

  startFloodNow() {
    this.isPrepPhase = false;
    this.prepTimeRemaining = 0;
    soundManager.playAlarm();
  }

  update(dt) {
    if (this.isPaused) return;

    const scaledDt = dt * this.gameSpeed;

    // 1. Preparation Countdown Phase
    if (this.isPrepPhase) {
      this.prepTimeRemaining -= scaledDt;
      if (this.prepTimeRemaining <= 0) {
        this.isPrepPhase = false;
        soundManager.playAlarm();
      }
    } else {
      // Game Round Countdown
      this.timerSeconds = Math.max(0, this.timerSeconds - scaledDt);
    }

    // 2. Weather System Step
    const weatherStats = this.weatherSystem.step(scaledDt, this.isPrepPhase);

    // 3. Flood Simulation Step
    const buildingStats = this.floodSim.step(
      scaledDt,
      weatherStats.phase,
      weatherStats.riverLevelPct,
      weatherStats.rainfallMm
    );

    // 4. Construction Progress Animations
    this.defensesManager.updateConstructions(scaledDt);

    // 5. Emergency Events & Rescue Missions
    const activeEvent = this.emergencyManager.update(scaledDt, weatherStats.phase, this.grid);
    const activeMission = this.rescueManager.update(scaledDt, this.grid);

    // 6. Combo Detection
    const newCombos = this.comboSystem.evaluate(this.defensesManager.placedDefenses);

    // 7. Dynamic Score & XP calculation
    const scoreData = ScoringEngine.calculateRealtimeScore(
      buildingStats,
      this.defensesManager.budget,
      this.defensesManager.initialBudget,
      this.floodSim.waterManagedTotal,
      this.comboSystem.activeCombos
    );

    this.score = scoreData.totalScore;
    this.xp = scoreData.xp;

    return {
      weatherStats,
      buildingStats,
      activeEvent,
      activeMission,
      newCombos,
      scoreData,
      isGameOver: this.timerSeconds <= 0
    };
  }

  placeDefenseAt(col, row) {
    if (!this.selectedDefense) return null;

    const check = this.defensesManager.canPlaceDefense(col, row, this.selectedDefense);
    if (!check.valid) {
      soundManager.playClick();
      return null;
    }

    const placed = this.defensesManager.placeDefense(col, row, this.selectedDefense);
    if (placed) {
      this.historyDecisions.push({
        time: 180 - this.timerSeconds,
        col,
        row,
        defenseType: this.selectedDefense,
        budgetAfter: this.defensesManager.budget
      });
    }
    return placed;
  }
}

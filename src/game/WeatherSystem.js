// Weather System for River Defender
import { soundManager } from './SoundManager.js';

export const WEATHER_PHASES = {
  NORMAL: 'NORMAL',
  HEAVY_RAIN: 'HEAVY_RAIN',
  EXTREME_STORM: 'EXTREME_STORM',
  FLOOD_PEAK: 'FLOOD_PEAK'
};

export class WeatherSystem {
  constructor(scenario) {
    this.scenario = scenario;
    this.phase = WEATHER_PHASES.NORMAL;
    this.elapsedTime = 0;
    this.totalDuration = scenario ? scenario.floodDurationSeconds : 180;
    this.prepTime = scenario ? scenario.prepTimeSeconds : 45;

    this.rainfallMm = 10;
    this.riverLevelPct = 25;
    this.windSpeed = 12;
    this.lightningTriggered = false;
    this.lightningFlashTimer = 0;
    this.thunderCooldown = 0;
  }

  update(dt, isPrepPhase) {
    this.elapsedTime += dt;

    if (isPrepPhase) {
      this.phase = WEATHER_PHASES.NORMAL;
      this.rainfallMm = 15;
      this.riverLevelPct = 30;
      this.windSpeed = 10;
      soundManager.updateMusicPhase(this.phase);
      return;
    }

    const progress = Math.min(1, this.elapsedTime / this.totalDuration);

    if (progress < 0.25) {
      this.phase = WEATHER_PHASES.NORMAL;
      this.rainfallMm = Math.round(15 + progress * 100);
      this.riverLevelPct = Math.round(30 + progress * 60);
      this.windSpeed = 15;
    } else if (progress < 0.6) {
      this.phase = WEATHER_PHASES.HEAVY_RAIN;
      this.rainfallMm = Math.round(60 + (progress - 0.25) * 200);
      this.riverLevelPct = Math.round(45 + (progress - 0.25) * 80);
      this.windSpeed = 35;
    } else if (progress < 0.85) {
      this.phase = WEATHER_PHASES.EXTREME_STORM;
      this.rainfallMm = Math.round(130 + (progress - 0.6) * 240);
      this.riverLevelPct = Math.round(75 + (progress - 0.6) * 80);
      this.windSpeed = 65;

      // Random lightning
      this.thunderCooldown -= dt;
      if (this.thunderCooldown <= 0 && Math.random() < 0.2) {
        this.triggerLightning();
        this.thunderCooldown = 8 + Math.random() * 12;
      }
    } else {
      this.phase = WEATHER_PHASES.FLOOD_PEAK;
      this.rainfallMm = Math.round(190 + (progress - 0.85) * 200);
      this.riverLevelPct = Math.min(100, Math.round(92 + (progress - 0.85) * 50));
      this.windSpeed = 85;

      this.thunderCooldown -= dt;
      if (this.thunderCooldown <= 0 && Math.random() < 0.3) {
        this.triggerLightning();
        this.thunderCooldown = 5 + Math.random() * 8;
      }
    }

    if (this.lightningFlashTimer > 0) {
      this.lightningFlashTimer -= dt;
    }

    soundManager.updateMusicPhase(this.phase);
  }

  triggerLightning() {
    this.lightningTriggered = true;
    this.lightningFlashTimer = 0.3;
    soundManager.playThunder();
  }

  getWeatherStats() {
    return {
      phase: this.phase,
      rainfallMm: this.rainfallMm,
      riverLevelPct: this.riverLevelPct,
      windSpeed: this.windSpeed,
      isLightning: this.lightningFlashTimer > 0
    };
  }
}

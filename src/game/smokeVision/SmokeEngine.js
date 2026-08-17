// Real-Time 3D Volumetric Smoke Simulation Engine for Smoke Vision
export const SMOKE_LEVELS = {
  LOW: 'LOW',       // Clear visibility, 0 damage
  MEDIUM: 'MEDIUM', // Slight haze, 15m visibility
  HIGH: 'HIGH',     // Thick smoke, 6m visibility, health drains fast unless crouching
  EXTREME: 'EXTREME'// Very dense smoke, 3m visibility, rapid damage
};

export class SmokeEngine {
  constructor() {
    this.smokeDensityMap = new Map(); // key: 'x_z', val: density 0..100
    this.elapsedTime = 0;
  }

  reset() {
    this.smokeDensityMap.clear();
    this.elapsedTime = 0;
  }

  update(dt, fireSource) {
    this.elapsedTime += dt;

    // Smoke spreads over time outward from fire source (e.g. Staff room / Corridor)
    const radius = Math.min(25, 2 + this.elapsedTime * 0.85);

    for (let x = 0; x < 26; x++) {
      for (let z = 0; z < 22; z++) {
        const dx = x - fireSource.x;
        const dz = z - fireSource.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist <= radius) {
          const intensity = Math.max(0, 100 - (dist / radius) * 100);
          const current = this.smokeDensityMap.get(`${x}_${z}`) || 0;
          this.smokeDensityMap.set(`${x}_${z}`, Math.min(100, current + intensity * dt * 0.4));
        }
      }
    }
  }

  getSmokeAt(x, z) {
    const key = `${Math.floor(x)}_${Math.floor(z)}`;
    const val = this.smokeDensityMap.get(key) || 0;

    if (val > 75) return SMOKE_LEVELS.EXTREME;
    if (val > 45) return SMOKE_LEVELS.HIGH;
    if (val > 18) return SMOKE_LEVELS.MEDIUM;
    return SMOKE_LEVELS.LOW;
  }

  getVisibilityRadius(smokeLevel, flashlightOn, batteryPct) {
    let baseRadius = 18; // Low smoke
    if (smokeLevel === SMOKE_LEVELS.MEDIUM) baseRadius = 12;
    if (smokeLevel === SMOKE_LEVELS.HIGH) baseRadius = 6.5;
    if (smokeLevel === SMOKE_LEVELS.EXTREME) baseRadius = 3.5;

    if (flashlightOn && batteryPct > 0) {
      baseRadius *= 1.4;
    }
    return baseRadius;
  }

  getDamageRate(smokeLevel, isCrouching) {
    let baseDamage = 0; // Low
    if (smokeLevel === SMOKE_LEVELS.MEDIUM) baseDamage = 1.5;
    if (smokeLevel === SMOKE_LEVELS.HIGH) baseDamage = 5.0;
    if (smokeLevel === SMOKE_LEVELS.EXTREME) baseDamage = 12.0;

    // Crouching/crawling reduces smoke damage by 65%!
    if (isCrouching) {
      baseDamage *= 0.35;
    }
    return baseDamage;
  }
}

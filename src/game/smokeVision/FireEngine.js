// Fire Spreading & Door Temperature Checking Engine for Smoke Vision
export class FireEngine {
  constructor() {
    this.fireOrigin = { x: 10, z: 4 }; // Staff room area
    this.fireIntensity = 10;
    this.elapsedTime = 0;
  }

  reset() {
    this.fireIntensity = 10;
    this.elapsedTime = 0;
  }

  update(dt) {
    this.elapsedTime += dt;
    this.fireIntensity = Math.min(100, 10 + this.elapsedTime * 0.9);
  }

  checkDoorTemperature(door) {
    // Teaches real fire safety: check door before opening!
    if (door.tempState) return door.tempState;

    const dx = door.x - this.fireOrigin.x;
    const dz = door.z - this.fireOrigin.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < 4) return 'VERY_HOT'; // 🔴 DO NOT OPEN!
    if (dist < 8) return 'WARM';     // 🟡 BE CAREFUL
    return 'COOL';                  // 🔵 SAFE TO OPEN
  }

  isFireNearPlayer(px, pz) {
    const dx = px - this.fireOrigin.x;
    const dz = pz - this.fireOrigin.z;
    return Math.sqrt(dx * dx + dz * dz) < 3.5;
  }
}

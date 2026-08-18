import * as THREE from 'three';
import { FIRE_ORIGIN } from './Building.js';

const PARTICLE_COUNT = 90;

function warmAt(distance) { return 20 + distance * 2.0; }
function hotAt(distance) { return warmAt(distance) + 60; }

export function doorHeatLevel(door, elapsed) {
  if (door.alwaysHot) return 2;
  const w = warmAt(door.distance);
  const h = hotAt(door.distance);
  if (elapsed >= h) return 2;
  if (elapsed >= w) return 1;
  return 0;
}

export function doorHeatLabel(level) {
  if (level === 2) return { icon: '🔥', text: 'VERY HOT', sub: 'DO NOT OPEN', cls: 'status-hot' };
  if (level === 1) return { icon: '🌡️', text: 'WARM', sub: 'BE CAUTIOUS', cls: 'status-warm' };
  return { icon: '❄️', text: 'COOL', sub: 'SAFE TO OPEN', cls: 'status-cool' };
}

function distanceFromFire(x, z) {
  const corridorZ = Math.max(-1.5, Math.min(1.5, z));
  const dx = Math.abs(x - FIRE_ORIGIN.x);
  const detour = Math.max(0, Math.abs(z) - 1.5) * 1.6;
  return dx + detour + Math.abs(corridorZ - FIRE_ORIGIN.z) * 0.3;
}

export class FireSmokeSystem {
  constructor(scene) {
    this.elapsed = 0;
    this.scene = scene;
    this._buildParticles();
  }

  _buildParticles() {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    this.velocities = [];
    this.ages = [];
    this.lifespans = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      this._resetParticle(i, positions, true);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x9a938c,
      size: 1.6,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
      sizeAttenuation: true
    });
    this.points = new THREE.Points(geo, mat);
    this.scene.add(this.points);
    this.positions = positions;
  }

  _resetParticle(i, positions, initial) {
    const spread = initial ? Math.random() * 6 : 0.5;
    const dir = Math.random() > 0.5 ? 1 : -1;
    const x = FIRE_ORIGIN.x + (Math.random() - 0.5) * spread * dir;
    const z = FIRE_ORIGIN.z - Math.random() * 4;
    const y = 0.3 + Math.random() * 2.2;
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    this.velocities[i] = {
      x: (Math.random() - 0.5) * 0.15,
      y: 0.08 + Math.random() * 0.1,
      z: -0.15 - Math.random() * 0.15
    };
    this.ages[i] = 0;
    this.lifespans[i] = 6 + Math.random() * 6;
  }

  smokeLevelAt(x, z) {
    const d = distanceFromFire(x, z);
    const raw = (this.elapsed - d * 1.5) / 30;
    return Math.max(0, Math.min(4, raw));
  }

  update(dt, playerPos) {
    this.elapsed += dt;
    const spreadRange = Math.min(30, 4 + this.elapsed * 0.35);
    const arr = this.positions;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      this.ages[i] += dt;
      const v = this.velocities[i];
      arr[i * 3] += v.x * dt * 4;
      arr[i * 3 + 1] += v.y * dt;
      arr[i * 3 + 2] += v.z * dt * (0.6 + spreadRange / 30);

      const withinRange = Math.abs(arr[i * 3] - FIRE_ORIGIN.x) < spreadRange;
      if (this.ages[i] > this.lifespans[i] || arr[i * 3 + 1] > 3 || (!withinRange && Math.random() < 0.02)) {
        this._resetParticle(i, arr, false);
        arr[i * 3] = FIRE_ORIGIN.x + (Math.random() - 0.5) * Math.min(spreadRange, 3);
      }
    }
    this.points.geometry.attributes.position.needsUpdate = true;
    this.points.material.opacity = Math.min(0.55, 0.25 + this.elapsed / 400);
  }
}

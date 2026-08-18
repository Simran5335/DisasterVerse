import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

const STAND_HEIGHT = 1.7;
const CROUCH_HEIGHT = 1.0;
const RADIUS = 0.32;
const STAND_SPEED = 4.2;
const CROUCH_SPEED = 2.0;
const FLASH_DRAIN_PER_SEC = 4.5;
const FLASH_RANGE_ON = 12.5;
const FLASH_RANGE_OFF = 4.5;

export class Player {
  constructor(camera, domElement, collidersFn) {
    this.camera = camera;
    this.domElement = domElement;
    this.collidersFn = collidersFn;
    this.controls = new PointerLockControls(camera, domElement);

    this.velocity = new THREE.Vector3();
    this.move = { forward: false, back: false, left: false, right: false };
    this.crouching = false;
    this.height = STAND_HEIGHT;

    this.flashOn = false;
    this.flashBattery = 100;
    this.flashUsedEver = false;

    this.position = new THREE.Vector3(0, STAND_HEIGHT, 0);
    this.camera.position.copy(this.position);

    this.flashlight = new THREE.SpotLight(0xfff2cf, 0, FLASH_RANGE_OFF, Math.PI / 5, 0.55, 1.3);
    this.flashlight.position.set(0, 0, 0);
    this.flashlightTarget = new THREE.Object3D();
    this.flashlightTarget.position.set(0, 0, -1);
    camera.add(this.flashlight);
    camera.add(this.flashlightTarget);
    this.flashlight.target = this.flashlightTarget;

    this.isMouseDown = false;
    this.mousePrev = { x: 0, y: 0 };

    this._bindKeys();
    this._bindMouseFallback();
  }

  _bindKeys() {
    this.onKeyDown = (e) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': this.move.forward = true; break;
        case 'KeyS': case 'ArrowDown': this.move.back = true; break;
        case 'KeyA': case 'ArrowLeft': this.move.left = true; break;
        case 'KeyD': case 'ArrowRight': this.move.right = true; break;
        case 'ShiftLeft': case 'ShiftRight': case 'KeyC': this.crouching = true; break;
        case 'KeyF': this._toggleFlash(); break;
        default: break;
      }
    };
    this.onKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': this.move.forward = false; break;
        case 'KeyS': case 'ArrowDown': this.move.back = false; break;
        case 'KeyA': case 'ArrowLeft': this.move.left = false; break;
        case 'KeyD': case 'ArrowRight': this.move.right = false; break;
        case 'ShiftLeft': case 'ShiftRight': case 'KeyC': this.crouching = false; break;
        default: break;
      }
    };
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  _bindMouseFallback() {
    this.onMouseDown = (e) => {
      this.isMouseDown = true;
      this.mousePrev = { x: e.clientX, y: e.clientY };
    };
    this.onMouseUp = () => {
      this.isMouseDown = false;
    };
    this.onMouseMove = (e) => {
      // Fallback mouse look when pointer lock is not active
      if (!this.controls.isLocked && this.isMouseDown) {
        const movementX = e.movementX !== undefined ? e.movementX : (e.clientX - this.mousePrev.x);
        const movementY = e.movementY !== undefined ? e.movementY : (e.clientY - this.mousePrev.y);
        this.mousePrev = { x: e.clientX, y: e.clientY };

        const euler = new THREE.Euler(0, 0, 0, 'YXZ');
        euler.setFromQuaternion(this.camera.quaternion);
        euler.y -= movementX * 0.0025;
        euler.x -= movementY * 0.0025;
        euler.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, euler.x));
        this.camera.quaternion.setFromEuler(euler);
      }
    };

    window.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('mousemove', this.onMouseMove);
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('mousemove', this.onMouseMove);
    if (this.controls) this.controls.dispose();
  }

  _toggleFlash() {
    if (this.flashBattery <= 0 && !this.flashOn) return;
    this.flashOn = !this.flashOn;
    if (this.flashOn) this.flashUsedEver = true;
  }

  _resolveCollision(pos) {
    const result = pos.clone();
    const colliders = this.collidersFn();
    for (const box of colliders) {
      const closestX = Math.max(box.min.x, Math.min(result.x, box.max.x));
      const closestZ = Math.max(box.min.z, Math.min(result.z, box.max.z));
      const dx = result.x - closestX;
      const dz = result.z - closestZ;
      const distSq = dx * dx + dz * dz;
      if (distSq < RADIUS * RADIUS) {
        const dist = Math.sqrt(distSq) || 0.0001;
        const overlap = RADIUS - dist;
        result.x += (dx / dist) * overlap;
        result.z += (dz / dist) * overlap;
      }
    }
    return result;
  }

  update(dt) {
    const targetHeight = this.crouching ? CROUCH_HEIGHT : STAND_HEIGHT;
    this.height += (targetHeight - this.height) * Math.min(1, dt * 8);

    const speed = this.crouching ? CROUCH_SPEED : STAND_SPEED;
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.y = 0; forward.normalize();
    const right = new THREE.Vector3().crossVectors(forward, this.camera.up).normalize();

    const dir = new THREE.Vector3();
    if (this.move.forward) dir.add(forward);
    if (this.move.back) dir.sub(forward);
    if (this.move.right) dir.add(right);
    if (this.move.left) dir.sub(right);
    if (dir.lengthSq() > 0) dir.normalize().multiplyScalar(speed * dt);

    const proposed = this.position.clone();
    proposed.x += dir.x;
    proposed.z += dir.z;
    const resolved = this._resolveCollision(proposed);

    resolved.x = Math.max(-9, Math.min(29, resolved.x));
    resolved.z = Math.max(-10, Math.min(10, resolved.z));

    this.position.copy(resolved);
    this.position.y = this.height;
    this.camera.position.copy(this.position);

    if (this.flashOn) {
      this.flashBattery = Math.max(0, this.flashBattery - FLASH_DRAIN_PER_SEC * dt);
      if (this.flashBattery <= 0) this.flashOn = false;
    }
    const targetIntensity = this.flashOn ? 2.6 : 0;
    this.flashlight.intensity += (targetIntensity - this.flashlight.intensity) * Math.min(1, dt * 6);
    this.flashlight.distance = this.flashOn ? FLASH_RANGE_ON : FLASH_RANGE_OFF;
  }
}

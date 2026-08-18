import * as THREE from 'three';

const WALL_H = 3.2;
const WALL_T = 0.25;
const WALL_COLOR = 0x4a433c;
const FLOOR_COLOR = 0x35302a;
const CORRIDOR_WALL_COLOR = 0x433c34;

// Fire originates at the south "Fire Room" door.
export const FIRE_ORIGIN = { x: 0, z: 3 };
export const SAFE_ROOM_ID = 'roomD';

// Rooms are used for labels, the memory map, orientation toasts, and picking a random start room.
export const ROOMS = [
  { id: 'roomA', name: 'ROOM 101', sub: 'CLASSROOM', x0: -6, x1: 2, z0: -8, z1: -1.5, side: 'north', startable: true },
  { id: 'roomB', name: 'ROOM 104', sub: 'OFFICE', x0: 6, x1: 14, z0: -8, z1: -1.5, side: 'north', startable: true },
  { id: 'common', name: 'COMMON ROOM', sub: '', x0: 18, x1: 26, z0: -8, z1: -1.5, side: 'north', startable: true },
  { id: 'fireRoom', name: 'ROOM 108', sub: '', x0: -6, x1: 2, z0: 1.5, z1: 8, side: 'south', startable: false },
  { id: 'roomD', name: 'ROOM 110', sub: 'SAFE ROOM', x0: 6, x1: 14, z0: 1.5, z1: 8, side: 'south', startable: true },
  { id: 'exitRoom', name: 'ROOM 112', sub: 'NEAR SECONDARY EXIT', x0: 18, x1: 26, z0: 1.5, z1: 8, side: 'south', startable: false },
  { id: 'corridor', name: 'MAIN CORRIDOR', sub: '', x0: -6, x1: 26, z0: -1.5, z1: 1.5, side: 'mid', startable: false }
];

// Doors: each connects a room to the corridor, or the corridor/room to the outside.
export const DOOR_DEFS = [
  { id: 'doorA', x: 0, z: -1.5, gap: [-1, 1], normal: 'x', label: 'Room 101 Door', distance: 12, exterior: false, roomId: 'roomA', color: 0x5c4326 },
  { id: 'doorB', x: 10, z: -1.5, gap: [9, 11], normal: 'x', label: 'Room 104 Door', distance: 20, exterior: false, roomId: 'roomB', color: 0x46505e },
  { id: 'doorCommon', x: 22, z: -1.5, gap: [21, 23], normal: 'x', label: 'Common Room Door', distance: 32, exterior: false, roomId: 'common', color: 0x2f6f6f },
  { id: 'doorFire', x: 0, z: 1.5, gap: [-1, 1], normal: 'x', label: 'Room 108 Door', distance: 0, exterior: false, alwaysHot: true, roomId: 'fireRoom', color: 0x3a2420 },
  { id: 'doorD', x: 10, z: 1.5, gap: [9, 11], normal: 'x', label: 'Room 110 Door', distance: 20, exterior: false, roomId: 'roomD', color: 0x3f6b5e },
  { id: 'doorExitRoom', x: 22, z: 1.5, gap: [21, 23], normal: 'x', label: 'Room 112 Door', distance: 32, exterior: false, roomId: 'exitRoom', color: 0x555f66 },
  { id: 'mainExit', x: -6, z: 0, gap: [-1, 1], normal: 'z', label: 'MAIN EXIT', distance: 6, exterior: true, exitId: 'main', color: 0x2f7a52 },
  { id: 'secondaryExit', x: 22, z: 8, gap: [21, 23], normal: 'x', label: 'SECONDARY EXIT', distance: 34, exterior: true, exitId: 'secondary', color: 0x2f7a52 }
];

// Predefined, always-reachable NPC spawn points (room id + local offset).
export const NPC_SPAWN_POINTS = [
  { roomId: 'common', x: 21, z: -5.5 },
  { roomId: 'roomB', x: 9, z: -6 },
  { roomId: 'roomD', x: 9, z: 5.5 },
  { roomId: 'exitRoom', x: 21, z: 5.5 }
];

function boxMesh(x0, x1, y0, y1, z0, z1, color, opts = {}) {
  const w = Math.max(x1 - x0, 0.01);
  const h = Math.max(y1 - y0, 0.01);
  const d = Math.max(z1 - z0, 0.01);
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.85,
    metalness: opts.metalness ?? 0.05,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.emissiveIntensity ?? 0
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  mesh.receiveShadow = true;
  return mesh;
}

function wallAlongX(z, x0, x1, gap, group, colliders, color = WALL_COLOR) {
  const segs = [];
  if (gap) {
    if (gap[0] > x0) segs.push([x0, gap[0]]);
    if (x1 > gap[1]) segs.push([gap[1], x1]);
  } else {
    segs.push([x0, x1]);
  }
  segs.forEach(([sx0, sx1]) => {
    const m = boxMesh(sx0, sx1, 0, WALL_H, z - WALL_T / 2, z + WALL_T / 2, color);
    group.add(m);
    colliders.push(new THREE.Box3().setFromObject(m));
  });
}

function wallAlongZ(x, z0, z1, gap, group, colliders, color = WALL_COLOR) {
  const segs = [];
  if (gap) {
    if (gap[0] > z0) segs.push([z0, gap[0]]);
    if (z1 > gap[1]) segs.push([gap[1], z1]);
  } else {
    segs.push([z0, z1]);
  }
  segs.forEach(([sz0, sz1]) => {
    const m = boxMesh(x - WALL_T / 2, x + WALL_T / 2, 0, WALL_H, sz0, sz1, color);
    group.add(m);
    colliders.push(new THREE.Box3().setFromObject(m));
  });
}

function multiGapWallX(z, x0, x1, gaps, group, colliders, color = CORRIDOR_WALL_COLOR) {
  const sorted = [...gaps].sort((a, b) => a[0] - b[0]);
  let cursor = x0;
  const segs = [];
  sorted.forEach(([g0, g1]) => {
    if (g0 > cursor) segs.push([cursor, g0]);
    cursor = Math.max(cursor, g1);
  });
  if (cursor < x1) segs.push([cursor, x1]);
  segs.forEach(([sx0, sx1]) => {
    const m = boxMesh(sx0, sx1, 0, WALL_H, z - WALL_T / 2, z + WALL_T / 2, color);
    group.add(m);
    colliders.push(new THREE.Box3().setFromObject(m));
  });
}

function addDoorMesh(def, group) {
  const width = def.gap[1] - def.gap[0];
  const geo = new THREE.BoxGeometry(
    def.normal === 'x' ? width - 0.1 : 0.08,
    2.4,
    def.normal === 'x' ? 0.08 : width - 0.1
  );
  const mat = new THREE.MeshStandardMaterial({ color: def.color || 0x5c4326, roughness: 0.65 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(def.x, 1.2, def.z);
  mesh.userData.doorId = def.id;

  // Handle detail
  const handleGeo = new THREE.SphereGeometry(0.06, 8, 8);
  const handleMat = new THREE.MeshStandardMaterial({ color: 0xd8c48a, metalness: 0.6, roughness: 0.3 });
  const handle = new THREE.Mesh(handleGeo, handleMat);
  if (def.normal === 'x') handle.position.set(width / 2 - 0.3, 0, 0.1);
  else handle.position.set(0.1, 0, width / 2 - 0.3);
  mesh.add(handle);

  group.add(mesh);
  return mesh;
}

function makeTextSprite(text, opts = {}) {
  const canvas = document.createElement('canvas');
  const W = opts.width || 320, H = opts.height || 96;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  if (opts.bg) {
    ctx.fillStyle = opts.bg;
    ctx.fillRect(4, 4, W - 8, H - 8);
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${opts.mainSize || 30}px Arial`;
  ctx.fillStyle = opts.color || '#ffffff';
  ctx.fillText(text, W / 2, opts.sub ? H * 0.36 : H / 2);
  if (opts.sub) {
    ctx.font = `${opts.subSize || 18}px Arial`;
    ctx.fillStyle = opts.subColor || 'rgba(255,255,255,0.7)';
    ctx.fillText(opts.sub, W / 2, H * 0.72);
  }
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  sprite.renderOrder = 10;
  const aspect = W / H;
  const h = opts.size || 0.5;
  sprite.scale.set(h * aspect, h, 1);
  return sprite;
}

function addRoomSign(group, room, doorX, doorZ, faceOffset) {
  const sprite = makeTextSprite(room.name, {
    sub: room.sub || undefined,
    color: '#dff0ff',
    subColor: '#8fd8ff',
    mainSize: 30,
    subSize: 16,
    size: 0.42,
    width: 300,
    height: 90
  });
  sprite.position.set(doorX + faceOffset.x, 2.35, doorZ + faceOffset.z);
  group.add(sprite);
}

function addExitSign(group, text) {
  const sprite = makeTextSprite(text, { color: '#35d07f', mainSize: 34, size: 0.55, width: 320, height: 80 });
  group.add(sprite);
  return sprite;
}

function addLocker(group, colliders, x, z, w, color) {
  const m = boxMesh(x - w / 2, x + w / 2, 0, 1.9, z - 0.25, z + 0.25, color, { metalness: 0.3, roughness: 0.5 });
  group.add(m);
  colliders.push(new THREE.Box3().setFromObject(m));
}

function addPoster(group, x, y, z, text, color) {
  const sprite = makeTextSprite(text, { bg: 'rgba(20,20,20,0.55)', color, mainSize: 20, size: 0.5, width: 200, height: 140 });
  sprite.position.set(x, y, z);
  group.add(sprite);
}

function addBox(group, colliders, x, z, w, d, h, color, matOpts = {}, collide = true) {
  const m = boxMesh(x - w / 2, x + w / 2, 0, h, z - d / 2, z + d / 2, color, matOpts);
  group.add(m);
  if (collide) colliders.push(new THREE.Box3().setFromObject(m));
  return m;
}

function makeSignAt(group, x, y, z, text) {
  const sprite = makeTextSprite(text, { color: '#dddddd', mainSize: 16, size: 0.25, width: 220, height: 50 });
  sprite.position.set(x, y, z);
  group.add(sprite);
}

function addLandmarks(group, colliders) {
  // ROOM 101 — Classroom
  addBox(group, colliders, -4.5, -6, 1.4, 0.6, 0.9, 0x4a3b2a);
  addBox(group, colliders, -2, -7.6, 2.2, 0.1, 1.3, 0xe8e4d8, { emissive: 0x222222 });
  addBox(group, colliders, -5, -5, 0.4, 0.4, 0.75, 0x2b2b33, {}, false);
  makeSignAt(group, -2, -6.5, -7.7, 'WHITEBOARD');

  // ROOM 104 — Office
  addBox(group, colliders, 8, -6.5, 1.6, 0.7, 0.8, 0x3f3f52);
  addBox(group, colliders, 12.5, -6.5, 0.6, 0.6, 1.1, 0x555555);
  addBox(group, colliders, 8, -6.8, 0.4, 0.3, 0.3, 0x111318, { emissive: 0x1a3a4a, emissiveIntensity: 0.4 }, false);

  // COMMON ROOM
  addBox(group, colliders, 20, -6, 2.2, 0.8, 0.6, 0x5a3040);
  addBox(group, colliders, 22, -6, 1.2, 1.2, 0.5, 0x555555);
  addBox(group, colliders, 25, -7.4, 0.9, 0.6, 1.8, 0x1c3d5a, { emissive: 0x2fa8ff, emissiveIntensity: 0.5 });
  addBox(group, colliders, 19, -4.2, 0.4, 0.4, 0.9, 0x2f6b3a, {}, false);

  // ROOM 110 — Safe Room
  addBox(group, colliders, 10, 5.5, 1.5, 0.6, 0.85, 0x3f6b5e);
  addBox(group, colliders, 13, 6.8, 0.4, 0.4, 0.9, 0x2f6b3a, {}, false);

  // ROOM 112 — near secondary exit
  addBox(group, colliders, 20, 6.5, 0.8, 0.8, 0.9, 0x4a4032);
  addBox(group, colliders, 21.2, 6.5, 0.6, 0.6, 0.6, 0x4a4032);

  // Corridor landmarks
  addLocker(group, colliders, -4, -1.35, 2.2, 0x33475c);
  addLocker(group, colliders, 14.5, 1.35, 2.4, 0x33475c);
  addBox(group, colliders, -1, -3.05, 0.5, 0.5, 1.6, 0x8a1f1f);
  addPoster(group, -4, 2.0, -1.42, 'FIRE\nSAFETY', '#ff8855');
  addPoster(group, 15, 2.0, 1.42, 'IN CASE OF\nFIRE', '#ffb020');
}

export function buildBuilding(scene) {
  const group = new THREE.Group();
  const colliders = [];
  const emergencyLights = [];

  const floorGeo = new THREE.PlaneGeometry(34, 18);
  const floorMat = new THREE.MeshStandardMaterial({ color: FLOOR_COLOR, roughness: 0.95 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(10, 0, 0);
  floor.receiveShadow = true;
  group.add(floor);

  const ceil = new THREE.Mesh(floorGeo, new THREE.MeshStandardMaterial({ color: 0x1c1a17, roughness: 1 }));
  ceil.rotation.x = Math.PI / 2;
  ceil.position.set(10, WALL_H, 0);
  group.add(ceil);

  wallAlongX(-8, -6, 26, null, group, colliders);
  wallAlongX(8, -6, 26, [21, 23], group, colliders);
  wallAlongZ(-6, -8, 8, [-1, 1], group, colliders);
  wallAlongZ(26, -8, 8, null, group, colliders);

  multiGapWallX(-1.5, -6, 26, [[-1, 1], [9, 11], [21, 23]], group, colliders);
  multiGapWallX(1.5, -6, 26, [[-1, 1], [9, 11], [21, 23]], group, colliders);

  addLandmarks(group, colliders);

  const doors = DOOR_DEFS.map(def => {
    const mesh = addDoorMesh(def, group);
    return { ...def, mesh, open: false, checked: false, blocked: false };
  });

  const doorColliders = {};
  doors.forEach(d => {
    const width = d.gap[1] - d.gap[0];
    const box = new THREE.Box3();
    if (d.normal === 'x') {
      box.setFromCenterAndSize(new THREE.Vector3(d.x, WALL_H / 2, d.z), new THREE.Vector3(width, WALL_H, WALL_T));
    } else {
      box.setFromCenterAndSize(new THREE.Vector3(d.x, WALL_H / 2, d.z), new THREE.Vector3(WALL_T, WALL_H, width));
    }
    doorColliders[d.id] = box;
  });

  ROOMS.forEach(room => {
    if (!room.startable && room.id !== 'fireRoom' && room.id !== 'exitRoom') return;
    const door = doors.find(d => d.roomId === room.id);
    if (!door) return;
    const faceZ = door.z < 0 ? -0.35 : 0.35;
    addRoomSign(group, room, door.x, door.z, { x: 0, z: faceZ });
  });

  addExitSign(group, 'EXIT \u2190').position.set(-3, 2.6, -1.42);
  addExitSign(group, 'EXIT \u2192').position.set(19, 2.6, 1.42);
  addExitSign(group, 'EXIT \u2190').position.set(10, 2.6, -1.42);
  addExitSign(group, 'MAIN EXIT').position.set(-5.85, 2.4, 0);
  addExitSign(group, 'SECONDARY EXIT').position.set(22, 2.4, 7.85);

  const hemi = new THREE.HemisphereLight(0x9fb8d8, 0x2a2420, 0.62);
  group.add(hemi);
  const amb = new THREE.AmbientLight(0xaab4c2, 0.48);
  group.add(amb);

  DOOR_DEFS.forEach(def => {
    const color = def.exterior ? 0x8fffc0 : 0xffe0b0;
    const dl = new THREE.PointLight(color, def.exterior ? 0.9 : 0.55, 4.5, 2);
    dl.position.set(def.x, 2.1, def.z);
    group.add(dl);
  });

  const roomFixtures = [
    { x: -2, z: -4.5, color: 0xfff0d2 },
    { x: 10, z: -4.5, color: 0xfff0d2 },
    { x: 22, z: -4.5, color: 0xfff2e0 },
    { x: 10, z: 4.5, color: 0xcfeaff },
    { x: 21, z: 4.5, color: 0xfff0d2 }
  ];
  roomFixtures.forEach(f => {
    const pl = new THREE.PointLight(f.color, 1.1, 11, 2);
    pl.position.set(f.x, WALL_H - 0.3, f.z);
    group.add(pl);
  });

  [-3, 4, 10, 16, 22].forEach(x => {
    const pl = new THREE.PointLight(0xffe6c2, 0.85, 12, 2);
    pl.position.set(x, WALL_H - 0.35, 0);
    group.add(pl);
  });

  [-4.5, 12].forEach(x => {
    const rl = new THREE.PointLight(0xff2a2a, 1.4, 6, 2);
    rl.position.set(x, WALL_H - 0.5, 0.6);
    group.add(rl);
    emergencyLights.push(rl);
  });

  const fireLight = new THREE.PointLight(0xff5522, 3.2, 13, 2);
  fireLight.position.set(FIRE_ORIGIN.x, 1.2, FIRE_ORIGIN.z);
  group.add(fireLight);

  scene.add(group);

  return { group, colliders, doors, doorColliders, fireLight, emergencyLights };
}

export function randomStartRoom() {
  const options = ROOMS.filter(r => r.startable);
  const pick = options[Math.floor(Math.random() * options.length)];
  return { x: (pick.x0 + pick.x1) / 2, z: (pick.z0 + pick.z1) / 2, room: pick };
}

export function roomAt(x, z) {
  return ROOMS.find(r => x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1) || null;
}

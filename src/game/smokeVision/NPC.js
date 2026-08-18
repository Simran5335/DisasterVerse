import * as THREE from 'three';
import { NPC_SPAWN_POINTS, ROOMS } from './Building.js';

const ARCHETYPES = [
  {
    id: 'elderly',
    icon: '👵',
    name: 'Mrs. Iyer',
    title: 'Elderly Person',
    color: 0xb08a5a,
    callLine: 'HELP! Is anyone there?',
    helpLine: '"I can’t see well in this smoke. Please, help me find the way out."',
    clueLine: 'The main corridor gets hot fast near the west end — I’d avoid lingering there.',
    xp: 'HELP_NPC',
    reward: { type: 'health', amount: 15, label: '❤️ Health +15' },
    speed: 1.6
  },
  {
    id: 'student',
    icon: '🧑‍🎓',
    name: 'Jay',
    title: 'Panicked Student',
    color: 0x5a8ab0,
    callLine: 'OVER HERE! I don’t know where to go!',
    helpLine: '"I almost ran back toward the fire room! Thank you — stay with me?"',
    clueLine: 'I dropped my flashlight battery back there — here, take mine.',
    xp: 'HELP_NPC',
    reward: { type: 'battery', amount: 25, label: '🔋 Flashlight Battery +25%' },
    speed: 2.1
  },
  {
    id: 'mobility',
    icon: '🧑‍🦽',
    name: 'Mr. Fernandes',
    title: 'Person with Mobility Difficulty',
    color: 0x6a8a5a,
    callLine: 'I NEED HELP! I can’t move quickly!',
    helpLine: '"Thank you. I move slowly — please pick a route without stairs or heavy smoke."',
    clueLine: 'I came from the common room side — the secondary exit route was still clear.',
    xp: 'HELP_NPC',
    reward: { type: 'xp_bonus', amount: 25, label: '+25 Bonus XP (accessible route)' },
    speed: 1.3
  }
];

function makeNpcMesh(archetype) {
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: archetype.color, roughness: 0.7 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.9, 4, 8), bodyMat);
  body.position.y = 0.95;
  group.add(body);
  const headMat = new THREE.MeshStandardMaterial({ color: 0xe8c9a0, roughness: 0.6 });
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), headMat);
  head.position.y = 1.6;
  group.add(head);

  const canvas = document.createElement('canvas');
  canvas.width = 64; canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.font = '44px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('!', 32, 30);
  const tex = new THREE.CanvasTexture(canvas);
  const markerMat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, color: 0xffd23f });
  const marker = new THREE.Sprite(markerMat);
  marker.position.y = 2.15;
  marker.scale.set(0.4, 0.4, 1);
  marker.renderOrder = 12;
  group.add(marker);

  return { group, marker };
}

export class NPCSystem {
  constructor(scene, collidersFn) {
    this.scene = scene;
    this.collidersFn = collidersFn;
    this.npcs = [];
    this._spawnOne();
  }

  _spawnOne() {
    const archetype = ARCHETYPES[Math.floor(Math.random() * ARCHETYPES.length)];
    const spawn = NPC_SPAWN_POINTS[Math.floor(Math.random() * NPC_SPAWN_POINTS.length)];
    const room = ROOMS.find(r => r.id === spawn.roomId);
    const { group, marker } = makeNpcMesh(archetype);
    group.position.set(spawn.x, 0, spawn.z);
    this.scene.add(group);

    const npc = {
      archetype,
      mesh: group,
      marker,
      room,
      position: new THREE.Vector3(spawn.x, 0, spawn.z),
      state: 'undiscovered',
      heardAnnounced: false,
      rescued: false,
      escaped: false
    };
    this.npcs.push(npc);
    return npc;
  }

  get active() {
    return this.npcs.find(n => !n.escaped);
  }

  proximityStatus(playerPos) {
    const npc = this.active;
    if (!npc || npc.state === 'following') return null;
    const dist = npc.position.distanceTo(playerPos);
    if (dist < 2.6) return { type: 'help', npc };
    if (dist < 9 && npc.state === 'undiscovered') return { type: 'heard', npc };
    return null;
  }

  markHeard(npc) {
    npc.state = 'heard';
  }

  help(npc) {
    npc.state = 'following';
    npc.rescued = true;
    npc.marker.visible = false;
  }

  update(dt, playerPos, playerForward) {
    this.npcs.forEach(npc => {
      if (npc.state !== 'following' || npc.escaped) return;
      const behind = playerPos.clone().addScaledVector(playerForward, -1.6);
      behind.y = 0;
      const toTarget = behind.clone().sub(npc.position);
      const dist = toTarget.length();
      if (dist > 0.3) {
        toTarget.normalize();
        const step = Math.min(dist, npc.archetype.speed * dt);
        const proposed = npc.position.clone().addScaledVector(toTarget, step);

        const colliders = this.collidersFn();
        let blocked = false;
        for (const box of colliders) {
          const cx = Math.max(box.min.x, Math.min(proposed.x, box.max.x));
          const cz = Math.max(box.min.z, Math.min(proposed.z, box.max.z));
          const dx = proposed.x - cx, dz = proposed.z - cz;
          if (dx * dx + dz * dz < 0.16) { blocked = true; break; }
        }
        if (!blocked) npc.position.copy(proposed);
      }
      npc.mesh.position.set(npc.position.x, 0, npc.position.z);
      if (dist > 0.3) {
        const angle = Math.atan2(toTarget.x, toTarget.z);
        npc.mesh.rotation.y = angle;
      }
    });
  }

  escapeFollowing() {
    const npc = this.npcs.find(n => n.state === 'following' && !n.escaped);
    if (npc) {
      npc.escaped = true;
      npc.mesh.visible = false;
    }
    return npc || null;
  }
}

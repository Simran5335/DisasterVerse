import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';

import { buildBuilding, randomStartRoom, roomAt } from '../game/smokeVision/Building.js';
import { FireSmokeSystem, doorHeatLevel, doorHeatLabel } from '../game/smokeVision/FireSmoke.js';
import { Player } from '../game/smokeVision/Player.js';
import { NPCSystem } from '../game/smokeVision/NPC.js';
import { VisionSystem } from '../game/smokeVision/VisionSystem.js';
import { ScoreSystem } from '../game/smokeVision/ScoreSystem.js';
import { drawMemoryMap } from '../game/smokeVision/MemoryMap.js';
import { soundEngine } from '../game/smokeVision/SoundEngine.js';

import '../styles/SmokeVision.css';

const MEMORY_SECONDS = 12;
const ORIENTATION_SECONDS = 8;
const COMPASS_DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

const SmokeVision = () => {
  const navigate = useNavigate();

  // DOM Refs
  const canvasRef = useRef(null);
  const memoryCanvasRef = useRef(null);
  const blurLayerRef = useRef(null);
  const hazeLayerRef = useRef(null);
  const vignetteLayerRef = useRef(null);

  // Game Phase & UI States
  const [gameState, setGameState] = useState('start'); // start | memory | flash | clicklock | playing | tip | npc | result | gameover
  const [health, setHealth] = useState(100);
  const [flashBattery, setFlashBattery] = useState(100);
  const [flashOn, setFlashOn] = useState(false);
  const [smokeLevel, setSmokeLevel] = useState(0);
  const [isCrawling, setIsCrawling] = useState(false);
  const [compassDir, setCompassDir] = useState('N');
  const [objective, setObjective] = useState('Find a safe exit');
  const [locationName, setLocationName] = useState('');
  const [locationVisible, setLocationVisible] = useState(false);
  const [interactionPrompt, setInteractionPrompt] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [memoryCountdown, setMemoryCountdown] = useState(MEMORY_SECONDS);

  // Modal Data
  const [tipModalData, setTipModalData] = useState({ title: '', body: '', advice: '' });
  const [npcModalData, setNpcModalData] = useState({ title: '', line: '', clue: '', reward: '' });
  const [resultData, setResultData] = useState(null);

  // Three.js and Engine Refs
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const buildingRef = useRef(null);
  const playerRef = useRef(null);
  const fireSystemRef = useRef(null);
  const npcSystemRef = useRef(null);
  const visionRef = useRef(null);
  const scoreRef = useRef(null);
  const clockRef = useRef(null);
  const animFrameIdRef = useRef(null);

  // Gameplay Helper Variables Ref
  const gameVarsRef = useRef({
    inOrientation: false,
    orientationTimer: 0,
    crawlAccumTimer: 0,
    flashWasteTimer: 0,
    startRoomInfo: null,
    lastRoomId: null,
    heardNpcAnnounced: false,
    hoveredDoor: null,
    hoveredNpc: null
  });

  const toastTimerRef = useRef(null);
  const locationTimerRef = useRef(null);

  const showToast = (text) => {
    setToastMessage(text);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 2400);
  };

  const triggerLocationToast = (text) => {
    setLocationName(text);
    setLocationVisible(true);
    if (locationTimerRef.current) clearTimeout(locationTimerRef.current);
    locationTimerRef.current = setTimeout(() => setLocationVisible(false), 3000);
  };

  // Helper for active colliders
  const getActiveColliders = () => {
    if (!buildingRef.current) return [];
    const b = buildingRef.current;
    const doorBoxes = b.doors.filter(d => !d.open).map(d => b.doorColliders[d.id]);
    return b.colliders.concat(doorBoxes);
  };

  // Initialize Three.js Scene once on mount
  useEffect(() => {
    if (!canvasRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x11100e);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
    cameraRef.current = camera;

    const building = buildBuilding(scene);
    buildingRef.current = building;

    const score = new ScoreSystem();
    scoreRef.current = score;

    const player = new Player(camera, renderer.domElement, getActiveColliders);
    playerRef.current = player;

    const npcSystem = new NPCSystem(scene, getActiveColliders);
    npcSystemRef.current = npcSystem;

    const vision = new VisionSystem(
      blurLayerRef.current,
      hazeLayerRef.current,
      vignetteLayerRef.current,
      canvasRef.current
    );
    visionRef.current = vision;

    clockRef.current = new THREE.Clock();

    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // PointerLock controls event listeners
    const onLock = () => {
      soundEngine.startFireAlarm();
      setGameState('playing');
    };

    const onUnlock = () => {
      setGameState(prevState => {
        if (prevState === 'playing') {
          return 'clicklock';
        }
        return prevState;
      });
    };

    const onPointerLockErr = (err) => {
      console.warn('Pointer lock error registered (fallback active):', err);
      setGameState('playing');
    };

    player.controls.addEventListener('lock', onLock);
    player.controls.addEventListener('unlock', onUnlock);
    document.addEventListener('pointerlockerror', onPointerLockErr);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('pointerlockerror', onPointerLockErr);
      if (playerRef.current) playerRef.current.destroy();
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      soundEngine.stopFireAlarm();
    };
  }, []);

  // Interaction Key Listener [E]
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code !== 'KeyE' || gameState !== 'playing') return;
      const vars = gameVarsRef.current;
      if (vars.hoveredDoor) {
        handleDoorInteract(vars.hoveredDoor);
      } else if (vars.hoveredNpc) {
        handleNpcInteract(vars.hoveredNpc);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Main Render & Physics Game Loop
  useEffect(() => {
    let active = true;

    const animate = () => {
      if (!active) return;
      animFrameIdRef.current = requestAnimationFrame(animate);

      const dt = Math.min(0.06, clockRef.current ? clockRef.current.getDelta() : 0.016);
      const t = performance.now() / 1000;
      const b = buildingRef.current;

      if (b) {
        // Door retraction animation
        b.doors.forEach(door => {
          if (!door.animating) return;
          const animT = Math.min(1, (performance.now() - door.animStart) / 400);
          door.mesh.position.y = 1.2 + animT * 2.6;
          door.mesh.material.opacity = 1 - animT * 0.6;
          door.mesh.material.transparent = true;
          if (animT >= 1) door.animating = false;
        });

        // Ambient lighting flickering
        if (b.fireLight) {
          b.fireLight.intensity = 3.0 + Math.sin(t * 11) * 0.4 + Math.sin(t * 27) * 0.2;
        }
        b.emergencyLights.forEach((light, i) => {
          const phase = t * 2.4 + i * 1.6;
          light.intensity = 0.3 + Math.max(0, Math.sin(phase)) * 1.6;
        });
      }

      if (gameState === 'playing' && playerRef.current && fireSystemRef.current && npcSystemRef.current) {
        const player = playerRef.current;
        const fireSystem = fireSystemRef.current;
        const npcSystem = npcSystemRef.current;
        const vars = gameVarsRef.current;
        const scene = sceneRef.current;

        player.update(dt);
        setHealth(prevH => {
          const newH = Math.max(0, prevH);
          if (newH <= 0 && gameState === 'playing') {
            loseGame();
          }
          return newH;
        });

        setFlashBattery(Math.round(player.flashBattery));
        setFlashOn(player.flashOn);
        setIsCrawling(player.crouching);

        if (vars.inOrientation) {
          vars.orientationTimer += dt;
          if (vars.orientationTimer >= ORIENTATION_SECONDS) {
            vars.inOrientation = false;
            showToast('🌫️ SMOKE BEGINS');
          }
        } else {
          fireSystem.update(dt, player.position);
        }

        // Camera direction
        const cameraFwd = new THREE.Vector3();
        cameraRef.current.getWorldDirection(cameraFwd);
        cameraFwd.y = 0; cameraFwd.normalize();

        npcSystem.update(dt, player.position, cameraFwd);
        updateInteractionPrompt();
        updateLocationTracking();

        // Yaw & Compass
        const yaw = Math.atan2(cameraFwd.x, cameraFwd.z) + Math.PI;
        let deg = (-yaw * 180 / Math.PI + 360) % 360;
        const compassIdx = Math.round(deg / 45) % 8;
        setCompassDir(COMPASS_DIRS[compassIdx]);

        // Smoke Level Calculation
        const rawLevel = vars.inOrientation ? 0 : fireSystem.smokeLevelAt(player.position.x, player.position.z);
        const effLevel = player.crouching ? Math.max(0, rawLevel - 0.6) : rawLevel;
        setSmokeLevel(rawLevel);

        // 3D Scene Fog
        const far = THREE.MathUtils.lerp(60, 8, Math.min(1, effLevel / 4));
        const near = far * 0.05;
        if (!scene.fog) scene.fog = new THREE.Fog(0x3a352d, near, far);
        scene.fog.near = near;
        scene.fog.far = far;
        const fogDark = THREE.MathUtils.lerp(0x3a352d, 0x14100c, Math.min(1, effLevel / 4));
        scene.fog.color.setHex(fogDark);

        // Progressive Vision System update
        if (visionRef.current) {
          visionRef.current.update(dt, effLevel, player.flashOn);
        }

        // Health damage from smoke exposure
        let damageRate = 0;
        if (effLevel >= 3) damageRate = 7;
        else if (effLevel >= 2) damageRate = 4;
        else if (effLevel >= 1) damageRate = 1.3;
        if (player.crouching) damageRate *= 0.4;
        if (damageRate > 0) {
          setHealth(h => Math.max(0, h - damageRate * dt));
        }

        // Crouch in smoke reward tracking
        if (player.crouching && rawLevel >= 1) {
          vars.crawlAccumTimer += dt;
          scoreRef.current.stats.crawlEvents++;
          if (vars.crawlAccumTimer >= 4) {
            scoreRef.current.award('CRAWL_THROUGH_SMOKE');
            vars.crawlAccumTimer = 0;
          }
        }

        // Flashlight waste penalty
        if (player.flashOn && rawLevel < 0.4) {
          vars.flashWasteTimer += dt;
          if (vars.flashWasteTimer >= 10) {
            scoreRef.current.award('WASTE_FLASHLIGHT');
            vars.flashWasteTimer = 0;
          }
        } else {
          vars.flashWasteTimer = 0;
        }

        checkExitTriggers();
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();
    return () => { active = false; };
  }, [gameState]);

  // Start Evacuation Game Flow
  const beginMemoryPhase = () => {
    if (visionRef.current) visionRef.current.reset();

    const startInfo = randomStartRoom();
    gameVarsRef.current.startRoomInfo = startInfo;
    gameVarsRef.current.lastRoomId = startInfo.room.id;
    gameVarsRef.current.heardNpcAnnounced = false;

    if (playerRef.current && cameraRef.current) {
      const p = playerRef.current;
      p.position.set(startInfo.x, p.height, startInfo.z);
      cameraRef.current.position.copy(p.position);
      cameraRef.current.lookAt(startInfo.x, p.height, startInfo.z + (startInfo.room.side === 'north' ? -1 : 1));
    }

    setGameState('memory');
    setMemoryCountdown(MEMORY_SECONDS);

    // Draw memory map onto 2D canvas
    setTimeout(() => {
      if (memoryCanvasRef.current) {
        drawMemoryMap(memoryCanvasRef.current, startInfo);
      }
    }, 50);

    let remaining = MEMORY_SECONDS;
    const timer = setInterval(() => {
      remaining -= 1;
      setMemoryCountdown(Math.max(0, remaining));
      if (remaining <= 0) {
        clearInterval(timer);
        triggerSmokeDetected();
      }
    }, 1000);
  };

  const triggerSmokeDetected = () => {
    setGameState('flash');
    setTimeout(() => {
      setGameState('clicklock');
    }, 1100);
  };

  // Click to activate / enter 3D Simulation
  const handleActivate3DSimulation = (e) => {
    if (e) {
      e.stopPropagation();
    }

    setGameState('playing');
    soundEngine.startFireAlarm();

    if (sceneRef.current && !fireSystemRef.current) {
      fireSystemRef.current = new FireSmokeSystem(sceneRef.current);
    }

    if (playerRef.current && playerRef.current.controls) {
      try {
        const lockPromise = playerRef.current.controls.lock();
        if (lockPromise && typeof lockPromise.catch === 'function') {
          lockPromise.catch(err => {
            console.warn('Pointer lock request rejected by browser:', err);
          });
        }
      } catch (err) {
        console.warn('Pointer lock exception:', err);
      }
    }
  };

  // Door interaction
  const handleDoorInteract = (door) => {
    if (!door.checked) {
      door.checked = true;
      const level = doorHeatLevel(door, fireSystemRef.current ? fireSystemRef.current.elapsed : 0);
      door.heatLevel = level;
      scoreRef.current.award('CHECK_DOOR');
      if (level >= 1) scoreRef.current.award('CHECK_HOT_DOOR');
      scoreRef.current.stats.doorsChecked++;
      const lbl = doorHeatLabel(level);
      soundEngine.playDoorCheckSound(level === 2 ? 'HOT' : level === 1 ? 'WARM' : 'COOL');
      showToast(`${lbl.icon} ${door.label}: ${lbl.text}`);
      return;
    }
    if (door.open || door.blocked) return;
    openDoor(door);
  };

  const openDoor = (door) => {
    const level = door.heatLevel ?? 0;
    if (level === 2) {
      scoreRef.current.award('OPEN_DANGEROUS_DOOR');
      scoreRef.current.stats.dangerousDoorsOpened++;
      setHealth(h => Math.max(0, h - 25));
      if (door.exterior) {
        door.blocked = true;
        queueTip(
          '🔥 Exit Blocked by Fire',
          `${door.label} is far too hot — fire is blocking this exit route.`,
          'Safety Tip: If an exit is blocked by fire or heavy smoke, turn back immediately and use another route.'
        );
      } else {
        door.open = true;
        retractDoorMesh(door);
        queueTip(
          '🔥 Dangerous Door Opened',
          `${door.label} was very hot. Opening a hot door during a fire can expose you to sudden flames and smoke.`,
          'Safety Tip: Always check a door before opening it. If it feels hot, turn back and find another route.'
        );
      }
    } else if (level === 1) {
      door.open = true;
      retractDoorMesh(door);
      setHealth(h => Math.max(0, h - 8));
      showToast('🌡️ Opened cautiously — this route is warm.');
      if (door.exterior) scoreRef.current.award('AVOID_BLOCKED_EXIT', 'used warm exit before it closed');
    } else {
      door.open = true;
      retractDoorMesh(door);
      showToast('❄️ Door opened safely.');
      if (door.exterior) scoreRef.current.award('FOLLOW_EMERGENCY_SIGN');
    }
  };

  const retractDoorMesh = (door) => {
    door.animStart = performance.now();
    door.animating = true;
  };

  // NPC interaction
  const handleNpcInteract = (npc) => {
    if (npc.state === 'following' || npc.escaped) return;
    npcSystemRef.current.help(npc);
    scoreRef.current.award(npc.archetype.xp);
    scoreRef.current.stats.npcRescued = (scoreRef.current.stats.npcRescued || 0) + 1;

    const reward = npc.archetype.reward;
    let rewardText = '';
    if (reward.type === 'health') {
      setHealth(h => Math.min(100, h + reward.amount));
      rewardText = reward.label;
    } else if (reward.type === 'battery' && playerRef.current) {
      playerRef.current.flashBattery = Math.min(100, playerRef.current.flashBattery + reward.amount);
      setFlashBattery(Math.round(playerRef.current.flashBattery));
      rewardText = reward.label;
    } else if (reward.type === 'xp_bonus') {
      scoreRef.current.xp += reward.amount;
      rewardText = reward.label;
    }

    setNpcModalData({
      title: `🤝 ${npc.archetype.title} Rescued`,
      line: npc.archetype.helpLine,
      clue: `Clue: ${npc.archetype.clueLine}`,
      reward: rewardText
    });

    setGameState('npc');
    if (playerRef.current) playerRef.current.controls.unlock();
    if (visionRef.current) visionRef.current.reset();
    setObjective(`Help ${npc.archetype.name} reach safety`);
  };

  const queueTip = (title, body, advice) => {
    setTipModalData({ title, body, advice });
    setGameState('tip');
    if (playerRef.current) playerRef.current.controls.unlock();
    if (visionRef.current) visionRef.current.reset();
  };

  const resumeFromModal = () => {
    handleActivate3DSimulation();
  };

  // Raycasting & Interaction Prompts
  const updateInteractionPrompt = () => {
    if (!cameraRef.current || !buildingRef.current || !npcSystemRef.current || !playerRef.current) return;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), cameraRef.current);
    raycaster.far = 2.6;

    const doorMeshes = buildingRef.current.doors.filter(d => !d.open).map(d => d.mesh);
    const hits = raycaster.intersectObjects(doorMeshes, false);

    if (hits.length > 0) {
      gameVarsRef.current.hoveredNpc = null;
      const doorId = hits[0].object.userData.doorId;
      const hoveredDoor = buildingRef.current.doors.find(d => d.id === doorId);
      gameVarsRef.current.hoveredDoor = hoveredDoor;

      if (!hoveredDoor.checked) {
        setInteractionPrompt(`<b>${hoveredDoor.label}</b><br/><span class="key">[E]</span> CHECK DOOR`);
      } else {
        const lbl = doorHeatLabel(hoveredDoor.heatLevel ?? 0);
        setInteractionPrompt(`<b>${hoveredDoor.label}</b><br/>${lbl.icon} <span class="${lbl.cls}">${lbl.text}</span> — ${lbl.sub}<br/><span class="key">[E]</span> OPEN`);
      }
      return;
    }
    gameVarsRef.current.hoveredDoor = null;

    const proximity = npcSystemRef.current.proximityStatus(playerRef.current.position);
    if (proximity && proximity.type === 'help') {
      gameVarsRef.current.hoveredNpc = proximity.npc;
      setInteractionPrompt(`<b>${proximity.npc.archetype.icon} ${proximity.npc.archetype.title}</b><br/><span class="key">[E]</span> HELP`);
    } else {
      gameVarsRef.current.hoveredNpc = null;
      setInteractionPrompt(null);
    }

    if (proximity && proximity.type === 'heard' && !gameVarsRef.current.heardNpcAnnounced) {
      gameVarsRef.current.heardNpcAnnounced = true;
      npcSystemRef.current.markHeard(proximity.npc);
      showToast(`🔊 "${proximity.npc.archetype.callLine}"`);
    }
  };

  // Location room tracking
  const updateLocationTracking = () => {
    if (!playerRef.current) return;
    const p = playerRef.current.position;
    const room = roomAt(p.x, p.z);
    if (room && room.id !== gameVarsRef.current.lastRoomId) {
      gameVarsRef.current.lastRoomId = room.id;
      triggerLocationToast(room.name + (room.sub ? ' · ' + room.sub : ''));
    }
  };

  // Check exit triggers for Win condition
  const checkExitTriggers = () => {
    if (!playerRef.current || !buildingRef.current) return;
    const p = playerRef.current.position;
    buildingRef.current.doors.forEach(door => {
      if (!door.exterior || !door.open || door.blocked) return;
      if (door.exitId === 'main' && p.x < -6.4 && Math.abs(p.z) < 1.6) winGame(door);
      else if (door.exitId === 'secondary' && p.z > 8.4 && p.x > 20.3 && p.x < 23.7) winGame(door);
    });
  };

  // Win Game
  const winGame = (door) => {
    scoreRef.current.award('FIND_SAFE_EXIT');
    scoreRef.current.stats.exitFound = true;
    const escapedNpc = npcSystemRef.current.escapeFollowing();
    if (escapedNpc) scoreRef.current.xp += 50;

    if (playerRef.current) playerRef.current.controls.unlock();
    if (visionRef.current) visionRef.current.reset();
    soundEngine.stopFireAlarm();

    const final = scoreRef.current.finalize();

    const email = localStorage.getItem('currentUserEmail');
    if (email) {
      const userKey = `user_${email}`;
      const userData = JSON.parse(localStorage.getItem(userKey) || '{}');
      const currentXP = userData.xp || 0;
      userData.xp = currentXP + final.xp;
      localStorage.setItem(userKey, JSON.stringify(userData));
    }

    setResultData({
      xp: final.xp,
      level: final.level,
      color: final.color,
      stars: final.stars,
      doorsChecked: scoreRef.current.stats.doorsChecked,
      dangerousDoorsOpened: scoreRef.current.stats.dangerousDoorsOpened,
      exitUsed: door.label,
      healthRemaining: Math.round(health),
      npcRescuedCount: scoreRef.current.stats.npcRescued || 0,
      npcName: escapedNpc ? escapedNpc.archetype.name : '—',
      lessons: final.lessons
    });

    setGameState('result');
  };

  // Lose Game
  const loseGame = () => {
    if (playerRef.current) playerRef.current.controls.unlock();
    if (visionRef.current) visionRef.current.reset();
    soundEngine.stopFireAlarm();
    setGameState('gameover');
  };

  // Reset & Replay
  const restartGame = () => {
    soundEngine.stopFireAlarm();
    setGameState('start');
    setHealth(100);
    setFlashBattery(100);
    setFlashOn(false);
    setSmokeLevel(0);

    if (sceneRef.current && cameraRef.current && rendererRef.current) {
      const building = buildBuilding(sceneRef.current);
      buildingRef.current = building;
      scoreRef.current = new ScoreSystem();
      playerRef.current = new Player(cameraRef.current, rendererRef.current.domElement, getActiveColliders);
      npcSystemRef.current = new NPCSystem(sceneRef.current, getActiveColliders);
      fireSystemRef.current = new FireSmokeSystem(sceneRef.current);
    }
  };

  const handleStartEvacuationClick = () => {
    if (sceneRef.current) {
      fireSystemRef.current = new FireSmokeSystem(sceneRef.current);
    }
    beginMemoryPhase();
  };

  return (
    <div className="sv-container">

      {/* 3D CANVAS */}
      <canvas ref={canvasRef} className="sv-scene" onClick={handleActivate3DSimulation} />

      {/* PROGRESSIVE VISION OVERLAYS */}
      <div id="vision-haze" ref={hazeLayerRef} className="sv-vision-layer" />
      <div id="vision-blur" ref={blurLayerRef} className="sv-vision-layer" />
      <div id="vision-vignette" ref={vignetteLayerRef} className="sv-vision-layer" />

      {/* START SCREEN */}
      {gameState === 'start' && (
        <section id="screen-start" className="sv-screen">
          <div className="sv-panel sv-panel-wide">
            <button className="sv-back-btn" onClick={() => navigate('/dashboard')}>
              ← Back to Dashboard
            </button>
            <div className="sv-brand">
              <span className="sv-brand-fire">🔥</span>
              <h1>SMOKE VISION</h1>
            </div>
            <p className="sv-subtitle">3D FIRE ESCAPE EXPERIENCE</p>
            <div className="sv-story">
              <p>You are inside a multi-room building when a fire breaks out.</p>
              <p>Smoke will fill corridors rapidly — visibility will drop.</p>
            </div>
            <ul className="sv-tips">
              <li>🧠 Remember the building layout before smoke spreads</li>
              <li>🚪 Check door temperatures before opening them</li>
              <li>🧎 Stay low (crouch) in heavy smoke to save health</li>
              <li>🔦 Use your flashlight battery wisely</li>
              <li>🚨 Follow illuminated emergency exit signs to safety</li>
              <li>🤝 Listen for trapped people and help them escape</li>
            </ul>
            <div className="sv-controls-hint">
              <span><b>WASD</b> move</span>
              <span><b>Mouse</b> look around</span>
              <span><b>E</b> check / open door / help</span>
              <span><b>Shift</b> or <b>C</b> crouch</span>
              <span><b>F</b> flashlight</span>
            </div>
            <button className="sv-btn sv-btn-primary" onClick={handleStartEvacuationClick}>
              START EVACUATION
            </button>
          </div>
        </section>
      )}

      {/* MEMORY MAP SCREEN */}
      {gameState === 'memory' && (
        <section id="screen-memory" className="sv-screen">
          <div className="sv-panel sv-panel-wide">
            <h2 id="memory-title">MEMORIZE YOUR ESCAPE ROUTE</h2>
            <div className="sv-memory-countdown">{memoryCountdown}</div>
            <canvas ref={memoryCanvasRef} id="memory-map" width="640" height="420" />
            <div className="sv-memory-legend">
              <span><i className="dot" style={{ background: '#fff2cf' }}></i> You start here</span>
              <span><i className="dot" style={{ background: '#ff3b30' }}></i> Fire origin</span>
              <span><i className="dot" style={{ background: '#ffb020' }}></i> Door</span>
              <span><i className="dot" style={{ background: '#35d07f' }}></i> Safe Exit</span>
            </div>
            <p className="sv-dim">Memorize the building layout before smoke fills the corridors.</p>
          </div>
        </section>
      )}

      {/* SMOKE DETECTED FLASH */}
      {gameState === 'flash' && (
        <div className="sv-flash-alert">SMOKE DETECTED</div>
      )}

      {/* CLICK TO LOCK POINTER OVERLAY */}
      {gameState === 'clicklock' && (
        <div
          id="screen-click"
          className="sv-screen"
          onClick={handleActivate3DSimulation}
          style={{ cursor: 'pointer', zIndex: 100 }}
        >
          <div
            className="sv-panel sv-panel-narrow"
            onClick={handleActivate3DSimulation}
            style={{ cursor: 'pointer' }}
          >
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff', margin: '0 0 10px 0' }}>
              Click to enter 3D Simulation
            </h3>
            <p className="sv-dim" style={{ marginBottom: '18px' }}>
              WASD to move · Mouse to look · Esc to release mouse
            </p>
            <button className="sv-btn sv-btn-primary" onClick={handleActivate3DSimulation}>
              ENTER 3D SIMULATION
            </button>
          </div>
        </div>
      )}

      {/* IN-GAME HUD */}
      {(gameState === 'playing' || gameState === 'tip' || gameState === 'npc') && (
        <div className={`sv-hud ${gameState === 'playing' ? '' : 'hidden'}`}>
          <div className="sv-hud-top-left">
            <div className="sv-hud-stat">
              <span className="sv-hud-icon">❤️</span>
              <div className="sv-bar-track">
                <div
                  className="sv-bar-fill health"
                  style={{
                    width: `${health}%`,
                    background: health > 50 ? '#35d07f' : health > 25 ? '#ffb020' : '#ff3b30'
                  }}
                />
              </div>
              <span>{Math.round(health)}</span>
            </div>
            <div className="sv-hud-stat sv-smoke-indicator">
              <span className="sv-hud-icon">🌫️</span>
              <span
                id="smoke-label"
                style={{
                  color: smokeLevel <= 0.4 ? '#a89e93' : smokeLevel <= 1.5 ? '#ffb020' : smokeLevel <= 2.8 ? '#ff7a33' : '#ff3b30'
                }}
              >
                SMOKE: {smokeLevel <= 0.4 ? 'CLEAR' : smokeLevel <= 1.5 ? 'HAZY' : smokeLevel <= 2.8 ? 'LOW VISIBILITY' : 'CRITICAL'}
              </span>
            </div>
          </div>

          <div className="sv-hud-top-right">
            <div className="sv-hud-stat">
              <span className="sv-hud-icon">🔦</span>
              <div className="sv-bar-track">
                <div
                  className="sv-bar-fill battery"
                  style={{ width: `${flashBattery}%`, opacity: flashOn ? 1 : 0.45 }}
                />
              </div>
              <span>{flashBattery}%</span>
            </div>
          </div>

          <div className="sv-hud-top-center">
            <div className="sv-compass">{compassDir}</div>
            <div className="sv-objective-panel">
              <span className="sv-objective-label">OBJECTIVE</span>
              <span id="objective-text">{objective}</span>
            </div>
          </div>

          {locationVisible && (
            <div className="sv-location-label">{locationName}</div>
          )}

          {isCrawling && (
            <div className="sv-hud-badge">🧎 CRAWLING LOW</div>
          )}

          {interactionPrompt && (
            <div
              className="sv-hud-prompt"
              dangerouslySetInnerHTML={{ __html: interactionPrompt }}
            />
          )}

          {toastMessage && (
            <div className="sv-hud-toast">{toastMessage}</div>
          )}

          <div className="sv-crosshair">+</div>
        </div>
      )}

      {/* NPC DIALOGUE MODAL */}
      {gameState === 'npc' && (
        <section id="screen-npc" className="sv-screen">
          <div className="sv-panel sv-panel-wide sv-npc-panel">
            <h2>{npcModalData.title}</h2>
            <p className="sv-npc-line">{npcModalData.line}</p>
            <p className="sv-tip-advice">{npcModalData.clue}</p>
            <p className="sv-npc-reward">{npcModalData.reward}</p>
            <button className="sv-btn sv-btn-primary" onClick={resumeFromModal}>
              CONTINUE TOGETHER
            </button>
          </div>
        </section>
      )}

      {/* DANGEROUS DOOR / SAFETY TIP MODAL */}
      {gameState === 'tip' && (
        <section id="screen-tip" className="sv-screen">
          <div className="sv-panel sv-panel-wide sv-tip-panel">
            <h2>{tipModalData.title}</h2>
            <p style={{ margin: '12px 0', color: '#d1d5db' }}>{tipModalData.body}</p>
            <p className="sv-tip-advice">{tipModalData.advice}</p>
            <button className="sv-btn sv-btn-primary" onClick={resumeFromModal} style={{ marginTop: '20px' }}>
              CONTINUE
            </button>
          </div>
        </section>
      )}

      {/* RESULT SCREEN */}
      {gameState === 'result' && resultData && (
        <section id="screen-result" className="sv-screen">
          <div className="sv-panel sv-panel-wide">
            <h2 style={{ color: '#4ade80', margin: 0 }}>🎉 SAFE EXIT FOUND!</h2>
            <p className="sv-score-label" style={{ marginTop: '10px' }}>FIRE ESCAPE XP EARNED</p>
            <p className="sv-score-value">+{resultData.xp} XP</p>
            <p className="sv-safety-level">{resultData.color} {resultData.level}</p>
            <p className="sv-stars">{'⭐'.repeat(resultData.stars)}{'☆'.repeat(5 - resultData.stars)}</p>

            <div className="sv-result-grid">
              <div><span>Doors Checked</span>{resultData.doorsChecked}</div>
              <div><span>Hot Doors Opened</span>{resultData.dangerousDoorsOpened}</div>
              <div><span>Exit Route Used</span>{resultData.exitUsed}</div>
              <div><span>Health Remaining</span>{resultData.healthRemaining}</div>
              <div><span>People Rescued</span>{resultData.npcRescuedCount}</div>
              <div><span>Escaped With You</span>{resultData.npcName}</div>
            </div>

            <h3 style={{ fontSize: '15px', color: '#fbbf24', marginTop: '15px', marginBottom: '10px' }}>
              FIRE SAFETY LESSONS LEARNED
            </h3>
            <ul className="sv-lessons">
              {resultData.lessons.map((lesson, idx) => (
                <li key={idx}>{lesson}</li>
              ))}
            </ul>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="sv-btn sv-btn-primary" onClick={restartGame}>
                PLAY AGAIN
              </button>
              <button
                className="sv-btn"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
                onClick={() => navigate('/dashboard')}
              >
                BACK TO DASHBOARD
              </button>
            </div>
          </div>
        </section>
      )}

      {/* GAME OVER SCREEN */}
      {gameState === 'gameover' && (
        <section id="screen-gameover" className="sv-screen">
          <div className="sv-panel sv-panel-wide">
            <h2 style={{ color: '#ef4444', margin: 0 }}>SMOKE EXPOSURE TOO HIGH</h2>
            <p className="sv-dim" style={{ margin: '14px 0' }}>
              You breathed in too much toxic smoke to continue safely.
            </p>
            <p className="sv-tip-advice" style={{ marginBottom: '24px' }}>
              Remember: crawl low in heavy smoke, check door handles for heat, and don't linger near open fire sources.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="sv-btn sv-btn-primary" onClick={restartGame}>
                TRY AGAIN
              </button>
              <button
                className="sv-btn"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
                onClick={() => navigate('/dashboard')}
              >
                BACK TO DASHBOARD
              </button>
            </div>
          </div>
        </section>
      )}

    </div>
  );
};

export default SmokeVision;

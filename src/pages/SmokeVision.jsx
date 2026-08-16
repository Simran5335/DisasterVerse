import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { SmokeVisionEngine } from '../game/smokeVision/SmokeVisionEngine.js';
import { SmokeVisionRenderer } from '../game/smokeVision/SmokeVisionRenderer.js';
import { soundEngine } from '../game/smokeVision/SoundEngine.js';

import SmokeVisionHUD from '../components/smokeVision/SmokeVisionHUD.jsx';
import MemoryMapModal from '../components/smokeVision/MemoryMapModal.jsx';
import DoorInteractionModal from '../components/smokeVision/DoorInteractionModal.jsx';
import ResultsModal from '../components/smokeVision/ResultsModal.jsx';
import DisasterReplay2D from '../components/smokeVision/DisasterReplay2D.jsx';
import LearningScreenModal from '../components/smokeVision/LearningScreenModal.jsx';

const GAME_PHASES = {
  MEMORY_MAP: 'MEMORY_MAP',
  ESCAPE_SIMULATION: 'ESCAPE_SIMULATION',
  RESULTS: 'RESULTS',
  REPLAY_2D: 'REPLAY_2D',
  LEARNING_SCREEN: 'LEARNING_SCREEN'
};

const SmokeVision = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [phase, setPhase] = useState(GAME_PHASES.MEMORY_MAP);
  const engineRef = useRef(null);
  const rendererRef = useRef(null);

  // Dynamic UI States
  const [playerState, setPlayerState] = useState({ health: 100, isCrouching: false, flashlightOn: true, batteryPct: 100 });
  const [smokeLevel, setSmokeLevel] = useState('LOW');
  const [currentObjective, setCurrentObjective] = useState('Find a safe evacuation exit.');
  const [activeDoorData, setActiveDoorData] = useState(null);

  // Initialize Game Session
  const initGame = () => {
    const engine = new SmokeVisionEngine();
    engine.reset();
    engineRef.current = engine;

    if (canvasRef.current) {
      rendererRef.current = new SmokeVisionRenderer(canvasRef.current, engine.layout);
      rendererRef.current.resize(window.innerWidth, window.innerHeight);
    }

    setPhase(GAME_PHASES.MEMORY_MAP);
    soundEngine.stopFireAlarm();
  };

  useEffect(() => {
    initGame();
  }, []);

  // Keyboard Movement & Action Controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (phase !== GAME_PHASES.ESCAPE_SIMULATION || !engineRef.current) return;
      const engine = engineRef.current;

      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') engine.movePlayer(0, -0.6);
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') engine.movePlayer(0, 0.6);
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') engine.movePlayer(-0.6, 0);
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') engine.movePlayer(0.6, 0);

      if (e.key === 'c' || e.key === 'C') {
        engine.toggleCrouch();
        setPlayerState({ ...engine.player });
      }

      if (e.key === 'f' || e.key === 'F') {
        engine.toggleFlashlight();
        setPlayerState({ ...engine.player });
      }

      if (e.key === 'e' || e.key === 'E') {
        const res = engine.interact();
        if (res && res.type === 'DOOR_CHECK') {
          setActiveDoorData(res);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    if (phase !== GAME_PHASES.ESCAPE_SIMULATION) return;

    let animId;
    let lastTime = performance.now();

    const loop = (time) => {
      const dt = Math.min(0.1, (time - lastTime) / 1000);
      lastTime = time;

      const engine = engineRef.current;
      if (engine) {
        engine.update(dt);
        setPlayerState({ ...engine.player });

        const sLevel = engine.smokeEngine.getSmokeAt(engine.player.x, engine.player.z);
        setSmokeLevel(sLevel);

        if (engine.isGameOver) {
          setPhase(GAME_PHASES.RESULTS);
          return;
        }
      }

      if (rendererRef.current && engine) {
        rendererRef.current.render(engine.player, engine.smokeEngine, engine.fireEngine, dt, null);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [phase]);

  const handleStartSimulation = () => {
    setPhase(GAME_PHASES.ESCAPE_SIMULATION);
    soundEngine.startFireAlarm();
  };

  const handleConfirmDoorOpen = () => {
    if (activeDoorData && engineRef.current) {
      engineRef.current.movePlayer(0, 1.2);
    }
    setActiveDoorData(null);
  };

  return (
    <div style={styles.container}>
      {/* 3D GAME CANVAS */}
      <canvas
        ref={canvasRef}
        style={{
          display: phase === GAME_PHASES.ESCAPE_SIMULATION ? 'block' : 'none',
          width: '100vw',
          height: '100vh'
        }}
      />

      {/* GAME HUD OVERLAY */}
      {phase === GAME_PHASES.ESCAPE_SIMULATION && (
        <SmokeVisionHUD
          player={playerState}
          smokeLevel={smokeLevel}
          objective={currentObjective}
          onToggleCrouch={() => engineRef.current && engineRef.current.toggleCrouch()}
          onToggleFlashlight={() => engineRef.current && engineRef.current.toggleFlashlight()}
          onInteract={() => {
            const res = engineRef.current && engineRef.current.interact();
            if (res && res.type === 'DOOR_CHECK') setActiveDoorData(res);
          }}
        />
      )}

      {/* MODALS & PANELS */}
      <MemoryMapModal
        isOpen={phase === GAME_PHASES.MEMORY_MAP}
        onCountdownComplete={handleStartSimulation}
        layout={engineRef.current ? engineRef.current.layout : { rooms: [] }}
      />

      <DoorInteractionModal
        isOpen={!!activeDoorData}
        doorData={activeDoorData}
        onClose={() => setActiveDoorData(null)}
        onConfirmOpen={handleConfirmDoorOpen}
      />

      {phase === GAME_PHASES.RESULTS && (
        <ResultsModal
          isVictory={engineRef.current ? engineRef.current.isVictory : false}
          failReason={engineRef.current ? engineRef.current.failReason : ''}
          userScoreXP={engineRef.current ? engineRef.current.userScoreXP : 0}
          decisionLogs={engineRef.current ? engineRef.current.decisionLogs : []}
          onProceedToReplay={() => setPhase(GAME_PHASES.REPLAY_2D)}
          onReplayLevel={initGame}
        />
      )}

      {phase === GAME_PHASES.REPLAY_2D && (
        <DisasterReplay2D
          routeHistory={engineRef.current ? engineRef.current.routeHistory : []}
          decisionLogs={engineRef.current ? engineRef.current.decisionLogs : []}
          onProceedToLearning={() => setPhase(GAME_PHASES.LEARNING_SCREEN)}
        />
      )}

      <LearningScreenModal
        isOpen={phase === GAME_PHASES.LEARNING_SCREEN}
        onClaimBonusXP={() => navigate('/dashboard')}
        onClose={() => navigate('/dashboard')}
      />
    </div>
  );
};

const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    position: 'relative',
    background: '#090d16',
    userSelect: 'none'
  }
};

export default SmokeVision;

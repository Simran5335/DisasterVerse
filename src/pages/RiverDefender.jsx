import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { WaterGrid } from '../game/WaterGrid.js';
import { BuildingsManager } from '../game/BuildingsManager.js';
import { DefensesManager } from '../game/DefensesManager.js';
import { FloodSimulation } from '../game/FloodSimulation.js';
import { WeatherSystem } from '../game/WeatherSystem.js';
import { EmergencyEventsManager } from '../game/EmergencyEventsManager.js';
import { RescueMissionsManager } from '../game/RescueMissionsManager.js';
import { ComboSystem } from '../game/ComboSystem.js';
import { ScoringEngine } from '../game/ScoringEngine.js';
import { WhatIfAnalyzer } from '../game/WhatIfAnalyzer.js';
import { TrainingModeManager } from '../game/TrainingModeManager.js';
import { IsometricRenderer } from '../game/IsometricRenderer.js';
import { soundManager } from '../game/SoundManager.js';
import { scoreService } from '../services/scoreService.js';
import { gameProgressService } from '../services/gameProgressService.js';
import { SCENARIOS } from '../data/scenarios.js';
import { DEFENSES_DATA } from '../data/defenses.js';

import GameHUD from '../components/riverDefender/GameHUD.jsx';
import DefenseToolbar from '../components/riverDefender/DefenseToolbar.jsx';
import MissionPanel from '../components/riverDefender/MissionPanel.jsx';
import EmergencyModal from '../components/riverDefender/EmergencyModal.jsx';
import MiniMap from '../components/riverDefender/MiniMap.jsx';
import ResultScreen from '../components/riverDefender/ResultScreen.jsx';
import WhatIfPanel from '../components/riverDefender/WhatIfPanel.jsx';
import AchievementPanel from '../components/riverDefender/AchievementPanel.jsx';
import SettingsPanel from '../components/riverDefender/SettingsPanel.jsx';
import ScenarioSelectModal from '../components/riverDefender/ScenarioSelectModal.jsx';
import TutorialModal from '../components/riverDefender/TutorialModal.jsx';

const GAME_STATES = {
  MAIN_MENU: 'MAIN_MENU',
  PLAYING: 'PLAYING',
  RESULTS: 'RESULTS',
  WHAT_IF: 'WHAT_IF'
};

const RiverDefender = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Core Game State
  const [gameState, setGameState] = useState(GAME_STATES.MAIN_MENU);
  const [currentScenario, setCurrentScenario] = useState(SCENARIOS[0]);
  const [selectedDefense, setSelectedDefense] = useState('sandbag');
  const [isPrepPhase, setIsPrepPhase] = useState(true);
  const [prepTimer, setPrepTimer] = useState(45);
  const [floodTimer, setFloodTimer] = useState(180);

  // Training Mode State
  const [isTrainingMode, setIsTrainingMode] = useState(false);
  const trainingManagerRef = useRef(null);
  const [activeTrainingTask, setActiveTrainingTask] = useState(null);

  // Managers & Engines
  const gridRef = useRef(null);
  const buildingsRef = useRef(null);
  const defensesRef = useRef(null);
  const simulationRef = useRef(null);
  const weatherRef = useRef(null);
  const eventsRef = useRef(null);
  const rescuesRef = useRef(null);
  const comboRef = useRef(null);
  const rendererRef = useRef(null);

  // Dynamic UI States
  const [budget, setBudget] = useState(10000);
  const [weatherStats, setWeatherStats] = useState({ phase: 'NORMAL', rainfallMm: 10, riverLevelPct: 25, isLightning: false });
  const [buildingsStats, setBuildingsStats] = useState({ housesSavedPct: 100, hospitalSaved: true });
  const [hoverCell, setHoverCell] = useState(null);

  // Modals & Panels
  const [showTutorial, setShowTutorial] = useState(false);
  const [showObjectives, setShowObjectives] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showScenarioSelect, setShowScenarioSelect] = useState(false);

  // Active Events & Missions
  const [activeEvent, setActiveEvent] = useState(null);
  const [activeMission, setActiveMission] = useState(null);

  // Results & What-If
  const [scoreResult, setScoreResult] = useState(null);
  const [whatIfAnalysis, setWhatIfAnalysis] = useState(null);
  const [userProgress, setUserProgress] = useState(() => gameProgressService.getProgress());

  // Initialize Game Session
  const startNewGame = (scenario = SCENARIOS[0], training = false) => {
    setCurrentScenario(scenario);
    setIsTrainingMode(training);
    setBudget(scenario.initialBudget);
    setIsPrepPhase(true);
    setPrepTimer(scenario.prepTimeSeconds);
    setFloodTimer(scenario.floodDurationSeconds);

    const grid = new WaterGrid(scenario.gridSize.cols, scenario.gridSize.rows, scenario);
    const buildings = new BuildingsManager(grid);
    buildings.placeDefaultCityStructures();

    const defenses = new DefensesManager(grid, scenario.initialBudget);
    const sim = new FloodSimulation(grid, defenses, buildings);
    const weather = new WeatherSystem(scenario);
    const events = new EmergencyEventsManager(sim, defenses);
    const rescues = new RescueMissionsManager(defenses);
    const combo = new ComboSystem();

    if (training) {
      trainingManagerRef.current = new TrainingModeManager();
      setActiveTrainingTask(trainingManagerRef.current.getCurrentTask());
    } else {
      trainingManagerRef.current = null;
      setActiveTrainingTask(null);
    }

    gridRef.current = grid;
    buildingsRef.current = buildings;
    defensesRef.current = defenses;
    simulationRef.current = sim;
    weatherRef.current = weather;
    eventsRef.current = events;
    rescuesRef.current = rescues;
    comboRef.current = combo;

    if (canvasRef.current) {
      rendererRef.current = new IsometricRenderer(canvasRef.current, grid);
      rendererRef.current.resize(window.innerWidth, window.innerHeight);
    }

    setGameState(GAME_STATES.PLAYING);
    soundManager.updateMusicPhase('NORMAL');
  };

  // Keyboard Shortcuts (1-6 select defenses)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== GAME_STATES.PLAYING) return;
      const keys = Object.keys(DEFENSES_DATA);
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= keys.length) {
        setSelectedDefense(keys[num - 1]);
        soundManager.playClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (rendererRef.current && canvasRef.current) {
        rendererRef.current.resize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Main Game Loop (60 FPS)
  useEffect(() => {
    if (gameState !== GAME_STATES.PLAYING) return;

    let animId;
    let lastTime = performance.now();

    const loop = (time) => {
      const dt = Math.min(0.1, (time - lastTime) / 1000);
      lastTime = time;

      // Training Mode Task Updates
      if (isTrainingMode && trainingManagerRef.current) {
        trainingManagerRef.current.update(dt, defensesRef.current ? defensesRef.current.placedDefenses : [], isPrepPhase);
        setActiveTrainingTask(trainingManagerRef.current.getCurrentTask());
      }

      // Preparation Timer
      if (isPrepPhase) {
        setPrepTimer(prev => {
          if (prev <= 1) {
            setIsPrepPhase(false);
            return 0;
          }
          return prev - dt;
        });
      } else {
        // Active Flood Simulation
        setFloodTimer(prev => {
          if (prev <= 1) {
            handleGameOver();
            return 0;
          }
          return prev - dt;
        });

        // Step Weather & Hydraulic Simulation
        weatherRef.current && weatherRef.current.update(dt, isPrepPhase);
        const wStats = weatherRef.current ? weatherRef.current.getWeatherStats() : { phase: 'NORMAL' };
        setWeatherStats(wStats);

        const bStats = simulationRef.current ? simulationRef.current.step(dt, wStats.phase, wStats.riverLevelPct, wStats.rainfallMm) : {};
        setBuildingsStats(bStats);

        // Auto Focus Camera to Hospital Threat Event
        if (bStats.hospitalSaved === false && rendererRef.current) {
          rendererRef.current.focusOnCell(14, 10);
        }

        // Step Constructions & Combos
        defensesRef.current && defensesRef.current.updateConstructions(dt);
        setBudget(defensesRef.current ? defensesRef.current.budget : 10000);

        const newCombos = comboRef.current ? comboRef.current.checkCombos(gridRef.current) : [];
        if (newCombos.length > 0 && rendererRef.current) {
          rendererRef.current.addFloatingText(newCombos[0].title, 12, 12, '#38bdf8');
        }

        // Step Events & Missions
        if (!isTrainingMode) {
          eventsRef.current && eventsRef.current.update(dt, isPrepPhase);
          setActiveEvent(eventsRef.current ? eventsRef.current.activeEvent : null);

          rescuesRef.current && rescuesRef.current.update(dt, isPrepPhase);
          setActiveMission(rescuesRef.current ? rescuesRef.current.activeMission : null);
        }
      }

      // Render 3D Scene
      if (rendererRef.current) {
        rendererRef.current.render(dt, weatherStats, hoverCell, selectedDefense);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, isPrepPhase, hoverCell, selectedDefense, isTrainingMode]);

  // Handle Placement Click on Canvas
  const handleCanvasClick = (e) => {
    if (gameState !== GAME_STATES.PLAYING || !hoverCell) return;

    const check = defensesRef.current.canPlaceDefense(hoverCell.x, hoverCell.y, selectedDefense);
    if (check.valid) {
      const placed = defensesRef.current.placeDefense(hoverCell.x, hoverCell.y, selectedDefense);
      if (placed && rendererRef.current) {
        const meta = DEFENSES_DATA[selectedDefense];
        rendererRef.current.addFloatingText(`+${meta.name.toUpperCase()}`, hoverCell.x, hoverCell.y, meta.color);
      }
      setBudget(defensesRef.current.budget);
    } else {
      soundManager.playClick();
      if (rendererRef.current) {
        rendererRef.current.addFloatingText(check.reason, hoverCell.x, hoverCell.y, '#ef4444');
      }
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!rendererRef.current || !gridRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const gridPos = rendererRef.current.screenToGrid(x, y);
    const cell = gridRef.current.getCell(gridPos.col, gridPos.row);
    setHoverCell(cell);
  };

  // Game Completion
  const handleGameOver = () => {
    const finalStats = {
      buildingsStats: buildingsRef.current ? buildingsRef.current.updateBuildingsState() : {},
      defensesManager: defensesRef.current,
      simulation: simulationRef.current,
      rescueManager: rescuesRef.current,
      comboSystem: comboRef.current,
      weatherSystem: weatherRef.current
    };

    const res = ScoringEngine.calculateFinalScore(finalStats);
    setScoreResult(res);

    // Save Score & Progress
    scoreService.saveScore({ scenarioId: currentScenario.id, scenarioName: currentScenario.title, ...res });
    const updatedProg = gameProgressService.recordGameCompletion(currentScenario.id, res.grade, res.totalXP);
    setUserProgress(updatedProg);

    // Generate What-If Analysis
    const analysis = WhatIfAnalyzer.analyzeStrategy(gridRef.current, defensesRef.current, res);
    setWhatIfAnalysis(analysis);

    setGameState(GAME_STATES.RESULTS);
    soundManager.updateMusicPhase(res.grade === 'D' ? 'DEFEAT' : 'VICTORY');
  };

  return (
    <div style={styles.container}>
      {/* 1. MAIN MENU STATE */}
      {gameState === GAME_STATES.MAIN_MENU && (
        <div style={styles.mainMenuOverlay}>
          <div style={styles.menuBox}>
            <div style={styles.logoBadge}>🌊 DISASTERVERSE PRESENTS</div>
            <h1 style={styles.titleText}>RIVER DEFENDER</h1>
            <p style={styles.subtitleText}>Protect. Adapt. Save.</p>

            <div style={styles.menuButtonsGroup}>
              <button style={styles.btnPrimary} onClick={() => startNewGame(SCENARIOS[0], false)}>
                ▶ PLAY GAME
              </button>
              <button style={styles.btnTraining} onClick={() => startNewGame(SCENARIOS[0], true)}>
                🎓 TRAINING MODE (+100 XP)
              </button>
              <button style={styles.btnSecondary} onClick={() => setShowTutorial(true)}>
                📖 HOW TO PLAY MANUAL
              </button>
              <button style={styles.btnSecondary} onClick={() => setShowScenarioSelect(true)}>
                🗺️ SELECT SCENARIOS
              </button>
              <button style={styles.btnSecondary} onClick={() => setShowAchievements(true)}>
                🏆 ACHIEVEMENTS & BADGES
              </button>
              <button style={styles.btnSecondary} onClick={() => navigate('/dashboard')}>
                🏠 BACK TO DASHBOARD
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. PLAYING GAME STATE */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        style={{
          display: gameState === GAME_STATES.PLAYING ? 'block' : 'none',
          width: '100vw',
          height: '100vh',
          cursor: selectedDefense ? 'crosshair' : 'default'
        }}
      />

      {gameState === GAME_STATES.PLAYING && (
        <>
          <GameHUD
            budget={budget}
            initialBudget={currentScenario.initialBudget}
            weatherStats={weatherStats}
            timerSeconds={floodTimer}
            isPrepPhase={isPrepPhase}
            prepTimeRemaining={Math.ceil(prepTimer)}
            scenario={currentScenario}
            isTrainingMode={isTrainingMode}
            trainingTask={activeTrainingTask}
            onOpenObjectives={() => setShowObjectives(true)}
            onOpenSettings={() => setShowSettings(true)}
            onOpenAchievements={() => setShowAchievements(true)}
            onStartFloodNow={() => { setIsPrepPhase(false); setPrepTimer(0); }}
            onZoomIn={() => rendererRef.current && rendererRef.current.zoomIn()}
            onZoomOut={() => rendererRef.current && rendererRef.current.zoomOut()}
            onFocusHospital={() => rendererRef.current && rendererRef.current.focusOnCell(14, 10)}
          />

          <DefenseToolbar
            selectedDefense={selectedDefense}
            onSelectDefense={setSelectedDefense}
            budget={budget}
          />

          <MiniMap grid={gridRef.current} />

          {!isTrainingMode && (
            <EmergencyModal
              activeEvent={activeEvent}
              activeMission={activeMission}
              onEventChoice={(app) => eventsRef.current && eventsRef.current.handleChoice(app)}
              onMissionChoice={(app) => {
                if (app) rescuesRef.current && rescuesRef.current.acceptMission();
                else rescuesRef.current && rescuesRef.current.declineMission();
                setActiveMission(null);
              }}
              budget={budget}
            />
          )}
        </>
      )}

      {/* 3. RESULTS STATE */}
      {gameState === GAME_STATES.RESULTS && (
        <ResultScreen
          scoreResult={scoreResult}
          scenario={currentScenario}
          onOpenWhatIf={() => setGameState(GAME_STATES.WHAT_IF)}
          onReplay={() => startNewGame(currentScenario, false)}
          onSelectScenario={() => { setGameState(GAME_STATES.MAIN_MENU); setShowScenarioSelect(true); }}
        />
      )}

      {/* 4. WHAT-IF ANALYSIS STATE */}
      {gameState === GAME_STATES.WHAT_IF && (
        <WhatIfPanel
          analysis={whatIfAnalysis}
          onClose={() => setGameState(GAME_STATES.RESULTS)}
          onTestStrategy={() => startNewGame(currentScenario, false)}
        />
      )}

      {/* MODALS */}
      <TutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onStartTraining={() => { setShowTutorial(false); startNewGame(SCENARIOS[0], true); }}
        onStartGame={() => { setShowTutorial(false); startNewGame(SCENARIOS[0], false); }}
      />

      <MissionPanel
        isOpen={showObjectives}
        onClose={() => setShowObjectives(false)}
        scenario={currentScenario}
        buildingsStats={buildingsStats}
        budget={budget}
      />

      <AchievementPanel
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
        userAchievements={userProgress.achievements}
      />

      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onResetProgress={() => { localStorage.clear(); setUserProgress(gameProgressService.getProgress()); setShowSettings(false); }}
      />

      <ScenarioSelectModal
        isOpen={showScenarioSelect}
        onClose={() => setShowScenarioSelect(false)}
        onSelectScenario={(sc) => { setShowScenarioSelect(false); startNewGame(sc, false); }}
        unlockedScenarios={userProgress.unlockedScenarios}
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
    background: '#0f172a',
    userSelect: 'none'
  },
  mainMenuOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100
  },
  menuBox: {
    background: 'rgba(15, 23, 42, 0.92)',
    border: '2px solid #0284c7',
    borderRadius: 24,
    width: '90%',
    maxWidth: 440,
    padding: 36,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
    backdropFilter: 'blur(12px)'
  },
  logoBadge: { color: '#38bdf8', fontSize: '0.82rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: 6 },
  titleText: { fontSize: '2.4rem', fontWeight: 'bold', color: '#f8fafc', margin: 0 },
  subtitleText: { color: '#94a3b8', fontSize: '1rem', marginBottom: 28 },

  menuButtonsGroup: { display: 'flex', flexDirection: 'column', gap: 10, width: '100%' },
  btnPrimary: {
    background: 'linear-gradient(135deg, #0284c7, #2563eb)',
    color: '#ffffff',
    border: 'none',
    padding: '14px',
    borderRadius: 12,
    fontWeight: 'bold',
    fontSize: '1.05rem',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(37,99,235,0.4)'
  },
  btnTraining: {
    background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
    color: '#ffffff',
    border: 'none',
    padding: '12px',
    borderRadius: 12,
    fontWeight: 'bold',
    fontSize: '0.98rem',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(168,85,247,0.4)'
  },
  btnSecondary: {
    background: 'rgba(30, 41, 59, 0.8)',
    color: '#cbd5e1',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '11px',
    borderRadius: 12,
    fontWeight: 'bold',
    fontSize: '0.9rem',
    cursor: 'pointer'
  }
};

export default RiverDefender;

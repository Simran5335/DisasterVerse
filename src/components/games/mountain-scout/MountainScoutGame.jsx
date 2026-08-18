import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LEVELS_DATA, GAME_QUIZ_QUESTIONS, GAME_SETTINGS } from "../../../data/mountainScoutData";
import MountainVillageScene from "./MountainVillageScene";
import MountainRoadScene from "./scenes/MountainRoadScene";
import CliffValleyScene from "./scenes/CliffValleyScene";
import "../../../styles/MountainScout.css";

// Web Audio API Sound Synthesizer Helper
const playSound = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === "discover") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === "level_complete" || type === "win") {
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.25);
      });
    }
  } catch (e) {
    // Ignore audio policy errors
  }
};

export default function MountainScoutGame() {
  const navigate = useNavigate();

  // Level State: 1 | 2 | 3
  const [currentLevel, setCurrentLevel] = useState(1);
  const activeLevelData = LEVELS_DATA[currentLevel] || LEVELS_DATA[1];

  // Game States: 'START' | 'GUIDE' | 'PLAYING' | 'PAUSED' | 'LEVEL_COMPLETE' | 'WIN' | 'TIME_UP' | 'LEARN_QUIZ'
  const [gameState, setGameState] = useState("START");

  // Active Timer State
  const [timeRemaining, setTimeRemaining] = useState(activeLevelData.timer);

  // Score System
  const [score, setScore] = useState(0);

  // Combo System
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const lastDiscoveryTimeRef = useRef(0);

  // Tools & Resources
  const [cluesRemaining, setCluesRemaining] = useState(activeLevelData.maxClues);
  const [activeClueModalText, setActiveClueModalText] = useState(null);

  const [binocularsRemaining, setBinocularsRemaining] = useState(activeLevelData.maxBinoculars);
  const [isBinocularActive, setIsBinocularActive] = useState(false);
  const [isInvestigateMode, setIsInvestigateMode] = useState(false);

  // Viewport Controls
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // Hazards State
  const [discoveredHazards, setDiscoveredHazards] = useState([]);
  const [missedHazards, setMissedHazards] = useState([]);
  const [activeHazardCard, setActiveHazardCard] = useState(null);
  const [showChecklistDrawer, setShowChecklistDrawer] = useState(false);

  // Toast Alerts
  const [distractorToastMsg, setDistractorToastMsg] = useState(null);
  const [comboEducationalBanner, setComboEducationalBanner] = useState(null);

  // Quiz State
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [quizSelectedOption, setQuizSelectedOption] = useState(null);
  const [quizScore, setQuizScore] = useState(0);

  const timerRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  // STRICT TIMER CONTROL: Timer runs ONLY when gameState === "PLAYING" AND no overlay/modal is open!
  const isTimerActive =
    gameState === "PLAYING" &&
    !activeHazardCard &&
    !activeClueModalText &&
    !showChecklistDrawer;

  useEffect(() => {
    if (isTimerActive) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setGameState("TIME_UP");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerActive]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // Open Instruction Guide for a Level
  const openLevelGuide = (levelNum) => {
    const lvlData = LEVELS_DATA[levelNum] || LEVELS_DATA[1];
    setCurrentLevel(levelNum);
    setGameState("GUIDE");
    setTimeRemaining(lvlData.timer);
    setCluesRemaining(lvlData.maxClues);
    setActiveClueModalText(null);
    setBinocularsRemaining(lvlData.maxBinoculars);
    setIsBinocularActive(false);
    setIsInvestigateMode(false);
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
    setDiscoveredHazards([]);
    setMissedHazards([]);
    setActiveHazardCard(null);
    setShowChecklistDrawer(false);
    setDistractorToastMsg(null);
    setComboEducationalBanner(null);
  };

  // Start Gameplay Timer
  const startLevelGameplay = (levelNum) => {
    setCurrentLevel(levelNum);
    setGameState("PLAYING");
  };

  // Full Game Reset
  const handleStartGame = () => {
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    openLevelGuide(1);
  };

  // Restart Current Level
  const handleRestartCurrentLevel = () => {
    openLevelGuide(currentLevel);
  };

  // Proceed to Next Level
  const handleNextLevel = () => {
    if (currentLevel < 3) {
      openLevelGuide(currentLevel + 1);
    } else {
      setGameState("WIN");
    }
  };

  // Handle Hazard Discovery Click
  const handleHazardClick = (hazard) => {
    if (gameState !== "PLAYING") return;

    if (!discoveredHazards.includes(hazard.id)) {
      const now = Date.now();
      const timeSinceLast = (now - lastDiscoveryTimeRef.current) / 1000;
      lastDiscoveryTimeRef.current = now;

      let newCombo = 1;
      if (timeSinceLast < 12 && combo > 0) {
        newCombo = combo + 1;
      }
      setCombo(newCombo);
      setMaxCombo((prev) => Math.max(prev, newCombo));

      const pointsEarned = hazard.points || 50;
      const nextDiscovered = [...discoveredHazards, hazard.id];

      setDiscoveredHazards(nextDiscovered);
      setScore((prev) => prev + pointsEarned);
      setActiveHazardCard(hazard);
      playSound("discover");

      if (nextDiscovered.length >= 3) {
        setComboEducationalBanner(
          "⚠️ Educational Insight: Several warning signs occurring together indicate increasing slope instability!"
        );
      }

      if (nextDiscovered.length === activeLevelData.targetCount) {
        if (timerRef.current) clearInterval(timerRef.current);
        playSound("level_complete");
        setTimeout(() => {
          if (currentLevel < 3) {
            setGameState("LEVEL_COMPLETE");
          } else {
            setGameState("WIN");
          }
        }, 600);
      }
    } else {
      setActiveHazardCard(hazard);
    }
  };

  // Handle Distractor Click
  const handleDistractorClick = (distractor) => {
    if (gameState !== "PLAYING" || activeHazardCard) return;

    setCombo(0);
    setScore((prev) => Math.max(0, prev - 10));
    setDistractorToastMsg(`🔎 Not a warning sign: ${distractor.message}`);

    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setDistractorToastMsg(null);
    }, 2500);
  };

  // Handle Wrong Background Click
  const handleSceneClick = () => {
    if (gameState !== "PLAYING" || activeHazardCard) return;

    setCombo(0);
    setScore((prev) => Math.max(0, prev - 10));
    setDistractorToastMsg("🔎 That looks normal. Investigate another area carefully!");

    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setDistractorToastMsg(null);
    }, 2000);
  };

  // Handle Use Clue
  const handleUseClue = () => {
    if (cluesRemaining <= 0 || gameState !== "PLAYING") return;

    const undiscovered = activeLevelData.hazards.filter((h) => !discoveredHazards.includes(h.id));
    if (undiscovered.length === 0) return;

    const randomTarget = undiscovered[Math.floor(Math.random() * undiscovered.length)];
    const text = `💡 CLUE (${activeLevelData.name}): Look in AREA ${randomTarget.area || "A"} for warning sign: "${randomTarget.name}"`;
    setActiveClueModalText(text);
    setCluesRemaining((prev) => prev - 1);
  };

  // Handle Binoculars Tool
  const handleToggleBinoculars = () => {
    if (binocularsRemaining <= 0 && !isBinocularActive) return;

    if (!isBinocularActive) {
      setIsBinocularActive(true);
      setZoomScale(1.4);
      setBinocularsRemaining((prev) => prev - 1);
    } else {
      setIsBinocularActive(false);
      setZoomScale(1);
    }
  };

  // Zoom controls
  const handleZoomIn = () => setZoomScale((prev) => Math.min(2.0, prev + 0.25));
  const handleZoomOut = () => {
    setZoomScale((prev) => {
      const next = Math.max(1.0, prev - 0.25);
      if (next === 1.0) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const progressPct = (discoveredHazards.length / activeLevelData.targetCount) * 100;

  return (
    <div className="mountain-scout-page">
      {/* CONTAINED GAME CARD */}
      <div className="mountain-game-card">
        {/* TOP CARD HUD HEADER */}
        <div className="mountain-card-header">
          <div className="card-header-left">
            <span className="card-lvl-badge">LEVEL {currentLevel}</span>
            <h2 className="card-title">🏔️ {activeLevelData.headerTitle}</h2>
          </div>
          <div className="card-header-right">
            <div className={`card-stat-pill timer ${timeRemaining <= 15 ? "urgent" : ""}`}>
              ⏱ {timeRemaining}s
            </div>
            <div className="card-stat-pill xp">
              ⭐ {score} XP
            </div>
            {combo > 1 && (
              <div className="card-stat-pill combo">
                🔥 x{combo}
              </div>
            )}
            <button className="card-icon-btn" onClick={() => setGameState("PAUSED")} title="Pause">
              ⏸️
            </button>
            <button className="card-icon-btn" onClick={handleRestartCurrentLevel} title="Restart Level">
              🔄
            </button>
          </div>
        </div>

        {/* CONTAINED SCENE WRAPPER */}
        <div className="mountain-image-wrapper">
          {currentLevel === 1 && (
            <MountainVillageScene
              hazards={activeLevelData.hazards}
              distractors={activeLevelData.distractors}
              discoveredHazards={discoveredHazards}
              missedHazards={missedHazards}
              onHazardClick={handleHazardClick}
              onDistractorClick={handleDistractorClick}
              onSceneClick={handleSceneClick}
              disabled={gameState !== "PLAYING" || !!activeHazardCard || !!activeClueModalText}
              zoomScale={zoomScale}
              panOffset={panOffset}
              setPanOffset={setPanOffset}
              isInvestigateMode={isInvestigateMode}
              isBinocularActive={isBinocularActive}
            />
          )}

          {currentLevel === 2 && (
            <MountainRoadScene
              hazards={activeLevelData.hazards}
              distractors={activeLevelData.distractors}
              discoveredHazards={discoveredHazards}
              missedHazards={missedHazards}
              onHazardClick={handleHazardClick}
              onDistractorClick={handleDistractorClick}
              onSceneClick={handleSceneClick}
              disabled={gameState !== "PLAYING" || !!activeHazardCard || !!activeClueModalText}
              zoomScale={zoomScale}
              panOffset={panOffset}
              setPanOffset={setPanOffset}
              isInvestigateMode={isInvestigateMode}
              isBinocularActive={isBinocularActive}
            />
          )}

          {currentLevel === 3 && (
            <CliffValleyScene
              hazards={activeLevelData.hazards}
              distractors={activeLevelData.distractors}
              discoveredHazards={discoveredHazards}
              missedHazards={missedHazards}
              onHazardClick={handleHazardClick}
              onDistractorClick={handleDistractorClick}
              onSceneClick={handleSceneClick}
              disabled={gameState !== "PLAYING" || !!activeHazardCard || !!activeClueModalText}
              zoomScale={zoomScale}
              panOffset={panOffset}
              setPanOffset={setPanOffset}
              isInvestigateMode={isInvestigateMode}
              isBinocularActive={isBinocularActive}
            />
          )}

          {/* TOAST ALERTS OVERLAY */}
          {distractorToastMsg && gameState === "PLAYING" && (
            <div className="ms-floating-toast-alert">{distractorToastMsg}</div>
          )}

          {comboEducationalBanner && gameState === "PLAYING" && (
            <div className="ms-floating-edu-banner">
              {comboEducationalBanner}
            </div>
          )}
        </div>

        {/* BOTTOM GAME CARD FOOTER / CONTROLS & TASK HUD */}
        <div className="mountain-card-footer">
          {/* LEFT: ZOOM CONTROLS */}
          <div className="footer-left">
            <button className="footer-btn" onClick={handleZoomIn} title="Zoom In">🔍 +</button>
            <button className="footer-btn" onClick={handleZoomOut} title="Zoom Out">🔍 −</button>
            <button className="footer-btn" onClick={() => { setZoomScale(1); setPanOffset({ x: 0, y: 0 }); }}>🎯 RESET</button>
          </div>

          {/* CENTER: TASK TRACKER */}
          <div className="footer-center">
            <div className="footer-progress-info">
              <span>TASKS FOUND: <strong>{discoveredHazards.length} / {activeLevelData.targetCount}</strong></span>
              <button className="footer-checklist-btn" onClick={() => setShowChecklistDrawer((prev) => !prev)}>
                📋 Task Checklist
              </button>
            </div>
            <div className="footer-progress-track">
              <div className="footer-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          {/* RIGHT: TOOLS */}
          <div className="footer-right">
            <button
              className={`footer-btn ${isBinocularActive ? "active" : ""}`}
              onClick={handleToggleBinoculars}
              disabled={binocularsRemaining <= 0 && !isBinocularActive}
            >
              🔭 Binoculars ({binocularsRemaining})
            </button>
            <button
              className="footer-btn"
              onClick={handleUseClue}
              disabled={cluesRemaining <= 0}
            >
              💡 Clue ({cluesRemaining})
            </button>
          </div>
        </div>
      </div>

      {/* CHECKLIST DRAWER OVERLAY */}
      {showChecklistDrawer && gameState === "PLAYING" && (
        <div className="ms-drawer-backdrop" onClick={() => setShowChecklistDrawer(false)}>
          <div className="ms-checklist-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="ms-drawer-header">
              <h3>📋 LEVEL {currentLevel} TASK CHECKLIST</h3>
              <button onClick={() => setShowChecklistDrawer(false)}>×</button>
            </div>
            <div className="ms-drawer-list">
              {activeLevelData.hazards.map((h) => {
                const isFound = discoveredHazards.includes(h.id);
                return (
                  <div key={h.id} className={`ms-drawer-item ${isFound ? "found" : ""}`}>
                    <span className="item-status">{isFound ? "✓" : "○"}</span>
                    <span className="item-name">{h.name}</span>
                    <span className="item-cat">{h.category}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: START SCREEN MODAL */}
      {gameState === "START" && (
        <div className="ms-modal-backdrop">
          <div className="ms-start-card">
            <span style={{ fontSize: "56px" }}>🏔️🔎</span>
            <h1 className="ms-start-title">MOUNTAIN SCOUT</h1>
            <p className="ms-start-sub">Landslide Safety Inspection Expedition</p>

            <div className="ms-levels-preview-grid">
              <div className="ms-level-card">
                <span className="ms-lvl-tag" style={{ background: "#34d399" }}>LEVEL 1</span>
                <h3>CLIFFSIDE WARNING</h3>
                <p>Find 5 landslide warning signs.</p>
                <span className="ms-lvl-target">Target: 5/5 Tasks • 250 XP</span>
              </div>

              <div className="ms-level-card">
                <span className="ms-lvl-tag" style={{ background: "#fbbf24" }}>LEVEL 2</span>
                <h3>MOUNTAIN VILLAGE INSPECTION</h3>
                <p>Find 10 signs of slope instability.</p>
                <span className="ms-lvl-target">Target: 10/10 Tasks • 750 XP</span>
              </div>

              <div className="ms-level-card">
                <span className="ms-lvl-tag" style={{ background: "#f43f5e" }}>LEVEL 3</span>
                <h3>HIGH MOUNTAIN EXPEDITION</h3>
                <p>Complete full safety inspection (15 warning signs).</p>
                <span className="ms-lvl-target">Target: 15/15 Tasks • 1500 XP</span>
              </div>
            </div>

            <button className="ms-start-btn" onClick={handleStartGame}>
              🚀 START SCOUTING EXPEDITION →
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: LEVEL INSTRUCTION GUIDE MODAL */}
      {gameState === "GUIDE" && (
        <div className="ms-modal-backdrop">
          <div className="ms-guide-modal">
            <div className="ms-guide-header">
              <span className="ms-guide-badge" style={{ background: activeLevelData.badgeColor }}>
                LEVEL {currentLevel}: {activeLevelData.difficulty}
              </span>
              <h2 className="ms-guide-title">{activeLevelData.headerTitle}</h2>
            </div>

            <div className="ms-guide-body">
              <div className="ms-guide-section">
                <strong className="ms-guide-section-label">🎯 YOUR MISSION OBJECTIVE:</strong>
                <p className="ms-guide-text" style={{ fontSize: "16px", fontWeight: "bold", color: "#fef08a" }}>
                  {currentLevel === 1 && "Find 5 landslide warning signs before time runs out."}
                  {currentLevel === 2 && "Inspect the mountain village and find 10 warning signs."}
                  {currentLevel === 3 && "Complete the mountain safety inspection and find 15 warning signs."}
                </p>
              </div>

              <div className="ms-guide-section">
                <strong className="ms-guide-section-label">🔎 TASKS TO COMPUTE ({activeLevelData.targetCount} TASKS):</strong>
                <div className="ms-guide-tasks-grid">
                  {activeLevelData.hazards.map((h, idx) => (
                    <div key={h.id} className="ms-guide-task-item">
                      <span className="ms-guide-task-name">Task {idx + 1}: {h.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ms-guide-section">
                <strong className="ms-guide-section-label">💡 SCOUT TIPS:</strong>
                <ul className="ms-guide-tips-list">
                  <li>Click suspicious objects or areas to investigate warning signs.</li>
                  <li>Use <strong>Area A–E Navigation Pills</strong> at the top to focus camera.</li>
                  <li>Use <strong>Binoculars</strong> for zoomed inspection.</li>
                  <li>Use <strong>Clues</strong> when you need an area hint.</li>
                </ul>
              </div>
            </div>

            <button className="ms-guide-start-btn" onClick={() => startLevelGameplay(currentLevel)}>
              ▶ START LEVEL {currentLevel} (0/{activeLevelData.targetCount} FOUND)
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: PAUSE MODAL */}
      {gameState === "PAUSED" && (
        <div className="ms-modal-backdrop">
          <div className="ms-card-modal">
            <span style={{ fontSize: "48px" }}>⏸️</span>
            <h2 className="ms-card-title">MISSION PAUSED</h2>
            <p style={{ color: "#94a3b8", fontSize: "14px" }}>
              Gameplay timer paused for Level {currentLevel}: {activeLevelData.missionName}.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
              <button className="ms-card-btn" onClick={() => setGameState("PLAYING")}>
                ▶ Resume Scouting
              </button>
              <button className="ms-btn-secondary" onClick={handleRestartCurrentLevel}>
                🔄 View Level Instructions
              </button>
              <button className="ms-btn-secondary" onClick={() => navigate("/dashboard")}>
                🏠 Exit to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: ACTIVE CLUE MODAL */}
      {activeClueModalText && (
        <div className="ms-modal-backdrop" onClick={() => setActiveClueModalText(null)}>
          <div className="ms-card-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ms-card-header-icon">💡</div>
            <h2 className="ms-card-title">INVESTIGATION CLUE</h2>
            <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "12px" }}>
              ⏱️ Timer paused while reading clue text.
            </p>

            <div className="ms-educational-block">
              <p className="ms-edu-text" style={{ color: "#fef08a", fontSize: "14px", fontWeight: "bold" }}>
                {activeClueModalText}
              </p>
            </div>

            <button className="ms-card-btn" onClick={() => setActiveClueModalText(null)}>
              Resume Gameplay →
            </button>
          </div>
        </div>
      )}

      {/* MODAL 5: HAZARD DISCOVERY POLISHED POPUP CARD */}
      {activeHazardCard && (
        <div className="ms-modal-backdrop" onClick={() => setActiveHazardCard(null)}>
          <div className="ms-card-modal hazard-popup" onClick={(e) => e.stopPropagation()}>
            <div className="ms-popup-header-tag">⚠ LANDSLIDE WARNING</div>
            <h2 className="ms-card-title" style={{ marginTop: "4px" }}>{activeHazardCard.name}</h2>
            <span className="ms-popup-cat">{activeHazardCard.category?.toUpperCase() || "LANDSLIDE WARNING SIGN"}</span>

            <div className="ms-educational-block">
              <span className="ms-edu-section-title">EXPLANATION:</span>
              <p className="ms-edu-text">{activeHazardCard.explanation || activeHazardCard.description}</p>

              <span className="ms-edu-section-title">SAFETY ACTION:</span>
              <p className="ms-edu-text safety-tip">{activeHazardCard.safetyAction || activeHazardCard.safetyTip}</p>
            </div>

            <div className="ms-popup-reward-badge">+{activeHazardCard.points || 50} XP</div>

            <button className="ms-card-btn" onClick={() => setActiveHazardCard(null)}>
              CONTINUE →
            </button>
          </div>
        </div>
      )}

      {/* MODAL 6: LEVEL UNLOCKED / TRANSITION MODAL */}
      {gameState === "LEVEL_COMPLETE" && (
        <div className="ms-modal-backdrop">
          <div className="ms-end-card">
            <span style={{ fontSize: "56px" }}>🎉🔓</span>
            <h1 className="ms-start-title" style={{ color: "#38bdf8" }}>
              {currentLevel === 1 ? "CLIFFSIDE INSPECTION COMPLETE!" : "MOUNTAIN VILLAGE INSPECTION COMPLETE!"}
            </h1>
            <p className="ms-start-sub" style={{ fontSize: "16px", color: "#34d399", fontWeight: "bold" }}>
              {currentLevel === 1 ? "5 / 5 warning signs found." : "10 / 10 warning signs found."}
            </p>

            <div className="ms-score-summary">
              <div className="ms-score-chip">
                <span>TASKS COMPLETED</span>
                <strong>{discoveredHazards.length} / {activeLevelData.targetCount} ✅</strong>
              </div>
              <div className="ms-score-chip">
                <span>XP EARNED</span>
                <strong style={{ color: "#fbbf24" }}>+{discoveredHazards.length * (currentLevel === 1 ? 50 : 75)} XP</strong>
              </div>
            </div>

            <div className="ms-end-btn-group">
              <button className="ms-btn-primary" onClick={handleNextLevel}>
                PROCEED TO LEVEL {currentLevel + 1} →
              </button>
              <button className="ms-btn-secondary" onClick={handleRestartCurrentLevel}>
                🔄 Replay Level {currentLevel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: WIN SCREEN */}
      {gameState === "WIN" && (
        <div className="ms-modal-backdrop">
          <div className="ms-end-card">
            <span style={{ fontSize: "56px" }}>🏆🌟</span>
            <h1 className="ms-start-title" style={{ color: "#34d399" }}>
              HIGH MOUNTAIN EXPEDITION COMPLETE!
            </h1>
            <p className="ms-start-sub" style={{ fontSize: "16px", color: "#38bdf8", fontWeight: "bold" }}>
              15 / 15 warning signs found.
            </p>

            <div className="ms-score-summary">
              <div className="ms-score-chip">
                <span>MISSIONS CLEARED</span>
                <strong>3 / 3 ✅</strong>
              </div>
              <div className="ms-score-chip">
                <span>TOTAL XP EARNED</span>
                <strong style={{ color: "#fbbf24" }}>{score} XP</strong>
              </div>
            </div>

            <div className="ms-end-btn-group">
              <button className="ms-btn-primary" onClick={handleStartGame}>
                🔄 REPLAY SCOUT EXPEDITION
              </button>
              <button className="ms-btn-secondary" onClick={() => {
                setCurrentQuizIdx(0);
                setQuizSelectedOption(null);
                setQuizScore(0);
                setGameState("LEARN_QUIZ");
              }}>
                📚 LEARN & TEST QUIZ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: TIME-UP SCREEN */}
      {gameState === "TIME_UP" && (
        <div className="ms-modal-backdrop">
          <div className="ms-end-card timeup">
            <span style={{ fontSize: "56px" }}>⏰</span>
            <h1 className="ms-start-title" style={{ color: "#f43f5e" }}>
              INSPECTION INCOMPLETE
            </h1>
            <p className="ms-start-sub">
              FOUND: {discoveredHazards.length} / {activeLevelData.targetCount}
            </p>

            <div style={{ background: "#1e293b", padding: "12px", borderRadius: "12px", fontSize: "13px", color: "#cbd5e1", textAlign: "left", marginBottom: "12px" }}>
              <strong style={{ color: "#f43f5e", display: "block", marginBottom: "4px" }}>
                MISSED WARNING SIGNS:
              </strong>
              {activeLevelData.hazards.filter((h) => !discoveredHazards.includes(h.id)).map((h) => (
                <div key={h.id} style={{ marginTop: "6px", fontSize: "12px" }}>
                  <strong style={{ color: "#38bdf8" }}>{h.name}:</strong> {h.description}
                </div>
              ))}
            </div>

            <div className="ms-end-btn-group">
              <button className="ms-btn-primary" onClick={handleRestartCurrentLevel}>
                🔄 RETRY LEVEL {currentLevel}
              </button>
              <button className="ms-btn-secondary" onClick={() => setGameState("START")}>
                🏠 RETURN TO MENU
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 9: INTERACTIVE QUIZ */}
      {gameState === "LEARN_QUIZ" && (
        <div className="ms-modal-backdrop">
          <div className="ms-quiz-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h2 style={{ color: "#38bdf8", margin: 0, fontSize: "20px" }}>📚 LANDSLIDE SAFETY QUIZ</h2>
              <span style={{ fontSize: "12px", color: "#94a3b8" }}>Question {currentQuizIdx + 1} / {GAME_QUIZ_QUESTIONS.length}</span>
            </div>

            <h3 style={{ color: "#f8fafc", fontSize: "15px", margin: "8px 0 16px 0" }}>
              {GAME_QUIZ_QUESTIONS[currentQuizIdx].question}
            </h3>

            <div className="ms-quiz-options">
              {GAME_QUIZ_QUESTIONS[currentQuizIdx].options.map((opt, optIdx) => {
                const isCorrect = optIdx === GAME_QUIZ_QUESTIONS[currentQuizIdx].correctIndex;
                const isSelected = quizSelectedOption === optIdx;

                return (
                  <button
                    key={optIdx}
                    onClick={() => {
                      if (quizSelectedOption !== null) return;
                      setQuizSelectedOption(optIdx);
                      if (isCorrect) setQuizScore((prev) => prev + 100);
                    }}
                    className={`ms-quiz-opt-btn ${quizSelectedOption !== null ? (isCorrect ? "correct" : isSelected ? "wrong" : "") : ""}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {quizSelectedOption !== null && (
              <div style={{ background: "#1e293b", padding: "10px", borderRadius: "10px", fontSize: "12px", color: "#cbd5e1", marginBottom: "16px" }}>
                💡 <strong>Explanation:</strong> {GAME_QUIZ_QUESTIONS[currentQuizIdx].explanation}
              </div>
            )}

            {quizSelectedOption !== null && (
              <button
                className="ms-card-btn"
                onClick={() => {
                  if (currentQuizIdx < GAME_QUIZ_QUESTIONS.length - 1) {
                    setCurrentQuizIdx((prev) => prev + 1);
                    setQuizSelectedOption(null);
                  } else {
                    alert(`Quiz Complete! You earned ${quizScore} bonus knowledge points!`);
                    handleStartGame();
                  }
                }}
              >
                {currentQuizIdx < GAME_QUIZ_QUESTIONS.length - 1 ? "Next Question →" : "Finish Quiz & Return to Game"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

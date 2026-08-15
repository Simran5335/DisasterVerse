import React, { useState, useEffect, useRef } from "react";
import { HAZARDS_DATA, GAME_QUIZ_QUESTIONS, GAME_SETTINGS } from "../../../data/mountainScoutData";
import MountainVillageScene from "./MountainVillageScene";
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
    } else if (type === "win") {
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
  // Game States: 'START' | 'PLAYING' | 'PAUSED' | 'WIN' | 'TIME_UP' | 'LEARN_QUIZ'
  const [gameState, setGameState] = useState("START");
  const [timeRemaining, setTimeRemaining] = useState(GAME_SETTINGS.initialTime);
  const [score, setScore] = useState(0);

  // Combo System
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const lastDiscoveryTimeRef = useRef(0);

  // Tools & Resources
  const [cluesRemaining, setCluesRemaining] = useState(GAME_SETTINGS.maxClues);
  const [activeClueText, setActiveClueText] = useState(null);
  const [binocularsRemaining, setBinocularsRemaining] = useState(GAME_SETTINGS.maxBinoculars);
  const [isBinocularActive, setIsBinocularActive] = useState(false);
  const [isInvestigateMode, setIsInvestigateMode] = useState(false);

  // Zoom & Pan Camera Controls
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // Hazards State
  const [discoveredHazards, setDiscoveredHazards] = useState([]);
  const [missedHazards, setMissedHazards] = useState([]);
  const [activeHazardCard, setActiveHazardCard] = useState(null);

  // Feedback & Dynamic Event State
  const [wrongClickCount, setWrongClickCount] = useState(0);
  const [wrongToastMsg, setWrongToastMsg] = useState(null);
  const [observeNotice, setObserveNotice] = useState(false);

  // Quiz State
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [quizSelectedOption, setQuizSelectedOption] = useState(null);
  const [quizScore, setQuizScore] = useState(0);

  const timerRef = useRef(null);
  const toastTimeoutRef = useRef(null);
  const eventTimerRef = useRef(null);

  // Main Game Countdown Timer
  useEffect(() => {
    if (gameState === "PLAYING") {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameState]);

  // Occasional Dynamic Event ("👀 SOMETHING CHANGED...")
  useEffect(() => {
    if (gameState === "PLAYING") {
      eventTimerRef.current = setInterval(() => {
        if (Math.random() > 0.4 && !activeHazardCard) {
          setObserveNotice(true);
          setTimeout(() => setObserveNotice(false), 3000);
        }
      }, 14000);
    } else {
      if (eventTimerRef.current) clearInterval(eventTimerRef.current);
    }
    return () => {
      if (eventTimerRef.current) clearInterval(eventTimerRef.current);
    };
  }, [gameState, activeHazardCard]);

  // Clean up toasts on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // Handle Game Start / Restart
  const handleStartGame = () => {
    setGameState("PLAYING");
    setTimeRemaining(GAME_SETTINGS.initialTime);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setCluesRemaining(GAME_SETTINGS.maxClues);
    setActiveClueText(null);
    setBinocularsRemaining(GAME_SETTINGS.maxBinoculars);
    setIsBinocularActive(false);
    setIsInvestigateMode(false);
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
    setDiscoveredHazards([]);
    setMissedHazards([]);
    setActiveHazardCard(null);
    setWrongClickCount(0);
    setWrongToastMsg(null);
  };

  // Handle Hazard Click
  const handleHazardClick = (hazard) => {
    if (gameState !== "PLAYING") return;

    if (!discoveredHazards.includes(hazard.id)) {
      const now = Date.now();
      const timeSinceLast = (now - lastDiscoveryTimeRef.current) / 1000;
      lastDiscoveryTimeRef.current = now;

      // Calculate Combo
      let newCombo = 1;
      if (timeSinceLast < 12 && combo > 0) {
        newCombo = combo + 1;
      }
      setCombo(newCombo);
      setMaxCombo((prev) => Math.max(prev, newCombo));

      const comboBonus = (newCombo - 1) * GAME_SETTINGS.comboIncrement;
      const pointsEarned = GAME_SETTINGS.basePoints + comboBonus;

      const nextDiscovered = [...discoveredHazards, hazard.id];
      setDiscoveredHazards(nextDiscovered);
      setScore((prev) => prev + pointsEarned);
      setActiveHazardCard(hazard);
      playSound("discover");

      // Check Victory Condition (All 6 found!)
      if (nextDiscovered.length === HAZARDS_DATA.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        playSound("win");
        setTimeout(() => {
          setGameState("WIN");
        }, 500);
      }
    } else {
      setActiveHazardCard(hazard);
    }
  };

  // Handle Wrong Background Click
  const handleSceneClick = () => {
    if (gameState !== "PLAYING" || activeHazardCard) return;

    setCombo(0); // Reset combo on wrong click
    setWrongClickCount((prev) => {
      const newCount = prev + 1;
      let msg = "Nothing unusual here... Keep observing!";
      if (newCount > 4) msg = "Slow down, Scout. Observe carefully before clicking!";
      else if (newCount > 2) msg = "That's part of the normal mountain environment.";

      setWrongToastMsg(msg);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => {
        setWrongToastMsg(null);
      }, 1800);

      return newCount;
    });
  };

  // Handle Use Clue
  const handleUseClue = () => {
    if (cluesRemaining <= 0 || gameState !== "PLAYING") return;

    const undiscovered = HAZARDS_DATA.filter((h) => !discoveredHazards.includes(h.id));
    if (undiscovered.length === 0) return;

    const randomTarget = undiscovered[Math.floor(Math.random() * undiscovered.length)];
    setActiveClueText(`💡 CLUE: ${randomTarget.clueText}`);
    setCluesRemaining((prev) => prev - 1);
  };

  // Handle Binoculars Toggle
  const handleToggleBinoculars = () => {
    if (isBinocularActive) {
      setIsBinocularActive(false);
      setZoomScale(1);
    } else if (binocularsRemaining > 0) {
      setIsBinocularActive(true);
      setBinocularsRemaining((prev) => prev - 1);
      setZoomScale(1.4);
    }
  };

  // Handle Time Up
  const handleTimeUp = () => {
    setGameState("TIME_UP");
    const missed = HAZARDS_DATA.filter((h) => !discoveredHazards.includes(h.id)).map((h) => h.id);
    setMissedHazards(missed);
  };

  // Calculations for Final Score & Ratings
  const timeBonus = timeRemaining * GAME_SETTINGS.timeBonusMultiplier;
  const clueBonus = cluesRemaining * GAME_SETTINGS.clueBonus;
  const binocularBonus = binocularsRemaining * GAME_SETTINGS.binocularBonus;
  const finalScore = score + (discoveredHazards.length === HAZARDS_DATA.length ? timeBonus + clueBonus + binocularBonus : 0);

  const getScoutRating = (totScore) => {
    if (totScore >= 950) return { title: "🏆 EXPERT SCOUT", color: "#fbbf24" };
    if (totScore >= 800) return { title: "🥇 GREAT SCOUT", color: "#34d399" };
    if (totScore >= 600) return { title: "🥈 GOOD OBSERVER", color: "#38bdf8" };
    return { title: "🥉 KEEP PRACTICING", color: "#cbd5e1" };
  };

  const rating = getScoutRating(finalScore);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="mountain-scout-game">
      {/* TOP HUD BAR */}
      <header className="ms-hud">
        <div className="ms-hud-brand">
          <div className="ms-hud-title">
            <span>🏔️</span> MOUNTAIN SCOUT
          </div>
          <span className="ms-hud-sub">Landslide Warning Mission</span>
        </div>

        {/* Countdown Timer with 3 Visual Urgency States */}
        <div
          className={`ms-hud-timer ${
            timeRemaining <= 15 ? "urgent" : timeRemaining <= 30 ? "warning" : ""
          }`}
        >
          ⏱️ {formatTime(timeRemaining)}
        </div>

        <div className="ms-hud-controls">
          <div className="ms-stat-chip">
            🔎 {discoveredHazards.length} / {HAZARDS_DATA.length}
          </div>

          <div className="ms-stat-chip" style={{ color: "#fbbf24" }}>
            ⭐ {score}
          </div>

          {combo > 1 && <div className="ms-combo-chip">🔥 COMBO x{combo}</div>}

          {/* Pause Button */}
          {gameState === "PLAYING" && (
            <button className="ms-action-icon-btn" onClick={() => setGameState("PAUSED")}>
              ⏸ Pause
            </button>
          )}
        </div>
      </header>

      {/* TOOLBAR & EXPLORATION CONTROL ROW */}
      {gameState === "PLAYING" && (
        <div className="ms-control-bar">
          <div className="ms-zoom-group">
            <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "bold" }}>VIEWPORT:</span>
            <button
              className="ms-tool-btn"
              onClick={() => setZoomScale((prev) => Math.min(1.8, prev + 0.2))}
            >
              🔍 Zoom In
            </button>
            <button
              className="ms-tool-btn"
              onClick={() => setZoomScale((prev) => Math.max(1.0, prev - 0.2))}
            >
              🔎 Zoom Out
            </button>
            <button
              className="ms-tool-btn"
              onClick={() => {
                setZoomScale(1);
                setPanOffset({ x: 0, y: 0 });
              }}
            >
              ↔ Reset View
            </button>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            {/* Investigate Mode Toggle Button */}
            <button
              className={`ms-action-icon-btn ${isInvestigateMode ? "active" : ""}`}
              onClick={() => setIsInvestigateMode(!isInvestigateMode)}
            >
              🔍 Investigate Mode
            </button>

            {/* Binoculars Toggle Button */}
            <button
              className={`ms-action-icon-btn ${isBinocularActive ? "active" : ""}`}
              onClick={handleToggleBinoculars}
              disabled={binocularsRemaining <= 0 && !isBinocularActive}
            >
              🔭 Binoculars ({binocularsRemaining}/3)
            </button>

            {/* Use Clue Button */}
            <button
              className="ms-action-icon-btn"
              onClick={handleUseClue}
              disabled={cluesRemaining <= 0}
            >
              💡 Use Clue ({cluesRemaining}/3)
            </button>
          </div>
        </div>
      )}

      {/* MAIN GAME BODY GRID */}
      <div className="ms-game-body">
        {/* MOUNTAIN VILLAGE SCENE & HOTSPOTS */}
        <div style={{ position: "relative" }}>
          <MountainVillageScene
            discoveredHazards={discoveredHazards}
            missedHazards={missedHazards}
            onHazardClick={handleHazardClick}
            onSceneClick={handleSceneClick}
            disabled={gameState !== "PLAYING" || !!activeHazardCard}
            zoomScale={zoomScale}
            panOffset={panOffset}
            setPanOffset={setPanOffset}
            isInvestigateMode={isInvestigateMode}
            isBinocularActive={isBinocularActive}
            observeNotice={observeNotice}
          />

          {/* WRONG CLICK TOAST ALERT */}
          {wrongToastMsg && gameState === "PLAYING" && (
            <div className="ms-wrong-toast">🔎 {wrongToastMsg}</div>
          )}
        </div>

        {/* SIDEBAR CHECKLIST & CLUE PANEL */}
        <aside className="ms-sidebar">
          <div>
            <h3 className="ms-sidebar-title">
              <span>📋</span> Warning Signs Checklist
            </h3>
            <div className="ms-checklist-progress">
              {discoveredHazards.length} / {HAZARDS_DATA.length} FOUND
            </div>
          </div>

          <div className="ms-checklist">
            {HAZARDS_DATA.filter(h => h && h.id && h.name).map((h) => {
              const isFound = discoveredHazards.includes(h.id);
              return (
                <div key={h.id} className={`ms-check-item ${isFound ? "found" : ""}`}>
                  <span className="ms-check-icon">{isFound ? "✓" : "?"}</span>
                  <span>{h.name}</span>
                </div>
              );
            })}
          </div>

          {/* ACTIVE CLUE DISPLAY BOX */}
          {activeClueText && (
            <div className="ms-clue-display-box">
              {activeClueText}
            </div>
          )}
        </aside>
      </div>

      {/* MODAL 1: START SCREEN MODAL */}
      {gameState === "START" && (
        <div className="ms-modal-backdrop">
          <div className="ms-start-card">
            <span style={{ fontSize: "56px" }}>🏔️🔎</span>
            <h1 className="ms-start-title">MOUNTAIN SCOUT</h1>
            <p className="ms-start-sub">Landslide Warning Mission — Explore. Observe. Detect the danger.</p>

            <div className="ms-start-instructions">
              <strong style={{ color: "#38bdf8", display: "block", marginBottom: "6px" }}>
                🎯 YOUR MISSION:
              </strong>
              Investigate the mountain village and identify all <strong>6 hidden landslide warning signs</strong> before the slope collapses!
              <br /><br />
              🛠️ <strong>Tools Available:</strong>
              <ul style={{ margin: "6px 0 0 16px", padding: 0 }}>
                <li>🔍 <strong>Zoom & Pan</strong>: Zoom in and drag the canvas to inspect distant slopes.</li>
                <li>🔭 <strong>Binoculars (3)</strong>: Enlarge distant hillside sections.</li>
                <li>💡 <strong>Clues (3)</strong>: Get observational hints for hidden hazards.</li>
                <li>🔥 <strong>Combos</strong>: Discover signs quickly to earn extra combo points!</li>
              </ul>
            </div>

            <button className="ms-start-btn" onClick={handleStartGame}>
              ▶ START SCOUTING
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: PAUSE MODAL */}
      {gameState === "PAUSED" && (
        <div className="ms-modal-backdrop">
          <div className="ms-card-modal">
            <span style={{ fontSize: "48px" }}>⏸️</span>
            <h2 className="ms-card-title">GAME PAUSED</h2>
            <p style={{ color: "#94a3b8", fontSize: "14px" }}>Timer and investigation paused.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
              <button className="ms-card-btn" onClick={() => setGameState("PLAYING")}>
                ▶ Resume Scouting
              </button>
              <button className="ms-btn-secondary" onClick={handleStartGame}>
                🔄 Restart Mission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: HAZARD DISCOVERY EXPLANATION CARD */}
      {activeHazardCard && gameState === "PLAYING" && (
        <div className="ms-modal-backdrop" onClick={() => setActiveHazardCard(null)}>
          <div className="ms-card-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ms-card-header-icon">{activeHazardCard.icon}</div>
            <h2 className="ms-card-title">🔎 {activeHazardCard.name.toUpperCase()}</h2>

            <div className="ms-educational-block">
              <span className="ms-edu-section-title">WHAT YOU FOUND:</span>
              <p className="ms-edu-text">{activeHazardCard.explanation}</p>

              <span className="ms-edu-section-title">WHY IT MATTERS:</span>
              <p className="ms-edu-text">{activeHazardCard.whyItMatters}</p>

              <span className="ms-edu-section-title">WHAT TO WATCH FOR:</span>
              <p className="ms-edu-text" style={{ color: "#fbbf24" }}>{activeHazardCard.whatToWatchFor}</p>
            </div>

            <button className="ms-card-btn" onClick={() => setActiveHazardCard(null)}>
              Continue Exploring →
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: WIN SCREEN (MISSION COMPLETE) */}
      {gameState === "WIN" && (
        <div className="ms-modal-backdrop">
          <div className="ms-end-card">
            <span style={{ fontSize: "56px" }}>🎉🏆</span>
            <h1 className="ms-start-title" style={{ color: "#34d399" }}>
              MISSION COMPLETE!
            </h1>
            <span className="ms-rating-badge">{rating.title}</span>
            <p className="ms-start-sub">You successfully identified all 6 landslide warning signs!</p>

            <div className="ms-score-summary">
              <div className="ms-score-chip">
                <span>HAZARDS FOUND</span>
                <strong>6 / 6 ✅</strong>
              </div>
              <div className="ms-score-chip">
                <span>TIME REMAINING</span>
                <strong>{timeRemaining}s</strong>
              </div>
              <div className="ms-score-chip">
                <span>MAX COMBO</span>
                <strong>🔥 x{maxCombo}</strong>
              </div>
              <div className="ms-score-chip">
                <span>TIME BONUS</span>
                <strong style={{ color: "#fbbf24" }}>+{timeBonus}</strong>
              </div>
              <div className="ms-score-chip">
                <span>CLUE BONUS</span>
                <strong style={{ color: "#fbbf24" }}>+{clueBonus}</strong>
              </div>
              <div className="ms-score-chip">
                <span>BINOCULAR BONUS</span>
                <strong style={{ color: "#fbbf24" }}>+{binocularBonus}</strong>
              </div>
            </div>

            <div style={{ background: "#1e293b", padding: "12px", borderRadius: "12px", fontSize: "15px", color: "#38bdf8", fontWeight: "bold" }}>
              ⭐ FINAL SCORE: {finalScore} POINTS
            </div>

            <div className="ms-end-btn-group">
              <button className="ms-btn-primary" onClick={handleStartGame}>
                🔄 PLAY AGAIN
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

      {/* MODAL 5: TIME-UP SCREEN (TIMEOUT) */}
      {gameState === "TIME_UP" && (
        <div className="ms-modal-backdrop">
          <div className="ms-end-card timeup">
            <span style={{ fontSize: "56px" }}>⏰</span>
            <h1 className="ms-start-title" style={{ color: "#f43f5e" }}>
              TIME'S UP!
            </h1>
            <p className="ms-start-sub">
              You found {discoveredHazards.length} out of {HAZARDS_DATA.length} warning signs.
            </p>

            <div style={{ background: "#1e293b", padding: "12px", borderRadius: "12px", fontSize: "13px", color: "#cbd5e1", textAlign: "left", marginBottom: "12px" }}>
              <strong style={{ color: "#f43f5e", display: "block", marginBottom: "4px" }}>
                ⚠️ MISSED WARNING SIGNS REVEALED ON MAP:
              </strong>
              {HAZARDS_DATA.filter((h) => !discoveredHazards.includes(h.id)).map((h) => (
                <div key={h.id} style={{ marginTop: "6px", fontSize: "12px" }}>
                  <strong style={{ color: "#38bdf8" }}>{h.icon} {h.name}:</strong> {h.shortDesc}
                </div>
              ))}
            </div>

            <div className="ms-end-btn-group">
              <button className="ms-btn-primary" onClick={handleStartGame}>
                🔄 RETRY SCOUTING
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

      {/* MODAL 6: INTERACTIVE QUIZ & LEARNING CHALLENGE */}
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
                {currentQuizIdx < GAME_QUIZ_QUESTIONS.length - 1 ? "Next Question →" : "Finish Quiz & Play Game"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

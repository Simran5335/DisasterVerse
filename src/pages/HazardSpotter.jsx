import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { hazardSpotterLevels } from "../data/hazardSpotterLevels";

import "../styles/hazard/HazardSpotter.css";
import "../styles/hazard/Home.css";
import "../styles/hazard/School.css";
import "../styles/hazard/Office.css";

const ENVIRONMENTS = {
  home: {
    id: "home",
    name: "Home",
    icon: "🏠",
    desc: "Scan a family home across 5 progressive levels to identify household risks."
  },
  school: {
    id: "school",
    name: "School",
    icon: "🏫",
    desc: "Inspect classrooms, labs, and grounds across 5 levels to detect school hazards."
  },
  office: {
    id: "office",
    name: "Office",
    icon: "🏢",
    desc: "Examine corporate workspaces across 5 levels for electrical & ergonomic concerns."
  },
  outdoors: {
    id: "outdoors",
    name: "Outdoors",
    icon: "🌳",
    desc: "Inspect public outdoor areas across 5 levels to spot structural & environmental hazards."
  }
};

// Encouraging, kid-friendly near miss & wrong click feedback messages
const NEAR_MISS_MESSAGES = [
  "So close! 🔎",
  "Almost! 👀 Look a little closer.",
  "Very close! 🔎 You're in the right area!",
  "So close! Check around here. ✨",
  "Warm! Take a closer look right here. 🧐"
];

const WRONG_MESSAGES = [
  "Try again! 👀",
  "Not quite! Keep scanning. 🔎",
  "Good try! Keep looking. 💡",
  "Take another look around! 🧐",
  "Good observation! Keep searching. 🔍"
];

// Development / alignment debug toggle. Set to true to inspect hotspot boxes & center coordinates.
const DEBUG_HOTSPOTS = false;

// Small tolerance around hazard bounds (1% normalized)
const CLICK_PADDING = 1;

// Distance in normalized % coordinates to trigger "So close!" proximity feedback
const NEAR_MISS_PADDING = 5;

function getRandomMessage(msgArray, lastMsg) {
  const filtered = msgArray.filter((message) => message !== lastMsg);
  const choices = filtered.length > 0 ? filtered : msgArray;
  return choices[Math.floor(Math.random() * choices.length)];
}

/**
 * Calculates distance from a click point (percentage) to a hazard's rectangular bounding box (percentage).
 * Returns 0 if click is inside the hazard box, otherwise returns distance in % points.
 */
function distanceToHazard(clickX, clickY, hazard) {
  const left = hazard.x;
  const right = hazard.x + hazard.width;
  const top = hazard.y;
  const bottom = hazard.y + hazard.height;

  const dx = clickX < left ? left - clickX : clickX > right ? clickX - right : 0;
  const dy = clickY < top ? top - clickY : clickY > bottom ? clickY - bottom : 0;

  return Math.sqrt(dx * dx + dy * dy);
}

function validateHazards(hazards, envName, levelNumber) {
  if (!hazards || !Array.isArray(hazards)) return;
  const ids = hazards.map((h) => h.id);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);

  if (duplicateIds.length > 0) {
    console.error(`[HazardSpotter Validation] Duplicate hazard IDs in ${envName} Level ${levelNumber}:`, duplicateIds);
  }

  hazards.forEach((hazard) => {
    if (!hazard.id) console.error(`[HazardSpotter Validation] Hazard missing ID in ${envName} Level ${levelNumber}:`, hazard);
    if (!hazard.name) console.error(`[HazardSpotter Validation] Hazard missing name:`, hazard.id);
    if (!hazard.category) console.error(`[HazardSpotter Validation] Hazard missing category:`, hazard.id);
    if (!hazard.explanation && !hazard.description) console.error(`[HazardSpotter Validation] Hazard missing explanation:`, hazard.id);

    if (
      hazard.x < 0 ||
      hazard.y < 0 ||
      hazard.width <= 0 ||
      hazard.height <= 0 ||
      hazard.x + hazard.width > 100 ||
      hazard.y + hazard.height > 100
    ) {
      console.error(`[HazardSpotter Validation] Invalid hotspot bounds for ${hazard.id}:`, {
        x: hazard.x,
        y: hazard.y,
        width: hazard.width,
        height: hazard.height
      });
    }
  });
}

export default function HazardSpotter() {
  const navigate = useNavigate();

  const [env, setEnv] = useState(null);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);

  const [foundHazards, setFoundHazards] = useState([]);
  const [selectedHazard, setSelectedHazard] = useState(null);

  const [wrongClicks, setWrongClicks] = useState(0);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("wrong");
  const [showToast, setShowToast] = useState(false);

  // Contextual Hint System
  const [activeHintText, setActiveHintText] = useState(null);
  const [lastHintHazardId, setLastHintHazardId] = useState(null);

  const [animateCounter, setAnimateCounter] = useState(false);
  const [totalScore, setTotalScore] = useState(0);

  const toastTimeoutRef = useRef(null);
  const hintTimeoutRef = useRef(null);
  const counterTimeoutRef = useRef(null);
  const lastToastRef = useRef("");
  // Cleanup timers
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
      if (counterTimeoutRef.current) clearTimeout(counterTimeoutRef.current);
    };
  }, []);

  const [showInstructionGuide, setShowInstructionGuide] = useState(true);

  // Environment selection
  const handleSelectEnvironment = (selectedEnv) => {
    setEnv(selectedEnv);
    setCurrentLevelIndex(0);
    setFoundHazards([]);
    setSelectedHazard(null);
    setWrongClicks(0);
    setShowToast(false);
    setToastMessage("");
    setActiveHintText(null);
    setLastHintHazardId(null);
    setShowInstructionGuide(true);
    lastToastRef.current = "";
  };

  const currentEnv = env ? ENVIRONMENTS[env] : null;
  const envLevels = env ? hazardSpotterLevels[env] || [] : [];
  const currentLevel = envLevels[currentLevelIndex] || null;
  const currentHazards = currentLevel?.hazards || [];
  // Dynamic Image Source with PUBLIC_URL & Fallback Handling
  const getResolvedImagePath = (levelObj) => {
    if (!levelObj) return "";
    const rawImage = levelObj.image || `/images/hazard/${env}/level${levelObj.levelNumber || 1}.jpg`;
    const publicUrl = process.env.PUBLIC_URL || "";
    const cleanPath = rawImage.startsWith("/") ? rawImage : `/${rawImage}`;
    return `${publicUrl}${cleanPath}`;
  };

  const [imgSrc, setImgSrc] = useState(() => getResolvedImagePath(currentLevel));

  useEffect(() => {
    if (currentLevel) {
      setImgSrc(getResolvedImagePath(currentLevel));
      validateHazards(currentHazards, currentEnv?.name, currentLevel.levelNumber);
    }
  }, [currentLevel, env, currentLevelIndex]);

  const handleImageError = () => {
    console.error(`[HazardSpotter] Failed to load image at "${imgSrc}" for ${env} level ${currentLevelIndex + 1}`);
    const fallbackPath = `${process.env.PUBLIC_URL || ""}/images/hazard/${env}/level${currentLevel?.levelNumber || 1}.jpg`;
    if (imgSrc !== fallbackPath) {
      setImgSrc(fallbackPath);
    }
  };

  // Hint Threshold Logic based on Level Difficulty:
  const requiredHazardsForHint = (currentLevel?.levelNumber || 1) <= 2 ? 2 : 3;
  const isHintUnlocked =
    foundHazards.length >= Math.min(requiredHazardsForHint, currentHazards.length - 1) &&
    foundHazards.length < currentHazards.length;

  // Correct hazard click handler — 1:1 Identity Pairing via hazard.id
  const handleHazardClick = (hazard) => {
    if (!hazard || !hazard.id) return;

    // Developer Pairing Validation Log
    console.log("[HazardSpotter] Hazard Clicked:", {
      clickedHazardId: hazard.id,
      clickedHazardName: hazard.name,
      clickedHazardCategory: hazard.category,
      clickedHazardDescription: hazard.explanation || hazard.description,
      x: hazard.x,
      y: hazard.y,
      width: hazard.width,
      height: hazard.height
    });

    // Already found
    if (foundHazards.includes(hazard.id)) {
      setSelectedHazard({
        ...hazard,
        modalTitle: "Hazard Already Identified"
      });
      return;
    }

    const nextFoundCount = foundHazards.length + 1;
    let modalTitle = "🎯 Great Spotting!";

    if (nextFoundCount === currentHazards.length) {
      modalTitle = "🏆 Final Hazard Found!";
    } else if (nextFoundCount === currentHazards.length - 1) {
      modalTitle = "🔥 Almost Complete!";
    } else if (nextFoundCount > 1) {
      modalTitle = "⭐ Excellent Finding!";
    }

    setFoundHazards((prev) => [...prev, hazard.id]);
    setSelectedHazard({
      ...hazard,
      modalTitle
    });

    // Dismiss active hint when a hazard is found
    setActiveHintText(null);

    setAnimateCounter(true);
    if (counterTimeoutRef.current) clearTimeout(counterTimeoutRef.current);
    counterTimeoutRef.current = setTimeout(() => {
      setAnimateCounter(false);
    }, 400);
  };

  // Wrong click / near miss handler with exact image-bound coordinate calculation
  const handleSceneClick = (event) => {
    if (selectedHazard) return;

    // Ignore clicks on actual hotspot buttons
    if (event.target.closest(".hazard-hotspot-container")) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    // Calculate percentage click coordinates relative to the EXACT RENDERED IMAGE
    const clickX = ((event.clientX - rect.left) / rect.width) * 100;
    const clickY = ((event.clientY - rect.top) / rect.height) * 100;

    setWrongClicks((prev) => prev + 1);

    const undiscovered = currentHazards.filter((h) => !foundHazards.includes(h.id));
    if (undiscovered.length === 0) return;

    // Find nearest undiscovered hazard
    let nearestDistance = Infinity;
    undiscovered.forEach((h) => {
      const dist = distanceToHazard(clickX, clickY, h);
      if (dist < nearestDistance) {
        nearestDistance = dist;
      }
    });

    const isNearMiss = nearestDistance <= NEAR_MISS_PADDING;
    const messages = isNearMiss ? NEAR_MISS_MESSAGES : WRONG_MESSAGES;
    const message = getRandomMessage(messages, lastToastRef.current);

    lastToastRef.current = message;
    setToastMessage(message);
    setToastType(isNearMiss ? "near-miss" : "wrong");
    setShowToast(true);

    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setShowToast(false);
    }, 1800);
  };

  // Trigger Contextual Hint
  const handleTriggerHint = () => {
    if (!isHintUnlocked) return;

    const undiscovered = currentHazards.filter((h) => !foundHazards.includes(h.id));
    if (undiscovered.length === 0) return;

    // Pick a candidate undiscovered hazard (prefer one not previously shown)
    let candidate = undiscovered.find((h) => h.id !== lastHintHazardId);
    if (!candidate) candidate = undiscovered[0];

    setLastHintHazardId(candidate.id);
    const hintContent = candidate.hint || `Look carefully around the ${candidate.name.toLowerCase()} area.`;
    setActiveHintText(hintContent);

    if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    hintTimeoutRef.current = setTimeout(() => {
      setActiveHintText(null);
    }, 7000);
  };

  // Next level handler
  const handleNextLevel = () => {
    const levelScore = Math.max(foundHazards.length * 20 - wrongClicks * 2, 0);
    setTotalScore((prev) => prev + levelScore);

    if (currentLevelIndex < envLevels.length - 1) {
      setCurrentLevelIndex((prev) => prev + 1);
      setFoundHazards([]);
      setSelectedHazard(null);
      setWrongClicks(0);
      setShowToast(false);
      setToastMessage("");
      setActiveHintText(null);
      setLastHintHazardId(null);
      setShowInstructionGuide(true);
      lastToastRef.current = "";
    } else {
      setEnv(null);
      setCurrentLevelIndex(0);
      setFoundHazards([]);
      setSelectedHazard(null);
      setWrongClicks(0);
      setShowToast(false);
      setActiveHintText(null);
      setShowInstructionGuide(true);
    }
  };

  // Replay level
  const handleReplayLevel = () => {
    setFoundHazards([]);
    setSelectedHazard(null);
    setWrongClicks(0);
    setShowToast(false);
    setToastMessage("");
    setActiveHintText(null);
    setLastHintHazardId(null);
    setShowInstructionGuide(true);
    lastToastRef.current = "";
  };

  // Change environment
  const handleChooseAnother = () => {
    setEnv(null);
    setCurrentLevelIndex(0);
    setFoundHazards([]);
    setSelectedHazard(null);
    setWrongClicks(0);
    setShowToast(false);
    setToastMessage("");
    setActiveHintText(null);
    setLastHintHazardId(null);
    lastToastRef.current = "";
  };

  const currentLevelScore = Math.max(foundHazards.length * 20 - wrongClicks * 2, 0);
  const progress = currentHazards.length > 0 ? (foundHazards.length / currentHazards.length) * 100 : 0;
  const isLevelComplete = currentHazards.length > 0 && foundHazards.length === currentHazards.length;

  // ENVIRONMENT SELECTION SCREEN
  if (!env) {
    return (
      <div className="hazard-page selection">
        <header className="hazard-header">
          <div className="header-container">
            <div className="header-title-section">
              <p className="header-category">Safety Training</p>
              <h1 className="header-title">Hazard Spotter</h1>
            </div>
            <button className="exit-btn" onClick={() => navigate("/dashboard")} type="button">
              ← Back to Dashboard
            </button>
          </div>
        </header>

        <main className="hazard-main">
          <section className="env-selector">
            <h2 className="env-selector-title">Choose an environment</h2>
            <p className="env-selector-subtitle">
              Inspect 4 real-world environments across 20 progressive difficulty levels to spot hidden safety hazards.
            </p>

            <div className="env-cards-grid">
              {Object.values(ENVIRONMENTS).map((environment) => (
                <button
                  key={environment.id}
                  onClick={() => handleSelectEnvironment(environment.id)}
                  className={`env-card ${env === environment.id ? "selected" : ""}`}
                  type="button"
                >
                  <span className="env-card-icon">{environment.icon}</span>
                  <h3 className="env-card-name">{environment.name}</h3>
                  <p className="env-card-desc">{environment.desc}</p>
                </button>
              ))}
            </div>

            {totalScore > 0 && (
              <div
                style={{
                  marginTop: "2.5rem",
                  display: "inline-block",
                  background: "rgba(255,255,255,0.03)",
                  padding: "0.85rem 1.75rem",
                  borderRadius: "14px",
                  border: "1px solid var(--border-color)"
                }}
              >
                <span
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em"
                  }}
                >
                  Total Training Points:
                </span>
                <span
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: "800",
                    color: "var(--primary-accent)",
                    marginLeft: "0.5rem"
                  }}
                >
                  {totalScore} XP
                </span>
              </div>
            )}
          </section>
        </main>
      </div>
    );
  }

  // ACTIVE ENVIRONMENT GAMEPLAY
  return (
    <div className={`hazard-page ${env}`}>
      {/* HEADER */}
      <header className="hazard-header">
        <div className="header-container">
          <div className="header-title-section">
            <p className="header-category">SAFETY TRAINING — {currentEnv.name.toUpperCase()}</p>
            <h1 className="header-title">Hazard Spotter</h1>
            <p className="header-subtitle">Scan the scene and click on items or areas that present a safety risk.</p>
          </div>

          <div className="header-controls">
            {!isLevelComplete && (
              <>
                <div className="header-stat" style={{ marginRight: "0.5rem" }}>
                  <p className="stat-label">Level {currentLevel.levelNumber} / 5</p>
                  <p className="stat-val" style={{ fontSize: "1.1rem", color: "var(--primary-accent)" }}>
                    {currentLevel.difficulty}
                  </p>
                </div>

                <div className="header-stat">
                  <p className="stat-label">Hazards Found</p>
                  <p className={`stat-val ${animateCounter ? "pop-animate" : ""}`}>
                    {foundHazards.length}
                    <span className="stat-val-total"> / {currentHazards.length}</span>
                  </p>
                </div>
              </>
            )}

            <button className="exit-btn" onClick={handleChooseAnother} type="button">
              ← Change Room
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="hazard-main">
        {/* COMPLETION SCREEN */}
        {isLevelComplete ? (
          <div className="completion-screen">
            <span className="completion-icon">🎉</span>
            <h2 className="completion-title">
              {currentLevelIndex === envLevels.length - 1
                ? `${currentEnv.name} Environment Mastered!`
                : `Level ${currentLevel.levelNumber} Complete!`}
            </h2>

            <p className="completion-desc">
              {currentLevelIndex === envLevels.length - 1
                ? `Outstanding! You successfully identified all potential safety hazards across all 5 levels in the ${currentEnv.name} scene.`
                : `Great job! You found all ${currentHazards.length} hazards in Level ${currentLevel.levelNumber} (${currentLevel.difficulty}). Ready for the next challenge?`}
            </p>

            <div className="completion-stats">
              <div className="completion-stat-box">
                <span className="completion-stat-lbl">Hazards Found</span>
                <span className="completion-stat-val">
                  {foundHazards.length} / {currentHazards.length}
                </span>
              </div>

              <div className="completion-stat-box">
                <span className="completion-stat-lbl">Level Score</span>
                <span className="completion-stat-val">{currentLevelScore} XP</span>
              </div>
            </div>

            <div className="completion-actions">
              {currentLevelIndex < envLevels.length - 1 ? (
                <>
                  <button className="btn-primary" onClick={handleNextLevel} type="button">
                    Next Level (Level {currentLevel.levelNumber + 1}) →
                  </button>
                  <button className="btn-secondary" onClick={handleReplayLevel} type="button">
                    Replay Level
                  </button>
                </>
              ) : (
                <>
                  <button className="btn-primary" onClick={handleChooseAnother} type="button">
                    Choose Another Environment
                  </button>
                  <button className="btn-secondary" onClick={handleReplayLevel} type="button">
                    Replay Level 5
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          /* ACTIVE GAMEPLAY BOARD */
          <section className="gameboard-section">
            {/* STATS & HINT CONTROLS */}
            <div className="stats-grid">
              <div className="stat-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p className="stat-card-title">
                    Progress — Level {currentLevel.levelNumber} ({currentLevel.difficulty})
                  </p>
                  <p className="stat-card-title" style={{ color: "var(--primary-accent)", fontWeight: "700" }}>
                    {Math.round(progress)}%
                  </p>
                </div>
                <div className="progress-container">
                  <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="stat-card">
                <p className="stat-card-title">Current Score</p>
                <p className="stat-card-number">{currentLevelScore} XP</p>
              </div>

              {/* HINT BUTTON CARD */}
              <div className="stat-card hint-card-box">
                <p className="stat-card-title">Scout Assistance</p>
                {isHintUnlocked ? (
                  <button className="hint-trigger-btn unlocked" onClick={handleTriggerHint} type="button">
                    💡 Get a Hint
                  </button>
                ) : (
                  <div className="hint-trigger-btn locked" title={`Find ${requiredHazardsForHint} hazards to unlock hints`}>
                    🔒 Hint unlocks at {requiredHazardsForHint} found ({foundHazards.length}/{requiredHazardsForHint})
                  </div>
                )}
              </div>
            </div>

            {/* CONTEXTUAL HINT DISPLAY CARD */}
            {activeHintText && (
              <div className="hint-display-card">
                <div className="hint-card-inner">
                  <span className="hint-card-icon">💡</span>
                  <div className="hint-card-text-group">
                    <strong className="hint-card-header">SCOUT HINT</strong>
                    <p className="hint-card-body">{activeHintText}</p>
                  </div>
                  <button className="hint-card-close" onClick={() => setActiveHintText(null)} type="button">
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* =================================================
                IMAGE + HOTSPOTS (EXACT IMAGE RENDERED BOUNDS WRAPPER)
                ================================================= */}
            <div className="scene-container">
              <div className="scene-image-wrapper" onClick={handleSceneClick}>
                <img
                  src={imgSrc || currentLevel.image}
                  alt={`${currentEnv.name} Level ${currentLevel.levelNumber}`}
                  className="scene-image"
                  draggable="false"
                  onError={handleImageError}
                />

                {/* HOTSPOT LAYER OVERLAY MATCHING EXACT IMAGE RENDERED BOUNDS */}
                <div className="hotspot-layer">
                  {currentHazards.map((hazard) => {
                    const found = foundHazards.includes(hazard.id);

                    return (
                      <button
                        key={hazard.id}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleHazardClick(hazard);
                        }}
                        className={`hazard-hotspot-container ${found ? "found" : ""} ${DEBUG_HOTSPOTS ? "debug-mode" : ""}`}
                        style={{
                          left: `${hazard.x}%`,
                          top: `${hazard.y}%`,
                          width: `${hazard.width}%`,
                          height: `${hazard.height}%`
                        }}
                        aria-label={hazard.name}
                      >
                        <div className="hazard-hotspot-visual">
                          {found && <span className="hotspot-check">✓</span>}

                          {DEBUG_HOTSPOTS && (
                            <div className="debug-tag">
                              <div className="debug-tag-id">{hazard.id}</div>
                              <div className="debug-tag-coords">
                                x:{hazard.x} y:{hazard.y}
                              </div>
                              <div className="debug-tag-size">
                                w:{hazard.width} h:{hazard.height}
                              </div>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* WRONG / NEAR MISS TOAST */}
                {showToast && (
                  <div className={toastType === "near-miss" ? "near-miss-toast" : "wrong-click-toast"}>
                    {toastMessage}
                  </div>
                )}
              </div>
            </div>

            {/* INSTRUCTIONS */}
            <div className="instructions-card">
              <span style={{ fontSize: "1.2rem" }}>🔍</span>
              <p className="instructions-text">
                <span className="instructions-accent">Hover</span> over areas of interest to spot minor irregularities.
                Click on objects to check if they present a safety hazard. Need help? Use the scout hint button above!
              </p>
            </div>
          </section>
        )}
      </main>

      {/* HAZARD DETAIL MODAL */}
      {selectedHazard && (
        <div className="modal-backdrop" onClick={() => setSelectedHazard(null)}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" onClick={() => setSelectedHazard(null)} aria-label="Close details">
              ×
            </button>

            <div className="modal-header">
              <div style={{ display: "inline-block", background: "rgba(56, 189, 248, 0.15)", border: "1px solid #38bdf8", color: "#38bdf8", fontSize: "0.75rem", fontWeight: "800", padding: "0.2rem 0.65rem", borderRadius: "10px", marginBottom: "0.4rem" }}>
                {selectedHazard.modalTitle || "🎯 Hazard Identified"}
              </div>
              <h2 className="modal-title" style={{ fontSize: "1.4rem", fontWeight: "900", color: "#ffffff", margin: "0 0 0.25rem 0" }}>
                {selectedHazard.name}
              </h2>
              <p className="modal-category" style={{ fontSize: "0.85rem", color: "#38bdf8", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
                {selectedHazard.category}
              </p>
            </div>

            <div className="modal-risk-box">
              <p className="modal-risk-label">
                <span>⚠️</span> {selectedHazard.risk}
              </p>
              <p className="modal-explanation">{selectedHazard.explanation}</p>
            </div>

            <div className="modal-tip-box">
              <p className="modal-tip-label">Safety Action Plan</p>
              <p className="modal-tip-text">{selectedHazard.safetyTip}</p>
            </div>

            <button className="modal-continue-btn" type="button" onClick={() => setSelectedHazard(null)}>
              Continue
            </button>
          </div>
        </div>
      )}

      {/* PRE-LEVEL INSTRUCTION GUIDE MODAL */}
      {showInstructionGuide && env && currentLevel && (
        <div className="hs-guide-modal-backdrop">
          <div className="hs-guide-card">
            <div className="hs-guide-badge">
              <span>{currentEnv.icon} {currentEnv.name.toUpperCase()} • LEVEL {currentLevel.levelNumber}</span>
            </div>
            <h2 className="hs-guide-title">
              {currentEnv.name} Hazard Spotter: Level {currentLevel.levelNumber}
            </h2>
            <p className="hs-guide-subtitle">
              "Look carefully around the {currentEnv.name.toLowerCase()} and find the unsafe situations. Click each hazard you find. Be careful — not everything you see is dangerous!"
            </p>

            <div className="hs-guide-info-row">
              <div className="hs-guide-info-box">
                <span className="info-icon">🎯</span>
                <div>
                  <strong>HAZARDS TO FIND</strong>
                  <p>{currentHazards.length} Hidden Risks</p>
                </div>
              </div>
              <div className="hs-guide-info-box">
                <span className="info-icon">⭐</span>
                <div>
                  <strong>DIFFICULTY</strong>
                  <p>{currentLevel.difficulty || "Standard"}</p>
                </div>
              </div>
            </div>

            <div className="hs-guide-rules">
              <h4>HOW TO PLAY:</h4>
              <ul>
                <li>
                  🟢 <strong>Correct Hazard:</strong> Spot an unsafe situation to highlight it, view the safety rule, and earn +100 XP!
                </li>
                <li>
                  🔴 <strong>Wrong Area:</strong> Clicking safe items shows <em>"Look carefully — something nearby may be unsafe!"</em>
                </li>
                <li>
                  💡 <strong>Scout Assistance:</strong> Unlocks after finding initial hazards if you need a hint!
                </li>
              </ul>
            </div>

            <button
              className="hs-start-level-btn"
              onClick={() => setShowInstructionGuide(false)}
              type="button"
            >
              🚀 START LEVEL {currentLevel.levelNumber}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
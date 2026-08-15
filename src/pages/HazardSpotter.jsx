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

const NEAR_MISS_MESSAGES = [
  "👀 Very close!",
  "🔎 You're looking in the right area!",
  "✨ So close! Look a little closer.",
  "🔥 Almost! Check around here.",
  "🧐 Warm! Take a closer look right here."
];

const WRONG_MESSAGES = [
  "🔎 Good try! Keep looking.",
  "👀 Not quite — keep scanning.",
  "💡 Keep searching!",
  "🧐 Take another look around.",
  "✨ Good observation! But that area is safe.",
  "🔍 Keep looking carefully."
];

const DEBUG_HOTSPOTS = false;

// Pick a random message without repeating the previous toast consecutively
function getRandomMessage(msgArray, lastMsg) {
  const filtered = msgArray.filter((m) => m !== lastMsg);
  const choices = filtered.length > 0 ? filtered : msgArray;
  return choices[Math.floor(Math.random() * choices.length)];
}

export default function HazardSpotter() {
  const navigate = useNavigate();
  
  const [env, setEnv] = useState(null); // 'home', 'school', 'office', 'outdoors' or null
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0); // 0 to 4 (Level 1 to 5)
  const [foundHazards, setFoundHazards] = useState([]);
  const [selectedHazard, setSelectedHazard] = useState(null);
  const [wrongClicks, setWrongClicks] = useState(0);
  
  // Toast Notification States
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("wrong"); // 'wrong' or 'near-miss'
  const [showToast, setShowToast] = useState(false);
  const [animateCounter, setAnimateCounter] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  
  const toastTimeoutRef = useRef(null);
  const lastToastRef = useRef("");

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // Handle environment selection
  const handleSelectEnvironment = (selectedEnv) => {
    setEnv(selectedEnv);
    setCurrentLevelIndex(0);
    setFoundHazards([]);
    setSelectedHazard(null);
    setWrongClicks(0);
    setShowToast(false);
  };

  const currentEnv = env ? ENVIRONMENTS[env] : null;
  const envLevels = env ? hazardSpotterLevels[env] : [];
  const currentLevel = envLevels[currentLevelIndex] || null;
  const currentHazards = currentLevel ? currentLevel.hazards : [];

  const handleHazardClick = (hazard) => {
    if (foundHazards.includes(hazard.id)) {
      // Re-clicking an already found hazard still opens explanation modal without re-incrementing score
      setSelectedHazard({
        ...hazard,
        modalTitle: "Hazard Already Identified"
      });
      return;
    }

    const nextFoundCount = foundHazards.length + 1;
    let modalTitle = "🎯 Hazard Found!";
    if (nextFoundCount === currentHazards.length) {
      modalTitle = "🏆 Final Hazard Found!";
    } else if (nextFoundCount >= currentHazards.length - 1) {
      modalTitle = "🔥 You're on a Roll!";
    } else if (nextFoundCount > 1) {
      modalTitle = "👏 Great Spotting!";
    }

    setFoundHazards((prev) => [...prev, hazard.id]);
    setSelectedHazard({
      ...hazard,
      modalTitle
    });

    // Trigger counter pop animation
    setAnimateCounter(true);
    setTimeout(() => setAnimateCounter(false), 400);
  };

  // Proximity & Near Miss Click Handler
  const handleSceneClick = (event) => {
    // If clicked inside an actual hotspot button, hotspot handler takes over
    if (event.target.closest(".hazard-hotspot-container")) {
      return;
    }

    setWrongClicks((prev) => prev + 1);

    // Calculate percentage coordinates of the click relative to scene container
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = ((event.clientX - rect.left) / rect.width) * 100;
    const clickY = ((event.clientY - rect.top) / rect.height) * 100;

    // Find distance to all undiscovered hazards
    const undiscovered = currentHazards.filter((h) => !foundHazards.includes(h.id));
    let minDistance = Infinity;

    undiscovered.forEach((h) => {
      const dx = clickX - h.x;
      const dy = clickY - h.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDistance) {
        minDistance = dist;
      }
    });

    // If within 14% percentage radius of an undiscovered hazard -> VERY CLOSE!
    if (minDistance <= 14) {
      const msg = getRandomMessage(NEAR_MISS_MESSAGES, lastToastRef.current);
      lastToastRef.current = msg;
      setToastMessage(msg);
      setToastType("near-miss");
    } else {
      const msg = getRandomMessage(WRONG_MESSAGES, lastToastRef.current);
      lastToastRef.current = msg;
      setToastMessage(msg);
      setToastType("wrong");
    }

    setShowToast(true);

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setShowToast(false);
    }, 1600);
  };

  const handleNextLevel = () => {
    const levelScore = Math.max(foundHazards.length * 20 - wrongClicks * 2, 0);
    setTotalScore((prev) => prev + levelScore);

    if (currentLevelIndex < envLevels.length - 1) {
      setCurrentLevelIndex((prev) => prev + 1);
      setFoundHazards([]);
      setSelectedHazard(null);
      setWrongClicks(0);
      setShowToast(false);
    } else {
      setEnv(null);
    }
  };

  const handleReplayLevel = () => {
    setFoundHazards([]);
    setSelectedHazard(null);
    setWrongClicks(0);
    setShowToast(false);
  };

  const handleChooseAnother = () => {
    setEnv(null);
  };

  const currentLevelScore = Math.max(foundHazards.length * 20 - wrongClicks * 2, 0);
  const progress = currentHazards.length > 0 
    ? (foundHazards.length / currentHazards.length) * 100 
    : 0;

  const isLevelComplete = currentHazards.length > 0 && foundHazards.length === currentHazards.length;

  // Environment Selector Screen
  if (!env) {
    return (
      <div className="hazard-page selection">
        <header className="hazard-header">
          <div className="header-container">
            <div className="header-title-section">
              <p className="header-category">Safety Training</p>
              <h1 className="header-title">Hazard Spotter</h1>
            </div>
            <button className="exit-btn" onClick={() => navigate("/dashboard")}>
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
              {Object.values(ENVIRONMENTS).map((e) => (
                <button
                  key={e.id}
                  onClick={() => handleSelectEnvironment(e.id)}
                  className={`env-card ${env === e.id ? "selected" : ""}`}
                  type="button"
                >
                  <span className="env-card-icon">{e.icon}</span>
                  <h3 className="env-card-name">{e.name}</h3>
                  <p className="env-card-desc">{e.desc}</p>
                </button>
              ))}
            </div>

            {totalScore > 0 && (
              <div style={{ marginTop: "2.5rem", display: "inline-block", background: "rgba(255,255,255,0.03)", padding: "0.85rem 1.75rem", borderRadius: "14px", border: "1px solid var(--border-color)" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Total Training Points: </span>
                <span style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--primary-accent)", marginLeft: "0.5rem" }}>{totalScore} XP</span>
              </div>
            )}
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className={`hazard-page ${env}`}>
      
      {/* HEADER */}
      <header className="hazard-header">
        <div className="header-container">
          <div className="header-title-section">
            <p className="header-category">SAFETY TRAINING — {currentEnv.name.toUpperCase()}</p>
            <h1 className="header-title">Hazard Spotter</h1>
            <p className="header-subtitle">
              Scan the room and click on items or areas that present a safety risk.
            </p>
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
                    {foundHazards.length} <span className="stat-val-total">/ {currentHazards.length}</span>
                  </p>
                </div>
              </>
            )}
            <button className="exit-btn" onClick={handleChooseAnother}>
              ← Change Room
            </button>
          </div>
        </div>
      </header>

      {/* MAIN GAMEPLAY CONTENT */}
      <main className="hazard-main">
        {isLevelComplete ? (
          /* LEVEL COMPLETION SCREEN */
          <div className="completion-screen">
            <span className="completion-icon">🎉</span>
            <h2 className="completion-title">
              {currentLevelIndex === envLevels.length - 1 ? `${currentEnv.name} Environment Mastered!` : `Level ${currentLevel.levelNumber} Complete!`}
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
                  <button className="btn-primary" onClick={handleNextLevel}>
                    Next Level (Level {currentLevel.levelNumber + 1}) →
                  </button>
                  <button className="btn-secondary" onClick={handleReplayLevel}>
                    Replay Level
                  </button>
                </>
              ) : (
                <>
                  <button className="btn-primary" onClick={handleChooseAnother}>
                    Choose Another Environment
                  </button>
                  <button className="btn-secondary" onClick={handleReplayLevel}>
                    Replay Level 5
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          /* ACTIVE GAMEPLAY SCREEN */
          <section className="gameboard-section">
            
            {/* STATS PANEL */}
            <div className="stats-grid">
              <div className="stat-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p className="stat-card-title">Progress — Level {currentLevel.levelNumber} ({currentLevel.difficulty})</p>
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
            </div>

            {/* STATIC IMAGE VIEWPORT CONTAINER */}
            <div className="scene-container" onClick={handleSceneClick}>
              <img
                src={currentLevel.image}
                alt={`${currentEnv.name} Level ${currentLevel.levelNumber}`}
                className="scene-image"
              />

              {/* HOTSPOT LAYER */}
              <div className="hotspot-layer">
                {currentHazards.map((hazard) => {
                  const found = foundHazards.includes(hazard.id);
                  const paddingVal = 2.5; // clickable padding percentage points
                  const clickWidth = hazard.width + 2 * paddingVal;
                  const clickHeight = hazard.height + 2 * paddingVal;
                  
                  // Calculate inner dimensions as percentage of outer button
                  const innerWidth = (hazard.width / clickWidth) * 100;
                  const innerHeight = (hazard.height / clickHeight) * 100;

                  return (
                    <button
                      key={hazard.id}
                      type="button"
                      onClick={() => handleHazardClick(hazard)}
                      className={`hazard-hotspot-container ${found ? "found" : ""} ${DEBUG_HOTSPOTS ? "debug-mode" : ""}`}
                      style={{
                        left: `${hazard.x}%`,
                        top: `${hazard.y}%`,
                        width: `${clickWidth}%`,
                        height: `${clickHeight}%`,
                        transform: "translate(-50%, -50%)"
                      }}
                      aria-label={hazard.name}
                    >
                      <div 
                        className="hazard-hotspot-visual"
                        style={{
                          width: `${innerWidth}%`,
                          height: `${innerHeight}%`
                        }}
                      >
                        {found && <span className="hotspot-check">✓</span>}
                        
                        {DEBUG_HOTSPOTS && (
                          <div className="debug-tag">
                            <div className="debug-tag-id">{hazard.id}</div>
                            <div className="debug-tag-coords">{`x:${hazard.x} y:${hazard.y}`}</div>
                            <div className="debug-tag-size">{`w:${hazard.width} h:${hazard.height}`}</div>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* ENCOURAGING / NEAR MISS TOAST NOTIFICATION */}
              {showToast && (
                <div className={toastType === "near-miss" ? "near-miss-toast" : "wrong-click-toast"}>
                  {toastMessage}
                </div>
              )}
            </div>

            {/* LOWER INSTRUCTIONS FOOTER */}
            <div className="instructions-card">
              <span style={{ fontSize: "1.2rem" }}>🔍</span>
              <p className="instructions-text">
                <span className="instructions-accent">Hover</span> over areas of interest to spot minor irregularities. 
                Click on objects to check if they present a safety hazard.
              </p>
            </div>
          </section>
        )}
      </main>

      {/* FEEDBACK DETAIL MODAL */}
      {selectedHazard && (
        <div className="modal-backdrop" onClick={() => setSelectedHazard(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              type="button"
              onClick={() => setSelectedHazard(null)}
              aria-label="Close details"
            >
              ×
            </button>

            <div className="modal-header">
              <p className="modal-category">{selectedHazard.category}</p>
              <h2 className="modal-title">{selectedHazard.modalTitle || selectedHazard.name}</h2>
              {selectedHazard.modalTitle && selectedHazard.name && (
                <p style={{ fontSize: "1.1rem", fontWeight: "700", margin: "0.35rem 0 0 0", color: "#fff" }}>
                  {selectedHazard.name}
                </p>
              )}
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

            <button
              className="modal-continue-btn"
              type="button"
              onClick={() => setSelectedHazard(null)}
            >
              Continue
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
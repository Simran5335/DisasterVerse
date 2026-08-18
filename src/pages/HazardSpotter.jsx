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

// Development only.
// Change to true when you want to see hotspot boxes.
const DEBUG_HOTSPOTS = false;

// Small invisible tolerance around the actual hazard.
// This is intentionally much smaller than the old 2.5%.
const CLICK_PADDING = 1;

// How close a wrong click must be to an actual hazard
// before we call it a near miss.
const NEAR_MISS_PADDING = 3;

function getRandomMessage(msgArray, lastMsg) {
  const filtered = msgArray.filter((message) => message !== lastMsg);
  const choices = filtered.length > 0 ? filtered : msgArray;

  return choices[Math.floor(Math.random() * choices.length)];
}

/**
 * Returns true when a percentage-coordinate click is inside
 * the hazard rectangle expanded by a small tolerance.
 */
function isPointNearHazard(clickX, clickY, hazard, padding = 0) {
  const halfWidth = hazard.width / 2 + padding;
  const halfHeight = hazard.height / 2 + padding;

  return (
    clickX >= hazard.x - halfWidth &&
    clickX <= hazard.x + halfWidth &&
    clickY >= hazard.y - halfHeight &&
    clickY <= hazard.y + halfHeight
  );
}

/**
 * Calculates the distance from a click point to a hazard rectangle.
 *
 * 0 means the click is inside the rectangle.
 * A small value means the click is just outside the rectangle.
 */
function distanceToHazard(clickX, clickY, hazard) {
  const left = hazard.x - hazard.width / 2;
  const right = hazard.x + hazard.width / 2;
  const top = hazard.y - hazard.height / 2;
  const bottom = hazard.y + hazard.height / 2;

  const dx =
    clickX < left
      ? left - clickX
      : clickX > right
        ? clickX - right
        : 0;

  const dy =
    clickY < top
      ? top - clickY
      : clickY > bottom
        ? clickY - bottom
        : 0;

  return Math.sqrt(dx * dx + dy * dy);
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

  const [animateCounter, setAnimateCounter] = useState(false);
  const [totalScore, setTotalScore] = useState(0);

  const toastTimeoutRef = useRef(null);
  const counterTimeoutRef = useRef(null);
  const lastToastRef = useRef("");

  // ---------------------------------------------------------
  // Cleanup timers
  // ---------------------------------------------------------

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }

      if (counterTimeoutRef.current) {
        clearTimeout(counterTimeoutRef.current);
      }
    };
  }, []);

  // ---------------------------------------------------------
  // Environment selection
  // ---------------------------------------------------------

  const handleSelectEnvironment = (selectedEnv) => {
    setEnv(selectedEnv);
    setCurrentLevelIndex(0);
    setFoundHazards([]);
    setSelectedHazard(null);
    setWrongClicks(0);
    setShowToast(false);
    setToastMessage("");
    lastToastRef.current = "";
  };

  // ---------------------------------------------------------
  // Current environment / level
  // ---------------------------------------------------------

  const currentEnv = env ? ENVIRONMENTS[env] : null;

  const envLevels = env
    ? hazardSpotterLevels[env] || []
    : [];

  const currentLevel =
    envLevels[currentLevelIndex] || null;

  const currentHazards =
    currentLevel?.hazards || [];

  // ---------------------------------------------------------
  // Correct hazard click
  // ---------------------------------------------------------

  const handleHazardClick = (hazard) => {
    if (!hazard) return;

    // Already found
    if (foundHazards.includes(hazard.id)) {
      setSelectedHazard({
        ...hazard,
        modalTitle: "Hazard Already Identified"
      });

      return;
    }

    const nextFoundCount =
      foundHazards.length + 1;

    let modalTitle = "🎯 Hazard Found!";

    if (nextFoundCount === currentHazards.length) {
      modalTitle = "🏆 Final Hazard Found!";
    } else if (
      nextFoundCount === currentHazards.length - 1
    ) {
      modalTitle = "🔥 You're on a Roll!";
    } else if (nextFoundCount > 1) {
      modalTitle = "👏 Great Spotting!";
    }

    setFoundHazards((previous) => [
      ...previous,
      hazard.id
    ]);

    // IMPORTANT:
    // The popup gets the EXACT hazard that was clicked.
    setSelectedHazard({
      ...hazard,
      modalTitle
    });

    setAnimateCounter(true);

    if (counterTimeoutRef.current) {
      clearTimeout(counterTimeoutRef.current);
    }

    counterTimeoutRef.current = setTimeout(() => {
      setAnimateCounter(false);
    }, 400);
  };

  // ---------------------------------------------------------
  // Wrong click / near miss
  // ---------------------------------------------------------

  const handleSceneClick = (event) => {
    if (selectedHazard) return;

    // If the click happened on an actual hotspot button,
    // let the hotspot's own click handler handle it.
    if (
      event.target.closest(
        ".hazard-hotspot-container"
      )
    ) {
      return;
    }

    const rect =
      event.currentTarget.getBoundingClientRect();

    if (!rect.width || !rect.height) return;

    // Convert click to percentage coordinates
    // relative to the IMAGE/SCENE container.
    const clickX =
      ((event.clientX - rect.left) / rect.width) * 100;

    const clickY =
      ((event.clientY - rect.top) / rect.height) * 100;

    setWrongClicks((previous) => previous + 1);

    const undiscovered =
      currentHazards.filter(
        (hazard) =>
          !foundHazards.includes(hazard.id)
      );

    // -------------------------------------------------------
    // Determine whether the click is genuinely near
    // any undiscovered hazard.
    // -------------------------------------------------------

    let nearestDistance = Infinity;

    undiscovered.forEach((hazard) => {
      const distance = distanceToHazard(
        clickX,
        clickY,
        hazard
      );

      if (distance < nearestDistance) {
        nearestDistance = distance;
      }
    });

    const isNearMiss =
      nearestDistance <= NEAR_MISS_PADDING;

    const messages = isNearMiss
      ? NEAR_MISS_MESSAGES
      : WRONG_MESSAGES;

    const message = getRandomMessage(
      messages,
      lastToastRef.current
    );

    lastToastRef.current = message;

    setToastMessage(message);
    setToastType(
      isNearMiss ? "near-miss" : "wrong"
    );

    setShowToast(true);

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = setTimeout(() => {
      setShowToast(false);
    }, 1600);
  };

  // ---------------------------------------------------------
  // Next level
  // ---------------------------------------------------------

  const handleNextLevel = () => {
    const levelScore = Math.max(
      foundHazards.length * 20 -
        wrongClicks * 2,
      0
    );

    setTotalScore(
      (previous) =>
        previous + levelScore
    );

    if (
      currentLevelIndex <
      envLevels.length - 1
    ) {
      setCurrentLevelIndex(
        (previous) => previous + 1
      );

      setFoundHazards([]);
      setSelectedHazard(null);
      setWrongClicks(0);
      setShowToast(false);
      setToastMessage("");
      lastToastRef.current = "";
    } else {
      setEnv(null);
      setCurrentLevelIndex(0);
      setFoundHazards([]);
      setSelectedHazard(null);
      setWrongClicks(0);
      setShowToast(false);
    }
  };

  // ---------------------------------------------------------
  // Replay current level
  // ---------------------------------------------------------

  const handleReplayLevel = () => {
    setFoundHazards([]);
    setSelectedHazard(null);
    setWrongClicks(0);
    setShowToast(false);
    setToastMessage("");
    lastToastRef.current = "";
  };

  // ---------------------------------------------------------
  // Change environment
  // ---------------------------------------------------------

  const handleChooseAnother = () => {
    setEnv(null);
    setCurrentLevelIndex(0);
    setFoundHazards([]);
    setSelectedHazard(null);
    setWrongClicks(0);
    setShowToast(false);
    setToastMessage("");
    lastToastRef.current = "";
  };

  // ---------------------------------------------------------
  // Scores
  // ---------------------------------------------------------

  const currentLevelScore = Math.max(
    foundHazards.length * 20 -
      wrongClicks * 2,
    0
  );

  const progress =
    currentHazards.length > 0
      ? (foundHazards.length /
          currentHazards.length) *
        100
      : 0;

  const isLevelComplete =
    currentHazards.length > 0 &&
    foundHazards.length ===
      currentHazards.length;

  // =========================================================
  // ENVIRONMENT SELECTION SCREEN
  // =========================================================

  if (!env) {
    return (
      <div className="hazard-page selection">
        <header className="hazard-header">
          <div className="header-container">
            <div className="header-title-section">
              <p className="header-category">
                Safety Training
              </p>

              <h1 className="header-title">
                Hazard Spotter
              </h1>
            </div>

            <button
              className="exit-btn"
              onClick={() =>
                navigate("/dashboard")
              }
              type="button"
            >
              ← Back to Dashboard
            </button>
          </div>
        </header>

        <main className="hazard-main">
          <section className="env-selector">
            <h2 className="env-selector-title">
              Choose an environment
            </h2>

            <p className="env-selector-subtitle">
              Inspect 4 real-world environments
              across 20 progressive difficulty
              levels to spot hidden safety
              hazards.
            </p>

            <div className="env-cards-grid">
              {Object.values(ENVIRONMENTS).map(
                (environment) => (
                  <button
                    key={environment.id}
                    onClick={() =>
                      handleSelectEnvironment(
                        environment.id
                      )
                    }
                    className={`env-card ${
                      env === environment.id
                        ? "selected"
                        : ""
                    }`}
                    type="button"
                  >
                    <span className="env-card-icon">
                      {environment.icon}
                    </span>

                    <h3 className="env-card-name">
                      {environment.name}
                    </h3>

                    <p className="env-card-desc">
                      {environment.desc}
                    </p>
                  </button>
                )
              )}
            </div>

            {totalScore > 0 && (
              <div
                style={{
                  marginTop: "2.5rem",
                  display: "inline-block",
                  background:
                    "rgba(255,255,255,0.03)",
                  padding:
                    "0.85rem 1.75rem",
                  borderRadius: "14px",
                  border:
                    "1px solid var(--border-color)"
                }}
              >
                <span
                  style={{
                    fontSize: "0.85rem",
                    color:
                      "var(--text-muted)",
                    textTransform:
                      "uppercase",
                    letterSpacing:
                      "0.1em"
                  }}
                >
                  Total Training Points:
                </span>

                <span
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: "800",
                    color:
                      "var(--primary-accent)",
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

  // =========================================================
  // ACTIVE ENVIRONMENT
  // =========================================================

  return (
    <div
      className={`hazard-page ${env}`}
    >
      {/* HEADER */}
      <header className="hazard-header">
        <div className="header-container">

          <div className="header-title-section">
            <p className="header-category">
              SAFETY TRAINING —{" "}
              {currentEnv.name.toUpperCase()}
            </p>

            <h1 className="header-title">
              Hazard Spotter
            </h1>

            <p className="header-subtitle">
              Scan the scene and click on
              items or areas that present a
              safety risk.
            </p>
          </div>

          <div className="header-controls">
            {!isLevelComplete && (
              <>
                <div
                  className="header-stat"
                  style={{
                    marginRight: "0.5rem"
                  }}
                >
                  <p className="stat-label">
                    Level{" "}
                    {currentLevel.levelNumber}{" "}
                    / 5
                  </p>

                  <p
                    className="stat-val"
                    style={{
                      fontSize: "1.1rem",
                      color:
                        "var(--primary-accent)"
                    }}
                  >
                    {currentLevel.difficulty}
                  </p>
                </div>

                <div className="header-stat">
                  <p className="stat-label">
                    Hazards Found
                  </p>

                  <p
                    className={`stat-val ${
                      animateCounter
                        ? "pop-animate"
                        : ""
                    }`}
                  >
                    {foundHazards.length}

                    <span className="stat-val-total">
                      {" "}
                      /{" "}
                      {currentHazards.length}
                    </span>
                  </p>
                </div>
              </>
            )}

            <button
              className="exit-btn"
              onClick={
                handleChooseAnother
              }
              type="button"
            >
              ← Change Room
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="hazard-main">

        {/* ===================================================
            COMPLETION SCREEN
            =================================================== */}

        {isLevelComplete ? (
          <div className="completion-screen">

            <span className="completion-icon">
              🎉
            </span>

            <h2 className="completion-title">
              {currentLevelIndex ===
              envLevels.length - 1
                ? `${currentEnv.name} Environment Mastered!`
                : `Level ${currentLevel.levelNumber} Complete!`}
            </h2>

            <p className="completion-desc">
              {currentLevelIndex ===
              envLevels.length - 1
                ? `Outstanding! You successfully identified all potential safety hazards across all 5 levels in the ${currentEnv.name} scene.`
                : `Great job! You found all ${currentHazards.length} hazards in Level ${currentLevel.levelNumber} (${currentLevel.difficulty}). Ready for the next challenge?`}
            </p>

            <div className="completion-stats">

              <div className="completion-stat-box">
                <span className="completion-stat-lbl">
                  Hazards Found
                </span>

                <span className="completion-stat-val">
                  {foundHazards.length} /{" "}
                  {currentHazards.length}
                </span>
              </div>

              <div className="completion-stat-box">
                <span className="completion-stat-lbl">
                  Level Score
                </span>

                <span className="completion-stat-val">
                  {currentLevelScore} XP
                </span>
              </div>

            </div>

            <div className="completion-actions">

              {currentLevelIndex <
              envLevels.length - 1 ? (
                <>
                  <button
                    className="btn-primary"
                    onClick={
                      handleNextLevel
                    }
                    type="button"
                  >
                    Next Level
                    {" "}
                    (Level{" "}
                    {currentLevel.levelNumber +
                      1})
                    →
                  </button>

                  <button
                    className="btn-secondary"
                    onClick={
                      handleReplayLevel
                    }
                    type="button"
                  >
                    Replay Level
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn-primary"
                    onClick={
                      handleChooseAnother
                    }
                    type="button"
                  >
                    Choose Another
                    Environment
                  </button>

                  <button
                    className="btn-secondary"
                    onClick={
                      handleReplayLevel
                    }
                    type="button"
                  >
                    Replay Level 5
                  </button>
                </>
              )}

            </div>
          </div>
        ) : (

          /* =================================================
             ACTIVE GAMEPLAY
             ================================================= */

          <section className="gameboard-section">

            {/* STATS */}
            <div className="stats-grid">

              <div className="stat-card">

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center"
                  }}
                >
                  <p className="stat-card-title">
                    Progress — Level{" "}
                    {currentLevel.levelNumber}{" "}
                    ({currentLevel.difficulty})
                  </p>

                  <p
                    className="stat-card-title"
                    style={{
                      color:
                        "var(--primary-accent)",
                      fontWeight: "700"
                    }}
                  >
                    {Math.round(progress)}%
                  </p>
                </div>

                <div className="progress-container">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${progress}%`
                    }}
                  />
                </div>

              </div>

              <div className="stat-card">
                <p className="stat-card-title">
                  Current Score
                </p>

                <p className="stat-card-number">
                  {currentLevelScore} XP
                </p>
              </div>

            </div>

            {/* =================================================
                IMAGE + HOTSPOTS
                ================================================= */}

            <div
              className="scene-container"
              onClick={handleSceneClick}
            >

              <img
                src={currentLevel.image}
                alt={`${currentEnv.name} Level ${currentLevel.levelNumber}`}
                className="scene-image"
                draggable="false"
              />

              {/* HOTSPOT LAYER */}
              <div className="hotspot-layer">

                {currentHazards.map(
                  (hazard) => {

                    const found =
                      foundHazards.includes(
                        hazard.id
                      );

                    /*
                     * IMPORTANT:
                     * x/y = CENTER of hotspot.
                     *
                     * width/height = actual
                     * hazard size.
                     *
                     * Only add 1% tolerance.
                     */
                    /*
                     * x/y are the CENTER of the hazard region.
                     * Keep the original coordinate system used by
                     * hazardSpotterLevels.js.
                     */
                    const clickWidth =
                      hazard.width + CLICK_PADDING * 2;

                    const clickHeight =
                      hazard.height + CLICK_PADDING * 2;

                    return (
                      <button
                        key={hazard.id}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleHazardClick(hazard);
                        }}
                        className={`hazard-hotspot-container ${
                          found ? "found" : ""
                        } ${
                          DEBUG_HOTSPOTS ? "debug-mode" : ""
                        }`}
                        style={{
                          left: `${hazard.x}%`,
                          top: `${hazard.y}%`,
                          width: `${clickWidth}%`,
                          height: `${clickHeight}%`,
                          transform: "translate(-50%, -50%)"
                        }}
                        aria-label={hazard.name}
                      >
                        <div className="hazard-hotspot-visual">
                          {found && (
                            <span className="hotspot-check">
                              ✓
                            </span>
                          )}

                          {DEBUG_HOTSPOTS && (
                            <div className="debug-tag">
                              <div className="debug-tag-id">
                                {hazard.id}
                              </div>
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
                  }
                )}

              </div>

              {/* WRONG / NEAR MISS TOAST */}

              {showToast && (
                <div
                  className={
                    toastType ===
                    "near-miss"
                      ? "near-miss-toast"
                      : "wrong-click-toast"
                  }
                >
                  {toastMessage}
                </div>
              )}

            </div>

            {/* INSTRUCTIONS */}

            <div className="instructions-card">
              <span
                style={{
                  fontSize: "1.2rem"
                }}
              >
                🔍
              </span>

              <p className="instructions-text">
                <span className="instructions-accent">
                  Hover
                </span>{" "}
                over areas of interest to
                spot minor irregularities.
                Click on objects to check if
                they present a safety hazard.
              </p>
            </div>

          </section>
        )}
      </main>

      {/* =====================================================
          HAZARD DETAIL MODAL
          ===================================================== */}

      {selectedHazard && (
        <div
          className="modal-backdrop"
          onClick={() =>
            setSelectedHazard(null)
          }
        >

          <div
            className="modal-content"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="modal-close"
              type="button"
              onClick={() =>
                setSelectedHazard(null)
              }
              aria-label="Close details"
            >
              ×
            </button>

            <div className="modal-header">

              <p className="modal-category">
                {selectedHazard.category}
              </p>

              <h2 className="modal-title">
                {selectedHazard.modalTitle ||
                  selectedHazard.name}
              </h2>

              {selectedHazard.modalTitle &&
                selectedHazard.name && (
                  <p
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "700",
                      margin:
                        "0.35rem 0 0 0",
                      color: "#fff"
                    }}
                  >
                    {selectedHazard.name}
                  </p>
                )}

            </div>

            <div className="modal-risk-box">

              <p className="modal-risk-label">
                <span>⚠️</span>{" "}
                {selectedHazard.risk}
              </p>

              <p className="modal-explanation">
                {selectedHazard.explanation}
              </p>

            </div>

            <div className="modal-tip-box">

              <p className="modal-tip-label">
                Safety Action Plan
              </p>

              <p className="modal-tip-text">
                {selectedHazard.safetyTip}
              </p>

            </div>

            <button
              className="modal-continue-btn"
              type="button"
              onClick={() =>
                setSelectedHazard(null)
              }
            >
              Continue
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
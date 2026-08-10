import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { homeHazards } from "../data/homeHazards";
import { schoolHazards } from "../data/schoolHazards";
import { officeHazards } from "../data/officeHazards";

import "../styles/hazard/HazardSpotter.css";
import "../styles/hazard/Home.css";
import "../styles/hazard/School.css";
import "../styles/hazard/Office.css";

const ENVIRONMENTS = {
  home: {
    id: "home",
    name: "Home",
    icon: "🏠",
    video: "/videos/hazard/home.mp4",
    hazards: homeHazards,
    desc: "Scan a family home to find open flames, tripping risks, and hazard blockages."
  },
  school: {
    id: "school",
    name: "School",
    icon: "🏫",
    video: "/videos/hazard/school.mp4",
    hazards: schoolHazards,
    desc: "Examine classrooms and science labs to detect exit blocks and exposed sockets."
  },
  office: {
    id: "office",
    name: "Office",
    icon: "🏢",
    video: "/videos/hazard/office.mp4",
    hazards: officeHazards,
    desc: "Inspect corporate workspaces for electrical overloads and cabling concerns."
  }
};

const DEBUG_HOTSPOTS = false;

export default function HazardSpotter() {
  const navigate = useNavigate();
  
  const [env, setEnv] = useState(null); // 'home', 'school', 'office' or null
  const [foundHazards, setFoundHazards] = useState([]);
  const [selectedHazard, setSelectedHazard] = useState(null);
  const [wrongClicks, setWrongClicks] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const [showWrongToast, setShowWrongToast] = useState(false);
  
  const toastTimeoutRef = useRef(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // Reset states when environment changes
  const handleSelectEnvironment = (selectedEnv) => {
    setEnv(selectedEnv);
    setFoundHazards([]);
    setSelectedHazard(null);
    setWrongClicks(0);
    setVideoError(false);
    setShowWrongToast(false);
  };

  const currentEnv = env ? ENVIRONMENTS[env] : null;
  const currentHazards = currentEnv ? currentEnv.hazards : [];
  
  const handleHazardClick = (hazard) => {
    if (foundHazards.includes(hazard.id)) {
      // If already found, still allow looking at the explanation modal
      setSelectedHazard(hazard);
      return;
    }

    setFoundHazards((prev) => [...prev, hazard.id]);
    setSelectedHazard(hazard);
  };

  const handleSceneClick = (event) => {
    // If clicked a hotspot, do nothing
    if (event.target.closest(".hazard-hotspot")) {
      return;
    }

    setWrongClicks((prev) => prev + 1);
    setShowWrongToast(true);

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setShowWrongToast(false);
    }, 1500);
  };

  const handleTryAgain = () => {
    setFoundHazards([]);
    setSelectedHazard(null);
    setWrongClicks(0);
    setShowWrongToast(false);
  };

  const handleChooseAnother = () => {
    setEnv(null);
  };

  const score = Math.max(foundHazards.length * 20 - wrongClicks * 2, 0);
  const progress = currentHazards.length > 0 
    ? (foundHazards.length / currentHazards.length) * 100 
    : 0;

  const isComplete = currentHazards.length > 0 && foundHazards.length === currentHazards.length;

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
              Inspect different locations to identify and learn about real-world hazards.
            </p>
            
            <div className="env-cards-grid">
              {Object.values(ENVIRONMENTS).map((e) => (
                <button
                  key={e.id}
                  onClick={() => handleSelectEnvironment(e.id)}
                  className="env-card"
                  type="button"
                >
                  <span className="env-card-icon">{e.icon}</span>
                  <h3 className="env-card-name">{e.name}</h3>
                  <p className="env-card-desc">{e.desc}</p>
                </button>
              ))}
            </div>
          </section>
        </main>
      </div>
    );
  }

  // Error/Coming Soon state if video file is missing
  if (videoError) {
    return (
      <div className={`hazard-page ${env}`}>
        <header className="hazard-header">
          <div className="header-container">
            <div className="header-title-section">
              <p className="header-category">Safety Training</p>
              <h1 className="header-title">Hazard Spotter</h1>
            </div>
            <button className="exit-btn" onClick={handleChooseAnother}>
              ← Select Environment
            </button>
          </div>
        </header>

        <main className="hazard-main">
          <div className="error-screen">
            <span className="error-icon">🚧</span>
            <h2 className="error-title">{currentEnv.name} Environment Coming Soon</h2>
            <p className="error-desc">
              The hazard training video simulation for the {currentEnv.name} scene is not available in the assets folder yet.
            </p>
            <button className="error-btn" onClick={handleChooseAnother}>
              Choose Another Environment
            </button>
          </div>
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
            <p className="header-category">Safety Training — {currentEnv.name}</p>
            <h1 className="header-title">Hazard Spotter</h1>
            <p className="header-subtitle">
              Scan the room and click on items or areas that present a safety risk.
            </p>
          </div>

          <div className="header-controls">
            {!isComplete && (
              <div className="header-stat">
                <p className="stat-label">Hazards Found</p>
                <p className="stat-val">
                  {foundHazards.length} <span className="stat-val-total">/ {currentHazards.length}</span>
                </p>
              </div>
            )}
            <button className="exit-btn" onClick={handleChooseAnother}>
              ← Change Room
            </button>
          </div>
        </div>
      </header>

      {/* MAIN GAMEPLAY CONTENT */}
      <main className="hazard-main">
        {isComplete ? (
          /* COMPLETION SCREEN */
          <div className="completion-screen">
            <span className="completion-icon">🎉</span>
            <h2 className="completion-title">Hazard Spotter Complete</h2>
            <p className="completion-desc">
              Excellent! You successfully identified all potential hazards in the {currentEnv.name} environment.
            </p>

            <div className="completion-stats">
              <div className="completion-stat-box">
                <span className="completion-stat-lbl">Hazards Found</span>
                <span className="completion-stat-val">
                  {foundHazards.length} / {currentHazards.length}
                </span>
              </div>
              <div className="completion-stat-box">
                <span className="completion-stat-lbl">Final Score</span>
                <span className="completion-stat-val">{score} XP</span>
              </div>
            </div>

            <div className="completion-actions">
              <button className="btn-primary" onClick={handleTryAgain}>
                Try Again
              </button>
              <button className="btn-secondary" onClick={handleChooseAnother}>
                Choose Another Environment
              </button>
            </div>
          </div>
        ) : (
          /* ACTIVE GAMEPLAY SCREEN */
          <section className="gameboard-section">
            
            {/* STATS PANEL */}
            <div className="stats-grid">
              <div className="stat-card">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <p className="stat-card-title">Progress</p>
                  <p className="stat-card-title" style={{ color: "var(--primary-accent)", fontWeight: "600" }}>
                    {Math.round(progress)}%
                  </p>
                </div>
                <div className="progress-container">
                  <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="stat-card">
                <p className="stat-card-title">Current Score</p>
                <p className="stat-card-number">{score} XP</p>
              </div>
            </div>

            {/* VIDEO VIEWPORT CONTAINER */}
            <div className="scene-container" onClick={handleSceneClick}>
              <video
                src={currentEnv.video}
                autoPlay
                loop
                muted
                playsInline
                className="scene-video"
                onError={() => setVideoError(true)}
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

              {/* INCORRECT CLICK SUBTLE NOTIFICATION */}
              {showWrongToast && (
                <div className="wrong-click-toast">
                  No hazard here — keep looking.
                </div>
              )}
            </div>

            {/* LOWER INSTRUCTIONS FOOTER */}
            <div className="instructions-card">
              <span style={{ fontSize: "1.2rem" }}>🔍</span>
              <p className="instructions-text">
                <span className="instructions-accent">Hover</span> over areas of interest to spot minor irregularities. 
                Click on the objects to check if they present a safety hazard.
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
              <h2 className="modal-title">{selectedHazard.name}</h2>
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
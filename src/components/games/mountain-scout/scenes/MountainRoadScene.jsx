import React, { useState, useRef } from "react";

export default function MountainRoadScene({
  hazards,
  distractors = [],
  discoveredHazards,
  missedHazards,
  onHazardClick,
  onDistractorClick,
  onSceneClick,
  disabled,
  zoomScale,
  panOffset,
  setPanOffset,
  isInvestigateMode,
  isBinocularActive,
  observeNotice
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [activeArea, setActiveArea] = useState(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const AREAS = [
    { id: "A", name: "AREA A: VILLAGE ROAD", focusX: 120, focusY: -60 },
    { id: "B", name: "AREA B: HOUSE & SLOPE", focusX: -30, focusY: -10 },
    { id: "C", name: "AREA C: RETAINING WALL", focusX: -140, focusY: -90 },
    { id: "D", name: "AREA D: STREAM & BRIDGE", focusX: 40, focusY: -140 },
    { id: "E", name: "AREA E: UPPER HILLSIDE", focusX: 100, focusY: 130 }
  ];

  const handleAreaClick = (area) => {
    setActiveArea(area.id);
    setPanOffset({ x: area.focusX, y: area.focusY });
  };

  const handleMouseDown = (e) => {
    if (disabled || isInvestigateMode) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || disabled) return;
    const newX = e.clientX - dragStartRef.current.x;
    const newY = e.clientY - dragStartRef.current.y;
    setPanOffset({
      x: Math.min(250, Math.max(-250, newX)),
      y: Math.min(180, Math.max(-180, newY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={`ms-scene-wrapper ${isInvestigateMode ? "investigate-mode" : ""} ${isDragging ? "panning" : ""}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={(e) => {
        if (!isDragging && onSceneClick) onSceneClick(e);
      }}
    >
      {/* AREA A-E NAVIGATION BAR */}
      <div className="ms-area-nav-bar">
        {AREAS.map((area) => (
          <button
            key={area.id}
            type="button"
            className={`ms-area-pill ${activeArea === area.id ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              handleAreaClick(area);
            }}
          >
            {area.name}
          </button>
        ))}
      </div>

      {/* BINOCULAR OVERLAY */}
      {isBinocularActive && (
        <>
          <div className="ms-binocular-overlay" />
          <div className="ms-binocular-tag">🔭 BINOCULARS ACTIVE (LEVEL 2: MOUNTAIN VILLAGE SLOPE)</div>
        </>
      )}

      {/* DYNAMIC OBSERVE NOTICE */}
      {observeNotice && (
        <div className="ms-observe-event-banner">
          👀 SOMETHING CHANGED IN THE MOUNTAIN VILLAGE!
        </div>
      )}

      {/* VIEWPORT CANVAS */}
      <div
        className="ms-scene-viewport"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`
        }}
      >
        <div className="ms-illustration-container">
          <img
            src={`${process.env.PUBLIC_URL || ""}/images/hazard/mountain/level2_mountain_village.jpg`}
            alt="Level 2 Mountain Village Slope"
            className="ms-background-illustration"
            draggable="false"
          />

          {/* CLICKABLE HAZARDS HOTSPOTS */}
          {hazards.map((hazard) => {
            const isDiscovered = discoveredHazards.includes(hazard.id);
            const isMissed = missedHazards.includes(hazard.id);

            const leftPct = hazard.x !== undefined ? `${hazard.x}%` : hazard.svgPos?.left;
            const topPct = hazard.y !== undefined ? `${hazard.y}%` : hazard.svgPos?.top;
            const widthPct = hazard.width !== undefined ? `${hazard.width}%` : hazard.svgPos?.width;
            const heightPct = hazard.height !== undefined ? `${hazard.height}%` : hazard.svgPos?.height;

            return (
              <React.Fragment key={hazard.id}>
                <div
                  className={`ms-hotspot ${isDiscovered ? "found" : ""}`}
                  style={{
                    left: leftPct,
                    top: topPct,
                    width: widthPct,
                    height: heightPct,
                    pointerEvents: disabled ? "none" : "auto"
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!disabled) onHazardClick(hazard);
                  }}
                  title={isDiscovered ? hazard.name : `Inspect Area ${hazard.area || ""}`}
                >
                  {isDiscovered && (
                    <div className="ms-hotspot-found-badge">
                      <span className="badge-icon">✓</span>
                    </div>
                  )}
                </div>

                {isDiscovered && (
                  <div
                    className="ms-discovered-indicator"
                    style={{
                      left: leftPct,
                      top: topPct
                    }}
                  >
                    <div className="ms-ping-ring" />
                    <div className="ms-indicator-badge">✓</div>
                    <span className="ms-indicator-label">🔎 {(hazard.name || "").toUpperCase()}</span>
                  </div>
                )}

                {isMissed && !isDiscovered && (
                  <div
                    className="ms-missed-indicator"
                    style={{
                      left: leftPct,
                      top: topPct
                    }}
                  >
                    <div className="ms-missed-badge">⚠️</div>
                    <span className="ms-missed-label">MISSED: {(hazard.name || "").toUpperCase()}</span>
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {/* CLICKABLE DISTRACTORS HOTSPOTS */}
          {distractors.map((d) => (
            <div
              key={d.id}
              className="ms-hotspot distractor"
              style={{
                left: d.pos.left,
                top: d.pos.top,
                width: d.pos.width,
                height: d.pos.height,
                pointerEvents: disabled ? "none" : "auto"
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled && onDistractorClick) onDistractorClick(d);
              }}
              title={d.name}
            />
          ))}
        </div>
      </div>

      {/* MINIMAP VIEWPORT BOX */}
      <div className="ms-minimap-box">
        <div className="ms-minimap-bg">
          <div
            className="ms-minimap-viewport-rect"
            style={{
              width: `${100 / zoomScale}%`,
              height: `${100 / zoomScale}%`,
              left: `${50 - (panOffset.x / 10) - (50 / zoomScale)}%`,
              top: `${50 - (panOffset.y / 10) - (50 / zoomScale)}%`
            }}
          />
        </div>
      </div>
    </div>
  );
}

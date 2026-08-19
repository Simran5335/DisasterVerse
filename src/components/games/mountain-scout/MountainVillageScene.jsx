import React, { useState, useRef } from "react";
import { LEVELS_DATA } from "../../../data/mountainScoutData";

export default function MountainVillageScene({
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
  isCalibrationMode,
  observeNotice
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [activeArea, setActiveArea] = useState(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const AREAS = [
    { id: "A", name: "AREA A: CLIFF PATH & FENCE", focusX: 150, focusY: -80 },
    { id: "B", name: "AREA B: FOREST SHELF", focusX: 30, focusY: 100 },
    { id: "C", name: "AREA C: SCREE ROCKFALL", focusX: 0, focusY: -40 },
    { id: "D", name: "AREA D: WATERFALL & GORGE", focusX: -180, focusY: -60 },
    { id: "E", name: "AREA E: HIGH RIDGE PEAK", focusX: 0, focusY: 140 }
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


      {/* BINOCULAR OVERLAY */}
      {isBinocularActive && (
        <>
          <div className="ms-binocular-overlay" />
          <div className="ms-binocular-tag">🔭 BINOCULARS ACTIVE (LEVEL 1: CLIFFSIDE WARNING)</div>
        </>
      )}

      {/* DYNAMIC OBSERVE NOTICE */}
      {observeNotice && (
        <div className="ms-observe-event-banner">
          👀 SOMETHING CHANGED IN THE MOUNTAIN CANYON!
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
            src={LEVELS_DATA[1]?.image}
            alt="Mountain Scout Level 1"
            className="ms-background-illustration absolute inset-0 w-full h-full object-cover object-center block"
            draggable="false"
            decoding="async"
          />

          {/* CLICKABLE HAZARDS HOTSPOTS */}
          {hazards.map((hazard) => {
            const isDiscovered = discoveredHazards.includes(hazard.id) || (hazard.aliasId && discoveredHazards.includes(hazard.aliasId));
            const isMissed = missedHazards.includes(hazard.id) || (hazard.aliasId && missedHazards.includes(hazard.aliasId));

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

                {isCalibrationMode && (
                  <div
                    className="ms-calibration-overlay"
                    style={{
                      left: leftPct,
                      top: topPct,
                      width: widthPct,
                      height: heightPct
                    }}
                  >
                    <div className="ms-calibration-center-dot" />
                    <div className="ms-calibration-badge">
                      <strong>{hazard.id}</strong> - {hazard.name}
                      <br />
                      x: {hazard.x}%, y: {hazard.y}%, w: {hazard.width}%, h: {hazard.height}%
                    </div>
                  </div>
                )}

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

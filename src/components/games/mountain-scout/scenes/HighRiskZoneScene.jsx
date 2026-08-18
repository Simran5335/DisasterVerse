import React, { useState, useRef } from "react";

export default function HighRiskZoneScene({
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
  const dragStartRef = useRef({ x: 0, y: 0 });

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
          <div className="ms-binocular-tag">🔭 BINOCULARS ACTIVE (LEVEL 3: HIGH-RISK MOUNTAIN ZONE)</div>
        </>
      )}

      {/* DYNAMIC OBSERVE NOTICE */}
      {observeNotice && (
        <div className="ms-observe-event-banner">
          👀 CRITICAL ALERT: HIGH-RISK MOUNTAIN MOVEMENT DETECTED!
        </div>
      )}

      {/* AREA BOUNDARY LABELS FOR LEVEL 3 INVESTIGATION ZONES */}
      <div className="ms-zone-labels-overlay">
        <span className="ms-zone-tag area-a">AREA A: ROAD & FENCE</span>
        <span className="ms-zone-tag area-b">AREA B: DENSE FOREST</span>
        <span className="ms-zone-tag area-c">AREA C: ROCKY SCREE</span>
        <span className="ms-zone-tag area-d">AREA D: STREAM & CLAY</span>
        <span className="ms-zone-tag area-e">AREA E: HIGH RIDGE</span>
      </div>

      {/* VIEWPORT CANVAS */}
      <div
        className="ms-scene-viewport"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`
        }}
      >
        <svg
          className="ms-svg-scene"
          viewBox="0 0 1000 562.5"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="skyGradL3" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="60%" stopColor="#475569" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>

            <linearGradient id="highCliffGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            <linearGradient id="mudSeepageGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#b45309" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#78350f" stopOpacity="0.7" />
            </linearGradient>

            <linearGradient id="cleanStreamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>

          {/* 1. HIGH-ALTITUDE MOUNTAIN SKY */}
          <rect width="1000" height="562.5" fill="url(#skyGradL3)" />
          <ellipse cx="200" cy="70" rx="140" ry="22" fill="#94a3b8" opacity="0.4" />
          <ellipse cx="780" cy="85" rx="160" ry="28" fill="#94a3b8" opacity="0.35" />

          {/* 2. AREA E: HIGH MOUNTAIN RIDGE & CLIFF LAYERS */}
          <polygon points="-40,400 300,80 620,400" fill="url(#highCliffGrad)" />
          <polygon points="400,450 720,100 1040,450" fill="url(#highCliffGrad)" />

          {/* HAZARD 6: UNSTABLE SLOPE (AREA E: HIGH RIDGE BULGE COMBINING 3+ SIGNS) */}
          <g id="l3_unstable_slope_visual">
            <path d="M 410,130 Q 520,100 550,170 Q 500,230 400,190 Z" fill="#166534" stroke="#78350f" strokeWidth="2.5" />
            <path d="M 430,145 Q 490,130 525,175" stroke="#ef4444" strokeWidth="2.5" fill="none" opacity="0.85" />
            <path d="M 420,165 Q 480,150 510,192" stroke="#ef4444" strokeWidth="2" fill="none" opacity="0.85" />
            <circle cx="440" cy="155" r="4" fill="#b45309" />
            <circle cx="475" cy="170" r="5" fill="#78350f" />
            <ellipse cx="485" cy="195" rx="6" ry="4" fill="#475569" />
          </g>

          {/* HAZARD 1: CRACKED TERRAIN (AREA E: HAIRLINE CONTOUR CRACKS) */}
          <g id="l3_ground_cracks_visual">
            <path d="M 330,240 Q 420,220 460,260" stroke="#090d16" strokeWidth="2.5" fill="none" strokeDasharray="5 3" />
            <path d="M 345,252 Q 410,238 445,270" stroke="#1c1917" strokeWidth="1.8" fill="none" />
          </g>

          {/* DISTRACTOR: HORIZONTAL ROCK STRATA LINE */}
          <path d="M 270,140 Q 320,135 370,145" stroke="#64748b" strokeWidth="2.5" fill="none" opacity="0.6" />

          {/* 3. AREA C: ROCKY SCREE SLOPE (~35+ ROCKS DECOY FIELD) */}
          <path d="M -30,500 Q 150,220 420,420 L 350,562 L -30,562 Z" fill="#14532d" />

          {/* ~35 Decoy Rocks Field in Scree Slope */}
          <g id="l3_scree_rocks_field">
            <ellipse cx="60" cy="380" rx="8" ry="5" fill="#64748b" />
            <ellipse cx="85" cy="395" rx="12" ry="7" fill="#475569" />
            <ellipse cx="110" cy="410" rx="7" ry="4" fill="#334155" />
            <ellipse cx="130" cy="370" rx="10" ry="6" fill="#64748b" />
            <ellipse cx="150" cy="385" rx="14" ry="8" fill="#475569" />
            <ellipse cx="170" cy="340" rx="9" ry="5" fill="#334155" />
            <ellipse cx="280" cy="440" rx="12" ry="7" fill="#64748b" />
            <ellipse cx="300" cy="455" rx="15" ry="9" fill="#475569" />
            <ellipse cx="320" cy="420" rx="8" ry="5" fill="#334155" />
            <ellipse cx="340" cy="465" rx="11" ry="6" fill="#64748b" />
            <ellipse cx="120" cy="450" rx="10" ry="6" fill="#475569" />
            <ellipse cx="140" cy="470" rx="13" ry="7" fill="#334155" />
            <ellipse cx="160" cy="485" rx="9" ry="5" fill="#64748b" />
            <ellipse cx="90" cy="460" rx="11" ry="6" fill="#475569" />
          </g>

          {/* HAZARD 3: ROCKFALL (AREA C: FRESH DISTURBED SOIL TRAIL & BROKEN VEGETATION) */}
          <g id="l3_rockfall_visual">
            <path d="M 190,260 L 230,360 L 260,420" stroke="#78350f" strokeWidth="14" fill="none" opacity="0.85" />
            <path d="M 195,260 L 235,360 L 262,420" stroke="#9a3412" strokeWidth="8" fill="none" opacity="0.7" />
            <path d="M 210,300 L 202,310 M 215,302 L 222,312" stroke="#14532d" strokeWidth="2" />
            <polygon points="215,340 228,335 225,350 210,348" fill="#cbd5e1" stroke="#334155" strokeWidth="1" />
            <polygon points="245,395 260,390 258,408 240,402" fill="#cbd5e1" stroke="#334155" strokeWidth="1" />
          </g>

          {/* DISTRACTOR: BENT BIRCH TREE */}
          <g id="l3_bent_birch_distractor" transform="translate(110, 180)">
            <path d="M 0,50 Q -30,20 10,-20" stroke="#f8fafc" strokeWidth="6" fill="none" />
            <polygon points="10,-40 -12,-5 32,-5" fill="#15803d" />
          </g>

          {/* 4. AREA B: DENSE FOREST SLOPE (~20 TREES CLUSTER) */}
          <path d="M 500,280 Q 750,150 1030,320 L 1030,562 L 460,562 Z" fill="#14532d" />

          {/* ~20 Forest Trees Cluster */}
          <g id="l3_dense_forest">
            <polygon points="620,240 600,280 640,280" fill="#166534" />
            <polygon points="650,220 630,265 670,265" fill="#14532d" />
            <polygon points="680,250 660,290 700,290" fill="#15803d" />
            <polygon points="710,210 690,255 730,255" fill="#166534" />
            <polygon points="740,230 720,270 760,270" fill="#14532d" />
            <polygon points="790,260 770,300 810,300" fill="#15803d" />
            <polygon points="830,230 810,275 850,275" fill="#166534" />
            <polygon points="860,250 840,290 880,290" fill="#14532d" />
            <polygon points="890,220 870,265 910,265" fill="#15803d" />
            <polygon points="920,240 900,280 940,280" fill="#166534" />
            <polygon points="950,230 930,270 970,270" fill="#14532d" />
            <polygon points="980,250 960,290 1000,290" fill="#15803d" />
            <polygon points="600,270 585,305 615,305" fill="#166534" />
            <polygon points="640,280 625,315 655,315" fill="#14532d" />
            <polygon points="870,280 855,315 885,315" fill="#15803d" />
            <polygon points="910,290 895,325 925,325" fill="#166534" />
          </g>

          {/* HAZARD 2: LEANING TREE (AREA B: EXPOSED ROOT SOIL HEAVE AMONG 20 TREES) */}
          <g id="l3_leaning_tree_visual" transform="translate(770, 210) rotate(32)">
            <rect x="-5" y="0" width="10" height="42" fill="#78350f" />
            <polygon points="0,-52 -28,8 28,8" fill="#166534" />
            <polygon points="0,-30 -22,22 22,22" fill="#15803d" />
            <ellipse cx="0" cy="42" rx="18" ry="8" fill="#78350f" />
            <path d="M -12,42 Q -22,50 -26,46" stroke="#451a03" strokeWidth="3" fill="none" />
          </g>

          {/* DISTRACTOR: GLACIAL BOULDER */}
          <g id="l3_glacial_boulder">
            <ellipse cx="860" cy="380" rx="28" ry="16" fill="#64748b" stroke="#334155" strokeWidth="2" />
          </g>

          {/* 5. AREA D: STREAM & ERODING CLAY SLOPE */}
          {/* HAZARD 4: WATER SEEPAGE (AREA D: MUDDY SEEPAGE SPRING HIGH ABOVE STREAM) */}
          <g id="l3_water_seepage_visual">
            <ellipse cx="530" cy="320" rx="26" ry="38" fill="#78350f" opacity="0.6" />
            <path d="M 525,290 Q 520,320 532,350 T 518,380" stroke="url(#mudSeepageGrad)" strokeWidth="6" fill="none" />
            <path d="M 545,305 Q 540,335 548,365" stroke="url(#mudSeepageGrad)" strokeWidth="4" fill="none" />
            <ellipse cx="525" cy="382" rx="16" ry="6" fill="#b45309" opacity="0.8" />
          </g>

          {/* HAZARD 7: SEVERE SOIL EROSION (AREA D: CLAY WASHOUT GULLY CUTTING THROUGH GRASS) */}
          <g id="l3_soil_erosion_visual">
            <path d="M 370,520 Q 385,540 375,562" stroke="#451a03" strokeWidth="12" fill="none" opacity="0.9" />
            <path d="M 370,520 Q 385,540 375,562" stroke="#78350f" strokeWidth="7" fill="none" />
            <path d="M 362,530 L 375,535 M 365,548 L 380,552" stroke="#9a3412" strokeWidth="2.5" />
          </g>

          {/* CLEAN MOUNTAIN STREAM (DISTRACTOR AT BOTTOM) */}
          <path d="M 420,440 C 440,480 480,510 450,562 L 540,562 C 570,510 520,480 500,440 Z" fill="url(#cleanStreamGrad)" />

          {/* 6. AREA A: MOUNTAIN ROAD & CLIFF SAFETY FENCE */}
          <path d="M -10,510 C 200,490 350,470 520,490 C 680,510 850,480 1010,500 L 1010,550 C 850,530 680,560 520,540 C 350,520 200,545 -10,550 Z" fill="#475569" />

          {/* HAZARD 5: GROUND MOVEMENT (AREA A: MISALIGNED CLIFF SAFETY FENCE) */}
          <g id="l3_ground_movement_fence">
            <path d="M 600,460 L 640,462 M 642,475 L 710,480" stroke="#78350f" strokeWidth="5" />
            <line x1="605" y1="450" x2="605" y2="475" stroke="#451a03" strokeWidth="4" />
            <line x1="635" y1="452" x2="635" y2="477" stroke="#451a03" strokeWidth="4" />
            <line x1="645" y1="465" x2="655" y2="492" stroke="#dc2626" strokeWidth="4" />
            <line x1="675" y1="468" x2="675" y2="493" stroke="#451a03" strokeWidth="4" />
            <line x1="705" y1="472" x2="705" y2="497" stroke="#451a03" strokeWidth="4" />
          </g>

          {/* HAZARD 8: MULTIPLE GROUND CRACKS (AREA A: SPIDERWEB CRACK CLUSTER NEAR LOWER ROAD) */}
          <g id="l3_multiple_cracks_visual">
            <path d="M 140,710 Q 180,695 210,725" stroke="#1c1917" strokeWidth="3" fill="none" />
            <path d="M 150,700 L 190,720 M 170,695 L 165,725 M 185,705 L 195,730" stroke="#090d16" strokeWidth="2.5" strokeLinecap="round" />
            <ellipse cx="175" cy="710" rx="25" ry="12" fill="#78350f" opacity="0.3" />
          </g>

          {/* DISTRACTOR: ROAD PAINT MARKINGS */}
          <rect x="830" y="515" width="40" height="5" fill="#fef08a" transform="rotate(-5 830 515)" />
        </svg>

        {/* CLICKABLE HAZARDS HOTSPOTS */}
        {hazards.map((hazard) => {
          const isDiscovered = discoveredHazards.includes(hazard.id);
          const isMissed = missedHazards.includes(hazard.id);

          return (
            <React.Fragment key={hazard.id}>
              <div
                className="ms-hotspot"
                style={{
                  left: hazard.svgPos.left,
                  top: hazard.svgPos.top,
                  width: hazard.svgPos.width,
                  height: hazard.svgPos.height,
                  pointerEvents: disabled ? "none" : "auto"
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!disabled) onHazardClick(hazard);
                }}
                title={isDiscovered ? hazard.name : "Inspect High-Risk Area"}
              />

              {isDiscovered && (
                <div
                  className="ms-discovered-indicator"
                  style={{
                    left: hazard.highlightPos.left,
                    top: hazard.highlightPos.top
                  }}
                >
                  <div className="ms-ping-ring" />
                  <div className="ms-indicator-badge">{hazard.icon}</div>
                  <span className="ms-indicator-label">🔎 {hazard.name.toUpperCase()}</span>
                </div>
              )}

              {isMissed && !isDiscovered && (
                <div
                  className="ms-missed-indicator"
                  style={{
                    left: hazard.highlightPos.left,
                    top: hazard.highlightPos.top
                  }}
                >
                  <div className="ms-missed-badge">{hazard.icon}</div>
                  <span className="ms-missed-label">⚠️ MISSED: {hazard.name.toUpperCase()}</span>
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

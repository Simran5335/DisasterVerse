import React, { useState, useRef } from "react";
import { HAZARDS_DATA } from "../../../data/mountainScoutData";

export default function MountainVillageScene({
  discoveredHazards,
  missedHazards,
  onHazardClick,
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
    // Bound panning limits so user doesn't drag canvas off-screen
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
      {/* BINOCULAR LENS OVERLAY */}
      {isBinocularActive && (
        <>
          <div className="ms-binocular-overlay" />
          <div className="ms-binocular-tag">🔭 BINOCULARS ACTIVE (ENHANCED MAGNIFICATION)</div>
        </>
      )}

      {/* DYNAMIC OBSERVE NOTICE ("👀 SOMETHING CHANGED...") */}
      {observeNotice && (
        <div className="ms-observe-event-banner">
          👀 SOMETHING CHANGED IN THE MOUNTAIN SLOPE!
        </div>
      )}

      {/* ZOOMABLE & PANNABLE VIEWPORT CANVAS */}
      <div
        className="ms-scene-viewport"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`
        }}
      >
        {/* RICH SVG MOUNTAIN VILLAGE LANDSCAPE */}
        <svg
          className="ms-svg-scene"
          viewBox="0 0 1000 562.5"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="60%" stopColor="#bae6fd" />
              <stop offset="100%" stopColor="#e0f2fe" />
            </linearGradient>

            <linearGradient id="distMountGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>

            <linearGradient id="hillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#15803d" />
              <stop offset="100%" stopColor="#166534" />
            </linearGradient>

            <linearGradient id="rockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>

            <linearGradient id="waterSeepGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* 1. SKY & MOVING CLOUDS */}
          <rect width="1000" height="562.5" fill="url(#skyGrad)" />
          <g id="moving_clouds">
            <ellipse cx="180" cy="80" rx="90" ry="24" fill="#ffffff" opacity="0.85" />
            <ellipse cx="230" cy="75" rx="60" ry="20" fill="#ffffff" opacity="0.9" />
            <ellipse cx="750" cy="100" rx="110" ry="28" fill="#ffffff" opacity="0.8" />
            <ellipse cx="810" cy="90" rx="70" ry="22" fill="#ffffff" opacity="0.85" />
          </g>

          {/* 2. DISTANT SNOW-CAPPED MOUNTAIN PEAKS */}
          <polygon points="120,380 320,120 520,380" fill="url(#distMountGrad)" />
          <polygon points="320,120 270,185 320,200 360,170" fill="#f8fafc" />

          <polygon points="400,420 620,150 840,420" fill="url(#distMountGrad)" />
          <polygon points="620,150 560,220 620,240 670,210" fill="#f8fafc" />

          {/* 3. MIDGROUND MOUNTAIN SLOPES & CLIFF FACE */}
          <path d="M -20,480 Q 150,220 380,360 L 450,562 L -20,562 Z" fill="url(#hillGrad)" />
          <path d="M 40,360 L 160,250 L 220,340 L 180,440 L 80,430 Z" fill="url(#rockGrad)" />

          {/* HAZARD 3: ROCKFALL AREA */}
          <g id="visual_rockfall">
            <ellipse cx="140" cy="445" rx="14" ry="9" fill="#475569" />
            <ellipse cx="165" cy="455" rx="18" ry="11" fill="#334155" />
            <ellipse cx="185" cy="448" rx="12" ry="8" fill="#64748b" />
            <ellipse cx="150" cy="465" rx="15" ry="10" fill="#475569" />
            <ellipse cx="195" cy="462" rx="10" ry="7" fill="#334155" />
            <line x1="150" y1="360" x2="160" y2="440" stroke="#475569" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
            <line x1="175" y1="380" x2="180" y2="445" stroke="#475569" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />
          </g>

          {/* HAZARD 2: LEANING TREE ON UPPER RIGHT SLOPE */}
          <path d="M 550,280 Q 750,180 1020,340 L 1020,562 L 500,562 Z" fill="url(#hillGrad)" />

          {/* Straight Trees */}
          <g id="normal_trees">
            <rect x="620" y="240" width="8" height="28" fill="#78350f" />
            <polygon points="624,200 600,245 648,245" fill="#14532d" />
            <polygon points="624,218 605,255 643,255" fill="#15803d" />

            <rect x="780" y="260" width="8" height="30" fill="#78350f" />
            <polygon points="784,215 760,265 808,265" fill="#14532d" />
            <polygon points="784,235 765,275 803,275" fill="#15803d" />
          </g>

          {/* Tilted Leaning Tree (32 deg) */}
          <g id="visual_leaning_tree" transform="translate(710, 220) rotate(32)">
            <rect x="-4" y="0" width="8" height="34" fill="#78350f" />
            <polygon points="0,-45 -26,5 26,5" fill="#166534" />
            <polygon points="0,-25 -22,18 22,18" fill="#15803d" />
            <path d="M -8,30 Q -14,35 -18,34" stroke="#78350f" strokeWidth="3" fill="none" />
          </g>

          {/* HAZARD 4: WATER SEEPAGE */}
          <g id="visual_water_seepage">
            <path d="M 830,340 Q 825,370 835,400 T 820,430" stroke="url(#waterSeepGrad)" strokeWidth="6" fill="none" />
            <path d="M 850,355 Q 845,385 852,415" stroke="url(#waterSeepGrad)" strokeWidth="4" fill="none" />
            <ellipse cx="830" cy="432" rx="16" ry="6" fill="#0284c7" opacity="0.6" />
            <ellipse cx="840" cy="380" rx="20" ry="35" fill="#78350f" opacity="0.35" />
          </g>

          {/* HAZARD 5: BULGING SLOPE */}
          <path d="M 380,320 Q 550,220 720,380 L 650,562 L 320,562 Z" fill="#166534" />
          <g id="visual_bulging_slope">
            <path d="M 500,270 Q 570,250 590,300 Q 560,340 490,320 Z" fill="#15803d" stroke="#166534" strokeWidth="2" />
            <path d="M 510,280 Q 560,265 575,300" stroke="#84cc16" strokeWidth="3" fill="none" opacity="0.7" />
            <path d="M 500,295 Q 550,285 565,312" stroke="#84cc16" strokeWidth="3" fill="none" opacity="0.7" />
            <path d="M 525,272 Q 545,305 520,320" stroke="#78350f" strokeWidth="2" strokeDasharray="3 3" fill="none" opacity="0.5" />
          </g>

          {/* 4. VILLAGE HOUSES & WINDING ROAD */}
          <path d="M -10,500 C 200,490 350,460 500,480 C 650,500 850,470 1010,490 L 1010,540 C 850,520 650,550 500,530 C 350,510 200,540 -10,540 Z" fill="#94a3b8" />
          <path d="M 0,518 C 200,508 350,478 500,498 C 650,518 850,488 1000,508" stroke="#fef08a" strokeWidth="3" strokeDasharray="16 12" fill="none" />

          {/* Village Houses */}
          <g id="house_1">
            <rect x="220" y="380" width="70" height="50" fill="#fef3c7" stroke="#78350f" strokeWidth="2" />
            <polygon points="210,380 255,340 300,380" fill="#b91c1c" />
            <rect x="245" y="405" width="16" height="25" fill="#78350f" />
            <rect x="270" y="395" width="14" height="14" fill="#38bdf8" stroke="#78350f" strokeWidth="2" />
          </g>

          <g id="house_2">
            <rect x="610" y="390" width="80" height="55" fill="#f1f5f9" stroke="#334155" strokeWidth="2" />
            <polygon points="600,390 650,350 700,390" fill="#1e3a8a" />
            <rect x="640" y="415" width="18" height="30" fill="#78350f" />
            <rect x="620" y="405" width="14" height="14" fill="#fef08a" stroke="#334155" strokeWidth="2" />
          </g>

          {/* HAZARD 1: CRACKED TERRAIN (REALISTIC EXPOSED HILLSIDE GROUND CRACK) */}
          <g id="visual_ground_cracks">
            {/* Exposed Brown Soil Patch on Hillside */}
            <path d="M 230,350 Q 280,335 340,360 Q 350,395 310,420 Q 250,425 225,385 Z" fill="#78350f" opacity="0.9" />

            {/* Displaced Soil Layers */}
            <path d="M 245,365 Q 285,355 320,375 L 305,395 Q 265,385 245,365 Z" fill="#9a3412" opacity="0.6" />

            {/* Dark Shadow Sub-Layer for Fissure Depth */}
            <path d="M 250,360 L 268,375 L 260,390 L 285,405 L 310,412" stroke="#090d16" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

            {/* Main Irregular Zig-Zag Fissure Crack */}
            <path d="M 250,360 L 268,375 L 260,390 L 285,405 L 310,412" stroke="#1c1917" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />

            {/* Branching Fissure Cracks */}
            <path d="M 268,375 L 292,368 L 308,376" stroke="#1c1917" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 260,390 L 242,398 L 235,408" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 285,405 L 298,418 L 302,425" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" fill="none" />

            {/* Scattered Loose Soil Stones & Small Pebbles */}
            <ellipse cx="258" cy="370" rx="3.5" ry="2" fill="#44403c" />
            <ellipse cx="275" cy="382" rx="4" ry="2.5" fill="#292524" />
            <ellipse cx="290" cy="398" rx="3" ry="2" fill="#44403c" />
            <ellipse cx="248" cy="395" rx="4.5" ry="3" fill="#1c1917" />
            <ellipse cx="305" cy="415" rx="3" ry="2" fill="#44403c" />

            {/* Subtle Dust Particle Falling Into Crack */}
            <circle cx="270" cy="380" r="1.5" fill="#d97706" opacity="0.8">
              <animate attributeName="cy" values="375;395" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0" dur="3s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* HAZARD 6: SMALL GROUND MOVEMENT */}
          <g id="visual_ground_movement">
            <path d="M 390,410 Q 420,430 450,460" stroke="#b45309" strokeWidth="12" fill="none" opacity="0.8" />
            <path d="M 415,425 L 435,432" stroke="#451a03" strokeWidth="5" fill="none" />
            <path d="M 420,435 L 440,442" stroke="#78350f" strokeWidth="4" fill="none" />
            <circle cx="422" cy="428" r="4" fill="#78350f" />
            <circle cx="430" cy="436" r="3" fill="#451a03" />
          </g>
        </svg>

        {/* INVISIBLE CLICKABLE HOTSPOTS OVERLAY */}
        {HAZARDS_DATA.map((hazard) => {
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
                title={isDiscovered ? hazard.name : "Inspect Mountain Area"}
              />

              {/* Discovered Marker Ping & Icon */}
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

              {/* Missed Indicator (Revealed on Time-Up) */}
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

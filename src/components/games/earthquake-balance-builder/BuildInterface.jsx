import React, { useState, useEffect, useRef } from 'react';

// Exact Material Specifications, Real-World Colors & 3-Face Voxel Shades
export const MATERIAL_SPECS = {
  // Foundation
  weak: { category: 'Foundation', name: 'Weak Base', desc: 'Shallow base', color: '#8a7a5c', topColor: '#a89878', sideColor: '#695b42', texture: 'concrete', strength: 15, flexibility: 5, mass: 20 },
  normal: { category: 'Foundation', name: 'Normal Base', desc: 'Standard concrete', color: '#9a9a94', topColor: '#b8b8b2', sideColor: '#787872', texture: 'concrete', strength: 30, flexibility: 10, mass: 30 },
  strong: { category: 'Foundation', name: 'Strong Base', desc: 'Deep reinforced base', color: '#5c6670', topColor: '#75808c', sideColor: '#434b53', texture: 'steel', strength: 50, flexibility: 15, mass: 45 },

  // Pillars
  wood_pillar: { category: 'Pillars', name: 'Wood Pillars', desc: 'Light & flexible', color: '#a5713a', topColor: '#c78a4b', sideColor: '#7d5225', texture: 'wood', strength: 25, flexibility: 45, mass: 10 },
  concrete_pillar: { category: 'Pillars', name: 'Concrete Pillars', desc: 'Heavy & rigid', color: '#8f8f88', topColor: '#ababa3', sideColor: '#6e6e67', texture: 'concrete', strength: 40, flexibility: 10, mass: 35 },
  steel_pillar: { category: 'Pillars', name: 'Steel Pillars', desc: 'Strong & flexible', color: '#6b7f94', topColor: '#869bb2', sideColor: '#4e5f71', texture: 'steel', strength: 60, flexibility: 50, mass: 25 },

  // Walls / Material
  brick_wall: { category: 'Walls', name: 'Brick Walls', desc: 'Classic masonry', color: '#a4462c', topColor: '#c7593c', sideColor: '#7e321d', texture: 'brick', strength: 20, flexibility: 5, mass: 25 },
  concrete_wall: { category: 'Walls', name: 'Concrete Walls', desc: 'Solid wall', color: '#b5b5ae', topColor: '#d4d4cd', sideColor: '#91918b', texture: 'concrete', strength: 45, flexibility: 15, mass: 35 },
  steel_wall: { category: 'Walls', name: 'Steel Walls', desc: 'Modern panels', color: '#7d94a8', topColor: '#9cb4c9', sideColor: '#5b6f80', texture: 'steel', strength: 55, flexibility: 40, mass: 20 },

  // Roof
  flat_roof: { category: 'Roof', name: 'Flat Roof', desc: 'Light & basic', color: '#c9863f', topColor: '#e6a157', sideColor: '#9e6429', texture: 'concrete', strength: 20, flexibility: 25, mass: 10 },
  sloped_roof: { category: 'Roof', name: 'Sloped Roof', desc: 'Standard tiles', color: '#b0553f', topColor: '#d16a52', sideColor: '#873d2a', texture: 'brick', strength: 30, flexibility: 30, mass: 15 },
  heavy_roof: { category: 'Roof', name: 'Heavy Roof', desc: 'Concrete slab', color: '#5c6670', topColor: '#75808c', sideColor: '#434b53', texture: 'concrete', strength: 45, flexibility: 5, mass: 40 },
};

const BLUEPRINT_SECTIONS = [
  {
    title: '1. FOUNDATION',
    items: [
      { key: 'weak', label: 'Weak', desc: 'Shallow base' },
      { key: 'normal', label: 'Normal', desc: 'Standard concrete' },
      { key: 'strong', label: 'Strong', desc: 'Deep reinforced base' },
    ]
  },
  {
    title: '2. PILLARS',
    items: [
      { key: 'wood_pillar', label: 'Wood', desc: 'Light & flexible' },
      { key: 'concrete_pillar', label: 'Concrete', desc: 'Heavy & rigid' },
      { key: 'steel_pillar', label: 'Steel', desc: 'Strong & flexible' },
    ]
  },
  {
    title: '3. WALLS / MATERIAL',
    items: [
      { key: 'brick_wall', label: 'Brick', desc: 'Classic masonry' },
      { key: 'concrete_wall', label: 'Concrete', desc: 'Solid wall' },
      { key: 'steel_wall', label: 'Steel', desc: 'Modern panels' },
    ]
  },
  {
    title: '4. ROOF',
    items: [
      { key: 'flat_roof', label: 'Flat', desc: 'Light & basic' },
      { key: 'sloped_roof', label: 'Sloped', desc: 'Standard tiles' },
      { key: 'heavy_roof', label: 'Heavy', desc: 'Concrete slab' },
    ]
  }
];

const COLUMN_COUNT = 8;
const MAX_ROWS = 8;
const MAGNITUDES = [4.5, 5.5, 6.5, 7.5, 8.5];

export default function BuildInterface() {
  const [selectedMaterialKey, setSelectedMaterialKey] = useState('normal');

  // 2D Stacked Building Columns State
  const [columns, setColumns] = useState(() => {
    return Array.from({ length: COLUMN_COUNT }, (_, i) => [
      { id: `init-${i}`, key: 'normal', ...MATERIAL_SPECS.normal }
    ]);
  });

  const [history, setHistory] = useState([]);
  const [hoveredCol, setHoveredCol] = useState(null);

  const [magnitude, setMagnitude] = useState(6.5);
  const [status, setStatus] = useState('READY');
  const [isSimulating, setIsSimulating] = useState(false);
  const [swayAngle, setSwayAngle] = useState(0);
  const [isCollapsing, setIsCollapsing] = useState(false);
  const [resultModal, setResultModal] = useState(null);

  const animationFrameRef = useRef(null);

  const blockCount = columns.reduce((acc, col) => acc + col.length, 0);
  const maxHeight = Math.max(0, ...columns.map(col => col.length));
  const totalMass = columns.reduce((acc, col) => acc + col.reduce((sum, b) => sum + b.mass, 0), 0);

  const calculateResilience = () => {
    if (blockCount === 0) return 0;

    let totalStrength = 0;
    let totalFlex = 0;
    columns.forEach(col => {
      col.forEach(b => {
        totalStrength += b.strength;
        totalFlex += b.flexibility;
      });
    });

    const avgStrength = totalStrength / blockCount;
    const avgFlex = totalFlex / blockCount;

    const heightPenalty = maxHeight * 3.5;
    const massPenalty = totalMass * 0.15;
    const flexBonus = avgFlex * 0.4;

    const rawScore = avgStrength + flexBonus - heightPenalty - massPenalty + 15;
    return Math.min(100, Math.max(5, Math.round(rawScore)));
  };

  const resilienceScore = calculateResilience();

  const addBlockToColumn = (colIdx, matKey) => {
    if (isSimulating) return;
    const spec = MATERIAL_SPECS[matKey];
    if (!spec) return;

    if (columns[colIdx].length >= MAX_ROWS) return;

    const newBlock = {
      id: `${Date.now()}-${Math.random()}`,
      key: matKey,
      ...spec
    };

    setHistory(prev => [...prev, columns]);
    setColumns(prev => prev.map((col, i) => i === colIdx ? [...col, newBlock] : col));
    setResultModal(null);
    setStatus('READY');
  };

  const handleBlockClick = (colIdx, rowIdx) => {
    if (isSimulating) return;
    setHistory(prev => [...prev, columns]);
    setColumns(prev => prev.map((col, i) => {
      if (i === colIdx) {
        return col.slice(0, rowIdx);
      }
      return col;
    }));
    setResultModal(null);
    setStatus('READY');
  };

  const handleUndo = () => {
    if (isSimulating || history.length === 0) return;
    const lastState = history[history.length - 1];
    setColumns(lastState);
    setHistory(prev => prev.slice(0, -1));
    setResultModal(null);
    setStatus('READY');
  };

  const handleClear = () => {
    if (isSimulating) return;
    setHistory(prev => [...prev, columns]);
    setColumns(Array.from({ length: COLUMN_COUNT }, () => []));
    setResultModal(null);
    setStatus('READY');
  };

  const handleDragStart = (e, matKey) => {
    e.dataTransfer.setData('text/plain', matKey);
    setSelectedMaterialKey(matKey);
  };

  const handleDragOverCol = (e, colIdx) => {
    e.preventDefault();
    if (hoveredCol !== colIdx) setHoveredCol(colIdx);
  };

  const handleDropOnCol = (e, colIdx) => {
    e.preventDefault();
    setHoveredCol(null);
    const matKey = e.dataTransfer.getData('text/plain') || selectedMaterialKey;
    addBlockToColumn(colIdx, matKey);
  };

  const triggerEarthquake = () => {
    if (isSimulating || blockCount === 0) return;

    setIsSimulating(true);
    setStatus('QUAKE IN PROGRESS');
    setResultModal(null);
    setIsCollapsing(false);

    const startTime = performance.now();
    const durationSec = 5.5;

    const baseAmp = magnitude * 2.2;
    const effectiveAmp = baseAmp / (1 + (resilienceScore / 100) * 0.75);

    const collapseThreshold = 6.2;
    const willCollapse = effectiveAmp > collapseThreshold || (magnitude >= 7.5 && resilienceScore < 45);

    let collapseTriggered = false;

    const animate = (timestamp) => {
      const elapsed = (timestamp - startTime) / 1000;

      if (elapsed < durationSec) {
        const freq = 8 + magnitude * 0.4;
        const decay = Math.exp(-elapsed * 0.55);
        const angle = Math.sin(elapsed * freq) * effectiveAmp * decay;
        setSwayAngle(angle);

        if (willCollapse && elapsed > 1.2 && !collapseTriggered) {
          collapseTriggered = true;
          setIsCollapsing(true);
        }

        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setSwayAngle(0);
        setIsSimulating(false);

        const survived = !willCollapse;
        setStatus(survived ? 'STRUCTURE HELD' : 'STRUCTURE FAILED');

        setResultModal({
          survived,
          resilienceScore,
          magnitude,
          score: Math.round(resilienceScore * (survived ? 1.5 : 0.5)),
          xp: Math.round(resilienceScore * (survived ? 2.5 : 0.8)),
          details: survived 
            ? `Successfully absorbed seismic shear of Magnitude ${magnitude}!`
            : `Lateral sway exceeded tolerance under Magnitude ${magnitude}.`
        });
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const handleRandomMagnitude = () => {
    if (isSimulating) return;
    const randomIndex = Math.floor(Math.random() * MAGNITUDES.length);
    setMagnitude(MAGNITUDES[randomIndex]);
  };

  const getMagnitudeLabel = (m) => {
    if (m === 4.5) return 'LOW';
    if (m === 5.5) return 'MODERATE';
    if (m === 6.5) return 'STRONG';
    if (m === 7.5) return 'SEVERE';
    return 'EXTREME';
  };

  // Helper component to render Minecraft 3-Face Voxel Block with textures
  const renderVoxelBlock = (block, isGhost = false) => {
    const { color, topColor, sideColor, texture, name } = block;

    let patternStyle = {};
    if (texture === 'wood') {
      patternStyle = {
        backgroundImage: 'repeating-linear-gradient(90deg, transparent 0px, transparent 6px, rgba(0,0,0,0.18) 6px, rgba(0,0,0,0.18) 8px)',
        backgroundSize: '12px 100%'
      };
    } else if (texture === 'brick') {
      patternStyle = {
        backgroundImage: `
          linear-gradient(180deg, transparent 13px, rgba(241,245,249,0.75) 13px, rgba(241,245,249,0.75) 15px, transparent 15px),
          repeating-linear-gradient(90deg, transparent 0px, transparent 20px, rgba(241,245,249,0.75) 20px, rgba(241,245,249,0.75) 22px)
        `,
        backgroundSize: '100% 16px, 44px 100%'
      };
    } else if (texture === 'steel') {
      patternStyle = {
        backgroundImage: `
          linear-gradient(180deg, transparent 14px, rgba(15,23,42,0.6) 14px, rgba(15,23,42,0.6) 16px, transparent 16px),
          radial-gradient(circle at 4px 4px, rgba(255,255,255,0.85) 1px, transparent 1.5px),
          radial-gradient(circle at 40px 4px, rgba(255,255,255,0.85) 1px, transparent 1.5px)
        `,
        backgroundSize: '100% 16px, 48px 16px, 48px 16px'
      };
    } else {
      // Concrete fine speckle noise pattern
      patternStyle = {
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(255,255,255,0.2) 1px, transparent 1px),
          radial-gradient(circle at 70% 65%, rgba(0,0,0,0.25) 1px, transparent 1px)
        `,
        backgroundSize: '8px 8px, 10px 10px'
      };
    }

    return (
      <div style={{
        position: 'relative',
        width: '48px',
        height: '34px',
        opacity: isGhost ? 0.45 : 1,
        border: isGhost ? '2px dashed #06b6d4' : 'none',
        borderRadius: isGhost ? '4px' : '0px',
        filter: isGhost ? 'drop-shadow(0 0 6px rgba(6,182,212,0.6))' : 'none',
        willChange: 'transform',
        transform: 'translateZ(0)',
      }}>
        {/* Top Face (Directional Light: +20% Lighter from above) */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '7px',
          backgroundColor: topColor,
          border: '1px solid rgba(15,23,42,0.65)',
          borderBottom: '1px solid rgba(15,23,42,0.75)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)',
          zIndex: 3
        }} />

        {/* Front Face (Camera Facing with Material Pattern) */}
        <div style={{
          position: 'absolute',
          top: '6px',
          left: 0,
          right: '7px',
          bottom: 0,
          backgroundColor: color,
          border: '1px solid rgba(15,23,42,0.65)',
          borderTop: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
          ...patternStyle
        }}>
          <span style={{
            fontSize: '7px',
            fontWeight: '900',
            color: '#ffffff',
            textShadow: '0 1px 2px rgba(0,0,0,0.9)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {name.split(' ')[0]}
          </span>
        </div>

        {/* Right Side Shadow Face (Directional Light: -15% Darker) */}
        <div style={{
          position: 'absolute',
          top: '4px',
          right: 0,
          width: '7px',
          bottom: 0,
          backgroundColor: sideColor,
          border: '1px solid rgba(15,23,42,0.65)',
          borderLeft: 'none',
          boxShadow: 'inset -1px 0 0 rgba(0,0,0,0.4)',
          zIndex: 1
        }} />
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* LEFT COLUMN: Blueprint & Material Drag Source */}
      <div style={styles.leftCol}>
        <div style={styles.card}>
          <div style={styles.flexBetween}>
            <h2 style={styles.cardTitle}>📐 Construction Blueprint</h2>
            <span style={styles.dragTipBadge}>💡 Drag card to grid</span>
          </div>

          <div style={styles.sectionSpace}>
            {BLUEPRINT_SECTIONS.map((sec) => (
              <div key={sec.title} style={{ marginTop: '14px' }}>
                <label style={styles.label}>{sec.title}</label>
                <div style={styles.grid3}>
                  {sec.items.map((item) => {
                    const spec = MATERIAL_SPECS[item.key];
                    const isSelected = selectedMaterialKey === item.key;
                    return (
                      <div
                        key={item.key}
                        draggable={!isSimulating}
                        onDragStart={(e) => handleDragStart(e, item.key)}
                        onClick={() => setSelectedMaterialKey(item.key)}
                        style={{
                          ...styles.btnOption,
                          ...(isSelected ? styles.btnOptionSelected : {}),
                          borderColor: isSelected ? '#06b6d4' : '#2a2422',
                        }}
                      >
                        <div style={styles.optHeader}>
                          <span
                            style={{
                              ...styles.swatch,
                              backgroundColor: spec.color,
                              borderTop: `3px solid ${spec.topColor}`
                            }}
                          />
                          <div style={styles.optTitle}>{item.label}</div>
                        </div>
                        <div style={styles.optDesc}>{item.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Earthquake Magnitude Control */}
        <div style={{ ...styles.card, marginTop: '20px' }}>
          <div style={styles.flexBetween}>
            <h2 style={styles.cardTitle}>⚡ Earthquake Magnitude</h2>
            <button
              onClick={handleRandomMagnitude}
              disabled={isSimulating}
              style={styles.randomBtn}
            >
              🎲 Random
            </button>
          </div>

          <div style={styles.magCenter}>
            <div style={{ textAlign: 'center' }}>
              <span style={styles.magNumber}>{magnitude}</span>
              <span style={styles.magPill}>{getMagnitudeLabel(magnitude)}</span>
            </div>

            <div style={{ width: '100%', marginTop: '15px' }}>
              <input
                type="range"
                min="4.5"
                max="8.5"
                step="1"
                value={magnitude}
                onChange={(e) => {
                  setMagnitude(Number(e.target.value));
                  setResultModal(null);
                  setStatus('READY');
                }}
                disabled={isSimulating}
                style={{ width: '100%', cursor: 'pointer', accentColor: '#f43f5e' }}
              />
              <div style={styles.flexBetweenLabels}>
                <span>4.5</span>
                <span>5.5</span>
                <span>6.5</span>
                <span>7.5</span>
                <span>8.5</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Minecraft-Style Building Platform */}
      <div style={styles.rightCol}>
        <div style={styles.simCard}>
          {/* Simulator Header & Status Pill */}
          <div style={styles.simHeader}>
            <h3 style={{ margin: 0, fontSize: '14px', letterSpacing: '1px' }}>STRUCTURE SIMULATOR</h3>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{
                ...styles.activePill,
                backgroundColor: status === 'STRUCTURE HELD' ? 'rgba(16,185,129,0.2)' : status === 'STRUCTURE FAILED' ? 'rgba(239,68,68,0.2)' : 'rgba(6,182,212,0.15)',
                color: status === 'STRUCTURE HELD' ? '#34d399' : status === 'STRUCTURE FAILED' ? '#f87171' : '#06b6d4'
              }}>
                {status === 'READY' ? 'PHYSICS ACTIVE' : status}
              </span>
            </div>
          </div>

          {/* Canvas Interactive Sandbox Area */}
          <div style={styles.sandboxArea}>
            {/* Active Selected Material Brush Indicator */}
            <div style={styles.brushIndicator}>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>ACTIVE BRUSH:</span>
              <span style={{
                ...styles.swatchMini,
                backgroundColor: MATERIAL_SPECS[selectedMaterialKey].color,
                borderTop: `2px solid ${MATERIAL_SPECS[selectedMaterialKey].topColor}`
              }} />
              <strong style={{ fontSize: '11px', color: '#f8fafc' }}>
                {MATERIAL_SPECS[selectedMaterialKey].name.toUpperCase()}
              </strong>
            </div>

            {/* 2D Stacked Minecraft Voxel Columns Platform Container */}
            <div style={styles.viewportContainer}>
              <div style={{
                ...styles.structureWrapper,
                transformOrigin: 'bottom center',
                transform: `rotate(${swayAngle}deg)`,
                transition: isCollapsing ? 'none' : 'transform 0.05s linear'
              }}>
                <div style={styles.gridColumnsContainer}>
                  {columns.map((colBlocks, colIdx) => {
                    const isTargetCol = hoveredCol === colIdx;
                    const canFitGhost = colBlocks.length < MAX_ROWS;

                    return (
                      <div
                        key={colIdx}
                        onMouseEnter={() => setHoveredCol(colIdx)}
                        onMouseLeave={() => setHoveredCol(null)}
                        onDragOver={(e) => handleDragOverCol(e, colIdx)}
                        onDrop={(e) => handleDropOnCol(e, colIdx)}
                        onClick={() => addBlockToColumn(colIdx, selectedMaterialKey)}
                        style={{
                          ...styles.gridColumn,
                          backgroundColor: isTargetCol ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                          borderColor: isTargetCol ? '#06b6d4' : 'rgba(51, 65, 85, 0.25)',
                        }}
                      >
                        {/* Render Stacked Minecraft Voxel Blocks (Bottom-to-Top, Gap 0) */}
                        {colBlocks.map((block, rowIdx) => {
                          const isFallen = isCollapsing && rowIdx > 0;
                          const randX = (Math.sin(block.id.length + rowIdx) * 120);
                          const randRot = (Math.cos(block.id.length + rowIdx) * 180);

                          return (
                            <div
                              key={block.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBlockClick(colIdx, rowIdx);
                              }}
                              title={`Click to remove level ${rowIdx + 1}`}
                              style={{
                                transform: isFallen 
                                  ? `translate(${randX}px, ${180 + rowIdx * 15}px) rotate(${randRot}deg)`
                                  : 'none',
                                opacity: isFallen ? 0.2 : 1,
                                transition: isFallen ? 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.8s ease' : 'none',
                                cursor: 'pointer'
                              }}
                            >
                              {renderVoxelBlock(block, false)}
                            </div>
                          );
                        })}

                        {/* Hover & Drag Ghost Preview Block at Top Slot */}
                        {isTargetCol && canFitGhost && !isSimulating && (
                          <div style={{ cursor: 'pointer' }}>
                            {renderVoxelBlock(MATERIAL_SPECS[selectedMaterialKey], true)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Platform Street Ground Bed */}
            <div style={styles.groundBed}>
              <div style={styles.streetLine} />
            </div>

            {/* Bottom Controls Bar (Undo, Clear, Build Level, Block Count, Resilience) */}
            <div style={styles.bottomControlsBar}>
              <div style={styles.statsPillGroup}>
                <span style={styles.metricTag}>BUILD LEVEL: {maxHeight} / {MAX_ROWS}</span>
                <span style={styles.metricTag}>BLOCKS: {blockCount}</span>
                <span style={{ ...styles.metricTag, color: resilienceScore > 50 ? '#34d399' : '#f87171' }}>
                  RESILIENCE: {resilienceScore}%
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleUndo}
                  disabled={history.length === 0 || isSimulating}
                  style={{
                    ...styles.actionSmallBtn,
                    opacity: history.length === 0 || isSimulating ? 0.5 : 1
                  }}
                >
                  ↩️ UNDO
                </button>
                <button
                  onClick={handleClear}
                  disabled={blockCount === 0 || isSimulating}
                  style={{
                    ...styles.actionSmallBtn,
                    color: '#f43f5e',
                    borderColor: 'rgba(244,63,94,0.3)',
                    opacity: blockCount === 0 || isSimulating ? 0.5 : 1
                  }}
                >
                  🗑️ CLEAR
                </button>
              </div>
            </div>

            {/* Result Modal Banner */}
            {resultModal && (
              <div style={styles.resultBannerOverlay}>
                <div style={{
                  ...styles.modalBox,
                  borderColor: resultModal.survived ? '#10b981' : '#ef4444'
                }}>
                  <h3 style={{
                    fontSize: '22px',
                    margin: '0 0 8px 0',
                    color: resultModal.survived ? '#34d399' : '#f87171'
                  }}>
                    {resultModal.survived ? 'STRUCTURE HELD 🎉' : 'STRUCTURE FAILED 💥'}
                  </h3>

                  <div style={styles.statsRow}>
                    <div style={styles.statPill}>
                      <span style={{ fontSize: '10px', color: '#9ca3af' }}>MAGNITUDE SURVIVED</span>
                      <strong style={{ fontSize: '16px' }}>M {resultModal.magnitude}</strong>
                    </div>
                    <div style={styles.statPill}>
                      <span style={{ fontSize: '10px', color: '#9ca3af' }}>RESILIENCE SCORE</span>
                      <strong style={{ fontSize: '16px', color: '#38bdf8' }}>{resultModal.resilienceScore}%</strong>
                    </div>
                    <div style={styles.statPill}>
                      <span style={{ fontSize: '10px', color: '#9ca3af' }}>XP EARNED</span>
                      <strong style={{ fontSize: '16px', color: '#fbbf24' }}>+{resultModal.xp} XP</strong>
                    </div>
                  </div>

                  <p style={{ fontSize: '12px', color: '#cbd5e1', margin: '12px 0' }}>
                    {resultModal.details}
                  </p>

                  <button
                    onClick={() => {
                      setResultModal(null);
                      setStatus('READY');
                    }}
                    style={styles.replayBtn}
                  >
                    Rebuild & Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Commence Earthquake Button */}
        <button
          disabled={blockCount === 0 || isSimulating}
          onClick={triggerEarthquake}
          style={{
            ...styles.commenceBtn,
            opacity: (blockCount === 0 || isSimulating) ? 0.5 : 1,
            cursor: (blockCount === 0 || isSimulating) ? 'not-allowed' : 'pointer'
          }}
        >
          {isSimulating ? 'Earthquake in Progress...' : blockCount > 0 ? 'COMMENCE EARTHQUAKE 🌋' : 'Drag or click blocks onto grid to begin'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.15fr',
    gap: '24px',
    maxWidth: '1240px',
    margin: '0 auto',
  },
  leftCol: { display: 'flex', flexDirection: 'column', gap: '20px' },
  rightCol: { display: 'flex', flexDirection: 'column', gap: '20px' },
  card: {
    backgroundColor: '#161211',
    border: '1px solid #241e1c',
    padding: '20px',
    borderRadius: '16px',
  },
  cardTitle: { fontSize: '17px', margin: 0, color: '#fca5a5' },
  dragTipBadge: { fontSize: '10px', color: '#06b6d4', fontWeight: 'bold', backgroundColor: 'rgba(6,182,212,0.12)', padding: '3px 8px', borderRadius: '6px' },
  sectionSpace: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '10px', fontWeight: 'bold', color: '#06b6d4', textTransform: 'uppercase', marginBottom: '6px', display: 'block' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' },
  btnOption: {
    backgroundColor: '#1f1a18',
    border: '1px solid #2a2422',
    color: '#9ca3af',
    padding: '10px',
    borderRadius: '8px',
    textAlign: 'left',
    cursor: 'grab',
    userSelect: 'none',
    transition: 'all 0.15s ease-in-out',
  },
  btnOptionSelected: {
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    color: '#fff',
    boxShadow: '0 0 8px rgba(6,182,212,0.4)',
  },
  optHeader: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' },
  swatch: {
    width: '12px',
    height: '12px',
    borderRadius: '2px',
    flexShrink: 0,
    boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.3)'
  },
  swatchMini: {
    width: '10px',
    height: '10px',
    borderRadius: '2px',
    display: 'inline-block'
  },
  optTitle: { fontWeight: 'bold', fontSize: '12px' },
  optDesc: { fontSize: '10px', opacity: 0.75 },
  flexBetween: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  randomBtn: {
    backgroundColor: '#1f1a18',
    border: '1px solid #2a2422',
    color: '#fff',
    padding: '5px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '11px',
  },
  magCenter: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  magNumber: { fontSize: '34px', fontWeight: 'bold', color: '#f43f5e', display: 'block' },
  magPill: { fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '10px', backgroundColor: 'rgba(244,63,94,0.15)', color: '#f43f5e' },
  flexBetweenLabels: { display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#9ca3af', marginTop: '4px' },

  simCard: {
    backgroundColor: '#161211',
    border: '1px solid #241e1c',
    borderRadius: '16px',
    overflow: 'hidden',
    height: '560px',
    display: 'flex',
    flexDirection: 'column',
  },
  simHeader: {
    padding: '12px 18px',
    backgroundColor: '#1f1a18',
    borderBottom: '1px solid #2a2422',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activePill: { fontSize: '10px', fontWeight: 'bold', padding: '3px 9px', borderRadius: '4px' },
  sandboxArea: {
    position: 'relative',
    flex: 1,
    backgroundColor: '#0f172a',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '16px',
    overflow: 'hidden'
  },
  brushIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(15,23,42,0.9)',
    border: '1px solid #334155',
    padding: '4px 10px',
    borderRadius: '8px',
    alignSelf: 'center',
    zIndex: 10
  },
  viewportContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingBottom: '8px',
    zIndex: 5
  },
  structureWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  gridColumnsContainer: {
    display: 'grid',
    gridTemplateColumns: `repeat(${COLUMN_COUNT}, 52px)`,
    gap: '4px',
    alignItems: 'flex-end'
  },
  gridColumn: {
    height: `${MAX_ROWS * 36}px`,
    display: 'flex',
    flexDirection: 'column-reverse', // Stack bottom-to-top!
    justifyContent: 'flex-start',
    gap: '0px', // Zero gaps for continuous chunk column stacking!
    padding: '2px',
    borderRadius: '6px',
    border: '1px dashed transparent',
    cursor: 'pointer',
    transition: 'all 0.15s ease-in-out',
  },
  groundBed: {
    height: '16px',
    backgroundColor: '#1e293b',
    borderRadius: '4px',
    border: '1px solid #334155',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 10px'
  },
  streetLine: {
    width: '90%',
    height: '2px',
    backgroundColor: '#f59e0b',
    opacity: 0.7
  },
  bottomControlsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '12px',
    zIndex: 10
  },
  statsPillGroup: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },
  metricTag: {
    fontSize: '10px',
    fontWeight: 'bold',
    color: '#38bdf8',
    backgroundColor: '#0f172a',
    border: '1px solid #1e293b',
    padding: '4px 8px',
    borderRadius: '6px'
  },
  actionSmallBtn: {
    fontSize: '10px',
    fontWeight: 'bold',
    color: '#cbd5e1',
    backgroundColor: '#1e1b18',
    border: '1px solid #2a2422',
    padding: '4px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  resultBannerOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.82)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: '20px',
  },
  modalBox: {
    backgroundColor: '#161211',
    border: '2px solid',
    padding: '20px',
    borderRadius: '16px',
    textAlign: 'center',
    maxWidth: '340px',
    width: '100%',
  },
  statsRow: { display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '10px' },
  statPill: { backgroundColor: '#1f1a18', padding: '6px 10px', borderRadius: '8px', display: 'flex', flexDirection: 'column', flex: 1 },
  replayBtn: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#dc2626',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '12px',
    marginTop: '8px'
  },
  commenceBtn: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#dc2626',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
  }
};

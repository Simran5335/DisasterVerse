import React, { useState } from 'react';
import { MATERIAL_SPECS, GEM_SPECS } from '../../../data/quakecraftData';

const GRID_COLS = 8;
const GRID_ROWS = 8;

// Material Densities for Rigid Body Mass Calculation
const MATERIAL_DENSITIES = {
  weak_base: 1.5,
  normal_base: 2.8,
  strong_base: 4.2,
  wood_pillar: 1.2,
  concrete_pillar: 3.2,
  steel_pillar: 4.5,
  brick_wall: 2.4,
  concrete_wall: 3.5,
  steel_wall: 4.8,
  flat_roof: 2.0,
  sloped_roof: 2.5,
  heavy_roof: 4.0
};

// Structural Joint Breaking Thresholds (Newtons)
const JOINT_THRESHOLDS = {
  Foundation: 1800,
  Columns: 1200,
  Walls: 900,
  Roof: 600
};

// Closed Solid 6-Faced 3D Voxel Cube Component with Base Pivot, Multi-Axis Sway, High-Freq Vibration Buzz & Noise-Driven P-Wave Jolt
function VoxelCube3D({ block, bHeight, isFailedArea, isSimulating, swayAngle = 0, swayAngleZ = 0, vibrationAngle = 0, shakeDecayFactor = 1, magnitude = 6.5 }) {
  const cubeHeight = 36; // Equal X x Y x Z chunky cube dimensions

  // Progressive Sway Multipliers: Foundation (1.0x), Pillars (1.4x), Walls (1.8x), Roof (2.4x)
  let categoryMultiplier = 1.0;
  if (block.category === 'Columns') categoryMultiplier = 1.4;
  else if (block.category === 'Walls') categoryMultiplier = 1.8;
  else if (block.category === 'Roof') categoryMultiplier = 2.4;

  const density = MATERIAL_DENSITIES[block.key] || 2.5;
  const heightFactor = (1 + bHeight * 0.35) * categoryMultiplier;
  const inertialForce = density * (magnitude * 1.5) * heightFactor;
  const jointLimit = JOINT_THRESHOLDS[block.category] || 1000;
  const isJointBroken = isSimulating && isFailedArea && (inertialForce > jointLimit / 300);

  // 1. Primary Sway (X) & Perpendicular Sway (Y) displacement scaled by height factor
  const primarySwayX = isSimulating ? swayAngle * 0.85 * heightFactor : 0;
  const secondarySwayY = isSimulating ? swayAngleZ * 0.85 * heightFactor : 0;
  
  // 2. High-Frequency Vibration Buzz (adds trembling tremor on top of slow sway)
  const highFreqRotZ = isSimulating ? (vibrationAngle * 2.5) : 0;

  // 3. Noise-Driven Vertical P-Wave Jolt for Magnitude >= 7.0
  const pWaveVerticalJolt = (isSimulating && magnitude >= 7.0) ? (magnitude - 6) * 3.0 * (Math.sin(swayAngle * 0.2) + Math.cos(swayAngleZ * 0.3) * 0.3) * shakeDecayFactor : 0;

  const roofTiltAngle = (isSimulating && block.category === 'Roof') ? Math.sin(swayAngle * 0.15) * 8 * shakeDecayFactor : 0;
  
  // Real Gravity Drop on Joint Break (Gravity acceleration onto static ground platform)
  const gravityDropOffset = isJointBroken ? (bHeight + 1) * -34 : 0;

  const topColor = block.topColor || '#b8b8b2';
  const sideColor = block.sideColor || '#787872';
  const mainColor = (isFailedArea || isJointBroken) ? '#f87171' : (block.color || '#9a9a94');

  const getCategoryIcon = (category) => {
    if (category === 'Foundation') return '🏗️';
    if (category === 'Columns') return '🪵';
    if (category === 'Walls') return '🧱';
    if (category === 'Roof') return '🏠';
    return '🧱';
  };

  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        transformOrigin: 'bottom center', // PIVOT FROM THE BASE OF THE BLOCK/FOUNDATION!
        transform: `translateZ(${((bHeight + 1) * cubeHeight) + gravityDropOffset + pWaveVerticalJolt}px) translateX(${primarySwayX}px) translateY(${secondarySwayY}px) rotateZ(${(isJointBroken ? swayAngle * 2.5 : swayAngle * 0.6) + highFreqRotZ + roofTiltAngle}deg)`,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.04s ease-out',
        boxShadow: (isFailedArea || isJointBroken) ? '0 0 22px #ef4444' : '0 12px 24px rgba(0,0,0,0.7)'
      }}
    >
      {/* 1. TOP FACE (Bright top surface) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: topColor,
          border: '1px solid rgba(255,255,255,0.4)',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '13px',
          fontWeight: 900,
          color: '#fff',
          transform: `translateZ(${cubeHeight}px)`,
          boxShadow: 'inset 0 0 10px rgba(255,255,255,0.2)'
        }}
      >
        {getCategoryIcon(block.category)}
      </div>

      {/* 2. BOTTOM FACE (Dark ground surface) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: '#1e293b',
          border: '1px solid rgba(0,0,0,0.5)',
          transform: 'translateZ(0px)',
          borderRadius: '4px'
        }}
      />

      {/* 3. FRONT FACE (Main voxel face) */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: `${cubeHeight}px`,
          background: mainColor,
          border: '1px solid rgba(0,0,0,0.3)',
          transformOrigin: 'bottom center',
          transform: 'rotateX(-90deg)',
          borderRadius: '2px'
        }}
      />

      {/* 4. BACK FACE (Back shadow face) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: `${cubeHeight}px`,
          background: sideColor,
          border: '1px solid rgba(0,0,0,0.4)',
          transformOrigin: 'top center',
          transform: 'rotateX(90deg)',
          borderRadius: '2px'
        }}
      />

      {/* 5. LEFT FACE (Left side depth face) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${cubeHeight}px`,
          height: '100%',
          background: sideColor,
          border: '1px solid rgba(0,0,0,0.4)',
          transformOrigin: 'left center',
          transform: 'rotateY(-90deg)',
          borderRadius: '2px'
        }}
      />

      {/* 6. RIGHT FACE (Right side depth face) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: `${cubeHeight}px`,
          height: '100%',
          background: sideColor,
          border: '1px solid rgba(0,0,0,0.4)',
          transformOrigin: 'right center',
          transform: 'rotateY(90deg)',
          borderRadius: '2px'
        }}
      />
    </div>
  );
}

export default function QuakeCraftWorld({
  activeMaterialKey,
  columns,
  setColumns,
  foundGemsCount,
  onDiscoverGem,
  magnitude,
  isSimulating,
  swayAngle = 0,
  swayAngleZ = 0,
  vibrationAngle = 0,
  shakeDecayFactor = 1,
  failedHighlightArea,
  failedBlocks = [],
  resilienceScore,
  mode
}) {
  const [rotationAngle, setRotationAngle] = useState(45);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredCol, setHoveredCol] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);

  // Hidden plot gems
  const [plotGems, setPlotGems] = useState(() => [
    { col: 1, row: 2, type: 'quartz', found: false },
    { col: 6, row: 1, type: 'emerald', found: false },
    { col: 3, row: 6, type: 'sapphire', found: false },
    { col: 5, row: 7, type: 'amethyst', found: false }
  ]);

  const [particles, setParticles] = useState([]);
  const [gemNotification, setGemNotification] = useState(null);

  const spawnParticles = (x, y, color = '#06b6d4') => {
    const newP = Array.from({ length: 12 }, (_, i) => ({
      id: `${Date.now()}-${i}`,
      x: x + (Math.random() - 0.5) * 40,
      y: y + (Math.random() - 0.5) * 40,
      dx: (Math.random() - 0.5) * 60,
      dy: -30 - Math.random() * 40,
      color,
      opacity: 1
    }));
    setParticles(prev => [...prev, ...newP]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newP.find(np => np.id === p.id)));
    }, 700);
  };

  const handleCellClick = (colIdx, rowIdx) => {
    if (isSimulating) return;

    // Gem discovery
    const gemMatch = plotGems.find(g => g.col === colIdx && g.row === rowIdx && !g.found);
    if (gemMatch && Math.random() < 0.8) {
      setPlotGems(prev => prev.map(g => g === gemMatch ? { ...g, found: true } : g));
      const gemSpec = GEM_SPECS[gemMatch.type];
      spawnParticles((colIdx - 3.5) * 48, -(rowIdx * 32), gemSpec.color);
      
      setGemNotification({
        name: gemSpec.name,
        icon: gemSpec.icon,
        sellValue: gemSpec.sellValue
      });
      setTimeout(() => setGemNotification(null), 3000);
      onDiscoverGem && onDiscoverGem(gemMatch.type);
    }

    // Block Placement Logic
    const colBlocks = columns[colIdx] || [];
    if (activeMaterialKey === 'delete') {
      if (colBlocks.length > 0) {
        setColumns(prev => prev.map((c, i) => i === colIdx ? c.slice(0, -1) : c));
      }
    } else if (colBlocks.length < 8) {
      const spec = MATERIAL_SPECS[activeMaterialKey] || MATERIAL_SPECS['normal_base'];
      if (!spec) return;

      const newBlock = {
        id: `${Date.now()}-${Math.random()}`,
        key: activeMaterialKey,
        ...spec
      };

      spawnParticles((colIdx - 3.5) * 48, -(colBlocks.length * 32), spec.color);
      setColumns(prev => prev.map((c, i) => i === colIdx ? [...c, newBlock] : c));
    }
  };

  const getCategoryIcon = (category) => {
    if (category === 'Foundation') return '🏗️';
    if (category === 'Columns') return '🪵';
    if (category === 'Walls') return '🧱';
    if (category === 'Roof') return '🏠';
    return '🧱';
  };

  // Subtle Camera Vibration Offset during peak earthquake shaking (Decoupled from base pivot)
  const cameraShakeOffset = isSimulating ? Math.sin(swayAngle * 0.15) * (magnitude * 0.3) * shakeDecayFactor : 0;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#0a0e1a', overflow: 'hidden' }}>
      
      {/* FLOATING VIEW CONTROLS BOTTOM-RIGHT (PILL BUTTONS) */}
      <div style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 30, display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setRotationAngle(prev => (prev - 45 + 360) % 360)}
          style={{ background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', padding: '10px 18px', borderRadius: '30px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          🔄 Rotate View
        </button>
        <button
          onClick={() => setZoomLevel(prev => Math.min(1.6, prev + 0.15))}
          style={{ background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', padding: '10px 16px', borderRadius: '30px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          🔍 Zoom In
        </button>
        <button
          onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.15))}
          style={{ background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', padding: '10px 18px', borderRadius: '30px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          🔎 Zoom Out
        </button>
      </div>

      {/* GEM DISCOVERY NOTIFICATION POPUP */}
      {gemNotification && (
        <div style={{
          position: 'absolute',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 40,
          background: 'linear-gradient(135deg, #0284c7 0%, #0f172a 100%)',
          border: '2px solid #38bdf8',
          borderRadius: '20px',
          padding: '12px 24px',
          color: '#fff',
          boxShadow: '0 10px 30px rgba(56, 189, 248, 0.6)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          animation: 'bounce 0.5s ease'
        }}>
          <span style={{ fontSize: '32px' }}>{gemNotification.icon}</span>
          <div>
            <strong style={{ fontSize: '16px', color: '#38bdf8', display: 'block' }}>💎 GEM DISCOVERED!</strong>
            <span style={{ fontSize: '12px', color: '#e2e8f0' }}>{gemNotification.name} (+{gemNotification.sellValue}🪙 Coins)</span>
          </div>
        </div>
      )}

      {/* STATIC GROUND PLATFORM CONTAINER (PLATFORM NEVER MOVES!) WITH SUBTLE CAMERA SHAKE */}
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `translate(${cameraShakeOffset}px, ${cameraShakeOffset * 0.5}px) scale(${zoomLevel})`,
        transition: 'transform 0.04s ease-out'
      }}>
        <div style={{
          position: 'relative',
          width: '560px',
          height: '420px',
          transform: `rotateX(55deg) rotateZ(${rotationAngle}deg)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}>

          {/* 8x8 GROUND PLOT MATRIX (STATIC GROUND BASE) */}
          <div style={{
            width: '100%',
            height: '100%',
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
            gap: '4px',
            background: '#15803d',
            padding: '10px',
            borderRadius: '16px',
            border: '4px solid #166534',
            boxShadow: '0 25px 50px rgba(0,0,0,0.85)',
            transformStyle: 'preserve-3d'
          }}>
            {Array.from({ length: GRID_ROWS }).map((_, rIdx) =>
              Array.from({ length: GRID_COLS }).map((_, cIdx) => {
                const isHovered = hoveredCol === cIdx && hoveredRow === rIdx;
                const blocksInCol = columns[cIdx] || [];
                const topBlock = blocksInCol[blocksInCol.length - 1];
                const isFailedArea = failedHighlightArea && (
                  (failedHighlightArea === 'foundation' && rIdx === 7) ||
                  (failedHighlightArea === 'columns' && cIdx === 3) ||
                  (failedHighlightArea === 'unbalanced' && (cIdx === 0 || cIdx === 7))
                );

                // Material tile fill color
                let tileColor = (cIdx + rIdx) % 2 === 0 ? '#16a34a' : '#15803d';
                if (topBlock) {
                  if (topBlock.category === 'Foundation') {
                    tileColor = topBlock.key === 'weak_base' ? '#8a7a5c' : topBlock.key === 'strong_base' ? '#5c6670' : '#9a9a94';
                  } else if (topBlock.category === 'Columns') {
                    tileColor = topBlock.key === 'wood_pillar' ? '#a5713a' : topBlock.key === 'steel_pillar' ? '#dc2626' : '#8f8f88';
                  } else if (topBlock.category === 'Walls') {
                    tileColor = topBlock.key === 'brick_wall' ? '#a4462c' : topBlock.key === 'steel_wall' ? '#6b7f94' : '#b5b5ae';
                  } else if (topBlock.category === 'Roof') {
                    tileColor = topBlock.key === 'sloped_roof' ? '#b0553f' : topBlock.key === 'heavy_roof' ? '#434b53' : '#c9863f';
                  }
                }

                return (
                  <div
                    key={`${cIdx}-${rIdx}`}
                    onMouseEnter={() => { setHoveredCol(cIdx); setHoveredRow(rIdx); }}
                    onMouseLeave={() => { setHoveredCol(null); setHoveredRow(null); }}
                    onClick={() => handleCellClick(cIdx, rIdx)}
                    style={{
                      position: 'relative',
                      background: isFailedArea ? '#ef4444' : isHovered ? '#38bdf8' : tileColor,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isFailedArea ? '0 0 20px #ef4444' : isHovered ? '0 0 12px #38bdf8' : 'none',
                      transition: 'all 0.15s ease',
                      transformStyle: 'preserve-3d'
                    }}
                  >
                    {/* Render Stacked Closed Solid 6-Faced 3D Voxel Cubes with Base Pivot & 3-Layered Motion */}
                    {blocksInCol.map((b, bHeight) => (
                      <VoxelCube3D
                        key={b.id || bHeight}
                        block={b}
                        bHeight={bHeight}
                        isFailedArea={isFailedArea}
                        isSimulating={isSimulating}
                        swayAngle={swayAngle}
                        swayAngleZ={swayAngleZ}
                        vibrationAngle={vibrationAngle}
                        shakeDecayFactor={shakeDecayFactor}
                        magnitude={magnitude}
                      />
                    ))}

                    {/* Translucent Hover Preview Block */}
                    {isHovered && activeMaterialKey !== 'delete' && (
                      <div style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        background: 'rgba(56, 189, 248, 0.45)',
                        border: '2px solid #38bdf8',
                        borderRadius: '4px',
                        transform: `translateZ(${(blocksInCol.length + 1) * 36}px)`,
                        pointerEvents: 'none'
                      }} />
                    )}

                    {/* Material Icon Badge */}
                    {topBlock && (
                      <div style={{ position: 'absolute', bottom: '2px', right: '2px', fontSize: '11px', background: 'rgba(0,0,0,0.7)', color: '#fff', borderRadius: '4px', padding: '1px 4px' }}>
                        {getCategoryIcon(topBlock.category)}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

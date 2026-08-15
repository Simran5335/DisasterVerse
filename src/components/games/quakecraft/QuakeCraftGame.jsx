import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MATERIAL_SPECS,
  GEM_SPECS,
  EMERGENCY_KIT_ITEMS,
  EARTHQUAKE_QUIZ,
  BADGE_SPECS
} from '../../../data/quakecraftData';
import { loadSaveData } from '../../../utils/quakecraftSave';
import QuakeCraftWorld from './QuakeCraftWorld';

export default function QuakeCraftGame() {
  const navigate = useNavigate();

  // Saved Player State
  const [playerData, setPlayerData] = useState(() => loadSaveData());

  // Top Navigation Screen
  const [activeScreen, setActiveScreen] = useState('MAIN'); // 'MAIN' | 'KIT' | 'QUIZ' | 'BADGES'

  // Selected Active Material
  const [activeMaterialKey, setActiveMaterialKey] = useState('normal_base');

  // Earthquake Magnitude Control (1.0 to 10.0, default 6.5)
  const [magnitude, setMagnitude] = useState(6.5);

  // 3D Grid Columns (8 Columns)
  const [columns, setColumns] = useState(() => Array.from({ length: 8 }, () => []));
  const savedBackupColumnsRef = useRef(null); // Backup of last-built layout for quick reset

  // Gems & Survival Progression Tracker
  const [foundGemsCount, setFoundGemsCount] = useState(0);
  const [survivedQuakesCount, setSurvivedQuakesCount] = useState(0);

  // Simulation State & Layered Shake Vectors
  const [isSimulating, setIsSimulating] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [swayAngle, setSwayAngle] = useState(0); // Primary X axis sway
  const [swayAngleZ, setSwayAngleZ] = useState(0); // Perpendicular Z axis sway
  const [vibrationAngle, setVibrationAngle] = useState(0); // High-frequency buzz
  const [shakeDecayFactor, setShakeDecayFactor] = useState(1);
  const [failedHighlightArea, setFailedHighlightArea] = useState(null);
  const [evalResultModal, setEvalResultModal] = useState(null);
  const [liveTestStatus, setLiveTestStatus] = useState(null); // null | 'SHAKING' | 'HELD' | 'COLLAPSED'
  const [shakeDebugInfo, setShakeDebugInfo] = useState(null); // Live computed debug values

  // Mascot Speech State
  const [mascotMessage, setMascotMessage] = useState("🏗️ Select 3D materials from the toolbar and build your structure on the plot!");

  // Compute Live Stats: Total Blocks, Height, Foundation, Column, Wall, Roof Counts & Resilience %
  const stats = useMemo(() => {
    let totalBlocks = 0;
    let maxLevel = 0;
    let foundationCount = 0;
    let pillarCount = 0;
    let wallCount = 0;
    let roofCount = 0;
    let totalStrength = 0;
    let leftCount = 0;
    let rightCount = 0;

    columns.forEach((col, cIdx) => {
      if (col.length > maxLevel) maxLevel = col.length;
      col.forEach(block => {
        totalBlocks++;
        totalStrength += (block.strength || 40);
        if (cIdx < 4) leftCount++;
        else rightCount++;

        if (block.category === 'Foundation') foundationCount++;
        else if (block.category === 'Columns') pillarCount++;
        else if (block.category === 'Walls') wallCount++;
        else if (block.category === 'Roof') roofCount++;
      });
    });

    // Compute Deterministic Resilience %
    let resilience = 15;
    if (totalBlocks > 0) {
      const avgStrength = totalStrength / totalBlocks;
      const foundationFactor = Math.min(1, foundationCount / 3);
      const balancePenalty = Math.abs(leftCount - rightCount) > 3 ? 15 : 0;
      resilience = Math.round(avgStrength * 0.6 + foundationFactor * 30 + (pillarCount > 0 ? 10 : 0) - balancePenalty);
    }

    return {
      totalBlocks,
      buildLevel: Math.max(1, maxLevel),
      foundationCount,
      pillarCount,
      wallCount,
      roofCount,
      leftCount,
      rightCount,
      resilience: Math.max(5, Math.min(99, resilience))
    };
  }, [columns]);

  // Section Lock Logic in Build Order
  const isPillarsUnlocked = stats.foundationCount >= 1;
  const isWallsUnlocked = stats.pillarCount >= 1;
  const isRoofUnlocked = stats.wallCount >= 1;

  // Swatch colors by material
  const getSwatchColor = (key, mat) => {
    if (key === 'weak_base') return '#8a7a5c';
    if (key === 'normal_base') return '#9a9a94';
    if (key === 'strong_base') return '#5c6670';
    if (key === 'wood_pillar') return '#a5713a';
    if (key === 'concrete_pillar') return '#8f8f88';
    if (key === 'steel_pillar') return '#dc2626';
    if (key === 'brick_wall') return '#a4462c';
    if (key === 'concrete_wall') return '#b5b5ae';
    if (key === 'steel_wall') return '#6b7f94';
    if (key === 'sloped_roof') return '#b0553f';
    if (key === 'heavy_roof') return '#434b53';
    return mat.color || '#0284c7';
  };

  // Resilience Color Coding: Red < 40%, Yellow 40-70%, Green > 70%
  const getResilienceColor = (score) => {
    if (score < 40) return '#ef4444'; // Red
    if (score <= 70) return '#fbbf24'; // Yellow
    return '#34d399'; // Green
  };

  // Discover Gem Callback
  const handleDiscoverGem = (type) => {
    setFoundGemsCount(prev => prev + 1);
    setMascotMessage("✨ AMAZING! You discovered a hidden gem! Sell it for extra building resources!");
    setPlayerData(prev => ({
      ...prev,
      gems: { ...prev.gems, [type]: (prev.gems[type] || 0) + 1 },
      xp: prev.xp + 50,
      coins: prev.coins + 100
    }));
  };

  // Authoritative Structural Evaluation Function
  const evaluateStructure = () => {
    if (stats.totalBlocks < 3) {
      return {
        passed: false,
        reasonTitle: "NO STRUCTURE FOUND",
        reasonDesc: "You must place at least 3 structural blocks (foundation and pillars) to test the structure.",
        highlightArea: "foundation"
      };
    }

    if (stats.foundationCount < 1) {
      return {
        passed: false,
        reasonTitle: "WEAK FOUNDATION BASE",
        reasonDesc: "The structure lacks a foundational base pad on the ground, causing immediate buckling.",
        highlightArea: "foundation"
      };
    }

    // Explicit Survival Threshold Formula: survivalThreshold = resiliencePercent / 10
    const survivalThreshold = stats.resilience / 10;
    const marginRoll = (Math.random() - 0.5) * 0.6; // +/- 0.3 magnitude variance
    const structureFails = magnitude > (survivalThreshold + marginRoll);

    if (structureFails) {
      let reasonTitle = "STRUCTURE FAILED";
      let reasonDesc = "";
      let highlightArea = "columns";

      if (stats.buildLevel >= 5 && stats.foundationCount <= 2) {
        reasonTitle = "STRUCTURE TOO TALL";
        reasonDesc = "Structure too tall for its foundation width — top-heavy and prone to toppling.";
        highlightArea = "foundation";
      } else if (Math.abs(stats.leftCount - stats.rightCount) > 3) {
        reasonTitle = "UNBALANCED WEIGHT DISTRIBUTION";
        reasonDesc = "Unbalanced weight distribution — too much mass concentrated on one side.";
        highlightArea = "unbalanced";
      } else if (stats.foundationCount < 2 || stats.pillarCount < 2) {
        reasonTitle = "MATERIALS TOO WEAK";
        reasonDesc = "Materials too weak for this magnitude — upgrade foundation or column material.";
        highlightArea = "columns";
      } else {
        reasonTitle = "MAGNITUDE THRESHOLD EXCEEDED";
        reasonDesc = `Seismic Magnitude ${magnitude} exceeded this structure's maximum survivable threshold (${stats.resilience}% resilience allows up to M${survivalThreshold.toFixed(1)}).`;
        highlightArea = "columns";
      }

      return {
        passed: false,
        reasonTitle,
        reasonDesc,
        highlightArea
      };
    }

    return {
      passed: true,
      reasonTitle: "EXCELLENT SEISMIC RESILIENCE!",
      reasonDesc: `Strong material choices, solid foundation base, and balanced weight distribution kept the structure stable during Magnitude ${magnitude} shaking.`,
      highlightArea: null
    };
  };

  // Reset Structure Layout from Backup
  const handleResetStructure = () => {
    if (savedBackupColumnsRef.current) {
      setColumns(JSON.parse(JSON.stringify(savedBackupColumnsRef.current)));
      setMascotMessage("🔄 Last-built layout restored! Modify your design to improve resilience.");
    }
    setLiveTestStatus(null);
    setFailedHighlightArea(null);
    setEvalResultModal(null);
    setShakeDebugInfo(null);
  };

  // Random Build Generator (Fair, valid structure using unlocked materials)
  const handleRandomBuild = () => {
    if (isSimulating || countdown !== null) return;

    const foundations = ['weak_base', 'normal_base', 'strong_base'];
    const pillars = ['wood_pillar', 'concrete_pillar', 'steel_pillar'];
    const walls = ['brick_wall', 'concrete_wall', 'steel_wall'];
    const roofs = ['flat_roof', 'sloped_roof', 'heavy_roof'];

    // Choose footprint: 4 to 8 active column positions
    const numCols = Math.floor(Math.random() * 5) + 4; // 4..8
    const startCol = Math.floor(Math.random() * (9 - numCols));
    const activeCols = [];
    for (let i = 0; i < numCols; i++) {
      activeCols.push(startCol + i);
    }

    // Choose height: 3 to 6 layers
    const height = Math.floor(Math.random() * 4) + 3;

    // Pick materials for this randomized design
    const fKey = foundations[Math.floor(Math.random() * foundations.length)];
    const pKey = pillars[Math.floor(Math.random() * pillars.length)];
    const wKey = walls[Math.floor(Math.random() * walls.length)];
    const rKey = roofs[Math.floor(Math.random() * roofs.length)];

    const fSpec = MATERIAL_SPECS[fKey];
    const pSpec = MATERIAL_SPECS[pKey];
    const wSpec = MATERIAL_SPECS[wKey];
    const rSpec = MATERIAL_SPECS[rKey];

    const newColumns = Array.from({ length: 8 }, () => []);

    activeCols.forEach((cIdx) => {
      // Level Z=0: Foundation Block
      newColumns[cIdx].push({
        id: `rnd-f-${cIdx}-0-${Date.now()}-${Math.random()}`,
        key: fKey,
        name: fSpec.name,
        strength: fSpec.strength,
        category: fSpec.category,
        color: getSwatchColor(fKey, fSpec),
        topColor: fSpec.topColor,
        sideColor: fSpec.sideColor
      });

      // Levels Z=1..height-2: Pillars or Walls
      for (let z = 1; z < height - 1; z++) {
        const useWall = (cIdx === activeCols[0] || cIdx === activeCols[activeCols.length - 1]) ? (Math.random() > 0.5) : (Math.random() > 0.3);
        const matKey = useWall ? wKey : pKey;
        const spec = useWall ? wSpec : pSpec;

        newColumns[cIdx].push({
          id: `rnd-${cIdx}-${z}-${Date.now()}-${Math.random()}`,
          key: matKey,
          name: spec.name,
          strength: spec.strength,
          category: spec.category,
          color: getSwatchColor(matKey, spec),
          topColor: spec.topColor,
          sideColor: spec.sideColor
        });
      }

      // Top Level Z=height-1: Roof Deck
      if (height > 1) {
        newColumns[cIdx].push({
          id: `rnd-r-${cIdx}-${height - 1}-${Date.now()}-${Math.random()}`,
          key: rKey,
          name: rSpec.name,
          strength: rSpec.strength,
          category: rSpec.category,
          color: getSwatchColor(rKey, rSpec),
          topColor: rSpec.topColor,
          sideColor: rSpec.sideColor
        });
      }
    });

    setColumns(newColumns);
    savedBackupColumnsRef.current = JSON.parse(JSON.stringify(newColumns));
    setLiveTestStatus(null);
    setFailedHighlightArea(null);
    setEvalResultModal(null);
    setShakeDebugInfo(null);
    setMascotMessage("🎲 Random valid structure generated! Test its seismic resilience or modify it manually.");
  };

  // Random Magnitude Generator (Selects random magnitude between 1.0 and 10.0)
  const handleRandomMagnitude = () => {
    if (isSimulating || countdown !== null) return;
    const rndMag = Math.round((Math.random() * 9 + 1) * 10) / 10;
    setMagnitude(rndMag);
    setMascotMessage(`⚡ Seismic magnitude randomly set to Magnitude ${rndMag}!`);
  };

  // Earthquake Test with Countdown & 3-Layered Motion Frame Animation Engine
  const handleStartEarthquake = () => {
    if (isSimulating || countdown !== null) return;

    savedBackupColumnsRef.current = JSON.parse(JSON.stringify(columns));

    const evaluation = evaluateStructure();
    setFailedHighlightArea(evaluation.highlightArea);
    setLiveTestStatus('SHAKING');

    setMascotMessage(`⚠️ EARTHQUAKE MAGNITUDE ${magnitude} INCOMING! Hold on tight!`);
    setCountdown(3);

    const countInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countInterval);
          startActualShaking(evaluation);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startActualShaking = (evaluation) => {
    setIsSimulating(true);

    // 1. Exponential Amplitude Formula: amplitude_degrees = baseAmp * (mag/10)^1.6 * 40
    const amplitudeDegrees = 1.0 * Math.pow(magnitude / 10, 1.6) * 40;
    
    // 2. Inverse Resilience Multiplier: finalAmplitude = amplitude_degrees * (1.4 - resilience/100)
    const finalAmplitude = amplitudeDegrees * (1.4 - stats.resilience / 100);

    // 3. Frequency Scaling: frequency = 1.5 + (magnitude / 10) * 4.0
    const frequency = 1.5 + (magnitude / 10) * 4.0;

    // 4. Damping Rate Scaling: dampingRate = 0.15 + (10 - magnitude) * 0.03
    const dampingRate = 0.15 + (10 - magnitude) * 0.03;

    setShakeDebugInfo({
      amplitude: finalAmplitude.toFixed(1),
      frequency: frequency.toFixed(1),
      damping: dampingRate.toFixed(2)
    });

    const startTime = performance.now();
    const shakeDurationMs = magnitude >= 7 ? 6500 : magnitude >= 4 ? 4500 : 3000;

    let animFrameId = null;

    const animateFrame = (now) => {
      const elapsedSec = (now - startTime) / 1000;
      if (elapsedSec * 1000 >= shakeDurationMs) {
        setSwayAngle(0);
        setSwayAngleZ(0);
        setVibrationAngle(0);
        setShakeDecayFactor(0);
        setIsSimulating(false);

        if (evaluation.passed) {
          setLiveTestStatus('HELD');
          const nextCount = survivedQuakesCount + 1;
          setSurvivedQuakesCount(nextCount);
          setMascotMessage("🎉 WE DID IT! Structure survived the earthquake!");

          setEvalResultModal({
            passed: true,
            title: "🎉 STRUCTURE SURVIVED!",
            score: stats.resilience,
            magnitude,
            reasonTitle: evaluation.reasonTitle,
            reasonDesc: evaluation.reasonDesc,
            resourcesEarned: 500,
            xpEarned: 300
          });

          setPlayerData(prev => ({
            ...prev,
            coins: prev.coins + 500,
            xp: prev.xp + 300
          }));
        } else {
          setLiveTestStatus('COLLAPSED');
          setMascotMessage("💥 Oh no! The structure collapsed! Let's inspect why!");
          
          setEvalResultModal({
            passed: false,
            title: "💥 STRUCTURE FAILED",
            score: stats.resilience,
            magnitude,
            reasonTitle: evaluation.reasonTitle,
            reasonDesc: evaluation.reasonDesc,
            resourcesEarned: 0,
            xpEarned: 0
          });
        }
        return;
      }

      // 3-LAYERED EARTHQUAKE MOTION FORMULAS:
      const decay = Math.exp(-elapsedSec * dampingRate);
      setShakeDecayFactor(decay);

      // Signal 1: Primary Sway (large, slow)
      const primarySway = Math.sin(elapsedSec * frequency * Math.PI * 2) * finalAmplitude * decay;

      // Signal 2: High-Frequency Vibration (small, fast tight buzz, 6x frequency)
      const highFreqVib = Math.sin(elapsedSec * frequency * 6 * Math.PI * 2) * (finalAmplitude * 0.08) * decay;

      // Signal 3: Smoothed Random Noise Perturbation (breaks mechanical regularity)
      const noisePerturbation = (Math.sin(elapsedSec * 17.3) + Math.cos(elapsedSec * 11.7)) * 0.5 * (finalAmplitude * 0.12) * decay;

      // Sum for Main Horizontal Axis (X) and Perpendicular Axis (Z)
      const finalX = primarySway + highFreqVib + noisePerturbation;
      const finalZ = (primarySway + noisePerturbation) * 0.3;

      setSwayAngle(finalX);
      setSwayAngleZ(finalZ);
      setVibrationAngle(highFreqVib);

      animFrameId = requestAnimationFrame(animateFrame);
    };

    animFrameId = requestAnimationFrame(animateFrame);
  };

  // Magnitude Badge Readout
  const getMagBadge = () => {
    if (magnitude < 3.5) return { label: `${magnitude} MILD`, bg: '#10b981' };
    if (magnitude < 6.0) return { label: `${magnitude} MODERATE`, bg: '#f59e0b' };
    return { label: `${magnitude} STRONG`, bg: '#ef4444' };
  };

  const magBadge = getMagBadge();
  const activeSpec = MATERIAL_SPECS[activeMaterialKey] || { name: 'Normal Base' };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0e1a', color: '#f8fafc', fontFamily: 'Inter, sans-serif', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* TOP HEADER WITH PERSISTENT TABS */}
      <header style={{
        background: '#0f172a',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '8px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        zIndex: 40
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '24px' }}>🏗️</div>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', color: '#38bdf8', fontWeight: 900 }}>Earthquake Balance Builder</h1>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>DisasterVerse Educational Structure Simulator</span>
          </div>
        </div>

        {/* TOP NAVIGATION TABS */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setActiveScreen('MAIN')}
            style={{
              background: activeScreen === 'MAIN' ? '#0284c7' : '#1e293b',
              color: '#fff',
              border: activeScreen === 'MAIN' ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: activeScreen === 'MAIN' ? '0 0 12px rgba(2, 132, 199, 0.4)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            🧱 3D Block Building Plot
          </button>
          <button
            onClick={() => setActiveScreen('BADGES')}
            style={{
              background: activeScreen === 'BADGES' ? '#0284c7' : '#1e293b',
              color: '#fff',
              border: activeScreen === 'BADGES' ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: activeScreen === 'BADGES' ? '0 0 12px rgba(2, 132, 199, 0.4)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            🏆 Badges & Senior Architect
          </button>
        </div>

        {/* HUD STATS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'rgba(251, 191, 36, 0.15)', border: '1px solid #fbbf24', padding: '6px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 900, color: '#fbbf24' }}>
            💰 {playerData.coins} Coins
          </div>
          <button onClick={() => navigate('/dashboard')} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>
            ← Dashboard
          </button>
        </div>
      </header>

      {/* MAIN TWO-PANEL SPLIT VIEWPORT */}
      <main style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

        {activeScreen === 'MAIN' && (
          <div style={{ width: '100%', height: '100%', display: 'flex' }}>
            
            {/* LEFT SIDEBAR — CONSTRUCTION BLUEPRINT (~320px wide) */}
            <div style={{
              width: '320px',
              background: '#0a0e1a',
              borderRight: '1px solid rgba(255,255,255,0.1)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              zIndex: 20,
              overflowY: 'auto'
            }}>
              
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#38bdf8', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Construction Blueprint
                </h2>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Select material options to update active brush</span>
              </div>

              {/* 1. FOUNDATION SECTION */}
              <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#fbbf24', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>1. Foundation</span>
                  <span style={{ fontSize: '11px', color: '#34d399' }}>✓ Unlocked</span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {['weak_base', 'normal_base', 'strong_base'].map(k => {
                    const mat = MATERIAL_SPECS[k];
                    if (!mat) return null;
                    const isSelected = activeMaterialKey === k;
                    return (
                      <div
                        key={k}
                        onClick={() => !isSimulating && setActiveMaterialKey(k)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          background: isSelected ? 'rgba(56, 189, 248, 0.15)' : '#0f172a',
                          border: isSelected ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                          cursor: isSimulating ? 'not-allowed' : 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: getSwatchColor(k, mat), border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>
                          🏗️
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <strong style={{ color: '#fff', fontSize: '12px', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mat.name}</strong>
                          <span style={{ color: '#94a3b8', fontSize: '10px', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mat.desc}</span>
                        </div>
                        <span style={{ color: '#fbbf24', fontSize: '12px', fontWeight: 900, flexShrink: 0 }}>{mat.cost} 🪙</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. PILLARS SECTION */}
              <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', opacity: isPillarsUnlocked ? 1 : 0.6 }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#fbbf24', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>2. Pillars / Columns</span>
                  <span style={{ fontSize: '11px', color: isPillarsUnlocked ? '#34d399' : '#f87171' }}>
                    {isPillarsUnlocked ? '✓ Unlocked' : '🔒 Locked'}
                  </span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {['wood_pillar', 'concrete_pillar', 'steel_pillar'].map(k => {
                    const mat = MATERIAL_SPECS[k];
                    if (!mat) return null;
                    const isSelected = activeMaterialKey === k;
                    return (
                      <div
                        key={k}
                        onClick={() => !isSimulating && isPillarsUnlocked && setActiveMaterialKey(k)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          background: isSelected ? 'rgba(56, 189, 248, 0.15)' : '#0f172a',
                          border: isSelected ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                          cursor: (isPillarsUnlocked && !isSimulating) ? 'pointer' : 'not-allowed',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: getSwatchColor(k, mat), border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>
                          🪵
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <strong style={{ color: '#fff', fontSize: '12px', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mat.name}</strong>
                          <span style={{ color: '#94a3b8', fontSize: '10px', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mat.desc}</span>
                        </div>
                        <span style={{ color: '#fbbf24', fontSize: '12px', fontWeight: 900, flexShrink: 0 }}>{mat.cost} 🪙</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. WALLS SECTION */}
              <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', opacity: isWallsUnlocked ? 1 : 0.6 }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#fbbf24', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>3. Walls / Panels</span>
                  <span style={{ fontSize: '11px', color: isWallsUnlocked ? '#34d399' : '#f87171' }}>
                    {isWallsUnlocked ? '✓ Unlocked' : '🔒 Locked'}
                  </span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {['brick_wall', 'concrete_wall', 'steel_wall'].map(k => {
                    const mat = MATERIAL_SPECS[k];
                    if (!mat) return null;
                    const isSelected = activeMaterialKey === k;
                    return (
                      <div
                        key={k}
                        onClick={() => !isSimulating && isWallsUnlocked && setActiveMaterialKey(k)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          background: isSelected ? 'rgba(56, 189, 248, 0.15)' : '#0f172a',
                          border: isSelected ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                          cursor: (isWallsUnlocked && !isSimulating) ? 'pointer' : 'not-allowed',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: getSwatchColor(k, mat), border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>
                          🧱
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <strong style={{ color: '#fff', fontSize: '12px', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mat.name}</strong>
                          <span style={{ color: '#94a3b8', fontSize: '10px', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mat.desc}</span>
                        </div>
                        <span style={{ color: '#fbbf24', fontSize: '12px', fontWeight: 900, flexShrink: 0 }}>{mat.cost} 🪙</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. ROOF SECTION */}
              <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', opacity: isRoofUnlocked ? 1 : 0.6 }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#fbbf24', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>4. Roof Deck</span>
                  <span style={{ fontSize: '11px', color: isRoofUnlocked ? '#34d399' : '#f87171' }}>
                    {isRoofUnlocked ? '✓ Unlocked' : '🔒 Locked'}
                  </span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {['flat_roof', 'sloped_roof', 'heavy_roof'].map(k => {
                    const mat = MATERIAL_SPECS[k];
                    if (!mat) return null;
                    const isSelected = activeMaterialKey === k;
                    return (
                      <div
                        key={k}
                        onClick={() => !isSimulating && isRoofUnlocked && setActiveMaterialKey(k)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          background: isSelected ? 'rgba(56, 189, 248, 0.15)' : '#0f172a',
                          border: isSelected ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                          cursor: (isRoofUnlocked && !isSimulating) ? 'pointer' : 'not-allowed',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: getSwatchColor(k, mat), border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>
                          🏠
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <strong style={{ color: '#fff', fontSize: '12px', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mat.name}</strong>
                          <span style={{ color: '#94a3b8', fontSize: '10px', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mat.desc}</span>
                        </div>
                        <span style={{ color: '#fbbf24', fontSize: '12px', fontWeight: 900, flexShrink: 0 }}>{mat.cost} 🪙</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RESET LAYOUT ACTION BUTTON (APPEARS AFTER COLLAPSE) */}
              {savedBackupColumnsRef.current && (
                <button
                  onClick={handleResetStructure}
                  style={{
                    background: '#0284c7',
                    color: '#fff',
                    border: '1px solid #38bdf8',
                    padding: '10px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  🔄 Reset Last-Built Layout
                </button>
              )}

              {/* REMOVE TOOL BUTTON */}
              <button
                onClick={() => !isSimulating && setActiveMaterialKey('delete')}
                disabled={isSimulating}
                style={{
                  background: activeMaterialKey === 'delete' ? '#ef4444' : '#0f172a',
                  color: '#fff',
                  border: activeMaterialKey === 'delete' ? '2px solid #f87171' : '1px solid rgba(255,255,255,0.1)',
                  padding: '10px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: isSimulating ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>❌</span>
                <span>Remove Block Tool</span>
              </button>

              {/* RANDOM BUILD BUTTON */}
              <button
                onClick={handleRandomBuild}
                disabled={isSimulating || countdown !== null}
                style={{
                  background: 'rgba(2, 132, 199, 0.2)',
                  color: '#38bdf8',
                  border: '1px solid #38bdf8',
                  padding: '10px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: (isSimulating || countdown !== null) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>🎲</span>
                <span>RANDOM BUILD</span>
              </button>

              {/* RANDOM MAGNITUDE BUTTON */}
              <button
                onClick={handleRandomMagnitude}
                disabled={isSimulating || countdown !== null}
                style={{
                  background: 'rgba(2, 132, 199, 0.2)',
                  color: '#38bdf8',
                  border: '1px solid #38bdf8',
                  padding: '10px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: (isSimulating || countdown !== null) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>⚡</span>
                <span>RANDOM MAGNITUDE</span>
              </button>

              {/* EARTHQUAKE MAGNITUDE CONTROL SLIDER */}
              <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 800 }}>EARTHQUAKE MAGNITUDE:</span>
                  <span style={{ background: magBadge.bg, color: '#fff', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 900 }}>
                    {magBadge.label}
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="10.0"
                  step="0.1"
                  value={magnitude}
                  disabled={isSimulating || countdown !== null}
                  onChange={e => setMagnitude(parseFloat(e.target.value))}
                  style={{ width: '100%', cursor: isSimulating ? 'not-allowed' : 'pointer', accentColor: magBadge.bg }}
                />
              </div>

              {/* FULL WIDTH CTA BUTTON */}
              <button
                onClick={handleStartEarthquake}
                disabled={isSimulating || countdown !== null}
                style={{
                  marginTop: 'auto',
                  background: (isSimulating || countdown !== null) ? '#475569' : 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '14px',
                  fontSize: '15px',
                  fontWeight: 900,
                  cursor: (isSimulating || countdown !== null) ? 'not-allowed' : 'pointer',
                  boxShadow: '0 6px 20px rgba(239, 68, 68, 0.45)',
                  letterSpacing: '0.5px'
                }}
              >
                🌍 TEST STRUCTURE (EARTHQUAKE)
              </button>
            </div>

            {/* RIGHT PANEL — STRUCTURE SIMULATOR (3D CANVAS VIEWPORT) */}
            <div style={{ flex: 1, position: 'relative', height: '100%' }}>
              
              {/* TOP STATUS BAR OVERLAY ON CANVAS WITH LIVE STATUS PILL & SHAKE DEBUG READOUT */}
              <div style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                right: '16px',
                zIndex: 30,
                background: 'rgba(15, 23, 42, 0.9)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '16px',
                padding: '10px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>BUILD LEVEL</span>
                    <strong style={{ fontSize: '15px', color: '#38bdf8', fontWeight: 900 }}>{stats.buildLevel} / 8</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>BLOCKS PLACED</span>
                    <strong style={{ fontSize: '15px', color: '#fff', fontWeight: 900 }}>{stats.totalBlocks} Blocks</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>RESILIENCE</span>
                    <strong style={{ fontSize: '15px', color: getResilienceColor(stats.resilience), fontWeight: 900 }}>{stats.resilience}%</strong>
                  </div>

                  {/* VISUAL DEBUG READOUT FOR TUNING SHAKE PARAMETERS */}
                  {shakeDebugInfo && (
                    <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '8px', fontSize: '10px', color: '#fbbf24', fontFamily: 'monospace' }}>
                      ⚡ LIVE SHAKE: Amp {shakeDebugInfo.amplitude}° | Freq {shakeDebugInfo.frequency}Hz | Damp {shakeDebugInfo.damping}
                    </div>
                  )}
                </div>

                {/* LIVE STATUS READOUT PILL */}
                <div style={{
                  background: liveTestStatus === 'SHAKING' ? 'rgba(251, 191, 36, 0.2)' : liveTestStatus === 'HELD' ? 'rgba(52, 211, 153, 0.2)' : liveTestStatus === 'COLLAPSED' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(56, 189, 248, 0.15)',
                  border: `1px solid ${liveTestStatus === 'SHAKING' ? '#fbbf24' : liveTestStatus === 'HELD' ? '#34d399' : liveTestStatus === 'COLLAPSED' ? '#f43f5e' : '#38bdf8'}`,
                  padding: '6px 14px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 900,
                  color: liveTestStatus === 'SHAKING' ? '#fbbf24' : liveTestStatus === 'HELD' ? '#34d399' : liveTestStatus === 'COLLAPSED' ? '#f43f5e' : '#38bdf8'
                }}>
                  {liveTestStatus === 'SHAKING' ? `⚡ SHAKING... M${magnitude}` : liveTestStatus === 'HELD' ? '✓ STRUCTURE HELD' : liveTestStatus === 'COLLAPSED' ? '💥 STRUCTURE COLLAPSED' : `BRUSH: ${activeMaterialKey === 'delete' ? 'REMOVE TOOL' : activeSpec.name.toUpperCase()}`}
                </div>
              </div>

              {/* EARTHQUAKE INCOMING COUNTDOWN OVERLAY */}
              {countdown !== null && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9,13,22,0.85)', zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '24px', color: '#f43f5e', fontWeight: 900 }}>⚠️ EARTHQUAKE INCOMING!</span>
                  <span style={{ fontSize: '96px', color: '#fbbf24', fontWeight: 900, animation: 'bounce 0.6s infinite alternate' }}>{countdown}</span>
                </div>
              )}

              {/* 3D CANVAS WORLD */}
              <QuakeCraftWorld
                activeMaterialKey={activeMaterialKey}
                columns={columns}
                setColumns={setColumns}
                foundGemsCount={foundGemsCount}
                onDiscoverGem={handleDiscoverGem}
                magnitude={magnitude}
                isSimulating={isSimulating}
                swayAngle={swayAngle}
                swayAngleZ={swayAngleZ}
                vibrationAngle={vibrationAngle}
                shakeDecayFactor={shakeDecayFactor}
                failedHighlightArea={failedHighlightArea}
                resilienceScore={stats.resilience}
              />
            </div>
          </div>
        )}
        {activeScreen === 'BADGES' && (
          <div style={{ flex: 1, padding: '30px', overflowY: 'auto', background: '#0a0e1a', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ maxWidth: '840px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '24px', color: '#38bdf8', fontWeight: 900, margin: 0 }}>🏆 Badges & Senior Architect</h2>
                  <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0 0' }}>Track your structural engineering achievements & earthquake survival masteries.</p>
                </div>
                <button
                  onClick={() => setActiveScreen('MAIN')}
                  style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
                >
                  ← Return to Building Plot
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                {BADGE_SPECS.map(badge => {
                  const isUnlocked = badge.id === 'senior_architect' ? survivedQuakesCount >= 3 : true;
                  return (
                    <div key={badge.id} style={{ background: '#0f172a', border: `1px solid ${isUnlocked ? 'rgba(56, 189, 248, 0.3)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '16px', padding: '16px', display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <div style={{ fontSize: '32px', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '12px', flexShrink: 0 }}>{badge.icon}</div>
                      <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '13px', color: isUnlocked ? '#38bdf8' : '#94a3b8', fontWeight: 900 }}>{badge.title}</h3>
                        <p style={{ margin: 0, fontSize: '11px', color: '#cbd5e1', lineHeight: 1.4 }}>{badge.desc}</p>
                        <span style={{ fontSize: '10px', color: isUnlocked ? '#34d399' : '#fbbf24', fontWeight: 800, marginTop: '6px', display: 'inline-block' }}>
                          {isUnlocked ? '✓ UNLOCKED' : `Req: ${badge.requirement}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* EVALUATION RESULT MODAL */}
        {evalResultModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9,13,22,0.92)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: '#0f172a', border: `2px solid ${evalResultModal.passed ? '#34d399' : '#f43f5e'}`, borderRadius: '24px', padding: '30px', maxWidth: '480px', width: '100%', textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.8)' }}>
              <span style={{ fontSize: '56px' }}>{evalResultModal.passed ? '🎉🏆' : '⚠️💥'}</span>
              <h2 style={{ color: evalResultModal.passed ? '#34d399' : '#f43f5e', fontSize: '26px', fontWeight: 900, margin: '10px 0' }}>
                {evalResultModal.title}
              </h2>

              <div style={{ background: '#1e293b', border: `1px solid ${evalResultModal.passed ? '#10b981' : '#f43f5e'}`, padding: '16px', borderRadius: '16px', textAlign: 'left', margin: '16px 0' }}>
                <strong style={{ color: evalResultModal.passed ? '#34d399' : '#f43f5e', fontSize: '14px', display: 'block', marginBottom: '6px' }}>
                  {evalResultModal.reasonTitle}
                </strong>
                <p style={{ color: '#cbd5e1', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
                  {evalResultModal.reasonDesc}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-around', background: '#1e293b', padding: '12px', borderRadius: '12px', color: '#fbbf24', fontWeight: 900, marginBottom: '20px' }}>
                <span>💰 +{evalResultModal.resourcesEarned} Resources</span>
                <span>⭐ +{evalResultModal.xpEarned} XP</span>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                {!evalResultModal.passed && savedBackupColumnsRef.current && (
                  <button
                    onClick={handleResetStructure}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: '#0284c7',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '14px',
                      fontSize: '14px',
                      fontWeight: 900,
                      cursor: 'pointer'
                    }}
                  >
                    🔄 Reset Layout
                  </button>
                )}
                <button
                  onClick={() => setEvalResultModal(null)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: evalResultModal.passed ? '#0284c7' : '#ef4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '14px',
                    fontSize: '14px',
                    fontWeight: 900,
                    cursor: 'pointer'
                  }}
                >
                  {evalResultModal.passed ? 'Continue Building →' : 'Modify Design'}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

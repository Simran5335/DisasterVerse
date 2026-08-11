import React, { useState } from 'react';
import GameCanvas from './GameCanvas';

const FOUNDATIONS = [
  { id: 'weak', label: 'Weak', desc: 'Shallow base' },
  { id: 'normal', label: 'Normal', desc: 'Standard concrete' },
  { id: 'strong', label: 'Strong', desc: 'Deep reinforced base' },
];

const PILLARS = [
  { id: 'wood', label: 'Wood', desc: 'Light & flexible' },
  { id: 'concrete', label: 'Concrete', desc: 'Heavy & rigid' },
  { id: 'steel', label: 'Steel', desc: 'Strong & flexible' },
];

const MATERIALS = [
  { id: 'brick', label: 'Brick', desc: 'Classic masonry' },
  { id: 'concrete', label: 'Concrete', desc: 'Solid wall' },
  { id: 'steel', label: 'Steel', desc: 'Modern panels' },
];

const ROOFS = [
  { id: 'flat', label: 'Flat', desc: 'Light & basic' },
  { id: 'sloped', label: 'Sloped', desc: 'Standard tiles' },
  { id: 'heavy', label: 'Heavy', desc: 'Concrete slab' },
];

const MAGNITUDES = [4.5, 5.5, 6.5, 7.5, 8.5];

const getMagnitudeLabel = (m) => {
  if (m === 4.5) return 'LOW';
  if (m === 5.5) return 'MODERATE';
  if (m === 6.5) return 'STRONG';
  if (m === 7.5) return 'SEVERE';
  return 'EXTREME';
};

export default function BuildInterface() {
  const [foundation, setFoundation] = useState(null);
  const [pillars, setPillars] = useState(null);
  const [material, setMaterial] = useState(null);
  const [roof, setRoof] = useState(null);
  const [magnitude, setMagnitude] = useState(6.5);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [rebuildSignal, setRebuildSignal] = useState(0);

  const isReady = foundation && pillars && material && roof && magnitude;

  const calculateLocalResult = (survived) => {
    let score = 0;
    if (foundation === 'strong') score += 30; else if (foundation === 'normal') score += 15; else score += 5;
    if (pillars === 'steel') score += 50; else if (pillars === 'concrete') score += 30; else score += 10;
    if (material === 'steel') score += 20; else if (material === 'concrete') score += 15; else score += 5;
    if (roof === 'sloped') score += 20; else if (roof === 'flat') score += 15; else score += 5;

    if (survived) score += (magnitude >= 7.5 ? 30 : 10);
    else score = Math.floor(score * 0.5);

    const xpEarned = Math.round((score / 150) * 100);

    return {
      survived,
      stabilityScore: score,
      xpEarned,
      explanation: {
        foundation: foundation === 'strong' ? 'Strong foundation secured base.' : 'Base flexibility tested.',
        pillars: pillars === 'steel' ? 'Steel pillars offered lateral stability.' : 'Pillar mass contributed to strain.',
        material: material === 'steel' ? 'Steel structure absorbed shear.' : 'Wall mass absorbed energy.',
        roof: roof === 'sloped' ? 'Sloped roof minimized top-load.' : 'Roof weight affected inertia.',
        magnitude: `Magnitude ${magnitude} seismic wave applied.`,
        overall: survived 
          ? 'The structure withstood the seismic impact successfully!' 
          : 'Structural integrity failed during the earthquake.'
      }
    };
  };

  const handleSimulationComplete = (survived) => {
    setIsSimulating(false);
    const result = calculateLocalResult(survived);
    setSimulationResult(result);
  };

  const handleRandomMagnitude = () => {
    const randomIndex = Math.floor(Math.random() * MAGNITUDES.length);
    setMagnitude(MAGNITUDES[randomIndex]);
    setSimulationResult(null);
    setRebuildSignal(s => s + 1);
  };

  return (
    <div style={styles.container}>
      {/* LEFT COLUMN: Controls */}
      <div style={styles.leftCol}>
        {/* Blueprint Controls */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📐 Construction Blueprint</h2>

          <div style={styles.sectionSpace}>
            {/* Foundation */}
            <div>
              <label style={styles.label}>1. Foundation</label>
              <div style={styles.grid3}>
                {FOUNDATIONS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setFoundation(item.id);
                      setSimulationResult(null);
                      setRebuildSignal(s => s + 1);
                    }}
                    style={{
                      ...styles.btnOption,
                      ...(foundation === item.id ? styles.btnOptionSelected : {})
                    }}
                  >
                    <div style={styles.optTitle}>{item.label}</div>
                    <div style={styles.optDesc}>{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Pillars */}
            <div style={{ marginTop: '16px' }}>
              <label style={styles.label}>2. Pillars</label>
              <div style={styles.grid3}>
                {PILLARS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setPillars(item.id);
                      setSimulationResult(null);
                      setRebuildSignal(s => s + 1);
                    }}
                    style={{
                      ...styles.btnOption,
                      ...(pillars === item.id ? styles.btnOptionSelected : {})
                    }}
                  >
                    <div style={styles.optTitle}>{item.label}</div>
                    <div style={styles.optDesc}>{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Material */}
            <div style={{ marginTop: '16px' }}>
              <label style={styles.label}>3. Walls / Material</label>
              <div style={styles.grid3}>
                {MATERIALS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setMaterial(item.id);
                      setSimulationResult(null);
                      setRebuildSignal(s => s + 1);
                    }}
                    style={{
                      ...styles.btnOption,
                      ...(material === item.id ? styles.btnOptionSelected : {})
                    }}
                  >
                    <div style={styles.optTitle}>{item.label}</div>
                    <div style={styles.optDesc}>{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Roof */}
            <div style={{ marginTop: '16px' }}>
              <label style={styles.label}>4. Roof</label>
              <div style={styles.grid3}>
                {ROOFS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setRoof(item.id);
                      setSimulationResult(null);
                      setRebuildSignal(s => s + 1);
                    }}
                    style={{
                      ...styles.btnOption,
                      ...(roof === item.id ? styles.btnOptionSelected : {})
                    }}
                  >
                    <div style={styles.optTitle}>{item.label}</div>
                    <div style={styles.optDesc}>{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Magnitude Control */}
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
                  setSimulationResult(null);
                  setRebuildSignal(s => s + 1);
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

      {/* RIGHT COLUMN: Simulator Canvas */}
      <div style={styles.rightCol}>
        <div style={styles.simCard}>
          <div style={styles.simHeader}>
            <h3 style={{ margin: 0, fontSize: '14px', letterSpacing: '1px' }}>STRUCTURE SIMULATOR</h3>
            <span style={styles.activePill}>PHYSICS ACTIVE</span>
          </div>

          <div style={styles.canvasArea}>
            <GameCanvas 
              foundation={foundation} 
              pillars={pillars} 
              material={material} 
              roof={roof}
              magnitude={magnitude}
              isSimulating={isSimulating}
              rebuildSignal={rebuildSignal}
              onSimulationComplete={handleSimulationComplete}
            />

            {/* RESULT OVERLAY */}
            {simulationResult !== null && (
              <div style={styles.overlay}>
                <div style={{
                  ...styles.modalBox,
                  borderColor: simulationResult.survived ? '#10b981' : '#ef4444'
                }}>
                  <h3 style={{
                    fontSize: '24px',
                    margin: '0 0 10px 0',
                    color: simulationResult.survived ? '#34d399' : '#f87171'
                  }}>
                    {simulationResult.survived ? "STRUCTURE SURVIVED 🎉" : "STRUCTURE COLLAPSED 💥"}
                  </h3>
                  
                  <div style={styles.statsRow}>
                    <div style={styles.statPill}>
                      <span style={{ fontSize: '11px', color: '#9ca3af' }}>SCORE</span>
                      <strong style={{ fontSize: '18px' }}>{simulationResult.stabilityScore}</strong>
                    </div>
                    <div style={styles.statPill}>
                      <span style={{ fontSize: '11px', color: '#9ca3af' }}>XP EARNED</span>
                      <strong style={{ fontSize: '18px', color: '#fbbf24' }}>+{simulationResult.xpEarned} XP</strong>
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', color: '#d1d5db', margin: '15px 0' }}>
                    {simulationResult.explanation.overall}
                  </p>

                  <button 
                    onClick={() => { 
                      setSimulationResult(null); 
                      setIsSimulating(false); 
                      setRebuildSignal(s => s + 1); 
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

        <button 
          disabled={!isReady || isSimulating}
          onClick={() => setIsSimulating(true)}
          style={{
            ...styles.commenceBtn,
            opacity: (!isReady || isSimulating) ? 0.5 : 1,
            cursor: (!isReady || isSimulating) ? 'not-allowed' : 'pointer'
          }}
        >
          {isSimulating ? "Earthquake in Progress..." : isReady ? "COMMENCE EARTHQUAKE 🌋" : "Select all blueprint parts to begin"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  leftCol: { display: 'flex', flexDirection: 'column', gap: '20px' },
  rightCol: { display: 'flex', flexDirection: 'column', gap: '20px' },
  card: {
    backgroundColor: '#161211',
    border: '1px solid #241e1c',
    padding: '24px',
    borderRadius: '16px',
  },
  cardTitle: { fontSize: '18px', margin: '0 0 16px 0', color: '#fca5a5' },
  sectionSpace: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '11px', fontWeight: 'bold', color: '#06b6d4', textTransform: 'uppercase', marginBottom: '8px', display: 'block' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' },
  btnOption: {
    backgroundColor: '#1f1a18',
    border: '1px solid #2a2422',
    color: '#9ca3af',
    padding: '12px',
    borderRadius: '10px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  btnOptionSelected: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderColor: '#06b6d4',
    color: '#fff',
  },
  optTitle: { fontWeight: 'bold', fontSize: '13px' },
  optDesc: { fontSize: '11px', opacity: 0.7, marginTop: '2px' },
  flexBetween: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  randomBtn: {
    backgroundColor: '#1f1a18',
    border: '1px solid #2a2422',
    color: '#fff',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  magCenter: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  magNumber: { fontSize: '36px', fontWeight: 'bold', color: '#f43f5e', display: 'block' },
  magPill: { fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '10px', backgroundColor: 'rgba(244,63,94,0.15)', color: '#f43f5e' },
  flexBetweenLabels: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9ca3af', marginTop: '4px' },
  simCard: {
    backgroundColor: '#161211',
    border: '1px solid #241e1c',
    borderRadius: '16px',
    overflow: 'hidden',
    height: '480px',
    display: 'flex',
    flexDirection: 'column',
  },
  simHeader: {
    padding: '12px 20px',
    backgroundColor: '#1f1a18',
    borderBottom: '1px solid #2a2422',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activePill: { fontSize: '10px', color: '#06b6d4', fontWeight: 'bold', backgroundColor: 'rgba(6,182,212,0.15)', padding: '2px 8px', borderRadius: '4px' },
  canvasArea: { position: 'relative', flex: 1, backgroundColor: '#0f172a' },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    padding: '20px',
  },
  modalBox: {
    backgroundColor: '#161211',
    border: '2px solid',
    padding: '24px',
    borderRadius: '16px',
    textAlign: 'center',
    maxWidth: '320px',
    width: '100%',
  },
  statsRow: { display: 'flex', gap: '10px', justifyContent: 'center' },
  statPill: { backgroundColor: '#1f1a18', padding: '8px 14px', borderRadius: '8px', display: 'flex', flexDirection: 'column' },
  replayBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#dc2626',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
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

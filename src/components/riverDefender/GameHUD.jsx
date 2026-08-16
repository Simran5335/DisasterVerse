import React from 'react';

const GameHUD = ({
  budget,
  initialBudget,
  weatherStats,
  timerSeconds,
  isPrepPhase,
  prepTimeRemaining,
  scenario,
  isTrainingMode,
  trainingTask,
  onOpenObjectives,
  onOpenSettings,
  onOpenAchievements,
  onStartFloodNow,
  onZoomIn,
  onZoomOut,
  onFocusHospital
}) => {
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={styles.hudContainer}>
      {/* Top Floating Sleek Bar */}
      <div style={styles.topHeaderBar}>
        {/* Brand Logo & Tagline */}
        <div style={styles.brandContainer}>
          <div style={styles.brandTitle}>RIVER DEFENDER</div>
          <div style={styles.brandTagline}>PROTECT. PLAN. PREVAIL.</div>
        </div>

        {/* Stat Counter Pills */}
        <div style={styles.statsGroup}>
          <div style={styles.statPill}>
            <span style={styles.statLabel}>BUDGET</span>
            <div style={styles.statValueRow}>
              <span style={{ color: '#f59e0b', fontSize: '1.1rem' }}>🪙</span>
              <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>₹{budget.toLocaleString()}</span>
              <span style={{ color: '#64748b', fontSize: '0.78rem' }}>/ {initialBudget.toLocaleString()}</span>
            </div>
          </div>

          <div style={styles.statPill}>
            <span style={styles.statLabel}>RIVER LEVEL</span>
            <div style={styles.statValueRow}>
              <span style={{ color: '#38bdf8', fontSize: '1.1rem' }}>🌊</span>
              <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{weatherStats.riverLevelPct}%</span>
            </div>
          </div>

          <div style={styles.statPill}>
            <span style={styles.statLabel}>BUILDINGS SAFE</span>
            <div style={styles.statValueRow}>
              <span style={{ color: '#22c55e', fontSize: '1.1rem' }}>🛡️</span>
              <span style={{ color: '#22c55e', fontWeight: 'bold' }}>82%</span>
            </div>
          </div>

          <div style={styles.statPill}>
            <span style={styles.statLabel}>RAINFALL</span>
            <div style={styles.statValueRow}>
              <span style={{ color: '#60a5fa', fontSize: '1.1rem' }}>🌧️</span>
              <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>{weatherStats.rainfallMm || 180} mm</span>
            </div>
          </div>

          <div style={styles.statPill}>
            <span style={styles.statLabel}>TIME</span>
            <div style={styles.statValueRow}>
              <span style={{ color: '#f59e0b', fontSize: '1.1rem' }}>⏱️</span>
              <span style={{ color: '#f8fafc', fontWeight: 'bold' }}>{formatTime(timerSeconds)}</span>
            </div>
          </div>
        </div>

        {/* Top Right Action Controls */}
        <div style={styles.topRightControls}>
          {isPrepPhase && (
            <button style={styles.startFloodBtn} onClick={onStartFloodNow}>
              🌊 START FLOOD NOW ({prepTimeRemaining}s)
            </button>
          )}
          <button style={styles.iconBtn} title="Pause Simulation">⏸️</button>
          <button style={styles.iconBtn} title="Fast Forward">⏩</button>
          <button style={styles.iconBtn} onClick={onOpenSettings} title="Settings">⚙️</button>
        </div>
      </div>

      {/* Training Task Banner */}
      {isTrainingMode && trainingTask && (
        <div style={styles.trainingBanner}>
          <span style={styles.tTaskTitle}>{trainingTask.title}</span>
          <span style={styles.tTaskDesc}>{trainingTask.instruction}</span>
        </div>
      )}

      {/* Floating Zoom & Camera Controls */}
      <div style={styles.cameraControls}>
        <button style={styles.camBtn} onClick={onZoomIn} title="Zoom In">+</button>
        <button style={styles.camBtn} onClick={onZoomOut} title="Zoom Out">-</button>
        <button style={styles.camBtn} onClick={onFocusHospital} title="Focus Hospital">🏥</button>
        <button style={styles.camBtn} onClick={onOpenObjectives} title="Objectives">🎯</button>
        <button style={styles.camBtn} onClick={onOpenAchievements} title="Achievements">🏆</button>
      </div>
    </div>
  );
};

const styles = {
  hudContainer: {
    position: 'absolute',
    top: 10,
    left: 12,
    right: 12,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    zIndex: 20,
    pointerEvents: 'none'
  },
  topHeaderBar: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'rgba(15, 23, 42, 0.92)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: '8px 20px',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
    pointerEvents: 'auto'
  },
  brandContainer: {
    display: 'flex',
    flexDirection: 'column'
  },
  brandTitle: {
    fontSize: '1.4rem',
    fontWeight: '900',
    background: 'linear-gradient(135deg, #f59e0b, #38bdf8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '1px'
  },
  brandTagline: {
    color: '#64748b',
    fontSize: '0.65rem',
    fontWeight: 'bold',
    letterSpacing: '1.5px'
  },
  statsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 16
  },
  statPill: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'rgba(30, 41, 59, 0.7)',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '4px 14px',
    borderRadius: 12
  },
  statLabel: {
    fontSize: '0.62rem',
    fontWeight: 'bold',
    color: '#94a3b8',
    letterSpacing: '0.8px'
  },
  statValueRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: '0.95rem'
  },
  topRightControls: {
    display: 'flex',
    alignItems: 'center',
    gap: 8
  },
  startFloodBtn: {
    background: 'linear-gradient(135deg, #0284c7, #2563eb)',
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: 10,
    fontWeight: 'bold',
    fontSize: '0.85rem',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(37,99,235,0.4)'
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: 'rgba(30, 41, 59, 0.8)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#f8fafc',
    fontSize: '0.95rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  trainingBanner: {
    background: 'rgba(15, 23, 42, 0.95)',
    border: '2px solid #a855f7',
    borderRadius: 14,
    padding: '10px 18px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    backdropFilter: 'blur(10px)',
    boxShadow: '0 6px 20px rgba(168,85,247,0.4)',
    pointerEvents: 'auto'
  },
  tTaskTitle: { color: '#c084fc', fontWeight: 'bold', fontSize: '0.88rem' },
  tTaskDesc: { color: '#cbd5e1', fontSize: '0.82rem' },

  cameraControls: {
    position: 'fixed',
    top: 90,
    right: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    pointerEvents: 'auto'
  },
  camBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    background: 'rgba(15, 23, 42, 0.88)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#f8fafc',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
  }
};

export default GameHUD;

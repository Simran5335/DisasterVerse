import React from 'react';

const SmokeVisionHUD = ({ player, smokeLevel, objective, onToggleCrouch, onToggleFlashlight, onInteract }) => {
  const getSmokeBadgeColor = () => {
    if (smokeLevel === 'EXTREME') return '#ef4444';
    if (smokeLevel === 'HIGH') return '#f97316';
    if (smokeLevel === 'MEDIUM') return '#eab308';
    return '#22c55e';
  };

  return (
    <div style={styles.hudContainer}>
      {/* TOP HEADER BAR */}
      <div style={styles.topBar}>
        {/* Health Bar ❤️ */}
        <div style={styles.statBox}>
          <span style={styles.statLabel}>❤️ HEALTH</span>
          <div style={styles.healthBarBg}>
            <div style={{ ...styles.healthBarFill, width: `${Math.max(0, player.health)}%` }} />
          </div>
        </div>

        {/* Smoke Level Indicator 🌫 */}
        <div style={styles.smokePill} borderColor={getSmokeBadgeColor()}>
          <span style={{ color: getSmokeBadgeColor(), fontWeight: 'bold' }}>
            🌫 SMOKE LEVEL: {smokeLevel}
          </span>
          {player.isCrouching ? (
            <span style={styles.crouchingBadge}>🧎 CROUCHING (PROTECTED)</span>
          ) : (
            <span style={styles.recommendCrouch}>🧎 PRESS C TO STAY LOW</span>
          )}
        </div>

        {/* Flashlight Battery 🔦 */}
        <div style={styles.statBox}>
          <span style={styles.statLabel}>🔦 FLASHLIGHT</span>
          <div style={styles.batteryBarBg}>
            <div style={{ ...styles.batteryBarFill, width: `${Math.max(0, player.batteryPct)}%` }} />
          </div>
        </div>
      </div>

      {/* OBJECTIVE BANNER */}
      <div style={styles.objectiveBanner}>
        <span style={styles.objTag}>TARGET OBJECTIVE</span>
        <span style={styles.objText}>{objective || 'Find a safe evacuation exit.'}</span>
      </div>

      {/* BOTTOM CONTROL BUTTONS */}
      <div style={styles.controlsBar}>
        <button
          style={{ ...styles.ctrlBtn, background: player.isCrouching ? '#15803d' : 'rgba(30, 41, 59, 0.88)' }}
          onClick={onToggleCrouch}
        >
          🧎 [C] CROUCH / CRAWL
        </button>

        <button style={styles.ctrlBtnPrimary} onClick={onInteract}>
          ✋ [E] INTERACT / CHECK DOOR
        </button>

        <button
          style={{ ...styles.ctrlBtn, background: player.flashlightOn ? '#0284c7' : 'rgba(30, 41, 59, 0.88)' }}
          onClick={onToggleFlashlight}
        >
          🔦 [F] FLASHLIGHT ({Math.round(player.batteryPct)}%)
        </button>
      </div>
    </div>
  );
};

const styles = {
  hudContainer: {
    position: 'absolute',
    top: 10, left: 14, right: 14, bottom: 14,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    pointerEvents: 'none',
    zIndex: 20
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(15, 23, 42, 0.9)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: '8px 20px',
    backdropFilter: 'blur(10px)',
    pointerEvents: 'auto'
  },
  statBox: { display: 'flex', flexDirection: 'column', gap: 4, width: 140 },
  statLabel: { color: '#cbd5e1', fontSize: '0.72rem', fontWeight: 'bold' },
  healthBarBg: { width: '100%', height: 10, background: '#334155', borderRadius: 6, overflow: 'hidden' },
  healthBarFill: { height: '100%', background: '#ef4444', transition: 'width 0.2s ease' },
  batteryBarBg: { width: '100%', height: 10, background: '#334155', borderRadius: 6, overflow: 'hidden' },
  batteryBarFill: { height: '100%', background: '#f59e0b', transition: 'width 0.2s ease' },

  smokePill: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'rgba(30, 41, 59, 0.85)',
    border: '1px solid rgba(255,255,255,0.15)',
    padding: '6px 16px',
    borderRadius: 12,
    fontSize: '0.85rem'
  },
  crouchingBadge: { color: '#22c55e', fontSize: '0.7rem', fontWeight: 'bold', marginTop: 2 },
  recommendCrouch: { color: '#cbd5e1', fontSize: '0.68rem', marginTop: 2 },

  objectiveBanner: {
    alignSelf: 'center',
    background: 'rgba(15, 23, 42, 0.9)',
    border: '1px solid #38bdf8',
    borderRadius: 14,
    padding: '8px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
    pointerEvents: 'auto'
  },
  objTag: { color: '#38bdf8', fontSize: '0.68rem', fontWeight: 'bold', letterSpacing: '1px' },
  objText: { color: '#f8fafc', fontSize: '0.95rem', fontWeight: 'bold', marginTop: 2 },

  controlsBar: {
    display: 'flex',
    justifyContent: 'center',
    gap: 12,
    pointerEvents: 'auto'
  },
  ctrlBtn: {
    color: '#ffffff',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '10px 18px',
    borderRadius: 12,
    fontWeight: 'bold',
    fontSize: '0.88rem',
    cursor: 'pointer'
  },
  ctrlBtnPrimary: {
    background: 'linear-gradient(135deg, #0284c7, #2563eb)',
    color: '#ffffff',
    border: 'none',
    padding: '10px 24px',
    borderRadius: 12,
    fontWeight: 'bold',
    fontSize: '0.95rem',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(37,99,235,0.4)'
  }
};

export default SmokeVisionHUD;

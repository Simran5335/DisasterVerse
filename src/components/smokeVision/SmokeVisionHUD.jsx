import React from 'react';

const SmokeVisionHUD = ({
  player,
  smokeLevel,
  objective,
  toastNotification,
  onMove,
  onToggleCrouch,
  onToggleFlashlight,
  onInteract
}) => {
  const getSmokeBadgeColor = () => {
    if (smokeLevel === 'EXTREME') return '#ef4444';
    if (smokeLevel === 'HIGH') return '#f97316';
    if (smokeLevel === 'MEDIUM') return '#eab308';
    return '#22c55e';
  };

  return (
    <div style={styles.hudContainer}>
      {/* TOAST POPUP NOTIFICATION */}
      {toastNotification && (
        <div
          key={toastNotification.id}
          style={{
            ...styles.toastCard,
            borderColor: toastNotification.type === 'warning' ? '#f59e0b' : '#22c55e',
            background: toastNotification.type === 'warning' ? 'rgba(245, 158, 11, 0.95)' : 'rgba(34, 197, 94, 0.95)'
          }}
        >
          <span style={styles.toastText}>{toastNotification.message}</span>
        </div>
      )}

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
        <div style={styles.smokePill}>
          <span style={{ color: getSmokeBadgeColor(), fontWeight: 'bold' }}>
            🌫 SMOKE LEVEL: {smokeLevel}
          </span>
          {player.isCrouching ? (
            <span style={styles.crouchingBadge}>🧎 CROUCHING (-65% DAMAGE)</span>
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

      {/* TARGET OBJECTIVE */}
      <div style={styles.objectiveBanner}>
        <span style={styles.objTag}>TARGET OBJECTIVE</span>
        <span style={styles.objText}>{objective || 'Find a safe evacuation exit.'}</span>
      </div>

      {/* MOBILE / ON-SCREEN TOUCH CONTROLS */}
      <div style={styles.touchControlsRow}>
        <div style={styles.dpadGrid}>
          <button style={styles.dpadBtn} onClick={() => onMove(0, -0.6)}>▲</button>
          <div style={styles.dpadMid}>
            <button style={styles.dpadBtn} onClick={() => onMove(-0.6, 0)}>◄</button>
            <button style={styles.dpadBtn} onClick={() => onMove(0, 0.6)}>▼</button>
            <button style={styles.dpadBtn} onClick={() => onMove(0.6, 0)}>►</button>
          </div>
        </div>

        <div style={styles.actionButtonsCol}>
          <button
            style={{ ...styles.ctrlBtn, background: player.isCrouching ? '#15803d' : 'rgba(30, 41, 59, 0.88)' }}
            onClick={onToggleCrouch}
          >
            🧎 [C] CROUCH
          </button>

          <button style={styles.ctrlBtnPrimary} onClick={onInteract}>
            ✋ [E] CHECK DOOR
          </button>

          <button
            style={{ ...styles.ctrlBtn, background: player.flashlightOn ? '#0284c7' : 'rgba(30, 41, 59, 0.88)' }}
            onClick={onToggleFlashlight}
          >
            🔦 [F] FLASHLIGHT
          </button>
        </div>
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
  toastCard: {
    alignSelf: 'center',
    border: '1px solid',
    borderRadius: 14,
    padding: '8px 24px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    pointerEvents: 'auto',
    animation: 'toastPop 0.3s ease-out'
  },
  toastText: { color: '#ffffff', fontWeight: 'bold', fontSize: '0.92rem' },

  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(15, 23, 42, 0.92)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: '8px 16px',
    backdropFilter: 'blur(10px)',
    pointerEvents: 'auto',
    flexWrap: 'wrap',
    gap: 8
  },
  statBox: { display: 'flex', flexDirection: 'column', gap: 4, width: 130 },
  statLabel: { color: '#cbd5e1', fontSize: '0.7rem', fontWeight: 'bold' },
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
    padding: '6px 14px',
    borderRadius: 12,
    fontSize: '0.85rem'
  },
  crouchingBadge: { color: '#22c55e', fontSize: '0.68rem', fontWeight: 'bold', marginTop: 2 },
  recommendCrouch: { color: '#cbd5e1', fontSize: '0.68rem', marginTop: 2 },

  objectiveBanner: {
    alignSelf: 'center',
    background: 'rgba(15, 23, 42, 0.92)',
    border: '1px solid #38bdf8',
    borderRadius: 14,
    padding: '6px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
    pointerEvents: 'auto'
  },
  objTag: { color: '#38bdf8', fontSize: '0.65rem', fontWeight: 'bold', letterSpacing: '1px' },
  objText: { color: '#f8fafc', fontSize: '0.9rem', fontWeight: 'bold', marginTop: 2 },

  touchControlsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    pointerEvents: 'auto',
    gap: 12
  },
  dpadGrid: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  dpadMid: { display: 'flex', gap: 4 },
  dpadBtn: {
    background: 'rgba(30, 41, 59, 0.9)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#ffffff',
    width: 44,
    height: 44,
    borderRadius: 12,
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionButtonsCol: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  ctrlBtn: {
    color: '#ffffff',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '8px 14px',
    borderRadius: 12,
    fontWeight: 'bold',
    fontSize: '0.82rem',
    cursor: 'pointer'
  },
  ctrlBtnPrimary: {
    background: 'linear-gradient(135deg, #0284c7, #2563eb)',
    color: '#ffffff',
    border: 'none',
    padding: '8px 18px',
    borderRadius: 12,
    fontWeight: 'bold',
    fontSize: '0.88rem',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(37,99,235,0.4)'
  }
};

export default SmokeVisionHUD;

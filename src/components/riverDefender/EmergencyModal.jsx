import React from 'react';

const EmergencyModal = ({ activeEvent, activeMission, onEventChoice, onMissionChoice, budget }) => {
  if (!activeEvent && !activeMission) return null;

  const item = activeEvent || activeMission;
  const isMission = !!activeMission;
  const canAfford = budget >= (item.cost || 0);

  return (
    <>
      {/* TOP-RIGHT FLOATING EMERGENCY CARD MATCHING REFERENCE IMAGE */}
      <div style={styles.topRightCard}>
        <div style={styles.topRightHeader}>
          <span>⚠️ EMERGENCY EVENT!</span>
        </div>
        <div style={styles.topRightMsg}>
          {item.title || item.message || 'Drain blocked in Sector B! Fix it before it overflows.'}
        </div>
        <div style={styles.topRightTimerRow}>
          <span style={styles.timerCount}>00:25</span>
          <button style={styles.resolveQuickBtn} onClick={() => onEventChoice && onEventChoice(true)}>
            RESOLVE NOW
          </button>
        </div>
      </div>
    </>
  );
};

const styles = {
  topRightCard: {
    position: 'absolute',
    top: 80,
    right: 70,
    width: 220,
    background: 'rgba(239, 68, 68, 0.22)',
    border: '2px solid #ef4444',
    borderRadius: 14,
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    backdropFilter: 'blur(10px)',
    boxShadow: '0 10px 30px rgba(239, 68, 68, 0.4)',
    color: '#f8fafc',
    zIndex: 30,
    pointerEvents: 'auto'
  },
  topRightHeader: {
    color: '#fca5a5',
    fontWeight: 'bold',
    fontSize: '0.8rem',
    letterSpacing: '0.5px'
  },
  topRightMsg: {
    color: '#f8fafc',
    fontSize: '0.74rem',
    lineHeight: '1.3'
  },
  topRightTimerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4
  },
  timerCount: {
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: '0.9rem'
  },
  resolveQuickBtn: {
    background: '#dc2626',
    color: '#ffffff',
    border: 'none',
    padding: '4px 10px',
    borderRadius: 6,
    fontWeight: 'bold',
    fontSize: '0.7rem',
    cursor: 'pointer'
  }
};

export default EmergencyModal;

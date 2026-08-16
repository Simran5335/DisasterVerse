import React from 'react';

const DoorInteractionModal = ({ isOpen, doorData, onClose, onConfirmOpen }) => {
  if (!isOpen || !doorData) return null;

  const { door, tempState } = doorData;

  const getStateStyle = () => {
    if (tempState === 'COOL') {
      return {
        borderColor: '#22c55e',
        badgeColor: '#22c55e',
        badgeText: '🔵 DOOR IS COOL — SAFE TO CHECK & OPEN',
        desc: 'You felt the door with the back of your hand. The door handle is cool. It is safe to open and proceed carefully.'
      };
    } else if (tempState === 'WARM') {
      return {
        borderColor: '#f59e0b',
        badgeColor: '#f59e0b',
        badgeText: '🟡 DOOR IS WARM — BE CAREFUL!',
        desc: 'The door feels warm. Fire may be active nearby in the adjacent corridor. Consider checking an alternate evacuation route.'
      };
    } else {
      return {
        borderColor: '#ef4444',
        badgeColor: '#ef4444',
        badgeText: '🔴 DOOR IS VERY HOT — DO NOT OPEN!',
        desc: 'DANGER! Fire is burning directly on the other side of this door! Opening this door will cause oxygen to ignite a sudden flashover. Turn back and find another route!'
      };
    }
  };

  const stateStyle = getStateStyle();

  return (
    <div style={styles.overlay}>
      <div style={{ ...styles.modal, borderColor: stateStyle.borderColor }}>
        <div style={styles.header}>
          <span style={{ ...styles.badge, color: stateStyle.badgeColor }}>FIRE SAFETY DOOR CHECK</span>
          <h2 style={styles.title}>{door.label}</h2>
        </div>

        <div style={{ ...styles.statusCard, borderColor: stateStyle.badgeColor }}>
          <span style={{ color: stateStyle.badgeColor, fontWeight: 'bold', fontSize: '1rem' }}>
            {stateStyle.badgeText}
          </span>
          <p style={styles.desc}>{stateStyle.desc}</p>
        </div>

        <div style={styles.actions}>
          {tempState === 'VERY_HOT' ? (
            <button style={styles.btnDangerStop} onClick={onClose}>
              🚨 DO NOT OPEN — TURN BACK & FIND ALTERNATE ROUTE
            </button>
          ) : (
            <>
              <button style={styles.btnOpen} onClick={onConfirmOpen}>
                🚪 OPEN DOOR & PROCEED
              </button>
              <button style={styles.btnCancel} onClick={onClose}>
                ↩️ STEP BACK
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(15, 23, 42, 0.92)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 90
  },
  modal: {
    background: '#0f172a',
    border: '2px solid',
    borderRadius: 24,
    width: '90%',
    maxWidth: 480,
    padding: 24,
    color: '#f8fafc',
    boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
    display: 'flex',
    flexDirection: 'column',
    gap: 14
  },
  header: { display: 'flex', flexDirection: 'column' },
  badge: { fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px' },
  title: { fontSize: '1.25rem', fontWeight: 'bold', margin: '2px 0 0 0' },

  statusCard: {
    background: 'rgba(30, 41, 59, 0.8)',
    border: '1px solid',
    borderRadius: 14,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 6
  },
  desc: { color: '#cbd5e1', fontSize: '0.86rem', lineHeight: 1.4, margin: 0 },

  actions: { display: 'flex', gap: 10, marginTop: 6 },
  btnDangerStop: {
    flex: 1,
    background: 'linear-gradient(135deg, #dc2626, #991b1b)',
    color: '#ffffff',
    border: 'none',
    padding: '12px',
    borderRadius: 10,
    fontWeight: 'bold',
    fontSize: '0.86rem',
    cursor: 'pointer'
  },
  btnOpen: {
    flex: 1,
    background: 'linear-gradient(135deg, #16a34a, #15803d)',
    color: '#ffffff',
    border: 'none',
    padding: '12px',
    borderRadius: 10,
    fontWeight: 'bold',
    fontSize: '0.86rem',
    cursor: 'pointer'
  },
  btnCancel: {
    background: 'rgba(51, 65, 85, 0.8)',
    color: '#cbd5e1',
    border: '1px solid rgba(255,255,255,0.15)',
    padding: '12px',
    borderRadius: 10,
    fontWeight: 'bold',
    fontSize: '0.86rem',
    cursor: 'pointer'
  }
};

export default DoorInteractionModal;

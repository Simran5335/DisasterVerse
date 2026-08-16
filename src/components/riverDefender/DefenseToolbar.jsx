import React from 'react';
import { DEFENSES_DATA } from '../../data/defenses.js';

const DefenseToolbar = ({ selectedDefense, onSelectDefense, budget }) => {
  const defenseKeys = Object.keys(DEFENSES_DATA);

  return (
    <>
      {/* 1. LEFT SIDEBAR — "BUILD DEFENSES" PANEL */}
      <div style={styles.leftBuildPanel}>
        <div style={styles.buildHeader}>
          <span>BUILD DEFENSES</span>
        </div>

        <div style={styles.defensesList}>
          {defenseKeys.map((key) => {
            const item = DEFENSES_DATA[key];
            const isSelected = selectedDefense === key;
            const canAfford = budget >= item.cost;

            return (
              <div
                key={key}
                onClick={() => canAfford && onSelectDefense(key)}
                style={{
                  ...styles.defenseCard,
                  borderColor: isSelected ? '#38bdf8' : (canAfford ? 'rgba(255,255,255,0.1)' : 'rgba(239, 68, 68, 0.3)'),
                  background: isSelected ? 'rgba(14, 165, 233, 0.25)' : 'rgba(15, 23, 42, 0.85)',
                  opacity: canAfford ? 1 : 0.5,
                  cursor: canAfford ? 'pointer' : 'not-allowed',
                  transform: isSelected ? 'scale(1.02)' : 'none'
                }}
              >
                <div style={styles.cardIconBox}>
                  <span style={{ fontSize: '1.4rem' }}>{item.icon}</span>
                </div>
                <div style={styles.cardInfo}>
                  <div style={styles.cardTitleRow}>
                    <span style={styles.cardName}>{item.name.toUpperCase()}</span>
                    <span style={styles.cardCost}>₹{item.cost.toLocaleString()}</span>
                  </div>
                  <span style={styles.cardDesc}>{item.description}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={styles.selectHint}>
          <span>👇 SELECT & CLICK ON MAP</span>
        </div>
      </div>

      {/* 2. BOTTOM CENTER — QUICK DEFENSE HOTBAR */}
      <div style={styles.bottomHotbarContainer}>
        <div style={styles.hotbarRow}>
          {defenseKeys.map((key, index) => {
            const item = DEFENSES_DATA[key];
            const isSelected = selectedDefense === key;
            const canAfford = budget >= item.cost;

            return (
              <div
                key={key}
                onClick={() => canAfford && onSelectDefense(key)}
                style={{
                  ...styles.hotbarCard,
                  borderColor: isSelected ? '#22c55e' : (canAfford ? 'rgba(255,255,255,0.15)' : '#475569'),
                  background: isSelected ? 'rgba(34, 197, 94, 0.25)' : 'rgba(15, 23, 42, 0.92)',
                  opacity: canAfford ? 1 : 0.45,
                  cursor: canAfford ? 'pointer' : 'not-allowed',
                  transform: isSelected ? 'translateY(-6px)' : 'none'
                }}
              >
                <div style={styles.hotbarIconBox}>
                  <span style={{ fontSize: '1.4rem' }}>{item.icon}</span>
                </div>
                <span style={styles.hotbarName}>{item.name.toUpperCase()}</span>
                <span style={styles.hotbarCost}>₹{item.cost.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

const styles = {
  // Left Sidebar Build Panel
  leftBuildPanel: {
    position: 'absolute',
    top: 80,
    left: 14,
    width: 220,
    background: 'rgba(15, 23, 42, 0.92)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: 18,
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    backdropFilter: 'blur(12px)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
    zIndex: 20,
    pointerEvents: 'auto'
  },
  buildHeader: {
    fontSize: '0.82rem',
    fontWeight: 'bold',
    color: '#cbd5e1',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    paddingBottom: 6,
    letterSpacing: '1px'
  },
  defensesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  defenseCard: {
    padding: '8px 10px',
    borderRadius: 12,
    border: '1px solid transparent',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    transition: 'all 0.2s ease'
  },
  cardIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: 'rgba(30, 41, 59, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  cardInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    overflow: 'hidden'
  },
  cardTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardName: {
    color: '#f8fafc',
    fontWeight: 'bold',
    fontSize: '0.74rem',
    letterSpacing: '0.5px'
  },
  cardCost: {
    color: '#f59e0b',
    fontWeight: 'bold',
    fontSize: '0.74rem'
  },
  cardDesc: {
    color: '#94a3b8',
    fontSize: '0.64rem',
    lineHeight: '1.2'
  },
  selectHint: {
    fontSize: '0.66rem',
    fontWeight: 'bold',
    color: '#22c55e',
    textAlign: 'center',
    paddingTop: 4,
    borderTop: '1px dashed rgba(34, 197, 94, 0.3)'
  },

  // Bottom Center Hotbar
  bottomHotbarContainer: {
    position: 'absolute',
    bottom: 14,
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(15, 23, 42, 0.92)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    borderRadius: 18,
    padding: '8px 14px',
    display: 'flex',
    alignItems: 'center',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 10px 32px rgba(0,0,0,0.6)',
    zIndex: 20,
    pointerEvents: 'auto'
  },
  hotbarRow: {
    display: 'flex',
    gap: 10
  },
  hotbarCard: {
    width: 82,
    height: 72,
    padding: '6px 4px',
    borderRadius: 14,
    border: '2px solid transparent',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    transition: 'all 0.2s ease'
  },
  hotbarIconBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  hotbarName: {
    color: '#f8fafc',
    fontWeight: 'bold',
    fontSize: '0.62rem',
    textAlign: 'center'
  },
  hotbarCost: {
    color: '#f59e0b',
    fontWeight: 'bold',
    fontSize: '0.72rem'
  }
};

export default DefenseToolbar;

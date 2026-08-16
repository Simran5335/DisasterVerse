import React, { useState } from 'react';
import { SCENARIOS } from '../../data/scenarios.js';

const ScenarioSelectModal = ({ isOpen, onClose, onSelectScenario, unlockedScenarios = ['scenario_1'] }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState('MEDIUM');

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2>🗺️ SELECT SCENARIO</h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Difficulty Selector */}
        <div style={styles.diffRow}>
          <span style={styles.diffLabel}>Difficulty Mode:</span>
          {['EASY', 'MEDIUM', 'HARD'].map(d => (
            <button
              key={d}
              onClick={() => setSelectedDifficulty(d)}
              style={{
                ...styles.diffBtn,
                background: selectedDifficulty === d ? '#0284c7' : 'rgba(30, 41, 59, 0.8)',
                borderColor: selectedDifficulty === d ? '#38bdf8' : 'rgba(255,255,255,0.1)'
              }}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Scenarios Grid */}
        <div style={styles.grid}>
          {SCENARIOS.map(sc => {
            const isUnlocked = unlockedScenarios.includes(sc.id);

            return (
              <div
                key={sc.id}
                style={{
                  ...styles.card,
                  opacity: isUnlocked ? 1 : 0.45,
                  cursor: isUnlocked ? 'pointer' : 'not-allowed'
                }}
                onClick={() => isUnlocked && onSelectScenario(sc, selectedDifficulty)}
              >
                <div style={styles.cardHeader}>
                  <span style={{ ...styles.diffBadge, color: sc.difficultyColor }}>{sc.difficulty}</span>
                  <span style={styles.budgetTag}>Budget: ₹{sc.initialBudget.toLocaleString()}</span>
                </div>

                <h3 style={styles.cardTitle}>{sc.title}</h3>
                <span style={styles.cardSub}>{sc.subtitle}</span>
                <p style={styles.cardDesc}>{sc.description}</p>

                {!isUnlocked && (
                  <div style={styles.lockOverlay}>
                    🔒 Complete previous scenario to unlock
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(15, 23, 42, 0.9)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 60
  },
  modal: {
    background: '#0f172a',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 24,
    width: '90%',
    maxWidth: 720,
    padding: 28,
    color: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  closeBtn: { background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer' },

  diffRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },
  diffLabel: { color: '#cbd5e1', fontSize: '0.88rem', fontWeight: 'bold' },
  diffBtn: {
    color: '#fff',
    border: '1px solid transparent',
    padding: '6px 14px',
    borderRadius: 8,
    fontSize: '0.8rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  },

  grid: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: {
    background: 'rgba(30, 41, 59, 0.8)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: '16px 20px',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    transition: 'all 0.2s'
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  diffBadge: { fontWeight: 'bold', fontSize: '0.75rem', letterSpacing: '0.5px' },
  budgetTag: { color: '#eab308', fontWeight: 'bold', fontSize: '0.85rem' },
  cardTitle: { margin: 0, fontSize: '1.1rem', color: '#f8fafc' },
  cardSub: { color: '#38bdf8', fontSize: '0.82rem', fontWeight: 'bold' },
  cardDesc: { margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.4 },

  lockOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: '0.9rem'
  }
};

export default ScenarioSelectModal;

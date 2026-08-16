import React from 'react';

const WhatIfPanel = ({ analysis, onClose, onTestStrategy }) => {
  if (!analysis) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <span style={styles.tag}>🧠 DISASTERVERSE WHAT-IF ENGINE</span>
          <h2 style={styles.title}>STRATEGY OPTIMIZATION ANALYSIS</h2>
        </div>

        {/* Comparison Bar */}
        <div style={styles.compContainer}>
          <div style={styles.compBox}>
            <span style={styles.compLabel}>YOUR STRATEGY</span>
            <span style={styles.compVal}>{analysis.currentSavedPct}%</span>
            <span style={styles.compSub}>Protected</span>
          </div>

          <div style={styles.vsBadge}>VS</div>

          <div style={{ ...styles.compBox, borderColor: '#a855f7', background: 'rgba(168, 85, 247, 0.15)' }}>
            <span style={{ ...styles.compLabel, color: '#c084fc' }}>OPTIMAL HYBRID</span>
            <span style={{ ...styles.compVal, color: '#c084fc' }}>{analysis.potentialSavedPct}%</span>
            <span style={styles.compSub}>Protected (+{analysis.scoreGain} Pts)</span>
          </div>
        </div>

        {/* Findings Box */}
        <div style={styles.findingsBox}>
          <div style={styles.findingItem}>
            <span style={styles.itemTag}>⚠️ DIAGNOSIS:</span>
            <p style={styles.itemText}>{analysis.mainIssue}</p>
          </div>

          <div style={styles.findingItem}>
            <span style={{ ...styles.itemTag, color: '#22c55e' }}>💡 TACTICAL SOLUTION:</span>
            <p style={styles.itemText}>{analysis.recommendation}</p>
          </div>

          <div style={styles.findingItem}>
            <span style={{ ...styles.itemTag, color: '#38bdf8' }}>🌊 FLUID MECHANICS PRINCIPLE:</span>
            <p style={styles.itemText}>{analysis.keyInsight}</p>
          </div>
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <button style={styles.testBtn} onClick={onTestStrategy}>
            🚀 TEST STRATEGY & REPLAY
          </button>
          <button style={styles.closeBtn} onClick={onClose}>
            Back to Results
          </button>
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
    backdropFilter: 'blur(12px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 80
  },
  modal: {
    background: '#0f172a',
    border: '2px solid #a855f7',
    borderRadius: 24,
    width: '90%',
    maxWidth: 580,
    padding: 28,
    boxShadow: '0 25px 60px rgba(168, 85, 247, 0.3)',
    color: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    gap: 20
  },
  header: { textAlign: 'center' },
  tag: { color: '#c084fc', fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '1px' },
  title: { fontSize: '1.4rem', fontWeight: 'bold', margin: '4px 0 0 0' },

  compContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16
  },
  compBox: {
    flex: 1,
    background: 'rgba(30, 41, 59, 0.7)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  compLabel: { fontSize: '0.78rem', color: '#94a3b8', fontWeight: 'bold' },
  compVal: { fontSize: '2.2rem', fontWeight: 'bold', color: '#f8fafc', margin: '4px 0' },
  compSub: { fontSize: '0.75rem', color: '#cbd5e1' },
  vsBadge: {
    background: '#a855f7',
    color: '#fff',
    borderRadius: '50%',
    width: 36, height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '0.85rem'
  },

  findingsBox: {
    background: 'rgba(30, 41, 59, 0.8)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14
  },
  findingItem: { display: 'flex', flexDirection: 'column', gap: 2 },
  itemTag: { fontSize: '0.8rem', fontWeight: 'bold', color: '#f59e0b' },
  itemText: { margin: 0, color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.5 },

  actions: { display: 'flex', gap: 12, justifyContent: 'center' },
  testBtn: {
    background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
    color: '#fff',
    border: 'none',
    padding: '14px 24px',
    borderRadius: 12,
    fontWeight: 'bold',
    cursor: 'pointer',
    flex: 1.2
  },
  closeBtn: {
    background: 'rgba(51, 65, 85, 0.8)',
    color: '#f8fafc',
    border: '1px solid rgba(255,255,255,0.15)',
    padding: '14px 20px',
    borderRadius: 12,
    fontWeight: 'bold',
    cursor: 'pointer',
    flex: 1
  }
};

export default WhatIfPanel;

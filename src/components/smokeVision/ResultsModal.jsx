import React from 'react';

const ResultsModal = ({ isVictory, failReason, userScoreXP, decisionLogs, onProceedToReplay, onReplayLevel }) => {
  return (
    <div style={styles.overlay}>
      <div style={{ ...styles.modal, borderColor: isVictory ? '#22c55e' : '#ef4444' }}>
        <div style={styles.header}>
          <span style={{ color: isVictory ? '#22c55e' : '#ef4444', fontSize: '0.8rem', fontWeight: 'bold' }}>
            {isVictory ? '🎉 SUCCESSFUL EVACUATION!' : '🚨 EVACUATION FAILED'}
          </span>
          <h2 style={styles.title}>{isVictory ? 'FIRE SAFETY SCORE REPORT' : 'TRY AGAIN'}</h2>
        </div>

        {isVictory ? (
          <div style={styles.scoreContent}>
            <div style={styles.gradeBadge}>
              <span style={styles.gradeText}>GRADE</span>
              <span style={styles.gradeLetter}>A</span>
            </div>

            <div style={styles.xpCard}>
              <span style={styles.xpLabel}>EARNED XP</span>
              <span style={styles.xpValue}>+{userScoreXP} XP</span>
            </div>
          </div>
        ) : (
          <div style={styles.failCard}>
            <p style={styles.failReason}>{failReason || 'You spent too long in heavy smoke.'}</p>
            <span style={styles.tipText}>💡 Tip: Stay low by pressing C and check door handles before opening!</span>
          </div>
        )}

        <div style={styles.actions}>
          {isVictory ? (
            <button style={styles.btnPrimary} onClick={onProceedToReplay}>
              🗺️ VIEW 2D DISASTER ROUTE REPLAY →
            </button>
          ) : (
            <button style={styles.btnRetry} onClick={onReplayLevel}>
              🔄 TRY AGAIN
            </button>
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
    background: 'rgba(15, 23, 42, 0.94)',
    backdropFilter: 'blur(12px)',
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
    padding: 28,
    color: '#f8fafc',
    boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  },
  header: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  title: { fontSize: '1.4rem', fontWeight: 'bold', margin: '4px 0 0 0' },

  scoreContent: { display: 'flex', justifyContent: 'space-around', alignItems: 'center', margin: '10px 0' },
  gradeBadge: {
    width: 80,
    height: 80,
    borderRadius: 20,
    background: 'rgba(34, 197, 94, 0.2)',
    border: '2px solid #22c55e',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  gradeText: { color: '#22c55e', fontSize: '0.65rem', fontWeight: 'bold' },
  gradeLetter: { color: '#22c55e', fontSize: '2.2rem', fontWeight: 'bold' },

  xpCard: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  xpLabel: { color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 'bold' },
  xpValue: { color: '#f59e0b', fontSize: '1.8rem', fontWeight: 'bold' },

  failCard: { background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 6 },
  failReason: { color: '#fca5a5', fontSize: '0.88rem', margin: 0 },
  tipText: { color: '#cbd5e1', fontSize: '0.78rem' },

  actions: { display: 'flex', justifyContent: 'center' },
  btnPrimary: {
    background: 'linear-gradient(135deg, #0284c7, #2563eb)',
    color: '#ffffff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: 12,
    fontWeight: 'bold',
    fontSize: '0.95rem',
    cursor: 'pointer'
  },
  btnRetry: {
    background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
    color: '#ffffff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: 12,
    fontWeight: 'bold',
    fontSize: '0.95rem',
    cursor: 'pointer'
  }
};

export default ResultsModal;

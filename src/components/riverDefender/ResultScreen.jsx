import React from 'react';

const ResultScreen = ({ scoreResult, scenario, onOpenWhatIf, onReplay, onSelectScenario }) => {
  if (!scoreResult) return null;

  const {
    finalScore,
    grade,
    totalXP,
    buildingsSavedPct,
    waterManaged,
    budgetUsed,
    xpBreakdown,
    hospitalSaved,
    schoolSaved,
    fireSaved
  } = scoreResult;

  const getGradeColor = (g) => {
    switch (g) {
      case 'S': return '#a855f7';
      case 'A': return '#22c55e';
      case 'B': return '#3b82f6';
      case 'C': return '#f59e0b';
      default: return '#ef4444';
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <span style={styles.headerSub}>{scenario ? scenario.title : 'RIVERSIDE TOWN'}</span>
          <h1 style={styles.headerTitle}>FLOOD MANAGEMENT REPORT</h1>
        </div>

        {/* Grade & Score Card */}
        <div style={styles.scoreRow}>
          <div style={{ ...styles.gradeCircle, borderColor: getGradeColor(grade) }}>
            <span style={{ ...styles.gradeText, color: getGradeColor(grade) }}>{grade}</span>
            <span style={styles.gradeLabel}>GRADE</span>
          </div>

          <div style={styles.scoreMeta}>
            <div style={styles.scoreVal}>{finalScore.toLocaleString()} Pts</div>
            <div style={styles.xpBadge}>+{totalXP} XP EARNED</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <div style={styles.statBox}>
            <span style={styles.statNum}>{buildingsSavedPct}%</span>
            <span style={styles.statTitle}>Buildings Saved</span>
          </div>
          <div style={styles.statBox}>
            <span style={styles.statNum}>{hospitalSaved ? '✅ SAFE' : '🚨 DAMAGED'}</span>
            <span style={styles.statTitle}>Hospital Access</span>
          </div>
          <div style={styles.statBox}>
            <span style={styles.statNum}>{Math.round(waterManaged)} L</span>
            <span style={styles.statTitle}>Water Managed</span>
          </div>
          <div style={styles.statBox}>
            <span style={styles.statNum}>₹{budgetUsed.toLocaleString()}</span>
            <span style={styles.statTitle}>Budget Used</span>
          </div>
        </div>

        {/* Learning Report Section */}
        <div style={styles.learningBox}>
          <h4 style={styles.learningTitle}>💡 WHAT YOU LEARNED</h4>
          <ul style={styles.learningList}>
            <li>✓ Terrain elevation determines flood vulnerability: low-lying areas flood first.</li>
            <li>✓ Solid flood walls block water but redirect surge toward unprotected downstream zones.</li>
            <li>✓ Wetlands naturally absorb and retard excess flood volume without cost overflow.</li>
            <li>✓ Pumping & drainage channels prevent standing water accumulation on evacuation corridors.</li>
            <li>✓ Protecting critical medical infrastructure ensures emergency response remains active.</li>
          </ul>
        </div>

        {/* Buttons */}
        <div style={styles.actionsRow}>
          <button style={styles.whatIfBtn} onClick={onOpenWhatIf}>
            🧠 WHAT-IF ANALYSIS
          </button>
          <button style={styles.replayBtn} onClick={onReplay}>
            🔄 REPLAY SCENARIO
          </button>
          <button style={styles.scenariosBtn} onClick={onSelectScenario}>
            🗺️ OTHER SCENARIOS
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
    background: 'rgba(15, 23, 42, 0.85)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 70
  },
  modal: {
    background: '#0f172a',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 24,
    width: '90%',
    maxWidth: 580,
    padding: 28,
    boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
    color: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    gap: 18
  },
  header: { textAlign: 'center' },
  headerSub: { color: '#38bdf8', fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '1px' },
  headerTitle: { fontSize: '1.5rem', fontWeight: 'bold', margin: '4px 0 0 0' },

  scoreRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    background: 'rgba(30, 41, 59, 0.7)',
    padding: '16px 24px',
    borderRadius: 16
  },
  gradeCircle: {
    width: 70,
    height: 70,
    borderRadius: '50%',
    border: '4px solid #22c55e',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  gradeText: { fontSize: '1.8rem', fontWeight: 'bold', lineHeight: 1 },
  gradeLabel: { fontSize: '0.65rem', color: '#94a3b8', fontWeight: 'bold' },
  scoreMeta: { display: 'flex', flexDirection: 'column' },
  scoreVal: { fontSize: '2rem', fontWeight: 'bold', color: '#f8fafc' },
  xpBadge: { color: '#22c55e', fontWeight: 'bold', fontSize: '0.95rem' },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 10
  },
  statBox: {
    background: 'rgba(30, 41, 59, 0.5)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: '10px 8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  statNum: { fontSize: '1.05rem', fontWeight: 'bold', color: '#38bdf8' },
  statTitle: { fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 },

  learningBox: {
    background: 'rgba(30, 41, 59, 0.8)',
    border: '1px solid #0284c7',
    borderRadius: 14,
    padding: '14px 18px'
  },
  learningTitle: { color: '#38bdf8', fontSize: '0.95rem', margin: '0 0 8px 0' },
  learningList: { margin: 0, paddingLeft: 16, color: '#cbd5e1', fontSize: '0.82rem', lineHeight: 1.6 },

  actionsRow: { display: 'flex', gap: 10, justifyContent: 'center' },
  whatIfBtn: {
    background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
    color: '#fff',
    border: 'none',
    padding: '12px 18px',
    borderRadius: 12,
    fontWeight: 'bold',
    cursor: 'pointer',
    flex: 1
  },
  replayBtn: {
    background: 'linear-gradient(135deg, #0284c7, #2563eb)',
    color: '#fff',
    border: 'none',
    padding: '12px 18px',
    borderRadius: 12,
    fontWeight: 'bold',
    cursor: 'pointer',
    flex: 1
  },
  scenariosBtn: {
    background: 'rgba(51, 65, 85, 0.8)',
    color: '#f8fafc',
    border: '1px solid rgba(255,255,255,0.15)',
    padding: '12px 16px',
    borderRadius: 12,
    fontWeight: 'bold',
    cursor: 'pointer'
  }
};

export default ResultScreen;

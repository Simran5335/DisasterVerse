import React from 'react';

const MissionPanel = ({ isOpen, onClose, scenario, buildingsStats, budget }) => {
  const objectives = scenario ? scenario.objectives : [
    { id: '1', text: 'Protect the Hospital', target: 'hospital' },
    { id: '2', text: 'Protect the School', target: 'school' },
    { id: '3', text: 'Save 80% of Houses', target: 'houses_pct', minSavePct: 80 }
  ];
  const housesPct = buildingsStats?.housesSavedPct ?? 82;

  const renderObjectiveItem = (obj) => {
    let isComplete = false;
    let detailText = '';

    if (obj.target === 'hospital') {
      isComplete = buildingsStats?.hospitalSaved !== false;
    } else if (obj.target === 'school') {
      isComplete = buildingsStats?.schoolSaved !== false;
    } else if (obj.target === 'houses_pct') {
      isComplete = housesPct >= (obj.minSavePct || 80);
      detailText = `${Math.round(housesPct * 0.7 + 24)} / 100`;
    } else {
      isComplete = true;
    }

    return (
      <div key={obj.id} style={styles.hudObjRow}>
        <div style={styles.hudObjLeft}>
          <span style={styles.starIcon}>⭐</span>
          <span style={styles.hudObjText}>{obj.text}</span>
        </div>
        {detailText ? (
          <span style={styles.hudDetailCount}>{detailText}</span>
        ) : (
          <span style={{ ...styles.checkBadge, background: isComplete ? '#22c55e' : '#eab308' }}>✓</span>
        )}
      </div>
    );
  };

  return (
    <>
      {/* PERMANENT BOTTOM-LEFT HUD OBJECTIVES CARD */}
      <div style={styles.hudObjectivesCard}>
        <div style={styles.hudCardTitle}>MISSION OBJECTIVES</div>
        <div style={styles.hudObjList}>
          {objectives.map(renderObjectiveItem)}
        </div>
      </div>

      {/* FULL MODAL DETAILED VIEW WHEN CLICKED */}
      {isOpen && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.header}>
              <h2>🎯 MISSION OBJECTIVES DETAILS</h2>
              <button style={styles.closeBtn} onClick={onClose}>✕</button>
            </div>

            <div style={styles.objList}>
              {objectives.map((obj) => {
                let isComplete = false;
                let statusText = 'IN PROGRESS';

                if (obj.target === 'hospital') {
                  isComplete = buildingsStats?.hospitalSaved !== false;
                  statusText = isComplete ? '✅ SAFE' : '🚨 DAMAGED';
                } else if (obj.target === 'school') {
                  isComplete = buildingsStats?.schoolSaved !== false;
                  statusText = isComplete ? '✅ SAFE' : '🚨 DAMAGED';
                } else if (obj.target === 'houses_pct') {
                  isComplete = housesPct >= obj.minSavePct;
                  statusText = `${housesPct}% / ${obj.minSavePct}% Saved`;
                } else {
                  isComplete = true;
                  statusText = '✅ SAFE';
                }

                return (
                  <div key={obj.id} style={{ ...styles.objCard, borderColor: isComplete ? '#22c55e' : '#f59e0b' }}>
                    <span style={styles.objStar}>{isComplete ? '★' : '☆'}</span>
                    <div style={styles.objTextCnt}>
                      <span style={styles.objTitle}>{obj.text}</span>
                      <span style={{ ...styles.objStatus, color: isComplete ? '#22c55e' : '#f59e0b' }}>
                        {statusText}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={styles.footer}>
              <button style={styles.confirmBtn} onClick={onClose}>Back to Operations</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  // Permanent Bottom Left HUD Card
  hudObjectivesCard: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    width: 210,
    background: 'rgba(15, 23, 42, 0.92)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    backdropFilter: 'blur(12px)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
    zIndex: 20,
    pointerEvents: 'auto'
  },
  hudCardTitle: {
    fontSize: '0.78rem',
    fontWeight: 'bold',
    color: '#cbd5e1',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    paddingBottom: 4,
    letterSpacing: '0.8px'
  },
  hudObjList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6
  },
  hudObjRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  hudObjLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 6
  },
  starIcon: {
    fontSize: '0.82rem',
    color: '#eab308'
  },
  hudObjText: {
    color: '#f8fafc',
    fontSize: '0.74rem',
    fontWeight: '600'
  },
  checkBadge: {
    width: 16,
    height: 16,
    borderRadius: 4,
    color: '#0f172a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    fontWeight: 'bold'
  },
  hudDetailCount: {
    color: '#f59e0b',
    fontWeight: 'bold',
    fontSize: '0.74rem'
  },

  // Modal Full Overlay
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50
  },
  modal: {
    background: '#0f172a',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 20,
    width: '90%',
    maxWidth: 480,
    padding: 24,
    boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
    color: '#f8fafc'
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  closeBtn: { background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer' },
  objList: { display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 },
  objCard: {
    background: 'rgba(30, 41, 59, 0.8)',
    border: '1px solid #22c55e',
    borderRadius: 12,
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },
  objStar: { fontSize: '1.4rem', color: '#eab308' },
  objTextCnt: { display: 'flex', flexDirection: 'column' },
  objTitle: { fontWeight: 'bold', fontSize: '0.95rem' },
  objStatus: { fontSize: '0.8rem', marginTop: 2 },
  footer: { display: 'flex', justifyContent: 'flex-end' },
  confirmBtn: {
    background: 'linear-gradient(135deg, #0284c7, #2563eb)',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: 10,
    fontWeight: 'bold',
    cursor: 'pointer'
  }
};

export default MissionPanel;

import React, { useState } from 'react';
import { soundManager } from '../../game/SoundManager.js';

const TutorialModal = ({ isOpen, onClose, onStartTraining, onStartGame }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [quiz1Answer, setQuiz1Answer] = useState(null);
  const [quiz2Answer, setQuiz2Answer] = useState(null);

  if (!isOpen) return null;

  const totalPages = 7;

  const handleNext = () => {
    soundManager.playClick();
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleBack = () => {
    soundManager.playClick();
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header & Page Indicator */}
        <div style={styles.header}>
          <div style={styles.titleGroup}>
            <span style={styles.logoTag}>🌊 DISASTERVERSE INSTRUCTION MANUAL</span>
            <h2 style={styles.mainTitle}>RIVER DEFENDER TUTORIAL</h2>
          </div>

          <div style={styles.pagePill}>
            PAGE {currentPage + 1} OF {totalPages}
          </div>
        </div>

        {/* Content Body */}
        <div style={styles.contentBody}>
          {/* PAGE 1: YOUR MISSION */}
          {currentPage === 0 && (
            <div style={styles.pageContent}>
              <div style={styles.cardHeader}>
                <span style={styles.cardBadge}>MISSION BRIEFING</span>
                <h3 style={styles.cardTitle}>YOUR MISSION</h3>
              </div>

              <div style={styles.visualBox}>
                <div style={styles.cityAnimBox}>
                  <span style={styles.animIcon}>🏥</span>
                  <span style={styles.animIcon}>🏫</span>
                  <span style={styles.animIcon}>🏠</span>
                  <div style={styles.riverWaveAnim}>🌊 RIVER SURGE APPROACHING</div>
                </div>
              </div>

              <p style={styles.descText}>
                A major storm is approaching Riverside City. As the <strong>Flood Management Commander</strong>, your job is to protect critical infrastructure and residential neighborhoods before river levels breach safety margins.
              </p>

              <div style={styles.priorityPillList}>
                <span style={{ ...styles.pPill, borderColor: '#ef4444' }}>🏥 Hospital</span>
                <span style={{ ...styles.pPill, borderColor: '#f59e0b' }}>🏫 School</span>
                <span style={{ ...styles.pPill, borderColor: '#dc2626' }}>🚒 Fire Station</span>
                <span style={{ ...styles.pPill, borderColor: '#10b981' }}>🏠 Homes</span>
                <span style={{ ...styles.pPill, borderColor: '#64748b' }}>🛣️ Evacuation Routes</span>
              </div>
            </div>
          )}

          {/* PAGE 2: UNDERSTAND THE MAP */}
          {currentPage === 1 && (
            <div style={styles.pageContent}>
              <div style={styles.cardHeader}>
                <span style={styles.cardBadge}>TERRAIN ELEVATION</span>
                <h3 style={styles.cardTitle}>UNDERSTAND THE MAP</h3>
              </div>

              <div style={styles.elevationDiagram}>
                <div style={{ ...styles.elevTier, background: '#166534' }}>⛰️ HIGH GROUND (Safe)</div>
                <div style={styles.arrowDown}>↓</div>
                <div style={{ ...styles.elevTier, background: '#15803d' }}>🏠 RESIDENTIAL AREA (Medium)</div>
                <div style={styles.arrowDown}>↓</div>
                <div style={{ ...styles.elevTier, background: '#854d0e' }}>🏞️ LOW-LYING SECTOR (High Risk)</div>
                <div style={styles.arrowDown}>↓</div>
                <div style={{ ...styles.elevTier, background: '#1e3a8a' }}>🌊 RIVER CHANNEL (Flood Source)</div>
              </div>

              <p style={styles.descText}>
                <strong>Water naturally moves toward lower ground.</strong> Low-lying areas next to the river flood first when rainfall increases.
              </p>

              {/* Mini Quiz 1 */}
              <div style={styles.quizBox}>
                <span style={styles.quizQuestion}>❓ QUICK CHECK: Where does floodwater flow first?</span>
                <div style={styles.quizOptions}>
                  <button
                    style={{ ...styles.quizBtn, borderColor: quiz1Answer === 'correct' ? '#22c55e' : 'rgba(255,255,255,0.1)' }}
                    onClick={() => { setQuiz1Answer('correct'); soundManager.playVictory(); }}
                  >
                    Low-Lying Areas Next to River
                  </button>
                  <button
                    style={{ ...styles.quizBtn, borderColor: quiz1Answer === 'wrong' ? '#ef4444' : 'rgba(255,255,255,0.1)' }}
                    onClick={() => { setQuiz1Answer('wrong'); soundManager.playClick(); }}
                  >
                    High Ground Hills
                  </button>
                </div>
                {quiz1Answer === 'correct' && <span style={styles.correctFeedback}>✓ Correct! Gravity pulls water down to low-lying areas first.</span>}
                {quiz1Answer === 'wrong' && <span style={styles.wrongFeedback}>Try again! Water always flows downhill to lower ground.</span>}
              </div>
            </div>
          )}

          {/* PAGE 3: BUILD DEFENSES */}
          {currentPage === 2 && (
            <div style={styles.pageContent}>
              <div style={styles.cardHeader}>
                <span style={styles.cardBadge}>INFRASTRUCTURE CATALOG</span>
                <h3 style={styles.cardTitle}>BUILD DEFENSES</h3>
              </div>

              <div style={styles.defenseGrid}>
                <div style={styles.defCard}>
                  <span style={styles.defIcon}>🧱</span>
                  <div style={styles.defInfo}>
                    <strong>Sandbags (₹500)</strong>
                    <span>Quick emergency barrier. Retards flow velocity by 75%.</span>
                  </div>
                </div>

                <div style={styles.defCard}>
                  <span style={styles.defIcon}>🛡️</span>
                  <div style={styles.defInfo}>
                    <strong>Flood Wall (₹2,500)</strong>
                    <span>Concrete wall. Completely blocks & redirects surge.</span>
                  </div>
                </div>

                <div style={styles.defCard}>
                  <span style={styles.defIcon}>⚙️</span>
                  <div style={styles.defInfo}>
                    <strong>Pump Station (₹1,500)</strong>
                    <span>Actively extracts water from low elevation pockets.</span>
                  </div>
                </div>

                <div style={styles.defCard}>
                  <span style={styles.defIcon}>🌊</span>
                  <div style={styles.defInfo}>
                    <strong>Drainage Channel (₹1,200)</strong>
                    <span>Rapidly conducts water away from highways.</span>
                  </div>
                </div>

                <div style={styles.defCard}>
                  <span style={styles.defIcon}>🌿</span>
                  <div style={styles.defInfo}>
                    <strong>Wetland Reserve (₹2,000)</strong>
                    <span>Nature-based sponge that absorbs excess volume.</span>
                  </div>
                </div>

                <div style={styles.defCard}>
                  <span style={styles.defIcon}>🚧</span>
                  <div style={styles.defInfo}>
                    <strong>Temp Barrier (₹1,000)</strong>
                    <span>Inflatable barrier for sudden emergency surge.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PAGE 4: HOW WATER WORKS */}
          {currentPage === 3 && (
            <div style={styles.pageContent}>
              <div style={styles.cardHeader}>
                <span style={styles.cardBadge}>FLUID MECHANICS</span>
                <h3 style={styles.cardTitle}>HOW WATER WORKS</h3>
              </div>

              <div style={styles.mechanicsBox}>
                <div style={styles.mechCompare}>
                  <div style={styles.mechItem}>
                    <span style={styles.mechTitle}>❌ WALL ALONE</span>
                    <p style={styles.mechDesc}>Water hits wall $\rightarrow$ Blocks surge $\rightarrow$ Redirects into neighboring houses!</p>
                  </div>

                  <div style={styles.mechItem}>
                    <span style={{ ...styles.mechTitle, color: '#22c55e' }}>✅ WALL + DRAINAGE</span>
                    <p style={styles.mechDesc}>Water hits wall $\rightarrow$ Drainage carries water away $\rightarrow$ Sector remains safe!</p>
                  </div>
                </div>
              </div>

              <div style={styles.alertBanner}>
                ⚠️ <strong>DEFENSES DON'T MAKE WATER DISAPPEAR.</strong> Blocking one path will redirect water somewhere else unless combined with absorption or drainage.
              </div>

              {/* Mini Quiz 2 */}
              <div style={styles.quizBox}>
                <span style={styles.quizQuestion}>❓ QUICK CHECK: Which solution absorbs excess water naturally?</span>
                <div style={styles.quizOptions}>
                  <button
                    style={{ ...styles.quizBtn, borderColor: quiz2Answer === 'correct' ? '#22c55e' : 'rgba(255,255,255,0.1)' }}
                    onClick={() => { setQuiz2Answer('correct'); soundManager.playVictory(); }}
                  >
                    🌿 Wetland Reserve
                  </button>
                  <button
                    style={{ ...styles.quizBtn, borderColor: quiz2Answer === 'wrong' ? '#ef4444' : 'rgba(255,255,255,0.1)' }}
                    onClick={() => { setQuiz2Answer('wrong'); soundManager.playClick(); }}
                  >
                    🛣️ Evacuation Road
                  </button>
                </div>
                {quiz2Answer === 'correct' && <span style={styles.correctFeedback}>✓ Correct! Wetlands act as natural sponges for flood volume.</span>}
                {quiz2Answer === 'wrong' && <span style={styles.wrongFeedback}>Try again! Wetlands sponge and hold water.</span>}
              </div>
            </div>
          )}

          {/* PAGE 5: PROTECT THE IMPORTANT */}
          {currentPage === 4 && (
            <div style={styles.pageContent}>
              <div style={styles.cardHeader}>
                <span style={styles.cardBadge}>RESOURCE PRIORITIZATION</span>
                <h3 style={styles.cardTitle}>PROTECT THE IMPORTANT</h3>
              </div>

              <div style={styles.priorityList}>
                <div style={{ ...styles.pCard, borderColor: '#ef4444' }}>
                  <span style={styles.pIcon}>🏥</span>
                  <div>
                    <strong>General Hospital — PRIORITY: VERY HIGH</strong>
                    <p style={styles.pDesc}>Provides critical medical care. Access road must remain open!</p>
                  </div>
                </div>

                <div style={{ ...styles.pCard, borderColor: '#f59e0b' }}>
                  <span style={styles.pIcon}>🏫</span>
                  <div>
                    <strong>Central High School — PRIORITY: HIGH</strong>
                    <p style={styles.pDesc}>Serves as the primary community emergency shelter.</p>
                  </div>
                </div>

                <div style={{ ...styles.pCard, borderColor: '#dc2626' }}>
                  <span style={styles.pIcon}>🚒</span>
                  <div>
                    <strong>Fire & Rescue Station — PRIORITY: HIGH</strong>
                    <p style={styles.pDesc}>Deploys emergency rescue vehicles across the sector.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PAGE 6: REACT TO THE FLOOD */}
          {currentPage === 5 && (
            <div style={styles.pageContent}>
              <div style={styles.cardHeader}>
                <span style={styles.cardBadge}>SIMULATION TIMELINE</span>
                <h3 style={styles.cardTitle}>REACT TO THE FLOOD</h3>
              </div>

              <div style={styles.timelineRow}>
                <div style={styles.tCard}>
                  <span>🌤️ PHASE 1: PREPARE</span>
                  <p>Place defenses using initial budget.</p>
                </div>
                <div style={styles.tCard}>
                  <span>🌧️ PHASE 2: HEAVY RAIN</span>
                  <p>River rises. Monitor low-lying zones.</p>
                </div>
                <div style={styles.tCard}>
                  <span>⛈️ PHASE 3: EXTREME STORM</span>
                  <p>Thunder, power cuts, emergency events.</p>
                </div>
                <div style={styles.tCard}>
                  <span>🌊 PHASE 4: FLOOD PEAK</span>
                  <p>Maximum rainfall & surge challenge.</p>
                </div>
              </div>
            </div>
          )}

          {/* PAGE 7: SCORE & LEARN */}
          {currentPage === 6 && (
            <div style={styles.pageContent}>
              <div style={styles.cardHeader}>
                <span style={styles.cardBadge}>GAMIFICATION & ANALYSIS</span>
                <h3 style={styles.cardTitle}>SCORE & WHAT-IF ENGINE</h3>
              </div>

              <p style={styles.descText}>
                Your score is calculated dynamically based on <strong>Buildings Saved</strong>, <strong>Hospital Protection</strong>, <strong>Water Managed</strong>, and <strong>Budget Efficiency</strong>.
              </p>

              <div style={styles.whatIfHighlight}>
                🧠 <strong>WHAT-IF ENGINE:</strong> After every game, review the AI optimization report to see how a better strategy could have saved more buildings, and test it in one click!
              </div>

              <div style={styles.readyButtonsRow}>
                <button style={styles.btnTraining} onClick={onStartTraining}>
                  🎓 START TRAINING MODE
                </button>
                <button style={styles.btnRealGame} onClick={onStartGame}>
                  ▶ PLAY REAL SCENARIO
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div style={styles.footerNav}>
          <button style={styles.skipBtn} onClick={onClose}>
            SKIP TUTORIAL
          </button>

          <div style={styles.navGroup}>
            <button disabled={currentPage === 0} style={{ ...styles.navBtn, opacity: currentPage === 0 ? 0.4 : 1 }} onClick={handleBack}>
              ← BACK
            </button>

            {currentPage < totalPages - 1 ? (
              <button style={styles.navBtnPrimary} onClick={handleNext}>
                NEXT →
              </button>
            ) : (
              <button style={styles.navBtnPrimary} onClick={onStartTraining}>
                START TRAINING →
              </button>
            )}
          </div>
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
    backdropFilter: 'blur(12px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 90
  },
  modal: {
    background: '#0f172a',
    border: '2px solid #0284c7',
    borderRadius: 24,
    width: '92%',
    maxWidth: 640,
    padding: 28,
    color: '#f8fafc',
    boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  titleGroup: { display: 'flex', flexDirection: 'column' },
  logoTag: { color: '#38bdf8', fontSize: '0.78rem', fontWeight: 'bold', letterSpacing: '1px' },
  mainTitle: { fontSize: '1.4rem', fontWeight: 'bold', margin: '2px 0 0 0' },
  pagePill: {
    background: 'rgba(56, 189, 248, 0.15)',
    border: '1px solid #38bdf8',
    color: '#38bdf8',
    padding: '4px 12px',
    borderRadius: 12,
    fontSize: '0.78rem',
    fontWeight: 'bold'
  },

  contentBody: { minHeight: 340, display: 'flex', flexDirection: 'column' },
  pageContent: { display: 'flex', flexDirection: 'column', gap: 12 },
  cardHeader: { display: 'flex', flexDirection: 'column' },
  cardBadge: { color: '#f59e0b', fontSize: '0.75rem', fontWeight: 'bold' },
  cardTitle: { fontSize: '1.2rem', fontWeight: 'bold', margin: '2px 0 0 0' },

  visualBox: {
    background: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 14,
    padding: 16,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cityAnimBox: { display: 'flex', gap: 14, alignItems: 'center' },
  animIcon: { fontSize: '2rem' },
  riverWaveAnim: { background: '#1e3a8a', color: '#60a5fa', padding: '6px 12px', borderRadius: 8, fontWeight: 'bold', fontSize: '0.85rem' },

  descText: { color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 },
  priorityPillList: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  pPill: { background: 'rgba(30, 41, 59, 0.8)', border: '1px solid', padding: '4px 10px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 'bold' },

  elevationDiagram: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  elevTier: { color: '#fff', width: '80%', padding: '6px 12px', borderRadius: 8, textAlign: 'center', fontWeight: 'bold', fontSize: '0.82rem' },
  arrowDown: { color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1 },

  quizBox: {
    background: 'rgba(30, 41, 59, 0.8)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 14,
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  quizQuestion: { color: '#f59e0b', fontSize: '0.85rem', fontWeight: 'bold' },
  quizOptions: { display: 'flex', gap: 10 },
  quizBtn: {
    flex: 1,
    background: 'rgba(15, 23, 42, 0.8)',
    color: '#fff',
    border: '1px solid',
    padding: '8px 12px',
    borderRadius: 8,
    fontSize: '0.8rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  correctFeedback: { color: '#22c55e', fontSize: '0.8rem', fontWeight: 'bold' },
  wrongFeedback: { color: '#ef4444', fontSize: '0.8rem', fontWeight: 'bold' },

  defenseGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 },
  defCard: {
    background: 'rgba(30, 41, 59, 0.6)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 10
  },
  defIcon: { fontSize: '1.6rem' },
  defInfo: { display: 'flex', flexDirection: 'column', fontSize: '0.78rem', color: '#cbd5e1' },

  mechanicsBox: { background: 'rgba(30, 41, 59, 0.7)', borderRadius: 12, padding: 14 },
  mechCompare: { display: 'flex', flexDirection: 'column', gap: 8 },
  mechItem: { display: 'flex', flexDirection: 'column' },
  mechTitle: { color: '#ef4444', fontWeight: 'bold', fontSize: '0.85rem' },
  mechDesc: { color: '#cbd5e1', fontSize: '0.82rem', margin: '2px 0 0 0' },
  alertBanner: { background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: 10, borderRadius: 10, fontSize: '0.82rem' },

  priorityList: { display: 'flex', flexDirection: 'column', gap: 10 },
  pCard: { background: 'rgba(30, 41, 59, 0.6)', border: '1px solid', borderRadius: 12, padding: 12, display: 'flex', alignItems: 'center', gap: 12 },
  pIcon: { fontSize: '1.8rem' },
  pDesc: { color: '#94a3b8', fontSize: '0.8rem', margin: '2px 0 0 0' },

  timelineRow: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 },
  tCard: { background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', fontSize: '0.82rem', color: '#cbd5e1' },

  whatIfHighlight: { background: 'rgba(168, 85, 247, 0.15)', border: '1px solid #a855f7', color: '#c084fc', padding: 14, borderRadius: 12, fontSize: '0.85rem' },
  readyButtonsRow: { display: 'flex', gap: 12, marginTop: 12 },
  btnTraining: { flex: 1, background: 'linear-gradient(135deg, #a855f7, #7e22ce)', color: '#fff', border: 'none', padding: '12px', borderRadius: 10, fontWeight: 'bold', cursor: 'pointer' },
  btnRealGame: { flex: 1, background: 'linear-gradient(135deg, #0284c7, #2563eb)', color: '#fff', border: 'none', padding: '12px', borderRadius: 10, fontWeight: 'bold', cursor: 'pointer' },

  footerNav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16 },
  skipBtn: { background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' },
  navGroup: { display: 'flex', gap: 10 },
  navBtn: { background: 'rgba(51, 65, 85, 0.8)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', padding: '8px 16px', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' },
  navBtnPrimary: { background: '#0284c7', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }
};

export default TutorialModal;

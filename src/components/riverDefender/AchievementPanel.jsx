import React from 'react';
import { ACHIEVEMENTS } from '../../data/achievements.js';

const AchievementPanel = ({ isOpen, onClose, userAchievements = [] }) => {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2>🏆 ACHIEVEMENTS & BADGES</h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={styles.achList}>
          {ACHIEVEMENTS.map(ach => {
            const isUnlocked = userAchievements.includes(ach.id);
            return (
              <div key={ach.id} style={{ ...styles.card, opacity: isUnlocked ? 1 : 0.45 }}>
                <span style={styles.icon}>{ach.icon}</span>
                <div style={styles.info}>
                  <span style={styles.title}>{ach.title}</span>
                  <span style={styles.desc}>{ach.description}</span>
                </div>
                <div style={styles.xpTag}>+{ach.xp} XP</div>
              </div>
            );
          })}
        </div>

        <div style={styles.footer}>
          <button style={styles.confirmBtn} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 60
  },
  modal: {
    background: '#0f172a',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 20,
    width: '90%',
    maxWidth: 500,
    padding: 24,
    color: '#f8fafc'
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  closeBtn: { background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer' },
  achList: { display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 360, overflowY: 'auto', marginBottom: 16 },
  card: {
    background: 'rgba(30, 41, 59, 0.8)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },
  icon: { fontSize: '1.8rem' },
  info: { display: 'flex', flexDirection: 'column', flex: 1 },
  title: { fontWeight: 'bold', fontSize: '0.95rem', color: '#f8fafc' },
  desc: { color: '#94a3b8', fontSize: '0.78rem', marginTop: 2 },
  xpTag: { color: '#22c55e', fontWeight: 'bold', fontSize: '0.85rem' },
  footer: { display: 'flex', justifyContent: 'flex-end' },
  confirmBtn: { background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }
};

export default AchievementPanel;

import React from 'react';

const LearningScreenModal = ({ isOpen, onClaimBonusXP, onClose }) => {
  if (!isOpen) return null;

  const lessons = [
    { icon: '🚪', title: 'Check Doors Before Opening', desc: 'Always touch a door handle with the back of your hand. If it is hot or warm, DO NOT open it!' },
    { icon: '🧎', title: 'Stay Low in Smoke', desc: 'Smoke rises to the ceiling. Crouch or crawl on your hands and knees where the air is cleaner.' },
    { icon: '🏃', title: 'Know Evacuation Routes', desc: 'Always identify at least two safe emergency exit routes when entering a school or building.' },
    { icon: '🚫', title: 'Never Use Elevators During Fire', desc: 'Elevators can lose power or open on fire floors. Always take the emergency stairs.' },
    { icon: '🎒', title: 'Get Out Immediately', desc: 'Never stop or go back for toys, schoolbags, or belongings. Your life is the top priority!' }
  ];

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <span style={styles.badge}>FIRE SAFETY KNOWLEDGE</span>
          <h2 style={styles.title}>🎓 WHAT DID YOU LEARN?</h2>
        </div>

        <div style={styles.lessonsGrid}>
          {lessons.map((item, idx) => (
            <div key={idx} style={styles.lessonCard}>
              <span style={styles.icon}>{item.icon}</span>
              <div style={styles.info}>
                <strong style={styles.lessonTitle}>{item.title}</strong>
                <p style={styles.lessonDesc}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.footerRow}>
          <button style={styles.bonusBtn} onClick={onClaimBonusXP}>
            🌟 CLAIM +100 BONUS FIRE SAFETY XP & FINISH
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
    background: 'rgba(15, 23, 42, 0.94)',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100
  },
  modal: {
    background: '#0f172a',
    border: '2px solid #a855f7',
    borderRadius: 24,
    width: '92%',
    maxWidth: 620,
    padding: 28,
    color: '#f8fafc',
    boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  },
  header: { display: 'flex', flexDirection: 'column' },
  badge: { color: '#c084fc', fontSize: '0.78rem', fontWeight: 'bold', letterSpacing: '1px' },
  title: { fontSize: '1.4rem', fontWeight: 'bold', margin: '2px 0 0 0' },

  lessonsGrid: { display: 'flex', flexDirection: 'column', gap: 10 },
  lessonCard: {
    background: 'rgba(30, 41, 59, 0.7)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 14
  },
  icon: { fontSize: '1.8rem' },
  info: { display: 'flex', flexDirection: 'column' },
  lessonTitle: { color: '#f8fafc', fontSize: '0.9rem' },
  lessonDesc: { color: '#cbd5e1', fontSize: '0.78rem', margin: '2px 0 0 0', lineHeight: 1.3 },

  footerRow: { display: 'flex', justifyContent: 'center' },
  bonusBtn: {
    background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
    color: '#ffffff',
    border: 'none',
    padding: '14px 28px',
    borderRadius: 12,
    fontWeight: 'bold',
    fontSize: '0.98rem',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(168,85,247,0.4)'
  }
};

export default LearningScreenModal;

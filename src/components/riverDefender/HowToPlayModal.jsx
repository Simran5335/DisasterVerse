import React from 'react';

const HowToPlayModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const steps = [
    { num: '1', title: 'OBSERVE TERRAIN', desc: 'Scan heightmap elevation. Low-lying areas (dark ground) flood first as river rises.' },
    { num: '2', title: 'CHECK VULNERABLE BUILDINGS', desc: 'Identify City General Hospital, School, Fire Station, and low residential zones.' },
    { num: '3', title: 'SELECT DEFENSES', desc: 'Choose from Sandbags (cheap), Flood Walls (block), Pumps (extract), Drainage (conduct), and Wetlands (absorb).' },
    { num: '4', title: 'STRATEGIC PLACEMENT', desc: 'Click grid cells to place defenses before rainfall starts. Balance your ₹10,000 budget.' },
    { num: '5', title: 'MONITOR FLOOD SPREAD', desc: 'Watch real-time fluid simulation. Water flows from high elevation to low elevation and redirects around walls.' },
    { num: '6', title: 'RESPOND TO EMERGENCIES', desc: 'Handle blocked drains, power outages, and trapped resident rescue mini-missions.' },
    { num: '7', title: 'REVIEW WHAT-IF ENGINE', desc: 'After peak flood, review AI optimization suggestions and replay to improve your strategy.' }
  ];

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2>📖 HOW TO PLAY RIVER DEFENDER</h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={styles.stepList}>
          {steps.map(s => (
            <div key={s.num} style={styles.stepItem}>
              <div style={styles.numCircle}>{s.num}</div>
              <div style={styles.textCnt}>
                <span style={styles.stepTitle}>{s.title}</span>
                <span style={styles.stepDesc}>{s.desc}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.footer}>
          <button style={styles.confirmBtn} onClick={onClose}>Got It! Let's Defend</button>
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
    backdropFilter: 'blur(8px)',
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
    maxWidth: 540,
    padding: 24,
    color: '#f8fafc'
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  closeBtn: { background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer' },
  stepList: { display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 380, overflowY: 'auto', marginBottom: 20 },
  stepItem: {
    background: 'rgba(30, 41, 59, 0.8)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: 14
  },
  numCircle: {
    background: '#0284c7',
    color: '#fff',
    borderRadius: '50%',
    width: 32, height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '0.9rem'
  },
  textCnt: { display: 'flex', flexDirection: 'column' },
  stepTitle: { fontWeight: 'bold', fontSize: '0.9rem', color: '#38bdf8' },
  stepDesc: { color: '#cbd5e1', fontSize: '0.8rem', marginTop: 2 },
  footer: { display: 'flex', justifyContent: 'flex-end' },
  confirmBtn: { background: 'linear-gradient(135deg, #0284c7, #2563eb)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 10, fontWeight: 'bold', cursor: 'pointer' }
};

export default HowToPlayModal;

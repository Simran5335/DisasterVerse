import React, { useState, useEffect } from 'react';

const MemoryMapModal = ({ isOpen, onCountdownComplete, layout }) => {
  const [secondsLeft, setSecondsLeft] = useState(5);

  useEffect(() => {
    if (!isOpen) return;
    setSecondsLeft(5);

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onCountdownComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onCountdownComplete]);

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <span style={styles.badge}>MEMORIZE YOUR ROUTE</span>
          <h2 style={styles.title}>🏫 SCHOOL BUILDING BLUEPRINT</h2>
          <span style={styles.timerPill}>⏱️ STARTING IN {secondsLeft}S</span>
        </div>

        <p style={styles.instruction}>
          Study the building layout! When the fire starts in 5 seconds, visibility will decrease and you will need to rely on your memory.
        </p>

        {/* 2D BLUEPRINT MAP OVERVIEW */}
        <div style={styles.blueprintGrid}>
          {layout.rooms.map((room) => (
            <div
              key={room.id}
              style={{
                ...styles.roomBox,
                background: room.color || '#334155',
                gridColumn: `span ${Math.ceil(room.bounds.w / 3)}`
              }}
            >
              <span style={styles.roomName}>{room.name}</span>
            </div>
          ))}
        </div>

        <div style={styles.keyLegendRow}>
          <span>🟢 Exit A (Courtyard)</span>
          <span>🟢 Exit B (Emergency)</span>
          <span>🚪 Safe Doors</span>
          <span>🔥 Fire Origin (Staff Room)</span>
        </div>

        <button style={styles.startBtn} onClick={onCountdownComplete}>
          🚨 I HAVE MEMORIZED THE ROUTE - START NOW!
        </button>
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
    border: '2px solid #38bdf8',
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
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  badge: { color: '#38bdf8', fontSize: '0.78rem', fontWeight: 'bold', letterSpacing: '1px' },
  title: { fontSize: '1.3rem', fontWeight: 'bold', margin: '2px 0 0 0' },
  timerPill: { background: 'rgba(56, 189, 248, 0.2)', border: '1px solid #38bdf8', color: '#38bdf8', padding: '4px 12px', borderRadius: 12, fontWeight: 'bold', fontSize: '0.85rem' },
  instruction: { color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.4, margin: 0 },

  blueprintGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 10,
    background: '#1e293b',
    border: '1px dashed #38bdf8',
    borderRadius: 16,
    padding: 16,
    minHeight: 180
  },
  roomBox: {
    borderRadius: 10,
    padding: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255,255,255,0.2)'
  },
  roomName: { color: '#ffffff', fontWeight: 'bold', fontSize: '0.82rem', textAlign: 'center' },

  keyLegendRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8' },
  startBtn: {
    background: 'linear-gradient(135deg, #0284c7, #2563eb)',
    color: '#ffffff',
    border: 'none',
    padding: '12px',
    borderRadius: 12,
    fontWeight: 'bold',
    fontSize: '0.95rem',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(37,99,235,0.4)'
  }
};

export default MemoryMapModal;

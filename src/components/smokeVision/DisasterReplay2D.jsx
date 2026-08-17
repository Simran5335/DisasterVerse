import React, { useRef, useEffect } from 'react';

const DisasterReplay2D = ({ routeHistory, decisionLogs, onProceedToLearning }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !routeHistory || routeHistory.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Draw Top-down Map Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Draw Player Path Trajectory (Yellow/Green Line)
    const scaleX = w / 26;
    const scaleZ = h / 22;

    ctx.beginPath();
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 3;

    routeHistory.forEach((pt, i) => {
      const px = pt.x * scaleX;
      const pz = pt.z * scaleZ;
      if (i === 0) ctx.moveTo(px, pz);
      else ctx.lineTo(px, pz);
    });
    ctx.stroke();

    // Start Node (Blue)
    const startPt = routeHistory[0];
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(startPt.x * scaleX, startPt.z * scaleZ, 8, 0, Math.PI * 2);
    ctx.fill();

    // End Node (Green)
    const lastPt = routeHistory[routeHistory.length - 1];
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(lastPt.x * scaleX, lastPt.z * scaleZ, 9, 0, Math.PI * 2);
    ctx.fill();

  }, [routeHistory]);

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <span style={styles.badge}>POST-EVACUATION ANALYSIS</span>
          <h2 style={styles.title}>🗺️ 2D DISASTER ROUTE REPLAY</h2>
        </div>

        <div style={styles.replayBody}>
          <canvas ref={canvasRef} width={380} height={260} style={styles.canvas} />

          <div style={styles.logsBox}>
            <span style={styles.logTitle}>DECISION TIMELINE</span>
            <div style={styles.logsList}>
              {decisionLogs && decisionLogs.map((log, idx) => (
                <div key={idx} style={styles.logItem}>{log}</div>
              ))}
            </div>
          </div>
        </div>

        <button style={styles.nextBtn} onClick={onProceedToLearning}>
          🎓 CONTINUE TO "WHAT DID YOU LEARN?" SCREEN →
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
    zIndex: 90
  },
  modal: {
    background: '#0f172a',
    border: '2px solid #eab308',
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
  header: { display: 'flex', flexDirection: 'column' },
  badge: { color: '#eab308', fontSize: '0.78rem', fontWeight: 'bold', letterSpacing: '1px' },
  title: { fontSize: '1.3rem', fontWeight: 'bold', margin: '2px 0 0 0' },

  replayBody: { display: 'flex', gap: 16, alignItems: 'center' },
  canvas: { borderRadius: 14, border: '1px solid rgba(255,255,255,0.15)' },
  logsBox: { flex: 1, background: 'rgba(30, 41, 59, 0.7)', borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 8, height: 260 },
  logTitle: { color: '#f59e0b', fontSize: '0.78rem', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 4 },
  logsList: { display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto', fontSize: '0.76rem', color: '#cbd5e1' },
  logItem: { background: 'rgba(15, 23, 42, 0.6)', padding: '4px 8px', borderRadius: 6 },

  nextBtn: {
    background: 'linear-gradient(135deg, #0284c7, #2563eb)',
    color: '#ffffff',
    border: 'none',
    padding: '12px',
    borderRadius: 12,
    fontWeight: 'bold',
    fontSize: '0.95rem',
    cursor: 'pointer'
  }
};

export default DisasterReplay2D;

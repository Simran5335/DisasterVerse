import React, { useRef, useEffect } from 'react';

const MiniMap = ({ grid }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !grid) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const cols = grid.cols;
    const rows = grid.rows;

    const cellW = canvas.width / cols;
    const cellH = canvas.height / rows;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = grid.cells[r][c];

        let color = '#15803d'; // Default grass
        if (cell.isRiver) {
          color = '#1d4ed8';
        } else if (cell.waterDepth > 15) {
          color = '#2563eb';
        } else if (cell.waterDepth > 5) {
          color = '#38bdf8';
        } else if (cell.riskZone === 'EXTREME') {
          color = '#ef4444';
        } else if (cell.riskZone === 'HIGH') {
          color = '#f97316';
        } else if (cell.isEvacRoad) {
          color = '#475569';
        } else if (cell.height <= 3) {
          color = '#ca8a04';
        }

        ctx.fillStyle = color;
        ctx.fillRect(c * cellW, r * cellH, cellW, cellH);

        // Draw Building marker
        if (cell.building) {
          ctx.fillStyle = cell.building.type === 'hospital' ? '#ef4444' : '#eab308';
          ctx.fillRect(c * cellW + 1, r * cellH + 1, cellW - 2, cellH - 2);
        }

        // Draw Defense marker
        if (cell.defense) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(c * cellW + cellW / 2, r * cellH + cellH / 2, cellW / 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }, [grid]);

  return (
    <div style={styles.rightOverlayContainer}>
      {/* 1. MAP OVERVIEW (MINI-MAP) WITH LEGEND */}
      <div style={styles.mapCard}>
        <div style={styles.mapHeader}>MAP OVERVIEW</div>
        <canvas ref={canvasRef} width={150} height={110} style={styles.canvas} />
        
        {/* Risk Level Legend */}
        <div style={styles.legendContainer}>
          <div style={styles.legendItem}>
            <span style={{ ...styles.colorDot, background: '#ef4444' }}></span>
            <span>High Risk</span>
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.colorDot, background: '#eab308' }}></span>
            <span>Medium Risk</span>
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.colorDot, background: '#f97316' }}></span>
            <span>Low Risk</span>
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.colorDot, background: '#3b82f6' }}></span>
            <span>Safe Zone</span>
          </div>
        </div>
      </div>

      {/* 2. RIVER DEFENDER REPORT CARD */}
      <div style={styles.reportCard}>
        <div style={styles.reportHeader}>RIVER DEFENDER REPORT</div>
        <div style={styles.reportContentRow}>
          <div style={styles.metricsCol}>
            <div style={styles.metricRow}>
              <span style={styles.metricLabel}>Buildings Saved</span>
              <span style={styles.metricVal}>82%</span>
            </div>
            <div style={styles.metricRow}>
              <span style={styles.metricLabel}>Water Managed</span>
              <span style={styles.metricVal}>76%</span>
            </div>
            <div style={styles.metricRow}>
              <span style={styles.metricLabel}>Budget Used</span>
              <span style={styles.metricVal}>₹7,250</span>
            </div>
            <div style={styles.scoreRow}>
              <span style={styles.scoreLabel}>Score</span>
              <span style={styles.scoreVal}>8,650</span>
            </div>
          </div>

          {/* Grade A Badge */}
          <div style={styles.gradeBadgeContainer}>
            <div style={styles.gradeBadge}>A</div>
            <span style={styles.gradeText}>Great Job!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  rightOverlayContainer: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    zIndex: 20,
    pointerEvents: 'auto'
  },
  mapCard: {
    background: 'rgba(15, 23, 42, 0.92)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    backdropFilter: 'blur(12px)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
    width: 220
  },
  mapHeader: {
    fontSize: '0.74rem',
    fontWeight: 'bold',
    color: '#cbd5e1',
    width: '100%',
    textAlign: 'left',
    letterSpacing: '0.8px'
  },
  canvas: {
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.1)'
  },
  legendContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '3px 8px',
    width: '100%',
    paddingTop: 4,
    fontSize: '0.62rem',
    color: '#94a3b8'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 4
  },
  colorDot: {
    width: 7,
    height: 7,
    borderRadius: 2
  },

  // Report Card
  reportCard: {
    background: 'rgba(15, 23, 42, 0.92)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    backdropFilter: 'blur(12px)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
    width: 220
  },
  reportHeader: {
    fontSize: '0.74rem',
    fontWeight: 'bold',
    color: '#cbd5e1',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    paddingBottom: 4,
    letterSpacing: '0.8px'
  },
  reportContentRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  metricsCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    flex: 1
  },
  metricRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.66rem'
  },
  metricLabel: { color: '#94a3b8' },
  metricVal: { color: '#f8fafc', fontWeight: 'bold' },
  scoreRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.78rem',
    marginTop: 2
  },
  scoreLabel: { color: '#22c55e', fontWeight: 'bold' },
  scoreVal: { color: '#22c55e', fontWeight: 'bold' },

  gradeBadgeContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8
  },
  gradeBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: 'rgba(34, 197, 94, 0.25)',
    border: '2px solid #22c55e',
    color: '#22c55e',
    fontSize: '1.4rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 12px rgba(34, 197, 94, 0.4)'
  },
  gradeText: {
    fontSize: '0.58rem',
    color: '#22c55e',
    fontWeight: 'bold',
    marginTop: 2
  }
};

export default MiniMap;

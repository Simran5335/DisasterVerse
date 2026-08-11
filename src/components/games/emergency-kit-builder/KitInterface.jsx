import React, { useState } from 'react';
import ItemCard from './ItemCard';
import { ITEMS_CONFIG } from './config';

export default function KitInterface() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [evaluation, setEvaluation] = useState(null);

  const handleToggle = (id) => {
    if (evaluation) return;
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (selectedIds.length === 0) return;

    const totalEssentials = ITEMS_CONFIG.filter(item => item.isEssential).length;
    let selectedEssentialsCount = 0;
    let selectedUnnecessaryCount = 0;
    
    const feedback = [];
    const selectedSet = new Set(selectedIds);
    
    for (const id of selectedIds) {
       const itemDef = ITEMS_CONFIG.find(i => i.id === id);
       if (itemDef) {
         if (itemDef.isEssential) {
           selectedEssentialsCount++;
         } else {
           selectedUnnecessaryCount++;
         }
         feedback.push({
           itemId: itemDef.id,
           isCorrect: itemDef.isEssential,
           explanation: itemDef.explanation
         });
       }
    }
    
    const missingEssentials = ITEMS_CONFIG
      .filter(item => item.isEssential && !selectedSet.has(item.id))
      .map(item => item.id);

    const pointsPerEssential = 100 / totalEssentials;
    const penaltyPerUnnecessary = 20;

    const rawScore = (selectedEssentialsCount * pointsPerEssential) - (selectedUnnecessaryCount * penaltyPerUnnecessary);
    const finalScore = Math.max(0, Math.min(100, Math.round(rawScore)));
    const xpEarned = Math.round((finalScore / 100) * 150);

    setEvaluation({
      score: finalScore,
      xpEarned,
      feedback,
      missingEssentials
    });
  };

  const handleRebuild = () => {
    setSelectedIds([]);
    setEvaluation(null);
  };

  const selectedItems = selectedIds.map(id => ITEMS_CONFIG.find(item => item.id === id)).filter(Boolean);

  return (
    <div style={styles.gridContainer}>
      {/* LEFT: Items List */}
      <div style={styles.leftCol}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🎒 Available Emergency Gear</h2>
          <p style={styles.cardSubtitle}>Select essential survival items for your 72-hour emergency pack.</p>
          
          <div style={styles.itemsGrid}>
            {ITEMS_CONFIG.map(item => (
              <ItemCard
                key={item.id}
                id={item.id}
                name={item.name}
                icon={item.icon}
                description={item.description}
                isSelected={selectedIds.includes(item.id)}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: Backpack */}
      <div style={styles.rightCol}>
        <div style={styles.packCard}>
          <div style={styles.packHeader}>
            <h3 style={{ margin: 0, fontSize: '14px' }}>YOUR EMERGENCY BACKPACK</h3>
            <span style={styles.itemCountPill}>{selectedIds.length} ITEMS PACKED</span>
          </div>

          <div style={styles.packBody}>
            {selectedIds.length === 0 ? (
              <div style={styles.emptyState}>
                <span style={{ fontSize: '48px', opacity: 0.3 }}>🎒</span>
                <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '10px' }}>Your backpack is empty. Click items on the left to pack them.</p>
              </div>
            ) : (
              <div style={styles.packedGrid}>
                {selectedItems.map(item => (
                  <div key={item.id} style={styles.packedItemBadge}>
                    <span style={{ fontSize: '20px' }}>{item.icon}</span>
                    <span style={styles.packedItemName}>{item.name}</span>
                  </div>
                ))}
              </div>
            )}

            {/* EVALUATION MODAL */}
            {evaluation && (
              <div style={styles.evalOverlay}>
                <div style={styles.evalBox}>
                  <div style={styles.evalHeader}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '20px', color: '#fff' }}>Kit Evaluation</h3>
                      <span style={{ fontSize: '12px', color: '#4ade80' }}>Score calculated based on disaster preparedness standard</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#06b6d4' }}>{evaluation.score}/100</span>
                      <span style={{ display: 'block', fontSize: '11px', color: '#fbbf24', fontWeight: 'bold' }}>+{evaluation.xpEarned} XP</span>
                    </div>
                  </div>

                  <div style={styles.evalFeedbackList}>
                    <h4 style={{ margin: '15px 0 10px 0', fontSize: '13px', color: '#fca5a5' }}>Feedback Details:</h4>
                    {evaluation.feedback.map(fb => {
                      const item = ITEMS_CONFIG.find(i => i.id === fb.itemId);
                      return (
                        <div key={fb.itemId} style={{ ...styles.feedbackRow, borderColor: fb.isCorrect ? '#10b981' : '#f87171' }}>
                          <span style={{ fontSize: '18px' }}>{item?.icon}</span>
                          <div>
                            <strong style={{ color: fb.isCorrect ? '#4ade80' : '#f87171', fontSize: '13px' }}>{item?.name}: {fb.isCorrect ? 'Correct Choice ✓' : 'Non-essential ✕'}</strong>
                            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#d1d5db' }}>{fb.explanation}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button onClick={handleRebuild} style={styles.rebuildBtn}>
                    Rebuild Kit & Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <button 
          disabled={selectedIds.length === 0 || evaluation !== null}
          onClick={handleSubmit}
          style={{
            ...styles.submitBtn,
            opacity: (selectedIds.length === 0 || evaluation !== null) ? 0.5 : 1,
            cursor: (selectedIds.length === 0 || evaluation !== null) ? 'not-allowed' : 'pointer'
          }}
        >
          {evaluation ? "Evaluation Complete" : selectedIds.length === 0 ? "Select items to begin" : "Submit Kit for Evaluation"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  leftCol: { display: 'flex', flexDirection: 'column' },
  rightCol: { display: 'flex', flexDirection: 'column', gap: '20px' },
  card: {
    backgroundColor: '#161211',
    border: '1px solid #241e1c',
    padding: '24px',
    borderRadius: '16px',
  },
  cardTitle: { fontSize: '18px', margin: '0 0 4px 0', color: '#fca5a5' },
  cardSubtitle: { fontSize: '12px', color: '#9ca3af', margin: '0 0 16px 0' },
  itemsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' },
  packCard: {
    backgroundColor: '#161211',
    border: '1px solid #241e1c',
    borderRadius: '16px',
    overflow: 'hidden',
    height: '460px',
    display: 'flex',
    flexDirection: 'column',
  },
  packHeader: {
    padding: '12px 20px',
    backgroundColor: '#1f1a18',
    borderBottom: '1px solid #2a2422',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemCountPill: { fontSize: '10px', color: '#06b6d4', fontWeight: 'bold', backgroundColor: 'rgba(6,182,212,0.15)', padding: '2px 8px', borderRadius: '4px' },
  packBody: { position: 'relative', flex: 1, backgroundColor: '#0f0d0c', padding: '20px', overflowY: 'auto' },
  emptyState: { height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyCenter: 'center', textAlign: 'center' },
  packedGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' },
  packedItemBadge: {
    backgroundColor: '#1f1a18',
    border: '1px solid #2a2422',
    padding: '10px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  packedItemName: { fontSize: '11px', marginTop: '4px', fontWeight: 'bold', color: '#d1d5db' },
  evalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    zIndex: 50,
    padding: '20px',
    overflowY: 'auto',
  },
  evalBox: {
    backgroundColor: '#161211',
    border: '1px solid #241e1c',
    padding: '20px',
    borderRadius: '14px',
  },
  evalHeader: { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2a2422', paddingBottom: '12px' },
  evalFeedbackList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  feedbackRow: {
    backgroundColor: '#1f1a18',
    borderLeft: '4px solid',
    padding: '10px 14px',
    borderRadius: '8px',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  rebuildBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#06b6d4',
    color: '#0f0d0c',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '15px',
  },
  submitBtn: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#06b6d4',
    color: '#0f0d0c',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
  }
};

import React, { useState, useMemo } from 'react';
import ItemCard from './ItemCard';
import FirstAidKitBox from './FirstAidKitBox';
import SmileyBuddy from './SmileyBuddy';
import { ITEMS_CONFIG, MAX_KIT_CAPACITY } from './config';
import '../../../styles/EmergencyKitBuilder.css';

export default function KitInterface() {
  const [isLidOpen, setIsLidOpen] = useState(false);
  const [packedIds, setPackedIds] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [feedbackText, setFeedbackText] = useState('');
  const [smileyAnim, setSmileyAnim] = useState('');
  const [evaluation, setEvaluation] = useState(null);

  // Filter items by active tab
  const filteredItems = useMemo(() => {
    if (activeTab === 'essential') {
      return ITEMS_CONFIG.filter(i => i.isEssential);
    }
    if (activeTab === 'distractor') {
      return ITEMS_CONFIG.filter(i => !i.isEssential);
    }
    return ITEMS_CONFIG;
  }, [activeTab]);

  // Packed items object list
  const packedItems = useMemo(() => {
    return packedIds
      .map(id => ITEMS_CONFIG.find(item => item.id === id))
      .filter(Boolean);
  }, [packedIds]);

  // Calculate dynamic smiley emotion state
  const smileyState = useMemo(() => {
    if (packedItems.length === 0) return 'neutral';
    
    const distractorsCount = packedItems.filter(item => !item.isEssential).length;
    const essentialsCount = packedItems.filter(item => item.isEssential).length;

    if (distractorsCount >= 2) return 'sad';
    if (distractorsCount === 1) return 'concerned';
    if (essentialsCount >= 4) return 'super_happy';
    return 'happy';
  }, [packedItems]);

  // Trigger brief micro-animation on smiley buddy
  const triggerSmileyAnim = (animType) => {
    setSmileyAnim(animType);
    setTimeout(() => {
      setSmileyAnim('');
    }, 600);
  };

  // Toggle Lid Open/Close
  const handleToggleLid = () => {
    const nextState = !isLidOpen;
    setIsLidOpen(nextState);
    if (nextState) {
      setFeedbackText('First Aid Kit opened! Drag or tap supplies to pack them into the tray.');
      triggerSmileyAnim('bounce');
    } else {
      setFeedbackText('First Aid Kit lid closed. All packed supplies remain safely stored inside!');
    }
  };

  // Add Item to Kit Tray
  const handleAddItem = (id, targetIndex = null) => {
    if (evaluation) return;

    if (packedIds.includes(id)) {
      setFeedbackText('This item is already packed inside the kit tray!');
      return;
    }

    if (packedIds.length >= MAX_KIT_CAPACITY) {
      setFeedbackText(`The First Aid Kit is full! (Max ${MAX_KIT_CAPACITY} items). Remove an item to make space.`);
      triggerSmileyAnim('shake');
      return;
    }

    // Auto-open lid if closed when user selects an item
    if (!isLidOpen) {
      setIsLidOpen(true);
    }

    const itemDef = ITEMS_CONFIG.find(i => i.id === id);
    let nextPacked = [...packedIds];

    if (targetIndex !== null && targetIndex >= 0 && targetIndex < MAX_KIT_CAPACITY) {
      if (nextPacked[targetIndex]) {
        nextPacked = nextPacked.filter(i => i !== id);
        nextPacked.splice(targetIndex, 0, id);
      } else {
        nextPacked.push(id);
      }
    } else {
      nextPacked.push(id);
    }

    setPackedIds(nextPacked);

    if (itemDef) {
      if (itemDef.isEssential) {
        setFeedbackText(`Great choice! ${itemDef.name} is an essential first-aid item.`);
        triggerSmileyAnim('bounce');
      } else {
        setFeedbackText(`Hmm! ${itemDef.name} isn't a priority for emergency medical care.`);
        triggerSmileyAnim('shake');
      }
    }
  };

  // Remove Item from Kit Tray
  const handleRemoveItem = (id) => {
    if (evaluation) return;

    const itemDef = ITEMS_CONFIG.find(i => i.id === id);
    setPackedIds(prev => prev.filter(i => i !== id));
    
    if (itemDef) {
      setFeedbackText(`Removed ${itemDef.name} from the tray.`);
      triggerSmileyAnim('bounce');
    }
  };

  // Submit Kit for Evaluation
  const handleSubmit = () => {
    if (packedIds.length === 0) return;

    const totalEssentials = ITEMS_CONFIG.filter(item => item.isEssential).length;
    let selectedEssentialsCount = 0;
    let selectedUnnecessaryCount = 0;

    const feedback = [];
    const packedSet = new Set(packedIds);

    for (const id of packedIds) {
      const itemDef = ITEMS_CONFIG.find(i => i.id === id);
      if (itemDef) {
        if (itemDef.isEssential) {
          selectedEssentialsCount++;
        } else {
          selectedUnnecessaryCount++;
        }
        feedback.push({
          itemId: itemDef.id,
          name: itemDef.name,
          icon: itemDef.icon,
          isCorrect: itemDef.isEssential,
          explanation: itemDef.explanation
        });
      }
    }

    const missingEssentials = ITEMS_CONFIG
      .filter(item => item.isEssential && !packedSet.has(item.id))
      .map(item => item.name);

    const pointsPerEssential = 100 / totalEssentials;
    const penaltyPerUnnecessary = 15;

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

  // Reset/Rebuild Kit
  const handleRebuild = () => {
    setPackedIds([]);
    setEvaluation(null);
    setFeedbackText('First Aid Kit reset. Select supplies to start fresh!');
    triggerSmileyAnim('bounce');
  };

  return (
    <div className="kit-builder-layout">
      {/* --------------------------------------------------------------------------
          LEFT PANEL: Available First Aid Supplies & Distractor Items
          -------------------------------------------------------------------------- */}
      <div className="supplies-card">
        <div className="supplies-header">
          <h2 className="supplies-title">🎒 Available Supplies</h2>
          <p className="supplies-subtitle">Drag supplies or tap "+ Pack" to place inside the kit tray.</p>
        </div>

        {/* Category Filters */}
        <div className="category-tabs">
          <button
            className={`category-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Items ({ITEMS_CONFIG.length})
          </button>
          <button
            className={`category-tab ${activeTab === 'essential' ? 'active' : ''}`}
            onClick={() => setActiveTab('essential')}
          >
            Essential (Medical)
          </button>
          <button
            className={`category-tab ${activeTab === 'distractor' ? 'active' : ''}`}
            onClick={() => setActiveTab('distractor')}
          >
            Extra / Toys
          </button>
        </div>

        {/* Items List Grid */}
        <div className="items-grid">
          {filteredItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              isPacked={packedIds.includes(item.id)}
              onAddItem={handleAddItem}
              onDragStart={(id) => {
                if (!isLidOpen) setIsLidOpen(true);
              }}
            />
          ))}
        </div>
      </div>

      {/* --------------------------------------------------------------------------
          CENTER PANEL: REALISTIC 3D FIRST AID KIT WITH ANIMATED LID & INTERNAL TRAY
          -------------------------------------------------------------------------- */}
      <div className="kit-center-panel">
        <FirstAidKitBox
          isOpen={isLidOpen}
          onToggleLid={handleToggleLid}
          packedItems={packedItems}
          onDropItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
        />
      </div>

      {/* --------------------------------------------------------------------------
          RIGHT PANEL: CUTE SMILEY BUDDY, CAPACITY GAUGE, & EVALUATION
          -------------------------------------------------------------------------- */}
      <div className="kit-right-panel">
        {/* Animated Smiley Character */}
        <SmileyBuddy
          state={smileyState}
          feedbackText={feedbackText}
          animClass={smileyAnim}
        />

        {/* Capacity Gauge */}
        <div className="capacity-gauge-card">
          <div className="gauge-header">
            <span className="gauge-title">Kit Capacity</span>
            <span className="gauge-count">
              {packedIds.length} / {MAX_KIT_CAPACITY} Slots
            </span>
          </div>
          <div className="gauge-bar-bg">
            <div
              className={`gauge-bar-fill ${packedIds.length >= MAX_KIT_CAPACITY ? 'full' : ''}`}
              style={{ width: `${(packedIds.length / MAX_KIT_CAPACITY) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Submit Kit for Evaluation */}
        <button
          className="submit-kit-btn"
          disabled={packedIds.length === 0 || evaluation !== null}
          onClick={handleSubmit}
        >
          {evaluation ? 'Evaluation Complete' : packedIds.length === 0 ? 'Pack Kit to Evaluate' : 'Submit Kit for Evaluation'}
        </button>
      </div>

      {/* --------------------------------------------------------------------------
          EVALUATION RESULTS MODAL
          -------------------------------------------------------------------------- */}
      {evaluation && (
        <div style={evalStyles.overlay}>
          <div style={evalStyles.modalBox}>
            <div style={evalStyles.header}>
              <div>
                <h3 style={{ margin: 0, fontSize: '22px', color: '#fff' }}>Kit Preparedness Evaluation</h3>
                <span style={{ fontSize: '12px', color: '#4ade80' }}>Based on official disaster first-aid standards</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '36px', fontWeight: 'bold', color: '#06b6d4' }}>{evaluation.score}/100</span>
                <span style={{ display: 'block', fontSize: '12px', color: '#fbbf24', fontWeight: 'bold' }}>+{evaluation.xpEarned} XP</span>
              </div>
            </div>

            {/* Item-by-item breakdown */}
            <div style={evalStyles.feedbackList}>
              <h4 style={{ margin: '16px 0 10px 0', fontSize: '14px', color: '#fca5a5' }}>Items Evaluated in Kit:</h4>
              {evaluation.feedback.map((fb, idx) => (
                <div
                  key={idx}
                  style={{
                    ...evalStyles.feedbackRow,
                    borderColor: fb.isCorrect ? '#10b981' : '#f87171',
                    background: fb.isCorrect ? 'rgba(16, 185, 129, 0.08)' : 'rgba(248, 113, 113, 0.08)'
                  }}
                >
                  <span style={{ fontSize: '22px' }}>{fb.icon}</span>
                  <div>
                    <strong style={{ color: fb.isCorrect ? '#4ade80' : '#f87171', fontSize: '13px' }}>
                      {fb.name}: {fb.isCorrect ? 'Essential Supply ✓' : 'Unnecessary Distractor ✕'}
                    </strong>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#d1d5db', lineHeight: 1.4 }}>
                      {fb.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Missing essential items recommendation */}
            {evaluation.missingEssentials.length > 0 && (
              <div style={evalStyles.missingBox}>
                <h5 style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#fbbf24' }}>💡 Missing Key Supplies:</h5>
                <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', lineHeight: 1.4 }}>
                  Consider adding: {evaluation.missingEssentials.slice(0, 5).join(', ')}.
                </p>
              </div>
            )}

            <button onClick={handleRebuild} style={evalStyles.rebuildBtn}>
              🔄 Rebuild Kit & Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const evalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(6px)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  modalBox: {
    backgroundColor: '#161211',
    border: '1px solid #29221f',
    padding: '24px',
    borderRadius: '20px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '85vh',
    overflowY: 'auto',
    boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #2a2422',
    paddingBottom: '16px'
  },
  feedbackList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  feedbackRow: {
    padding: '12px 16px',
    borderRadius: '12px',
    borderLeft: '4px solid',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start'
  },
  missingBox: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    border: '1px solid rgba(251, 191, 36, 0.25)',
    borderRadius: '10px',
    padding: '12px',
    marginTop: '16px'
  },
  rebuildBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#06b6d4',
    color: '#0d0b0a',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '800',
    cursor: 'pointer',
    marginTop: '20px'
  }
};

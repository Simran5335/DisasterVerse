import React, { useState } from 'react';
import { MAX_KIT_CAPACITY } from './config';

export default function FirstAidKitBox({
  isOpen,
  onToggleLid,
  packedItems,
  onDropItem,
  onRemoveItem
}) {
  const [isDragOverTray, setIsDragOverTray] = useState(false);
  const [dragOverSlotIndex, setDragOverSlotIndex] = useState(null);

  const handleDragOver = (e, index = null) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOverTray) setIsDragOverTray(true);
    if (index !== null && dragOverSlotIndex !== index) {
      setDragOverSlotIndex(index);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOverTray(false);
    setDragOverSlotIndex(null);
  };

  const handleDrop = (e, targetIndex = null) => {
    e.preventDefault();
    setIsDragOverTray(false);
    setDragOverSlotIndex(null);
    const itemId = e.dataTransfer.getData('text/plain');
    if (itemId) {
      onDropItem(itemId, targetIndex);
    }
  };

  // Generate slots for the internal tray (MAX_KIT_CAPACITY total slots)
  const slots = Array.from({ length: MAX_KIT_CAPACITY }, (_, i) => {
    const item = packedItems[i] || null;
    return { index: i, item };
  });

  return (
    <div className="kit-3d-wrapper">
      <div className="first-aid-box">
        {/* Top Handle */}
        <div className="box-handle">
          <div className="box-handle-inner"></div>
        </div>

        {/* Side Metal Latches */}
        <div className="box-latch left"></div>
        <div className="box-latch right"></div>

        {/* Top Hinge Bar */}
        <div className="box-hinge-bar">
          <div className="box-hinge"></div>
          <div className="box-hinge"></div>
        </div>

        {/* --------------------------------------------------------------------------
            INTERACTIVE MAIN LID (3D ANIMATED)
            -------------------------------------------------------------------------- */}
        <div
          className={`box-lid ${isOpen ? 'open' : ''}`}
          onClick={!isOpen ? onToggleLid : undefined}
          title={isOpen ? '' : 'Click to Open First Aid Kit Lid'}
        >
          <div className="lid-front-content">
            <div className="medical-cross-badge">
              <div className="medical-cross-symbol"></div>
            </div>
            <h3 className="lid-title">First Aid Kit</h3>
            <p className="lid-subtitle">Compact Portable Medical Emergency Kit</p>
            <button
              type="button"
              className="open-lid-btn"
              onClick={(e) => {
                e.stopPropagation();
                onToggleLid();
              }}
            >
              🔓 Tap / Click Lid to Open
            </button>
          </div>
        </div>

        {/* --------------------------------------------------------------------------
            INTERNAL THIN PLATE / TRAY (VISIBLE WHEN LID IS OPEN)
            -------------------------------------------------------------------------- */}
        <div className="internal-kit-container">
          <div className="tray-top-bar">
            <span className="tray-label">
              🧰 Internal Supply Tray ({packedItems.length} / {MAX_KIT_CAPACITY})
            </span>
            <button
              type="button"
              className="close-lid-toggle-btn"
              onClick={onToggleLid}
            >
              🔒 Close Lid
            </button>
          </div>

          <div
            className={`internal-tray ${isDragOverTray ? 'drag-over' : ''}`}
            onDragOver={(e) => handleDragOver(e)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e)}
          >
            <div className="tray-compartments-grid">
              {slots.map(({ index, item }) => (
                <div
                  key={index}
                  className={`tray-slot ${item ? 'filled' : ''} ${dragOverSlotIndex === index ? 'target-active' : ''}`}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  {item ? (
                    <div className="placed-item-tile">
                      <div className="placed-item-info">
                        <span className="placed-item-icon">{item.icon}</span>
                        <span className="placed-item-name">{item.name}</span>
                      </div>
                      <button
                        type="button"
                        className="remove-item-btn"
                        onClick={() => onRemoveItem(item.id)}
                        title="Remove item from kit tray"
                      >
                        ✖
                      </button>
                    </div>
                  ) : (
                    <div className="empty-slot-placeholder">
                      <span>+</span> Drop Item Here
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

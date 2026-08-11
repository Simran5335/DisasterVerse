import React from 'react';

export default function ItemCard({ item, isPacked, onAddItem, onDragStart }) {
  const handleDragStart = (e) => {
    if (isPacked) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'copy';
    if (onDragStart) {
      onDragStart(item.id);
    }
  };

  return (
    <div
      className={`item-card ${isPacked ? 'packed' : ''}`}
      draggable={!isPacked}
      onDragStart={handleDragStart}
      title={isPacked ? 'Already inside First Aid Kit' : 'Drag or click to pack inside kit'}
    >
      <div className="item-card-icon-wrapper">
        <span>{item.icon}</span>
      </div>

      <div className="item-card-details">
        <h4 className="item-card-title">{item.name}</h4>
        <p className="item-card-desc">{item.description}</p>
      </div>

      <button
        type="button"
        className={`item-action-btn ${isPacked ? 'packed' : 'add'}`}
        onClick={() => !isPacked && onAddItem(item.id)}
        disabled={isPacked}
      >
        {isPacked ? 'Packed ✓' : '+ Pack'}
      </button>
    </div>
  );
}

import React from 'react';

export default function ItemCard({ id, name, icon, description, isSelected, onToggle }) {
  return (
    <div
      onClick={() => onToggle(id)}
      style={{
        ...styles.card,
        ...(isSelected ? styles.cardSelected : {})
      }}
    >
      <div style={styles.header}>
        <span style={styles.icon}>{icon}</span>
        <span style={{ ...styles.title, color: isSelected ? '#06b6d4' : '#fff' }}>{name}</span>
      </div>
      <p style={styles.desc}>{description}</p>
      <div style={{ ...styles.checkBadge, opacity: isSelected ? 1 : 0 }}>
        ✓ Selected
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#1f1a18',
    border: '1px solid #2a2422',
    borderRadius: '12px',
    padding: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cardSelected: {
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    borderColor: '#06b6d4',
  },
  header: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' },
  icon: { fontSize: '24px' },
  title: { fontWeight: 'bold', fontSize: '13px' },
  desc: { fontSize: '11px', color: '#9ca3af', margin: '0 0 10px 0', lineHeight: 1.4 },
  checkBadge: { fontSize: '11px', color: '#06b6d4', fontWeight: 'bold', alignSelf: 'flex-end' },
};

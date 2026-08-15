import React, { useState } from 'react';

const FlipCard = ({ title, imageSrc, protocols }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div style={styles.cardWrapper} onClick={() => setIsFlipped(!isFlipped)}>
      <div style={{ ...styles.cardInner, transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
        
        {/* FRONT OF CARD */}
        <div style={styles.cardFront}>
          <img 
            src={imageSrc} 
            alt={title} 
            style={styles.cardImg} 
            onError={(e)=>{e.target.src='https://images.unsplash.com/photo-1613545325278-f24b0cae1224?auto=format&fit=crop&w=600&q=80'}} 
          />
          <div style={styles.cardFrontText}>
            <h3 style={{ margin: '0 0 4px 0', color: '#fff', fontSize: '15px' }}>{title}</h3>
            <p style={{ margin: 0, fontSize: '11px', color: '#fca5a5' }}>Click card to flip & view protocols 🔄</p>
          </div>
        </div>

        {/* BACK OF CARD */}
        <div style={styles.cardBack}>
          <h3 style={{ margin: '0 0 8px 0', color: '#fca5a5', borderBottom: '1px solid #2a2422', paddingBottom: '4px', fontSize: '14px' }}>{title}</h3>
          
          <div style={styles.protocolsScrollArea}>
            {protocols.map((section, idx) => (
              <div key={idx} style={{ marginBottom: '6px' }}>
                <h4 style={{ margin: '0 0 2px 0', color: section.color, fontSize: '11px' }}>{section.stage}</h4>
                <ul style={{ margin: 0, paddingLeft: '12px', fontSize: '10px', color: '#d1d5db', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                  {section.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <span style={{ fontSize: '9px', color: '#9ca3af', display: 'block', textAlign: 'center', marginTop: '4px' }}>Click to flip back 🔄</span>
        </div>

      </div>
    </div>
  );
};

const styles = {
  cardWrapper: {
    width: '100%',
    height: '380px',
    perspective: '1000px',
    cursor: 'pointer',
  },
  cardInner: {
    position: 'relative',
    width: '100%',
    height: '100%',
    textAlign: 'left',
    transition: 'transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)',
    transformStyle: 'preserve-3d',
    borderRadius: '16px',
  },
  cardFront: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    backgroundColor: '#1f1a18',
    border: '1px solid #2a2422',
    borderRadius: '16px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  cardImg: {
    width: '100%',
    height: '220px',
    objectFit: 'cover',
  },
  cardFrontText: {
    padding: '12px',
    textAlign: 'center',
  },
  cardBack: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    backgroundColor: '#1f1a18',
    border: '1px solid #dc2626',
    borderRadius: '16px',
    padding: '14px',
    transform: 'rotateY(180deg)',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  protocolsScrollArea: {
    flex: 1,
    overflowY: 'auto',
    paddingRight: '4px',
  },
};

export default FlipCard;
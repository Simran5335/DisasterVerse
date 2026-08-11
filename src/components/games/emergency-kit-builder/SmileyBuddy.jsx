import React from 'react';

export default function SmileyBuddy({ state, feedbackText, animClass }) {
  const getEmotionDetails = () => {
    switch (state) {
      case 'super_happy':
        return { title: 'Super Excited! 😄', color: '#4ade80' };
      case 'happy':
        return { title: 'Happy Buddy 😊', color: '#06b6d4' };
      case 'concerned':
        return { title: 'Slightly Concerned 😐', color: '#fbbf24' };
      case 'sad':
        return { title: 'Sad Buddy 😢', color: '#f87171' };
      default:
        return { title: 'First Aid Buddy 🙂', color: '#9ca3af' };
    }
  };

  const details = getEmotionDetails();

  return (
    <div className="smiley-buddy-card">
      <div className="smiley-character-wrapper">
        <div className={`smiley-head ${state} ${animClass || ''}`}>
          {/* Eyes */}
          <div className="smiley-eyes">
            <div className="smiley-eye"></div>
            <div className="smiley-eye"></div>
          </div>
          {/* Cheeks */}
          <div className="smiley-cheeks">
            <div className="smiley-cheek"></div>
            <div className="smiley-cheek"></div>
          </div>
          {/* Mouth */}
          <div className="smiley-mouth"></div>
        </div>
      </div>

      <div className="smiley-status-text" style={{ color: details.color }}>
        {details.title}
      </div>

      <p className="smiley-feedback-toast">
        {feedbackText || "Open the First Aid Kit lid & pack essential supplies into the tray!"}
      </p>
    </div>
  );
}

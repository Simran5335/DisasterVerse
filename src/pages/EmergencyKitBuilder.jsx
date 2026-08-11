import React from 'react';
import { useNavigate } from 'react-router-dom';
import KitInterface from '../components/games/emergency-kit-builder/KitInterface';
import '../styles/GamePages.css';

export default function EmergencyKitBuilder() {
  const navigate = useNavigate();

  return (
    <div className="game-page">
      <header className="game-header">
        <div className="game-header-container">
          <div>
            <span className="game-category-kit">Preparedness Drill</span>
            <h1 className="game-title">Emergency Kit Builder</h1>
            <p className="game-subtitle">Prioritize essential survival supplies and build a 72-hour disaster emergency kit.</p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="game-exit-btn">
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <main className="game-main">
        <KitInterface />
      </main>
    </div>
  );
}


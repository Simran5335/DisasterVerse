import React from 'react';
import { useNavigate } from 'react-router-dom';
import BuildInterface from '../components/games/earthquake-balance-builder/BuildInterface';
import '../styles/GamePages.css';

export default function EarthquakeBuilder() {
  const navigate = useNavigate();

  return (
    <div className="game-page">
      <header className="game-header">
        <div className="game-header-container">
          <div>
            <span className="game-category-earthquake">Safety Training Simulation</span>
            <h1 className="game-title">Earthquake Balance Builder</h1>
            <p className="game-subtitle">Select structural materials and test your building resilience against seismic magnitude waves.</p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="game-exit-btn">
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <main className="game-main">
        <BuildInterface />
      </main>
    </div>
  );
}


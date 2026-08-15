import React from "react";
import { useNavigate } from "react-router-dom";
import MountainScoutGame from "../components/games/mountain-scout/MountainScoutGame";
import "../styles/GamePages.css";

export default function MountainScout() {
  const navigate = useNavigate();

  return (
    <div className="game-page">
      <header className="game-header">
        <div className="game-header-container">
          <div>
            <span className="game-category-earthquake" style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              Landslide Hazard Recognition
            </span>
            <h1 className="game-title">Mountain Scout — Landslide Warning Signs</h1>
            <p className="game-subtitle">
              Inspect the mountain village landscape to identify 6 early warning signs of landslides before time runs out!
            </p>
          </div>
          <button onClick={() => navigate("/dashboard")} className="game-exit-btn">
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <main className="game-main">
        <MountainScoutGame />
      </main>
    </div>
  );
}

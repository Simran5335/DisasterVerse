import React from "react";
import { useNavigate } from "react-router-dom";
import MountainScoutGame from "../components/games/mountain-scout/MountainScoutGame";
import "../styles/GamePages.css";

export default function MountainScout() {
  const navigate = useNavigate();

  return (
    <div className="game-page" style={{ backgroundColor: "#090d16", minHeight: "100vh", padding: "20px" }}>
      <header className="game-header" style={{ maxWidth: "1200px", margin: "0 auto 16px auto", padding: "12px 20px", background: "#0f172a", borderRadius: "16px", border: "1px solid #1e293b" }}>
        <div className="game-header-container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span className="game-category-earthquake" style={{ backgroundColor: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", padding: "3px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "800" }}>
              Landslide Hazard Recognition
            </span>
            <h1 className="game-title" style={{ fontSize: "20px", fontWeight: "900", margin: "4px 0 2px 0", color: "#f8fafc" }}>
              🏔️ Mountain Scout — Landslide Warning Signs
            </h1>
            <p className="game-subtitle" style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>
              Inspect the mountain landscape to identify early warning signs of slope instability.
            </p>
          </div>
          <button onClick={() => navigate("/dashboard")} className="game-exit-btn" style={{ background: "#1e293b", border: "1px solid #334155", color: "#cbd5e1", padding: "8px 16px", borderRadius: "12px", fontSize: "12px", fontWeight: "800", cursor: "pointer" }}>
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <main className="game-main" style={{ width: "100%" }}>
        <MountainScoutGame />
      </main>
    </div>
  );
}

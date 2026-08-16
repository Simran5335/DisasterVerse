import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import HazardSpotter from "./pages/HazardSpotter";
import EarthquakeBuilder from "./pages/EarthquakeBuilder";
import EmergencyKitBuilder from "./pages/EmergencyKitBuilder";
import MountainScout from "./pages/MountainScout";
import IndiaMap from "./pages/IndiaMap";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/hazard-spotter" element={<HazardSpotter />} />
        <Route path="/mountain-scout" element={<MountainScout />} />
        <Route path="/india-map" element={<IndiaMap />} />
        <Route path="/earthquake-balance-builder" element={<EarthquakeBuilder />} />
        <Route path="/emergency-kit-builder" element={<EmergencyKitBuilder />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
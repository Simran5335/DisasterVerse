import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import HazardSpotter from "./pages/HazardSpotter";
import EarthquakeBuilder from "./pages/EarthquakeBuilder";
import EmergencyKitBuilder from "./pages/EmergencyKitBuilder";
import MountainScout from "./pages/MountainScout";
import IndiaMap from "./pages/IndiaMap";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/hazard-spotter" element={<HazardSpotter />} />
        <Route path="/mountain-scout" element={<MountainScout />} />
        <Route path="/india-map" element={<IndiaMap />} />
        <Route path="/earthquake-balance-builder" element={<EarthquakeBuilder />} />
        <Route path="/emergency-kit-builder" element={<EmergencyKitBuilder />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

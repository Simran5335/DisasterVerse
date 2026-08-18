import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import ErrorBoundary from './components/ErrorBoundary';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import HazardSpotter from './pages/HazardSpotter';
import EarthquakeBuilder from './pages/EarthquakeBuilder';
import EmergencyKitBuilder from './pages/EmergencyKitBuilder';
import MountainScout from './pages/MountainScout';
import IndiaMap from './pages/IndiaMap';
import RiverDefender from './pages/RiverDefender';
import SmokeVision from './pages/SmokeVision';
import CrisisArchive from './pages/CrisisArchive';
import Quiz from './pages/Quiz';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>

          {/* Default */}
          <Route
            path="/"
            element={<Navigate to="/login" replace />}
          />

          {/* Authentication */}
          <Route
            path="/login"
            element={<Login />}
          />

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* Disaster Games */}
          <Route
            path="/hazard-spotter"
            element={<HazardSpotter />}
          />

          <Route
            path="/mountain-scout"
            element={<MountainScout />}
          />

          <Route
            path="/smoke-vision"
            element={<SmokeVision />}
          />

          <Route
            path="/river-defender"
            element={<RiverDefender />}
          />

          <Route
            path="/earthquake-balance-builder"
            element={<EarthquakeBuilder />}
          />

          <Route
            path="/emergency-kit-builder"
            element={<EmergencyKitBuilder />}
          />

          {/* Disaster Map */}
          <Route
            path="/india-map"
            element={<IndiaMap />}
          />

          {/* Other Modules */}
          <Route
            path="/crisis-archive"
            element={<CrisisArchive />}
          />

          <Route
            path="/quiz"
            element={<Quiz />}
          />

          {/* Unknown routes */}
          <Route
            path="*"
            element={<Navigate to="/login" replace />}
          />

        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
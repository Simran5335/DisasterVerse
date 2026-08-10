import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import HazardSpotter from "./pages/HazardSpotter";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route
          path="/hazard-spotter"
          element={<HazardSpotter />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar.js';
import { Sidebar } from './components/Sidebar.js';
import { HomeOverview } from './pages/HomeOverview.js';
import { WeatherDashboard } from './pages/WeatherDashboard.js';
import { MarketTicker } from './pages/MarketTicker.js';
import { CropDiagnostics } from './pages/CropDiagnostics.js';
import { MultilingualAgent } from './pages/MultilingualAgent.js';
import { TelephonyLogs } from './pages/TelephonyLogs.js';

export const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
          <Sidebar />
          <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
            <Routes>
              <Route path="/" element={<HomeOverview />} />
              <Route path="/weather" element={<WeatherDashboard />} />
              <Route path="/market" element={<MarketTicker />} />
              <Route path="/diagnostics" element={<CropDiagnostics />} />
              <Route path="/agent" element={<MultilingualAgent />} />
              <Route path="/call-logs" element={<TelephonyLogs />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;

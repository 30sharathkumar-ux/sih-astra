import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';

// Simple placeholder components for other routes
const Placeholder = ({ title }) => (
  <div className="flex-1 flex flex-col p-5 sm:p-6 lg:p-8 space-y-6 overflow-y-auto w-full">
    <div className="bg-white rounded-3xl p-8 shadow-card h-full flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      <p className="text-gray-500 mt-2">This module is currently under development.</p>
    </div>
  </div>
);

const App = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col lg:flex-row w-full bg-brand-surface font-sans antialiased text-gray-900">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/monitoring" element={<Placeholder title="Farm Monitoring" />} />
          <Route path="/disease-detection" element={<Placeholder title="Disease Detection (Edge AI)" />} />
          <Route path="/weather" element={<Placeholder title="Weather Forecast" />} />
          <Route path="/alerts" element={<Placeholder title="System Alerts" />} />
          <Route path="/settings" element={<Placeholder title="Settings" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

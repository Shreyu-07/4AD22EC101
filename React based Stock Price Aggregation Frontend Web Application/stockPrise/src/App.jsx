import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StockPage from './pages/StockPage';
import CorrelationHeatmap from './pages/CorrelationHeatmap';
import Navbar from './components/Navbar';

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<StockPage />} />
        <Route path="/heatmap" element={<CorrelationHeatmap />} />
      </Routes>
    </Router>
  );
}
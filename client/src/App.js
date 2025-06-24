import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

import VerifyFlow from './components/profile/VerifyFlow'; // your verify logic component
import Home from './components/Home'; // your main screen or dashboard

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/verify" element={<VerifyFlow />} />
    </Routes>
  </Router>
);

export default App;

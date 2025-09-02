import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Register from './pages/Register';
import CheckIn from './pages/ChecksIn';
import CheckOut from './pages/CheckOut';
import Feedback from './pages/Feedback';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';

import './App.css';

function Home() {
  return (
    <div className="container">
      <h1 className="title">VisiScan <br /> Visitor Management System</h1>
      <div className="sections">
        {/* Visitor Section */}
        <div className="box visitor-box">
          <h2>Visitor</h2>
          <Link to="/checkin" className="button" target="_blank" rel="noopener noreferrer">Check-In</Link>
          <Link to="/checkout" className="button" target="_blank" rel="noopener noreferrer">Check-Out</Link>
        </div>

        {/* Admin Section */}
        <div className="box admin-box">
          <h2>Admin</h2>
          <Link to="/admin-login" className="button" target="_blank" rel="noopener noreferrer">Admin Dashboard</Link>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/checkin" element={<CheckIn />} />
        <Route path="/checkout" element={<CheckOut />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;

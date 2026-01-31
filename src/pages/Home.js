import React from 'react';

export default function Home() {
  return (
    <div className="container">
      <h1 className="title">Visitor Management System</h1>
      <div className="sections">
        <div className="box visitor-box">
          <h2>Visitor</h2>
          <a href="/register" className="button" target="_blank" rel="noopener noreferrer">Register</a>
          <a href="/checkin" className="button" target="_blank" rel="noopener noreferrer">Check-In</a>
          <a href="/checkout" className="button" target="_blank" rel="noopener noreferrer">Check-Out</a>
        </div>
        <div className="box admin-box">
          <h2>Admin</h2>
          <a href="/admin" className="button" target="_blank" rel="noopener noreferrer">Admin Dashboard</a>
        </div>
      </div>
    </div>
  );
}


// src/pages/AdminLogin.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'admin@gmail.com') {
      localStorage.setItem('isAdmin', 'true');
      navigate('/admin');
    } else {
      setError('Unauthorized access ❌ Only admin is allowed');
    }
  };

  return (
    <div style={{ backgroundColor: '#fff8dc', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ padding: '30px', backgroundColor: '#fef3c7', borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', fontSize: '24px', color: '#d97706', marginBottom: '20px' }}>Admin Login</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input
            type='email'
            placeholder='Enter admin email'
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #e5e7eb' }}
          />
          <button
            type='submit'
            style={{ backgroundColor: '#facc15', padding: '10px', borderRadius: '6px', border: 'none', color: '#92400e', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Login
          </button>
          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        </form>
      </div>
    </div>
  );
}

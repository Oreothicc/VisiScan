import React, { useState } from 'react';

export default function Setup() {
  const [location, setLocation] = useState(localStorage.getItem('deviceLocation') || '');

  const handleSave = () => {
    if (!location) {
      alert('Please enter a location');
      return;
    }
    localStorage.setItem('deviceLocation', location);
    alert(`Location set to: ${location}`);
  };

  return (
    <div style={{ backgroundColor: '#fef3c7', minHeight: '100vh', padding: '30px' }}>
      <h2 style={{ fontSize: '28px', color: '#d97706' }}>Device Setup</h2>
      
      <div style={{ marginTop: '20px' }}>
        <label style={{ fontWeight: 'bold', color: '#92400e' }}>
          Enter Location for this Device:
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={{
            marginLeft: '10px',
            padding: '8px',
            borderRadius: '6px',
            border: '1px solid #d97706'
          }}
        />
        <button
          onClick={handleSave}
          style={{
            marginLeft: '15px',
            padding: '10px 20px',
            borderRadius: '6px',
            backgroundColor: '#4ade80',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import db from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';

export default function DailyReport() {
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState('');
  const [visitors, setVisitors] = useState([]);
  const [filteredVisitors, setFilteredVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch visitors
  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        setLoading(true);
        const snapshot = await getDocs(collection(db, 'visitors'));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVisitors(data);

        // Simple notification logic (same style as admin)
        const blacklistedAttempts = data.filter(v => v.lastCheckInAttempt && v.blacklisted);
        const newNotifications = blacklistedAttempts.map(v => `Blacklisted user ${v.name} attempted to check in.`);
        setNotifications(newNotifications);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVisitors();
  }, []);

  // Filter by selected date
  useEffect(() => {
    if (!selectedDate) {
      setFilteredVisitors([]);
      return;
    }

    const selected = new Date(selectedDate).toLocaleDateString();

    const filtered = visitors.filter(v => {
      if (!v.checkInTime?.seconds) return false;
      const visitDate = new Date(v.checkInTime.seconds * 1000).toLocaleDateString();
      return visitDate === selected;
    });

    setFilteredVisitors(filtered);
  }, [selectedDate, visitors]);

  return (
    <div style={{ backgroundColor: '#fff8dc', minHeight: '100vh', padding: '30px' }}>

      {/* Header (Same as Admin) */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#d97706",
          padding: "12px 20px",
          borderRadius: "8px",
          marginBottom: "20px",
          color: "white",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
        }}
      >
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => navigate(-1)}
            style={navButtonWhite}
          >
            ⬅ Back
          </button>

          <button
            onClick={() => navigate("/setup")}
            style={navButtonGreen}
          >
            Setup
          </button>

          <button
            onClick={() => navigate("/dailyreport")}
            style={navButtonGreen}
          >
            Reports
          </button>
        </div>

        <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "600" }}>
          Daily Reports
        </h2>

        <div style={{ position: "relative", cursor: "pointer" }} onClick={() => setShowNotifications(prev => !prev)}>
          <FaBell size={22} color="white" />

          {notifications.length > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-4px",
                right: "-4px",
                backgroundColor: "red",
                borderRadius: "50%",
                width: "10px",
                height: "10px"
              }}
            />
          )}

          {showNotifications && notifications.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "35px",
                right: 0,
                backgroundColor: "white",
                padding: "12px",
                borderRadius: "8px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                minWidth: "250px",
                color: "#78350f"
              }}
            >
              <h4 style={{ marginTop: 0 }}>Notifications</h4>
              <ul style={{ margin: 0, paddingLeft: "15px" }}>
                {notifications.map((note, i) => (
                  <li key={i} style={{ fontSize: "14px", marginBottom: "6px" }}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Date Selector */}
      <div style={{ marginBottom: '25px', textAlign: 'center' }}>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: '6px',
            border: '1px solid #fcd34d',
            backgroundColor: '#fff7ed',
            fontWeight: '500'
          }}
        />
      </div>

      {/* Table */}
      <table style={{ width: '100%', backgroundColor: '#fef3c7', borderCollapse: 'collapse', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr style={{ backgroundColor: '#fde68a' }}>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Purpose</th>
            <th style={thStyle}>Check-In Time</th>
            <th style={thStyle}>Check-Out Time</th>
            <th style={thStyle}>Location</th>
            <th style={thStyle}>Blacklist</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan="7" style={{ padding: '20px', textAlign: 'center' }}>Loading...</td>
            </tr>
          ) : filteredVisitors.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ padding: '20px', textAlign: 'center' }}>
                {selectedDate ? 'No visitors found for this date.' : 'Select a date to view report.'}
              </td>
            </tr>
          ) : (
            filteredVisitors.map(visitor => (
              <tr key={visitor.id}>
                <td style={tdStyle}>{visitor.name}</td>
                <td style={tdStyle}>{visitor.email}</td>
                <td style={tdStyle}>{visitor.whoAreYou}</td>
                <td style={tdStyle}>
                  {visitor.checkInTime?.seconds
                    ? new Date(visitor.checkInTime.seconds * 1000).toLocaleTimeString()
                    : '—'}
                </td>
                <td style={tdStyle}>
                  {visitor.checkOutTime?.seconds
                    ? new Date(visitor.checkOutTime.seconds * 1000).toLocaleTimeString()
                    : '—'}
                </td>
                <td style={tdStyle}>{visitor.checkInLocation}</td>
                <td style={tdStyle}>{visitor.blacklisted ? 'Yes' : 'No'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

const navButtonWhite = {
  padding: "8px 16px",
  backgroundColor: "white",
  color: "#d97706",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold"
};

const navButtonGreen = {
  padding: "8px 16px",
  backgroundColor: "#4ade80",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold"
};

const thStyle = {
  padding: '12px',
  borderBottom: '2px solid #fcd34d',
  color: '#78350f',
  textAlign: 'left'
};

const tdStyle = {
  padding: '10px',
  borderBottom: '1px solid #fde68a'
};

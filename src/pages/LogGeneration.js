import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import db from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';


export default function LogGeneration() {
  const { id } = useParams();
  const [visitor, setVisitor] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchVisitor = async () => {
      const ref = doc(db, 'visitors', id);
      const snapshot = await getDoc(ref);
      if (snapshot.exists()) {
        setVisitor({ id: snapshot.id, ...snapshot.data() });
      }
    };
    fetchVisitor();
  }, [id]);

  if (!visitor) return <p style={{ padding: '20px' }}>Loading visitor logs...</p>;

  function msToTime(ms) {
    let seconds = Math.floor(ms / 1000);
    let h = Math.floor(seconds / 3600);
    let m = Math.floor((seconds % 3600) / 60);
    let s = seconds % 60;
    return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
  }

 let totalTime = '—';

if (visitor.checkInTime?.seconds && visitor.checkOutTime?.seconds) {
  const checkIn = visitor.checkInTime.seconds * 1000;
  const checkOut = visitor.checkOutTime.seconds * 1000;
  const diff = checkOut - checkIn;

  if (diff >= 0) {
    totalTime = msToTime(diff);
  } else {
    totalTime = '—'; // Prevent negative duration bug
  }
} else if (visitor.checkInTime?.seconds && !visitor.checkOutTime?.seconds) {
  totalTime = 'Still inside';
}


  return (


    <div style={{ padding: '30px', backgroundColor: '#fef3c7', minHeight: '100vh' }}>
        <button
  onClick={() => navigate(-1)}
  style={{
    padding: "8px 16px",
    backgroundColor: "#d97706",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginBottom: "20px"
  }}
>
  ⬅ Back
</button>

      <h2 style={{ color: '#d97706', fontSize: '26px', marginBottom: '20px' }}>
        Visitor Log: {visitor.name} |  Total Time: {totalTime}
      </h2>

      <SectionBox title="Information">
        <p><strong>Email:</strong> {visitor.email}</p>
        <p><strong>Purpose:</strong> {visitor.whoAreYou}</p>
      </SectionBox>

     <SectionBox title="Visited Locations">
  {visitor.locationHistory && visitor.locationHistory.length > 0 ? (
    (() => {
      // Sort history by timestamp ascending
      const sortedHistory = [...visitor.locationHistory].sort(
        (a, b) => a.time.seconds - b.time.seconds
      );

      // Pair check-ins and check-outs by order and same location
      const pairedVisits = [];
      let lastCheckIn = null;

      for (const entry of sortedHistory) {
        if (entry.type === "check-in") {
          lastCheckIn = entry;
        } else if (entry.type === "check-out" && lastCheckIn) {
          // Only pair if same location, else treat separately
          if (entry.location === lastCheckIn.location) {
            pairedVisits.push({
              location: entry.location,
              checkIn: lastCheckIn.time,
              checkOut: entry.time,
            });
            lastCheckIn = null;
          } else {
            // If mismatched location, record as standalone check-out
            pairedVisits.push({
              location: entry.location,
              checkIn: null,
              checkOut: entry.time,
            });
          }
        }
      }

      // If last check-in without checkout, record it too
      if (lastCheckIn) {
        pairedVisits.push({
          location: lastCheckIn.location,
          checkIn: lastCheckIn.time,
          checkOut: null,
        });
      }

      // Helper for formatting time
      const formatDate = (ts) =>
        ts ? new Date(ts.seconds * 1000).toLocaleString() : "—";

      // Helper for time difference
      const msToTime = (ms) => {
        if (ms < 0) return "—"; // Prevent negative time bug
        const seconds = Math.floor(ms / 1000);
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
      };

      return (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#fde68a" }}>
              <th style={thStyle}>Location</th>
              <th style={thStyle}>Check-In</th>
              <th style={thStyle}>Check-Out</th>
              <th style={thStyle}>Time Spent</th>
            </tr>
          </thead>
          <tbody>
            {pairedVisits.map((v, idx) => {
              const checkInTime = v.checkIn ? v.checkIn.seconds * 1000 : null;
              const checkOutTime = v.checkOut ? v.checkOut.seconds * 1000 : null;
              const timeSpent =
                checkInTime && checkOutTime
                  ? msToTime(checkOutTime - checkInTime)
                  : v.checkIn && !v.checkOut
                  ? "Still inside"
                  : "—";

              return (
                <tr key={idx}>
                  <td style={tdStyle}>{v.location}</td>
                  <td style={tdStyle}>{formatDate(v.checkIn)}</td>
                  <td style={tdStyle}>{formatDate(v.checkOut)}</td>
                  <td style={tdStyle}>{timeSpent}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    })()
  ) : (
    <p>— No locations recorded —</p>
  )}
</SectionBox>


      <SectionBox title="Logs">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#fde68a' }}>
              <th style={thStyle}>Check-In</th>
              <th style={thStyle}>Check-Out</th>
              <th style={thStyle}>Time Spent</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyle}>
                {visitor.checkInTime?.seconds
                  ? new Date(visitor.checkInTime.seconds * 1000).toLocaleString()
                  : '—'}
              </td>
              <td style={tdStyle}>
                {visitor.checkOutTime?.seconds
                  ? new Date(visitor.checkOutTime.seconds * 1000).toLocaleString()
                  : '—'}
              </td>
              <td style={tdStyle}>{totalTime}</td>
            </tr>
          </tbody>
        </table>
      </SectionBox>

      <SectionBox title="Feedback">
        <p>{visitor.feedback || '—'}</p>
      </SectionBox>

      <SectionBox title="Blacklist">
        <p>{visitor.blacklisted ? 'Yes' : 'No'}</p>
      </SectionBox>
    </div>
  );
}

function SectionBox({ title, children }) {
  return (
    <div
      style={{
        backgroundColor: '#fff8dc',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 0 8px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}
    >
      <h3 style={{ marginTop: 0, color: '#b45309' }}>{title}</h3>
      {children}
    </div>
  );
}

const thStyle = {
  padding: '10px',
  borderBottom: '2px solid #fcd34d',
  textAlign: 'left',
  color: '#78350f'
};

const tdStyle = {
  padding: '8px',
  borderBottom: '1px solid #fde68a'
};
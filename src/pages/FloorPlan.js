import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import db from '../firebaseConfig';

export default function FloorPlan() {
  const [visitors, setVisitors] = useState([]);
  const [hoveredRoom, setHoveredRoom] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'visitors'), snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVisitors(data);
    });
    return () => unsub();
  }, []);

  const getVisitorsInRoom = (roomName) => {
    return visitors.filter(v =>
      v.checkInLocation === roomName &&
      v.checkInTime &&
      !v.checkOutTime
    );
  };

  const rooms = [
    { name: 'Reception', top: '20%', left: '17%', width: '20%', height: '10%' },
    { name: 'Conference Room', top: '20%', left: '63%', width: '20%', height: '17%' },
    { name: 'Lab', top: '65%', left: '25%', width: '15%', height: '15%' },
    { name: 'Office', top: '55%', left: '68%', width: '15%', height: '15%' },
  ];

  return (
    <div style={{ position: 'relative', width: '100%', textAlign: 'center', padding: '20px' }}>
      <h2 style={{ color: '#b45309', marginBottom: '10px' }}>🏢 Floor Plan Overview</h2>
      <p style={{ color: '#92400e' }}>Hover over a room to see who’s currently inside</p>

      <div style={{ position: 'relative', display: 'inline-block' }}>
        <img
          src="/floorplan.png"
          alt="Floor Plan"
          style={{ width: '900px', borderRadius: '10px', boxShadow: '0 0 8px rgba(0,0,0,0.2)' }}
        />

        {rooms.map(room => (
          <div
            key={room.name}
            onMouseEnter={() => setHoveredRoom(room.name)}
            onMouseLeave={() => setHoveredRoom(null)}
            style={{
              position: 'absolute',
              top: room.top,
              left: room.left,
              width: room.width,
              height: room.height,
              backgroundColor: 'rgba(217,119,6,0.3)',
              border: '2px solid #d97706',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {hoveredRoom === room.name && (
              <div
                style={{
                  position: 'absolute',
                  top: '-90px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'white',
                  padding: '10px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  zIndex: 10,
                  minWidth: '180px'
                }}
              >
                <h4 style={{ margin: '0 0 6px 0', color: '#d97706' }}>{room.name}</h4>
                {getVisitorsInRoom(room.name).length > 0 ? (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {getVisitorsInRoom(room.name).map(v => (
                      <li key={v.id} style={{ fontSize: '14px', color: '#78350f' }}>
                        {v.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: '13px', color: '#a16207' }}>No visitors inside</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

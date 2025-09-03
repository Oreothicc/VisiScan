import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, query, where, onSnapshot, deleteDoc } from 'firebase/firestore';
import db from '../firebaseConfig';
import { FaBell } from 'react-icons/fa';

export default function Admin() {
  const [visitors, setVisitors] = useState([]);
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [pendingVisitor, setPendingVisitor] = useState(null); // For approval dialog

  useEffect(() => {
    const fetchVisitors = async () => {
      const querySnapshot = await getDocs(collection(db, 'visitors'));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVisitors(data);

      const now = new Date();
      const blacklistedAttempts = data.filter(v => v.lastCheckInAttempt && v.blacklisted);
      const overdueVisitors = data.filter(v => {
        if (v.checkInTime && !v.checkOutTime && v.expectedCheckOutTime) {
          const [hours, minutes] = v.expectedCheckOutTime.split(':').map(Number);
          const expectedDate = new Date();
          expectedDate.setHours(hours);
          expectedDate.setMinutes(minutes);
          expectedDate.setSeconds(0);
          return now > expectedDate;
        }
        return false;
      });

      const newNotifications = [];
      blacklistedAttempts.forEach(v => {
        newNotifications.push(`Blacklisted user ${v.name} attempted to check in.`);
      });

      overdueVisitors.forEach(v => {
        newNotifications.push(`Visitor ${v.name} has exceeded expected check-out time.`);
      });

      setNotifications(newNotifications);
    };

    fetchVisitors();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'visitors'), where('approved', '==', false));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const unapproved = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (unapproved.length > 0) {
        setPendingVisitor(unapproved[0]);
      } else {
        setPendingVisitor(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleBlacklist = async (visitorId, currentStatus) => {
    const ref = doc(db, 'visitors', visitorId);
    await updateDoc(ref, { blacklisted: !currentStatus });
    setVisitors(prev =>
      prev.map(v => v.id === visitorId ? { ...v, blacklisted: !currentStatus } : v)
    );
  };

  const handleApprove = async () => {
    if (!pendingVisitor) return;
    const ref = doc(db, 'visitors', pendingVisitor.id);
    await updateDoc(ref, { approved: true });
    alert(`Registration for ${pendingVisitor.name} approved.`);
    setPendingVisitor(null);
  };

  const handleDeny = async () => {
    if (!pendingVisitor) return;
    const ref = doc(db, 'visitors', pendingVisitor.id);
    // Delete the visitor document to deny registration
    await deleteDoc(ref);
    alert(`Registration for ${pendingVisitor.name} denied.`);
    setPendingVisitor(null);
  };

  const filteredVisitors = visitors.filter(visitor => {
    if (filter === 'all') return true;
    if (filter === 'checkedIn') return visitor.checkInTime && !visitor.checkOutTime;
    if (filter === 'checkedOut') return visitor.checkOutTime;
    if (filter === 'blacklist') return visitor.blacklisted === true;
    return true;
  });

  const count = {
    all: visitors.length,
    checkedIn: visitors.filter(v => v.checkInTime && !v.checkOutTime).length,
    checkedOut: visitors.filter(v => v.checkOutTime).length,
    blacklist: visitors.filter(v => v.blacklisted === true).length
  };

  return (
    <div style={{ backgroundColor: '#fff8dc', minHeight: '100vh', padding: '30px' }}>
      {/* Approval Dialog */}
      {pendingVisitor && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '400px',
            boxShadow: '0 0 10px rgba(0,0,0,0.3)',
            textAlign: 'center'
          }}>
            <h3>{pendingVisitor.name} is trying to register for {pendingVisitor.whoAreYou}</h3>
            <div style={{ marginTop: '20px' }}>
              <button onClick={handleApprove} style={{ ...buttonStyle, marginRight: '10px', backgroundColor: '#4ade80' }}>
                Approve
              </button>
              <button onClick={handleDeny} style={{ ...buttonStyle, backgroundColor: '#f87171' }}>
                Deny
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '28px', color: '#d97706' }}>Admin Dashboard</h2>
        <div
          style={{ position: 'relative', cursor: 'pointer' }}
          onClick={() => setShowNotifications(prev => !prev)}
        >
          <FaBell size={24} color="#d97706" />
          {notifications.length > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: 'red',
              color: 'white',
              borderRadius: '50%',
              width: '10px',
              height: '10px'
            }}></span>
          )}
          {showNotifications && notifications.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '30px',
              right: '0',
              backgroundColor: '#fef3c7',
              padding: '10px',
              borderRadius: '6px',
              boxShadow: '0 0 8px rgba(0,0,0,0.1)',
              zIndex: 1,
              minWidth: '250px'
            }}>
              <h4 style={{ marginTop: 0, color: '#92400e' }}>Notifications</h4>
              <ul style={{ margin: 0, paddingLeft: '15px' }}>
                {notifications.map((note, index) => (
                  <li key={index} style={{ fontSize: '14px', marginBottom: '6px' }}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', margin: '20px 0' }}>
        <button onClick={() => setFilter('all')} style={buttonStyle}>All Visitors ({count.all})</button>
        <button onClick={() => setFilter('checkedIn')} style={buttonStyle}>In Premises ({count.checkedIn})</button>
        <button onClick={() => setFilter('checkedOut')} style={buttonStyle}>Checked Out ({count.checkedOut})</button>
        <button onClick={() => setFilter('blacklist')} style={buttonStyle}>Blacklisted ({count.blacklist})</button>
      </div>

      <table style={{ width: '100%', backgroundColor: '#fef3c7', borderCollapse: 'collapse', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
        {/* <thead>
          <tr style={{ backgroundColor: '#fde68a' }}>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Purpose</th>
            <th style={thStyle}>Check-In Time</th>
            <th style={thStyle}>Check-Out Time</th>
            <th style={thStyle}>Feedback</th>
            <th style={thStyle}>Blacklist</th>
          </tr>
        </thead>
        <tbody>
          {filteredVisitors.map(visitor => (
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
              <td style={tdStyle}>{visitor.feedback || '—'}</td>
              <td style={tdStyle}>
                <button
                  onClick={() => toggleBlacklist(visitor.id, visitor.blacklisted || false)}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: visitor.blacklisted ? '#dc2626' : '#facc15',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {visitor.blacklisted ? 'Remove' : 'Add'}
                </button>
              </td>
            </tr>
          ))}
        </tbody> */}
        <thead>
  <tr style={{ backgroundColor: '#fde68a' }}>
    <th style={thStyle}>Name</th>
    <th style={thStyle}>Email</th>
    <th style={thStyle}>Purpose</th>
    <th style={thStyle}>Check-In Date</th> {/* New column */}
    <th style={thStyle}>Check-In Time</th>
    <th style={thStyle}>Check-Out Time</th>
    <th style={thStyle}>Feedback</th>
    <th style={thStyle}>Blacklist</th>
  </tr>
</thead>
<tbody>
  {filteredVisitors.map(visitor => (
    <tr key={visitor.id}>
      <td style={tdStyle}>{visitor.name}</td>
      <td style={tdStyle}>{visitor.email}</td>
      <td style={tdStyle}>{visitor.whoAreYou}</td>
      <td style={tdStyle}>
        {visitor.checkInTime?.seconds
          ? new Date(visitor.checkInTime.seconds * 1000).toLocaleDateString()
          : '—'}
      </td>
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
      <td style={tdStyle}>{visitor.feedback || '—'}</td>
      <td style={tdStyle}>
        <button
          onClick={() => toggleBlacklist(visitor.id, visitor.blacklisted || false)}
          style={{
            padding: '4px 8px',
            backgroundColor: visitor.blacklisted ? '#dc2626' : '#facc15',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {visitor.blacklisted ? 'Remove' : 'Add'}
        </button>
      </td>
    </tr>
  ))}
</tbody>
      </table>
    </div>
  );
}

const buttonStyle = {
  backgroundColor: '#facc15',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold',
  color: '#92400e'
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
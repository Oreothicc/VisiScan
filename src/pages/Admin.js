import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, query, where, onSnapshot, deleteDoc } from 'firebase/firestore';
import db from '../firebaseConfig';
import { FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';



export default function Admin() {
  const [visitors, setVisitors] = useState([]);
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [pendingVisitor, setPendingVisitor] = useState(null); 
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [hoveredRoom, setHoveredRoom] = useState(null);

const rooms = [
  { name: 'Reception', top: '20%', left: '17%', width: '20%', height: '10%' },
    { name: 'Conference Room', top: '20%', left: '63%', width: '20%', height: '17%' },
    { name: 'Lab', top: '65%', left: '25%', width: '15%', height: '15%' },
    { name: 'Office', top: '55%', left: '68%', width: '15%', height: '15%' },
];

<<<<<<< HEAD
=======
// Replace this with however you store room info in Firestore
>>>>>>> fea4b3eca04f677bddfe6a2f2de70cf453fc05b8
const getVisitorsInRoom = (roomName) => {
  return visitors.filter(v => v.checkInLocation === roomName && !v.checkOutTime);
};


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
    await deleteDoc(ref);
    alert(`Registration for ${pendingVisitor.name} denied.`);
    setPendingVisitor(null);
  };


    const filteredVisitors = visitors.filter(visitor => {
    const matchesFilter =
      filter === 'all' ? true :
      filter === 'checkedIn' ? (visitor.checkInTime && !visitor.checkOutTime) :
      filter === 'checkedOut' ? visitor.checkOutTime :
      filter === 'blacklist' ? visitor.blacklisted === true :
      true;

    const matchesSearch = visitor.name?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const count = {
    all: visitors.length,
    checkedIn: visitors.filter(v => v.checkInTime && !v.checkOutTime).length,
    checkedOut: visitors.filter(v => v.checkOutTime).length,
    blacklist: visitors.filter(v => v.blacklisted === true).length
  };


  // ---------- Analytics Computation ----------
const [dailyData, setDailyData] = useState([]);
const [blacklistTrend, setBlacklistTrend] = useState([]);

useEffect(() => {
  if (visitors.length === 0) return;

  // Visitor count per day
  const countsByDate = {};
  visitors.forEach(v => {
    if (v.checkInTime?.seconds) {
      const date = new Date(v.checkInTime.seconds * 1000).toLocaleDateString();
      countsByDate[date] = (countsByDate[date] || 0) + 1;
    }
  });
  const formattedDailyData = Object.entries(countsByDate).map(([date, count]) => ({ date, count }));
  setDailyData(formattedDailyData);

  // Blacklisted visitors over time
  const blacklistCounts = {};
  visitors.forEach(v => {
    if (v.blacklisted && v.checkInTime?.seconds) {
      const date = new Date(v.checkInTime.seconds * 1000).toLocaleDateString();
      blacklistCounts[date] = (blacklistCounts[date] || 0) + 1;
    }
  });
  const formattedBlacklistData = Object.entries(blacklistCounts).map(([date, count]) => ({ date, count }));
  setBlacklistTrend(formattedBlacklistData);
}, [visitors]);


  return (
    <div style={{ backgroundColor: '#fff8dc', minHeight: '100vh', padding: '30px' }}>
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
      style={{
        padding: "8px 16px",
        backgroundColor: "white",
        color: "#d97706",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "bold"
      }}
    >
      ⬅ Back
    </button>

    <button
      onClick={() => navigate("/setup")}
      style={{
        padding: "8px 16px",
        backgroundColor: "#4ade80",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "bold"
      }}
    >
      Setup
    </button>
<<<<<<< HEAD

  <button onClick={() => navigate("/dailyreport")}
     style={{
        padding: "8px 16px",
        backgroundColor: "#4ade80",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "bold"
      }}
    >
  Reports
</button>

  </div>

=======
  </div>

  {/* <button
  onClick={() => navigate("/floorplan")}
  style={{
    padding: "8px 16px",
    backgroundColor: "#60a5fa",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold"
  }}
>
  Floor Plan
</button> */}


>>>>>>> fea4b3eca04f677bddfe6a2f2de70cf453fc05b8
  <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "600" }}>
    Admin Dashboard
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
          color: "white",
          borderRadius: "50%",
          width: "10px",
          height: "10px"
        }}
      ></span>
    )}
    {showNotifications && notifications.length > 0 && (
      <div
        style={{
          position: "absolute",
          top: "35px",
          right: "0",
          backgroundColor: "white",
          padding: "12px",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          zIndex: 1,
          minWidth: "250px",
          color: "#78350f"
        }}
      >
        <h4 style={{ marginTop: 0 }}>Notifications</h4>
        <ul style={{ margin: 0, paddingLeft: "15px" }}>
          {notifications.map((note, index) => (
            <li key={index} style={{ fontSize: "14px", marginBottom: "6px" }}>
              {note}
            </li>
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

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #fcd34d',
            width: '300px',
            fontSize: '14px'
          }}
        />
      </div>

<<<<<<< HEAD

{/* ---------- Glassmorphism Analytics Dashboard ---------- */}
<div style={{
  marginTop: '40px',
  marginBottom: '40px',
  padding: '32px',
  borderRadius: '16px',
  background: 'rgba(255,255,255,0.25)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(255,255,255,0.3)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
}}>
  <h3 style={{
    color: '#0f172a',
    marginBottom: '28px',
    fontSize: '22px',
    fontWeight: '600',
    letterSpacing: '0.2px'
  }}>
    📊 Real-Time Analytics Dashboard
  </h3>

  <div style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '28px'
  }}>

    {/* Visitors Chart Glass Card */}
    <div style={{
      padding: '20px',
      borderRadius: '14px',
      background: 'rgba(255,255,255,0.35)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.4)',
      boxShadow: '0 6px 24px rgba(0,0,0,0.12)'
    }}>
      <h4 style={{
        color: '#1e293b',
        marginBottom: '18px',
        fontWeight: '600'
      }}>
        Visitors Per Day
      </h4>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={dailyData}>
          <CartesianGrid stroke="rgba(148,163,184,0.25)" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#475569"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            stroke="#475569"
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(8px)',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.5)'
            }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
          />
=======
      {/* ---------- Analytics Dashboard ---------- */}
<div style={{
  marginTop: '40px',
  marginBottom: '40px',
  backgroundColor: '#fff8dc',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 0 10px rgba(0,0,0,0.1)'
}}>
  <h3 style={{ color: '#b45309', marginBottom: '20px' }}>📊 Real-Time Analytics Dashboard</h3>

  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
    {/* Daily Visitor Count */}
    <div>
      <h4 style={{ color: '#78350f' }}>Visitors Per Day</h4>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={dailyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="count" stroke="#d97706" strokeWidth={3} />
>>>>>>> fea4b3eca04f677bddfe6a2f2de70cf453fc05b8
        </LineChart>
      </ResponsiveContainer>
    </div>

<<<<<<< HEAD
    {/* Blacklist Chart Glass Card */}
    <div style={{
      padding: '20px',
      borderRadius: '14px',
      background: 'rgba(255,255,255,0.35)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.4)',
      boxShadow: '0 6px 24px rgba(0,0,0,0.12)'
    }}>
      <h4 style={{
        color: '#1e293b',
        marginBottom: '18px',
        fontWeight: '600'
      }}>
        Blacklisted Visitors Over Time
      </h4>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={blacklistTrend}>
          <CartesianGrid stroke="rgba(148,163,184,0.25)" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#475569"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            stroke="#475569"
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(8px)',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.5)'
            }}
          />
          <Bar
            dataKey="count"
            fill="#ef4444"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>

  </div>
</div>


=======
    {/* Blacklisted Visitors Trend */}
    <div>
      <h4 style={{ color: '#78350f' }}>Blacklisted Visitors Over Time</h4>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={blacklistTrend}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#dc2626" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
</div>

>>>>>>> fea4b3eca04f677bddfe6a2f2de70cf453fc05b8
<div style={{ position: 'relative', width: '100%', textAlign: 'center', padding: '20px' }}>
  <h2 style={{ color: '#b45309', marginBottom: '10px' }}>🏢 Floor Plan Overview</h2>
  <p style={{ color: '#92400e' }}>Hover over a room</p>

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


      <table style={{ width: '100%', backgroundColor: '#fef3c7', borderCollapse: 'collapse', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
        <thead>
  <tr style={{ backgroundColor: '#fde68a' }}>
    <th style={thStyle}>Name</th>
    <th style={thStyle}>Email</th>
    <th style={thStyle}>Purpose</th>
    <th style={thStyle}>Check-In Date</th> 
    <th style={thStyle}>Check-In Time</th>
    <th style={thStyle}>Check-Out Time</th>
    <th style={thStyle}>Location</th>
    <th style={thStyle}>Feedback</th>
    <th style={thStyle}>Blacklist</th>
  </tr>
</thead>
<tbody>
  {filteredVisitors.map(visitor => (
    <tr key={visitor.id}>
      <td style={tdStyle}>
       <span
    onClick={() => navigate(`/log/${visitor.id}`)}
    style={{ color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}
  > {visitor.name}
  </span>
        </td>
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
      <td style={tdStyle}>
        {visitor.checkInLocation}
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
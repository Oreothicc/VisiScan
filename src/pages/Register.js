import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { collection, addDoc, doc, onSnapshot } from 'firebase/firestore';
import db from '../firebaseConfig';

export default function Register() {
  const videoRef = useRef(null);
  const [descriptor, setDescriptor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whoAreYou: ''
  });
  const [loading, setLoading] = useState(false); 
  const [captureStatus, setCaptureStatus] = useState('');

  const [visitorDocId, setVisitorDocId] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState(null); // 'approved' | 'denied' | null

  useEffect(() => {
    const loadModelsAndStart = async () => {
      setLoading(true);
      try {
        await faceapi.nets.ssdMobilenetv1.loadFromUri('/models/ssd_mobilenetv1');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models/face_landmark_68');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models/face_recognition');

        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Error starting camera:", err);
      } finally {
        setLoading(false);
      }
    };

    loadModelsAndStart();
  }, []);

  useEffect(() => {
    if (!visitorDocId) return;

    const ref = doc(db, 'visitors', visitorDocId);
    const unsubscribe = onSnapshot(ref, (docSnap) => {
      if (!docSnap.exists()) {
        setApprovalStatus('denied');
        setVisitorDocId(null); // stop listening
        return;
      }

      const data = docSnap.data();
      if (data.approved === true) {
        setApprovalStatus('approved');
        setVisitorDocId(null); // stop listening
      }
    });

    return () => unsubscribe();
  }, [visitorDocId]);


  const captureFace = async () => {
  setCaptureStatus('Starting face detection...');
  setLoading(true);
  try {
    setCaptureStatus('Detecting single face...');
    const detection = await faceapi
      .detectSingleFace(videoRef.current)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      setCaptureStatus('No face detected. Please position your face clearly and try again.');
      setLoading(false);
      return;
    }

    setCaptureStatus('Face detected. Analyzing landmarks...');
    await new Promise(res => setTimeout(res, 500));

    setCaptureStatus('Extracting face descriptor...');
    await new Promise(res => setTimeout(res, 500));

    setDescriptor(detection.descriptor);
    setCaptureStatus('Face captured successfully ✅');
  } catch (err) {
    console.error("Face capture error:", err);
    setCaptureStatus('Error capturing face. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!descriptor) {
      alert('Please capture your face first!');
      return;
    }

    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'visitors'), {
        ...formData,
        embedding: Array.from(descriptor),
        timestamp: new Date(),
        approved: false 
      });

      setVisitorDocId(docRef.id); 
      alert('Registration submitted. Please wait for admin approval.');
      setFormData({ name: '', email: '', whoAreYou: '' });
      setDescriptor(null);
    } catch (err) {
      console.error(err);
      alert('Failed to register visitor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#f3e8ff',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative'
    }}>

      {/* Loading Overlay */}
      {loading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(255, 255, 255, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999
        }}>
          <div className="spinner"></div>
        </div>
      )}

      {/* Approval / Denial Dialog */}
      {approvalStatus === 'approved' && (
        <div style={dialogOverlayStyle}>
          <div style={dialogBoxStyle}>
            <h3>Admin Approved ✅</h3>
            <p>Your registration has been approved. You may now proceed.</p>
            <button onClick={() => setApprovalStatus(null)} style={dialogButtonStyle}>Close</button>
          </div>
        </div>
      )}

      {approvalStatus === 'denied' && (
        <div style={dialogOverlayStyle}>
          <div style={dialogBoxStyle}>
            <h3>Admin Denied ❌</h3>
            <p>Your registration request was denied by the admin.</p>
            <button onClick={() => setApprovalStatus(null)} style={dialogButtonStyle}>Close</button>
          </div>
        </div>
      )}

      <div style={{
        backgroundColor: '#ede9fe',
        borderRadius: '50%',
        width: '500px',
        height: '500px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
        padding: '5px',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '22px', color: '#4b0082', marginBottom: '20px' }}>
          Hi Visitor, Register Here
        </h2>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
            style={inputStyle}
          />
          <input
            type="email"
            placeholder="Email ID"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            required
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Purpose of visit"
            value={formData.whoAreYou}
            onChange={e => setFormData({ ...formData, whoAreYou: e.target.value })}
            required
            style={inputStyle}
          />

          <video ref={videoRef} width="250" height="180" autoPlay muted style={{ borderRadius: '10px', marginBottom: '10px' }} />

          <div style={{ minHeight: '24px', marginBottom: '10px', color: '#4b0082', fontWeight: 'bold' }}>
          {captureStatus}
          </div>

          <div>
            <button type="button" onClick={captureFace} style={buttonStyle}>Capture Face</button>
            <button type="submit" style={{ ...buttonStyle, marginLeft: '10px' }}>Register</button>
          </div>
        </form>
      </div>

      {/* Spinner CSS */}
      <style>{`
        .spinner {
          border: 6px solid #f3f3f3;
          border-top: 6px solid #4b0082;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '8px',
  marginBottom: '10px',
  borderRadius: '6px',
  border: '1px solid #ccc'
};

const buttonStyle = {
  padding: '8px 16px',
  border: 'none',
  backgroundColor: '#a78bfa',
  color: 'white',
  borderRadius: '6px',
  cursor: 'pointer'
};

const dialogOverlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
};

const dialogBoxStyle = {
  backgroundColor: 'white',
  padding: '30px',
  borderRadius: '8px',
  width: '350px',
  textAlign: 'center',
  boxShadow: '0 0 15px rgba(0,0,0,0.3)'
};

const dialogButtonStyle = {
  marginTop: '20px',
  padding: '8px 20px',
  borderRadius: '6px',
  border: 'none',
  backgroundColor: '#4b0082',
  color: 'white',
  cursor: 'pointer'
};
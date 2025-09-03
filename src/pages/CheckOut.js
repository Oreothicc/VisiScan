// src/pages/CheckOut.js
import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import db from '../firebaseConfig';
import { collection, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';

export default function CheckOut() {
  const videoRef = useRef(null);
  const [message, setMessage] = useState('');
  const [matchedVisitor, setMatchedVisitor] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const loadModelsAndStartCamera = async () => {
      await faceapi.nets.ssdMobilenetv1.loadFromUri('/models/ssd_mobilenetv1');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models/face_landmark_68');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models/face_recognition');

      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      videoRef.current.srcObject = stream;
    };

    loadModelsAndStartCamera();
  }, []);

  const handleCheckOut = async () => {
    setMessage('Checking...');
    const detection = await faceapi
      .detectSingleFace(videoRef.current)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      setMessage('Face not detected ❌');
      return;
    }

    const currentDescriptor = detection.descriptor;
    const querySnapshot = await getDocs(collection(db, 'visitors'));
    const visitors = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    let matched = false;

    for (let visitor of visitors) {
      const storedDescriptor = new Float32Array(visitor.embedding);
      const distance = faceapi.euclideanDistance(currentDescriptor, storedDescriptor);

      if (distance < 0.45 && !visitor.blacklisted) {
        console.log('Matched Visitor ID:', visitor.id);
        setMatchedVisitor(visitor);
        setMessage(`Thank you, ${visitor.name}! ✅`);
        matched = true;
        break;
      } else if (distance < 0.45 && visitor.blacklisted) {
        setMessage('Access denied ❌ You are blacklisted.');
        matched = true;
        break;
      }
    }

    if (!matched) {
      setMessage('Visitor not recognized ❌');
    }
  };

  const handleSubmit = async () => {
    if (!matchedVisitor || !matchedVisitor.id) {
      alert("Error: No matched visitor found for feedback.");
      return;
    }

    try {
      const visitorRef = doc(db, 'visitors', matchedVisitor.id);
      await updateDoc(visitorRef, {
        checkOutTime: Timestamp.now(),
        feedback: feedback
      });

      alert('Checked out successfully! ✅');
      setMatchedVisitor(null);
      setFeedback('');
      setMessage('');
    } catch (err) {
      console.error("Error updating feedback:", err);
      alert("Something went wrong while checking out.");
    }
  };

  const startSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setFeedback(transcript);
      setRecording(false);
    };

    recognition.onerror = (err) => {
      console.error('Speech recognition error:', err);
      setRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  };

  return (
    <div style={{ backgroundColor: '#f3e8ff', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ backgroundColor: '#ede9fe', borderRadius: '30px', width: '500px', padding: '30px', textAlign: 'center', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '22px', color: '#4b0082', marginBottom: '20px' }}>Visitor Check-Out</h2>
        <video ref={videoRef} width="280" height="200" autoPlay muted style={{ borderRadius: '8px', marginBottom: '10px' }} />
        <button onClick={handleCheckOut} style={{ padding: '10px 20px', backgroundColor: '#a78bfa', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', marginBottom: '15px' }}>
          Scan Face
        </button>

        {matchedVisitor && (
          <div>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Leave your feedback..."
              rows="3"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            ></textarea>
            <br />
            <button
              onClick={startSpeechRecognition}
              disabled={recording}
              style={{ marginTop: '10px', marginBottom: '10px', padding: '6px 12px', backgroundColor: recording ? '#ddd' : '#7c3aed', color: '#fff', border: 'none', borderRadius: '4px' }}
            >
              {recording ? 'Listening...' : 'Use Speech-to-Text'}
            </button>
            <br />
            <button
              onClick={handleSubmit}
              style={{ padding: '8px 16px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px' }}
            >
              Submit Feedback & Check-Out
            </button>
          </div>
        )}

        <p style={{ marginTop: '15px', color: '#4b0082' }}>{message}</p>
      </div>
    </div>
  );
}

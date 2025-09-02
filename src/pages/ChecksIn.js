import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import db from '../firebaseConfig';
import { collection, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';

export default function CheckIn() {
  const videoRef = useRef(null);
  const [message, setMessage] = useState('');
  const [showTimeInput, setShowTimeInput] = useState(false);
  const [expectedTime, setExpectedTime] = useState('');
  const [matchedVisitor, setMatchedVisitor] = useState(null);
  const navigate = useNavigate();

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

  const handleCheckIn = async () => {
    setMessage('Checking...');
    setShowTimeInput(false);

    const detection = await faceapi
      .detectSingleFace(videoRef.current)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      setMessage('Face not detected. Please try again.');
      return;
    }

    const currentDescriptor = detection.descriptor;
    const querySnapshot = await getDocs(collection(db, 'visitors'));
    const visitors = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    let matched = false;

    for (let visitor of visitors) {
      const storedDescriptor = new Float32Array(visitor.embedding);
      const distance = faceapi.euclideanDistance(currentDescriptor, storedDescriptor);

      if (distance < 0.5 && !visitor.blacklisted) {
        setMatchedVisitor(visitor);
        setMessage(`Welcome, ${visitor.name}! ✅`);
        setShowTimeInput(true);
        matched = true;
        break;
      } else if (distance < 0.5 && visitor.blacklisted) {
  await updateDoc(doc(db, 'visitors', visitor.id), {
    lastCheckInAttempt: new Date()
  });
  setMessage('Access denied ❌ You are blacklisted.');
  matched = true;
  break;
}
    }

    if (!matched) {
      setMessage('Match not found ❌');
    }
  };

  const handleSubmitExpectedTime = async () => {
    if (matchedVisitor && expectedTime) {
      await updateDoc(doc(db, 'visitors', matchedVisitor.id), {
        checkInTime: Timestamp.now(),
        expectedCheckOutTime: expectedTime,
        reminderSent: false
      });

      // Delay email by scheduling it for 30 minutes before expected time
      const [hours, minutes] = expectedTime.split(":").map(Number);
      const now = new Date();
      const target = new Date();
      target.setHours(hours);
      target.setMinutes(minutes);
      target.setSeconds(0);

      const delay = target.getTime() - now.getTime() - 30 * 60 * 1000;

      if (delay > 0) {
        setTimeout(() => {
          emailjs.send(
            'service_nzsrizv',
            'template_afvcgbo',
            {
              to_name: matchedVisitor.name,
              to_email: matchedVisitor.email,
              expected_time: expectedTime
            },
            '2gIUnKt6VUeWxt2pp'
          ).then(() => {
            console.log('Reminder email sent successfully!');
          }).catch((err) => {
            console.error('Failed to send delayed email:', err);
          });
        }, delay);
      }

      alert('Check-In and reminder scheduled successfully!');
      setShowTimeInput(false);
      setMessage('Thank you! You are checked in.');
    }
  };

  return (
    <div style={{ backgroundColor: '#f3e8ff', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ backgroundColor: '#ede9fe', borderRadius: '50%', width: '500px', height: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)', padding: '30px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '22px', color: '#4b0082', marginBottom: '20px' }}>
          Visitor Check-In
        </h2>
        <video ref={videoRef} width="250" height="180" autoPlay muted style={{ borderRadius: '10px', marginBottom: '10px' }} />
        <button onClick={handleCheckIn} style={{ padding: '10px 20px', backgroundColor: '#a78bfa', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '10px' }}>
          Capture Face
        </button>

        {showTimeInput && (
          <div style={{ marginTop: '10px' }}>
            <label>Select Expected Check-Out Time: </label><br />
            <input
              type="time"
              value={expectedTime}
              onChange={e => setExpectedTime(e.target.value)}
              style={{ margin: '10px 0', padding: '5px', borderRadius: '5px' }}
              required
            />
            <br />
            <button onClick={handleSubmitExpectedTime} style={{ padding: '6px 12px', backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '4px' }}>
              Submit
            </button>
          </div>
        )}

        {!showTimeInput && message.includes('not found') && (
          <div style={{ marginTop: '10px' }}>
            <p style={{ color: '#7c3aed' }}>Not a visitor?</p>
            <button
              onClick={() => navigate('/register')}
              style={{ padding: '6px 12px', backgroundColor: '#c4b5fd', color: '#4b0082', border: 'none', borderRadius: '4px', marginTop: '5px' }}
            >
              Register Now
            </button>
          </div>
        )}

        <p style={{ marginTop: '15px', fontSize: '16px', color: '#4b0082' }}>{message}</p>
      </div>
    </div>
  );
}

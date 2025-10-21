
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: "AIzaSyB22iwll9KIhnYSf3nu-utB0kw9IM8Q-W8",
  authDomain: "visiscan-c4e31.firebaseapp.com",
  projectId: "visiscan-c4e31",
  storageBucket: "visiscan-c4e31.firebasestorage.app",
  messagingSenderId: "516843395178",
  appId: "1:516843395178:web:dbb75b9a8df80e9f9dd213",
  measurementId: "G-B99VX72FJJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
export default db;
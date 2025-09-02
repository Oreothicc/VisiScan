
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAqynlR-zdx425K1XQMxNVMLEh313g7bo8",
  authDomain: "visiscan-b968f.firebaseapp.com",
  projectId: "visiscan-b968f",
  storageBucket: "visiscan-b968f.firebasestorage.app",
  messagingSenderId: "740973623336",
  appId: "1:740973623336:web:3bc1e5329bc8690b535d1d",
  measurementId: "G-ECVS5Z1PQZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
export default db;
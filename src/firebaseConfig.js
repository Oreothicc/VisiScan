
// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// import { getFirestore } from 'firebase/firestore';
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyAqynlR-zdx425K1XQMxNVMLEh313g7bo8",
//   authDomain: "visiscan-b968f.firebaseapp.com",
//   projectId: "visiscan-b968f",
//   storageBucket: "visiscan-b968f.firebasestorage.app",
//   messagingSenderId: "740973623336",
//   appId: "1:740973623336:web:3bc1e5329bc8690b535d1d",
//   measurementId: "G-ECVS5Z1PQZ"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
// const db = getFirestore(app);
// export default db;


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
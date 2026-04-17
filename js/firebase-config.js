// Firebase Configuration
// REPLACE the config object below with your actual Firebase project settings
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
let db;
let settingsDocRef;

if (typeof firebaseConfig !== 'undefined' && firebaseConfig.apiKey === "YOUR_API_KEY") {
  console.error("Firebase is not configured! Please update js/firebase-config.js with your actual credentials.");
} else if (typeof firebase !== 'undefined') {
  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    settingsDocRef = db.collection('siteSettings').doc('mainData');
  } catch (err) {
    console.error("Firebase initialization failed:", err);
  }
}

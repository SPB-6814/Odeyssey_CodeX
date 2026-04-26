import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

/*
 * ⚠️  Replace the values below with YOUR Firebase project credentials.
 *     Firebase Console → Project Settings → General → Your apps → Web app
 */
const firebaseConfig = {

  apiKey: "AIzaSyAs2RfhUxb8TuROATgAvmH1pZgNJ9qj4eE",

  authDomain: "fake-review-detection-sy-bbddf.firebaseapp.com",

  projectId: "fake-review-detection-sy-bbddf",

  storageBucket: "fake-review-detection-sy-bbddf.firebasestorage.app",

  messagingSenderId: "37624061394",

  appId: "1:37624061394:web:476abcdd2a0b90b5eafc0b",

  measurementId: "G-V4FK3DY1P2"

};



// Prevent re-initialisation in hot-reload / SSR
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };


import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "automata-18e40.firebaseapp.com",
  projectId: "automata-18e40",
  storageBucket: "automata-18e40.firebasestorage.app",
  messagingSenderId: "603209673195",
  appId: "1:603209673195:web:b0e58f7d1b7c2caa1711ae"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider()

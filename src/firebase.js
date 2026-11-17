import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase web config (safe to be public — access is controlled by firestore.rules)
const firebaseConfig = {
  apiKey: "AIzaSyARScvxqWCxzQjR7ADHLkwhBihaGM-Vv9M",
  authDomain: "my-fitness-workout-app.firebaseapp.com",
  projectId: "my-fitness-workout-app",
  storageBucket: "my-fitness-workout-app.firebasestorage.app",
  messagingSenderId: "647026051797",
  appId: "1:647026051797:web:7bccb693f7a5736f37705c",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Local preview mode (no login, data stays on the device). Only for testing builds.
export const DEMO = import.meta.env.VITE_DEMO === "1";

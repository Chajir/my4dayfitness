import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyARScvxqWCxzQjR7ADHLkwhBihaGM-Vv9M",
  authDomain: "my-fitness-workout-app.firebaseapp.com",
  projectId: "my-fitness-workout-app",
  storageBucket: "my-fitness-workout-app.firebasestorage.app",
  messagingSenderId: "647026051797",
  appId: "1:647026051797:web:7bccb693f7a5736f37705c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

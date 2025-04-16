import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { AnimatePresence } from "framer-motion";
import Calendar from "react-calendar";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Login from "./Login";
import ModeSelection from "./ModeSelection";
import MainAppStatic from "./MainAppStatic";
import MainAppAI from "./MainAppAI";
import WorkoutDay from "./components/WorkoutDay";
import workouts from "./data/workouts";
import { calculateStreak, getPersonalBests, getWeeklyData } from "./helpers/helpers";
import RestTimer from "./components/RestTimer";
import Navbar from "./components/Navbar";

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [mode, setMode] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setChecking(false);
    });
    return () => unsubscribe();
  }, []);

  if (checking) return <div className="text-white p-4">Loading...</div>;
  if (!user) return <Login onLogin={() => setUser(auth.currentUser)} />;

  const handleLogout = () => {
    signOut(auth);
  };

  const renderMainApp = () => {
    return mode === "static" ? (
      <MainAppStatic user={user} setMode={setMode} />
    ) : (
      <MainAppAI user={user} setMode={setMode} />
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <Navbar
        showBack={!!mode}
        onBack={() => setMode(null)}
        onLogout={handleLogout}
      />

      <AnimatePresence mode="wait">
        {!mode ? <ModeSelection setMode={setMode} /> : renderMainApp()}
      </AnimatePresence>
    </div>
  );
}

export default App;

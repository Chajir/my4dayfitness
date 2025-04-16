// src/MainAppAI.jsx
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";
import WorkoutDay from "./components/WorkoutDay";
import Calendar from "react-calendar";
import PreferencesForm from "./components/PreferencesForm";
import { generateAIWorkout } from "./helpers/helpers";
import { calculateStreak, getPersonalBests, getWeeklyData } from "./helpers/helpers";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

function InjuryForm({ onSave, user }) {
  const [selected, setSelected] = useState([]);
  const injuries = ["shoulders", "back", "legs", "chest"];

  useEffect(() => {
    const fetchInjuries = async () => {
      const ref = doc(db, "injuries", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setSelected(snap.data().types || []);
      }
    };
    fetchInjuries();
  }, [user]);

  const toggle = (type) => {
    setSelected((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSave = async () => {
    await setDoc(doc(db, "injuries", user.uid), { types: selected });
    onSave();
  };

  return (
    <div className="text-white p-4 bg-gray-800 rounded-xl mb-6">
      <h3 className="font-semibold mb-2">🩹 Report Any Injuries</h3>
      <div className="flex gap-2 flex-wrap">
        {injuries.map((type) => (
          <button
            key={type}
            onClick={() => toggle(type)}
            className={`px-3 py-1 rounded ${
              selected.includes(type) ? "bg-red-500" : "bg-gray-600"
            }`}
          >
            {type}
          </button>
        ))}
      </div>
      <button
        className="mt-4 bg-blue-600 py-2 px-4 rounded"
        onClick={handleSave}
      >
        Save Injuries
      </button>
    </div>
  );
}

export default function MainAppAI({ user, setMode }) {
  const [workout, setWorkout] = useState(null);
  const [lastUsed, setLastUsed] = useState({});
  const [history, setHistory] = useState({});
  const [preferences, setPreferences] = useState(undefined);
  const [streak, setStreak] = useState(0);
  const [showChart, setShowChart] = useState(false);
  const [showInjuryForm, setShowInjuryForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const uid = user.uid;

      const ref1 = doc(db, "exerciseData", uid);
      const snap1 = await getDoc(ref1);
      const last = snap1.exists() ? snap1.data() : {};
      setLastUsed(last);

      const ref2 = doc(db, "history", uid);
      const snap2 = await getDoc(ref2);
      const hist = snap2.exists() ? snap2.data() : {};
      setHistory(hist);

      const ref3 = doc(db, "preferences", uid);
      const snap3 = await getDoc(ref3);
      const prefs = snap3.exists() ? snap3.data() : null;
      setPreferences(prefs);

      const ref4 = doc(db, "injuries", uid);
      const snap4 = await getDoc(ref4);
      const userInjuries = snap4.exists() ? snap4.data().types || [] : [];

      if (prefs) generateWorkout(hist, prefs, last, userInjuries);
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    if (!preferences) return;
  
    const fetchWorkout = async () => {
      const ref4 = doc(db, "injuries", user.uid);
      const snap4 = await getDoc(ref4);
      const userInjuries = snap4.exists() ? snap4.data().types || [] : [];
  
      generateWorkout(history, preferences, lastUsed, userInjuries);
    };
  
    fetchWorkout();
  }, [preferences]);
  

  const generateWorkout = (hist, prefs, last, userInjuries) => {
    const flatSessions = Object.values(hist).flat();
    const days = [...new Set(flatSessions.map((e) => e.timestamp?.split(",")[0]))];
    const calculatedStreak = days.length;
    setStreak(calculatedStreak);
    const aiWorkout = generateAIWorkout(last || {}, userInjuries || [], calculatedStreak, prefs);
    setWorkout(aiWorkout);
  };

  const savePreferences = async (prefs) => {
    const uid = user.uid;
    const ref = doc(db, "preferences", uid);
    await setDoc(ref, prefs);
    setPreferences(prefs);
  };

  const resetPreferences = async () => {
    const uid = user.uid;
    await deleteDoc(doc(db, "preferences", uid));
    setPreferences(null);
    setWorkout(null);
  };

  const saveHistory = async (data) => {
    const docRef = doc(db, "history", user.uid);
    await setDoc(docRef, data);
  };

  const saveLastUsed = async (data) => {
    const docRef = doc(db, "exerciseData", user.uid);
    await setDoc(docRef, data);
  };

  const handleComplete = () => {
    const parsedData = workout.sections
      .flatMap((s) => s.exercises)
      .reduce((acc, curr) => {
        acc[curr.name] = {
          weight: curr.weight || 0,
          reps: curr.reps || 0,
          date: new Date().toLocaleDateString(),
        };
        return acc;
      }, {});

    const updated = {
      ...history,
      AI: [...(history["AI"] || []), {
        timestamp: new Date().toLocaleString(),
        data: JSON.stringify(parsedData),
      }],
    };

    setHistory(updated);
    saveHistory(updated);
    saveLastUsed({ ...lastUsed, ...parsedData });
  };

  const personalBests = getPersonalBests(history);
  const weeklyData = getWeeklyData(history);

  if (preferences === undefined) return <div className="text-white p-6">Loading...</div>;
  if (preferences === null) return <PreferencesForm onSave={savePreferences} />;
  if (!workout) return <div className="text-white p-6">Loading AI workout...</div>;

  return (
    <div className="text-white min-h-screen bg-black p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">🤖 AI Coach Dashboard</h2>
        <div className="flex gap-4">
          <button
            onClick={resetPreferences}
            className="text-blue-400 underline text-sm"
          >
            Change AI Workout Preferences
          </button>
          <button
            onClick={() => setShowInjuryForm(!showInjuryForm)}
            className="text-red-400 underline text-sm"
          >
            {showInjuryForm ? "Hide Injuries" : "Edit Injuries"}
          </button>
        </div>
      </div>

      {showInjuryForm && (
        <InjuryForm
          onSave={() => {
            setShowInjuryForm(false);
            generateWorkout(history, preferences, lastUsed);
          }}
          user={user}
        />
      )}

      <div className="text-center mb-6">
        <h2 className="text-xl font-bold mb-2">Workout Streak: {streak} day{streak !== 1 ? 's' : ''}</h2>
      </div>

      <div className="flex justify-center mb-6">
        <div className="bg-gray-900 p-4 rounded-xl shadow">
          <Calendar
            className="rounded-xl overflow-hidden"
            tileClassName={({ date }) => {
              const formatted = date.toLocaleDateString();
              return Object.values(history).flat().some(h => h.timestamp.includes(formatted))
                ? "bg-green-500 text-white rounded-full"
                : null;
            }}
          />
        </div>
      </div>

      <WorkoutDay
        day={"AI Coach"}
        data={workout}
        lastUsed={lastUsed}
        onComplete={handleComplete}
        user={user} 
      />

      <div className="mt-8 max-w-xl mx-auto">
        <h2 className="text-xl font-bold mb-4">🏋️ Personal Bests</h2>
        {Object.keys(personalBests).length === 0 ? (
          <p className="text-gray-400 text-sm">No personal bests recorded yet.</p>
        ) : (
          <ul className="space-y-2 text-sm text-gray-200">
            {Object.entries(personalBests).map(([exercise, best], i) => (
              <li key={i} className="bg-gray-800 p-2 rounded">
                <strong>{exercise}</strong>: {best.weight} lbs, {best.reps} reps on {best.date}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-10 max-w-xl mx-auto">
        <button
          onClick={() => setShowChart(!showChart)}
          className="w-full bg-gray-800 text-white py-2 px-4 rounded mb-4 hover:bg-gray-700 transition"
        >
          {showChart ? "Hide Weekly Activity Chart" : "Show Weekly Activity Chart"}
        </button>
        {showChart && (
          <div className="mt-4 bg-gray-900 p-4 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4 text-center">📊 Weekly Activity</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" stroke="#ccc" />
                <YAxis allowDecimals={false} stroke="#ccc" />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
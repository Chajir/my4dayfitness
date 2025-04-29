// src/MainAppStatic.jsx
import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import Calendar from "react-calendar";
import WorkoutDay from "./components/WorkoutDay";
import workouts from "./data/workouts";
import { calculateStreak, getPersonalBests, getWeeklyData } from "./helpers/helpers";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

function InjuryForm({ onSave, user, currentInjuries }) {
  const [selected, setSelected] = useState(currentInjuries || []);
  const injuries = ["shoulders", "back", "legs", "chest"];

  useEffect(() => {
    setSelected(currentInjuries || []); // Sync with parent state
  }, [currentInjuries]);

  const toggle = (type) => {
    setSelected((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSave = async () => {
    console.log("Saving injuries in InjuryForm:", selected); // Debug log
    await setDoc(doc(db, "injuries", user.uid), { types: selected });
    onSave(selected); // Pass updated injuries to parent
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

export default function MainAppStatic({ user, setMode }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [history, setHistory] = useState({});
  const [lastUsed, setLastUsed] = useState({});
  const [injuries, setInjuries] = useState([]); // Add injuries state
  const [showChart, setShowChart] = useState(false);
  const [showInjuryForm, setShowInjuryForm] = useState(false); // Add injury form toggle

  useEffect(() => {
    const loadFromFirestore = async () => {
      const ref1 = doc(db, "exerciseData", user.uid);
      const ref2 = doc(db, "history", user.uid);
      const ref3 = doc(db, "injuries", user.uid); // Fetch injuries
      const [snap1, snap2, snap3] = await Promise.all([getDoc(ref1), getDoc(ref2), getDoc(ref3)]);
      if (snap1.exists()) setLastUsed(snap1.data());
      if (snap2.exists()) setHistory(snap2.data());
      const userInjuries = snap3.exists() ? snap3.data().types || [] : [];
      setInjuries(userInjuries);
      console.log("MainAppStatic - Initial fetch - Injuries:", userInjuries); // Debug log
    };
    loadFromFirestore();
  }, [user]);

  const handleComplete = async () => {
    const dayName = selectedDay;
    const sessionData = filteredWorkouts[dayName].sections // Use filtered workouts
      .flatMap((s) => s.exercises)
      .reduce((acc, ex) => {
        const name = typeof ex === "string" ? ex : ex.name;
        acc[name] = { date: new Date().toLocaleDateString() };
        return acc;
      }, {});

    const updatedHistory = {
      ...history,
      [dayName]: [...(history[dayName] || []), {
        timestamp: new Date().toLocaleString(),
        data: JSON.stringify(sessionData),
      }],
    };

    await setDoc(doc(db, "history", user.uid), updatedHistory);
    await setDoc(doc(db, "exerciseData", user.uid), {
      ...lastUsed,
      ...sessionData,
    });

    setHistory(updatedHistory);
    setLastUsed(prev => ({ ...prev, ...sessionData }));
    setSelectedDay(null);
  };

  // Filter workouts based on injuries
  const filteredWorkouts = Object.fromEntries(
    Object.entries(workouts).map(([day, workout]) => [
      day,
      {
        ...workout,
        sections: workout.sections
          .map((section) => ({
            ...section,
            exercises: section.exercises.filter((exercise) => {
              const ex = typeof exercise === "string" ? { name: exercise } : exercise;
              // If bodyParts isn't defined, assume the exercise is safe (we'll fix this in workouts.js)
              if (!ex.bodyParts) {
                console.warn(`Exercise ${ex.name} in ${day} is missing bodyParts. Assuming it's safe.`); // Debug log
                return true;
              }
              return !ex.bodyParts.some((part) => injuries.includes(part));
            }),
          }))
          .filter((section) => section.exercises.length > 0),
      },
    ])
  );

  // Log filtered workouts whenever injuries change
  useEffect(() => {
    console.log("MainAppStatic - Filtered workouts based on injuries:", filteredWorkouts); // Debug log
  }, [injuries]);

  const personalBests = getPersonalBests(history);
  const weeklyData = getWeeklyData(history);
  const flatSessions = Object.values(history).flat();
  const streak = calculateStreak(flatSessions);

  if (selectedDay) {
    return (
      <WorkoutDay
        day={selectedDay}
        data={filteredWorkouts[selectedDay]} // Use filtered workout
        lastUsed={lastUsed}
        user={user}
        onComplete={handleComplete}
        setMode={setMode}
      />
    );
  }

  return (
    <div className="text-white min-h-screen bg-black p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-center">🔥 Your Dashboard</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setShowInjuryForm(!showInjuryForm)}
            className="text-red-400 underline text-sm"
          >
            {showInjuryForm ? "Hide Injuries" : "Edit Injuries"}
          </button>
          <button
            onClick={() => setMode(null)} // Add Change Mode button
            className="text-gray-400 underline text-sm"
          >
            Change Mode
          </button>
        </div>
      </div>

      {showInjuryForm && (
        <InjuryForm
          onSave={(newInjuries) => {
            console.log("MainAppStatic - InjuryForm onSave - New injuries:", newInjuries); // Debug log
            setInjuries(newInjuries);
            setShowInjuryForm(false);
          }}
          user={user}
          currentInjuries={injuries}
        />
      )}

      <h3 className="text-center text-lg font-medium mb-6">Workout Streak: {streak} days</h3>

      <div className="flex justify-center mb-6">
        <div className="bg-gray-900 p-4 rounded-xl shadow">
          <Calendar
            className="rounded-xl overflow-hidden"
            tileClassName={({ date }) => {
              const formatted = date.toLocaleDateString();
              return flatSessions.some(h => h.timestamp.includes(formatted))
                ? "bg-green-500 text-white rounded-full" : null;
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.keys(filteredWorkouts).map((day, i) => (
          <button
            key={i}
            onClick={() => setSelectedDay(day)}
            className="bg-gray-800 hover:bg-gray-700 py-3 px-4 rounded text-white shadow"
            disabled={filteredWorkouts[day].sections.length === 0} // Disable if no exercises are available
          >
            {day}
            {filteredWorkouts[day].sections.length === 0 && (
              <span className="text-red-400 text-xs block"> (Not available due to injuries)</span>
            )}
          </button>
        ))}
      </div>

      <div className="max-w-xl mx-auto">
        <h2 className="text-xl font-bold mb-2">🏆 Personal Bests</h2>
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

      <div className="mt-8 max-w-xl mx-auto">
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
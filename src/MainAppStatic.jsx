// src/MainAppStatic.jsx
import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import Calendar from "react-calendar";
import WorkoutDay from "./components/WorkoutDay";
import workouts from "./data/workouts";
import { calculateStreak, getPersonalBests, getWeeklyData } from "./helpers/helpers";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function MainAppStatic({ user, setMode }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [history, setHistory] = useState({});
  const [lastUsed, setLastUsed] = useState({});
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    const loadFromFirestore = async () => {
      const ref1 = doc(db, "exerciseData", user.uid);
      const ref2 = doc(db, "history", user.uid);
      const [snap1, snap2] = await Promise.all([getDoc(ref1), getDoc(ref2)]);
      if (snap1.exists()) setLastUsed(snap1.data());
      if (snap2.exists()) setHistory(snap2.data());
    };
    loadFromFirestore();
  }, [user]);

  const handleComplete = async () => {
    const dayName = selectedDay;
    const sessionData = workouts[dayName].sections
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

  const personalBests = getPersonalBests(history);
  const weeklyData = getWeeklyData(history);
  const flatSessions = Object.values(history).flat();
  const streak = calculateStreak(flatSessions);

  if (selectedDay) {
    return (
      <WorkoutDay
        day={selectedDay}
        data={workouts[selectedDay]}
        lastUsed={lastUsed}
        user={user}
        onComplete={handleComplete}
        setMode={setMode}
      />
    );
  }

  return (
    <div className="text-white min-h-screen bg-black p-6">
      <h2 className="text-2xl font-bold text-center mb-2">🔥 Your Dashboard</h2>
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
        {Object.keys(workouts).map((day, i) => (
          <button
            key={i}
            onClick={() => setSelectedDay(day)}
            className="bg-gray-800 hover:bg-gray-700 py-3 px-4 rounded text-white shadow"
          >
            {day}
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

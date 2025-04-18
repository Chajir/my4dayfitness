// src/MainAppCrossFit.jsx
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import WorkoutDay from "./components/WorkoutDay";
import Calendar from "react-calendar";
import { generateCrossFitWorkout } from "./helpers/helpers"; // ✅ Your new CrossFit logic here
import { calculateStreak, getPersonalBests, getWeeklyData } from "./helpers/helpers";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function MainAppCrossFit({ user, setMode }) {
  const [workout, setWorkout] = useState(null);
  const [lastUsed, setLastUsed] = useState({});
  const [history, setHistory] = useState({});
  const [streak, setStreak] = useState(0);
  const [showChart, setShowChart] = useState(false);

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

      const flatSessions = Object.values(hist).flat();
      const uniqueDays = [...new Set(flatSessions.map(e => e.timestamp?.split(",")[0]))];
      setStreak(uniqueDays.length);

      const newWorkout = generateCrossFitWorkout(); // ✅ Pure logic
      setWorkout(newWorkout);
    };

    fetchData();
  }, [user]);

  const saveHistory = async (data) => {
    const ref = doc(db, "history", user.uid);
    await setDoc(ref, data);
  };

  const saveLastUsed = async (data) => {
    const ref = doc(db, "exerciseData", user.uid);
    await setDoc(ref, data);
  };

  const handleComplete = () => {
    const parsedData = workout.sections
      .flatMap(s => s.exercises)
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
      CrossFit: [...(history["CrossFit"] || []), {
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

  if (!workout) return <div className="text-white p-6">Loading CrossFit workout...</div>;

  return (
    <div className="text-white min-h-screen bg-black p-6">
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
        day={"CrossFit"}
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

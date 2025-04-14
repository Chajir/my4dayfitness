import React, { useState, useEffect, useRef } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getPersonalBests, calculateStreak, getWeeklyData } from "./utils";

const workouts = {
  "Day 1": {
    title: "Resistance Day A",
    sections: [
      {
        name: "Movement Prep",
        exercises: [
          "Leg Extension Hip Bridge March",
          "Stability Ball Shoulder T’s",
          "Stability Ball Shoulder W’s",
          "Stability Ball Shoulder L’s",
          "Stability Ball Shoulder Y’s",
        ],
      },
      {
        name: "Dynamic Warm-Up",
        exercises: [
          "Stationary Inchworm",
          "Alternating Quads Stretch",
        ],
      },
      {
        name: "Power",
        exercises: [
          "Kettlebell Swing",
          "Linear Rapid Response Jumps",
        ],
      },
      {
        name: "Strength",
        exercises: [
          "Stability Ball Trunk Rollout",
          "Barbell Deadlift",
          "Barbell Bench Press",
          "Kettlebell Goblet Bulgarian Split Squat",
        ],
      },
      {
        name: "Resistance",
        exercises: [
          "1 Arm Seated Cable Row",
          "Lying Dumbbell Triceps Extension",
        ],
      },
      {
        name: "ESD (Energy System Development)",
        exercises: ["Rower"],
      },
      {
        name: "Cool Down",
        exercises: [
          "Cobra Pose",
          "Passive Lying Hip Abductors Stretch",
        ],
      },
    ],
  },
  "Day 2": {
    title: "Resistance Day B",
    sections: [
      {
        name: "Movement Prep",
        exercises: [
          "Back Lying Mini Band Hip Internal",
          "Stability Ball Shoulder L’s",
          "Stability Ball Shoulder Y’s",
        ],
      },
      {
        name: "Dynamic Warm-Up",
        exercises: [
          "Alternative Reverse Lunge",
          "Toe Touch to Deep Squat",
        ],
      },
      {
        name: "Power",
        exercises: [
          "Perpendicular Med Ball Hip Toss",
          "Lateral Rapid Response Jumps",
        ],
      },
      {
        name: "Strength",
        exercises: [
          "Barbell Back Squat",
          "1 Arm Kettlebell Farmer’s Carry",
          "Neutral Grip Pull Up",
          "1 Leg Dumbbell Hip Hinge",
        ],
      },
      {
        name: "Resistance",
        exercises: [
          "Half Kneel 1-Arm Landmine Press",
          "Dumbbell Biceps Curl",
        ],
      },
      {
        name: "ESD (Energy System Development)",
        exercises: ["Fan Bike"],
      },
      {
        name: "Cool Down",
        exercises: [
          "Passive 90/90 Glutes Stretch",
          "Active Lats Stretch",
        ],
      },
    ],
  },
  "Day 3": {
    title: "Resistance Day C",
    sections: [
      {
        name: "Movement Prep",
        exercises: [
          "Side Lying Mini Band Hip External",
          "Beast Plank",
          "Tall Kneel Kettlebell Halo",
        ],
      },
      {
        name: "Dynamic Warm-Up",
        exercises: [
          "Alternative Forward Lunge",
          "Alternative Lateral Lunge",
        ],
      },
      {
        name: "Power",
        exercises: [
          "Med Ball Slam",
          "Pogo Hop",
        ],
      },
      {
        name: "Strength",
        exercises: [
          "Barbell Hip Hinge",
          "Lateral Beast Crawl",
          "Dumbbell Incline Bench Press",
          "Kettlebell Front Rack Lateral Squat",
        ],
      },
      {
        name: "Resistance",
        exercises: [
          "Alternating Dumbbell Bent Over Row",
          "Cable Pallof Press",
        ],
      },
      {
        name: "ESD (Energy System Development)",
        exercises: ["Ski Erg"],
      },
      {
        name: "Cool Down",
        exercises: [
          "Passive Half Kneel Quads Stretch",
          "Passive Triceps/Lats Stretch",
        ],
      },
    ],
  },
  "Day 4": {
    title: "Alactic Power Intervals",
    sections: [
      {
        name: "Movement Prep",
        exercises: [
          "Foam Roll Calves",
          "Foam Roll Hamstrings",
          "Foam Roll Quadriceps",
          "Foam Roll Hip Flexors",
          "Foam Roll Lats",
        ],
      },
      {
        name: "Dynamic Warm-Up",
        exercises: [
          "Mini Band Hip Flexion",
          "Mini Band Hip Extension",
          "Treadmill Butt Kick",
          "Treadmill Lateral Shuffle",
          "Treadmill High Knee Run",
        ],
      },
      {
        name: "ESD (Energy System Development)",
        exercises: [
          "Curve Treadmill",
          "Battle Rope Double Arm Slam",
        ],
      },
      {
        name: "Cool Down",
        exercises: [
          "Passive Half Kneel Quads Stretch",
          "Passive Straight Leg Hamstrings Stretch",
          "Child’s Pose",
        ],
      },
    ],
  },
};

// Helper function to calculate personal bests
const getPersonalBests = (exerciseHistory) => {
  const bests = {};
  Object.entries(exerciseHistory).forEach(([day, sessions]) => {
    sessions.forEach((entry) => {
      const parsed = JSON.parse(entry.data || '{}');
      Object.entries(parsed).forEach(([exercise, data]) => {
        const weight = parseInt(data.weight || 0);
        const reps = (data.reps || []).reduce((sum, r) => sum + parseInt(r || 0), 0);
        if (!bests[exercise] || weight > bests[exercise].weight || reps > bests[exercise].reps) {
          bests[exercise] = { weight, reps, date: entry.timestamp };
        }
      });
    });
  });
  return bests;
};

// Count workout streak
const calculateStreak = (history) => {
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toLocaleDateString();
    if (Object.values(history).flat().some(h => h.timestamp.includes(dateString))) {
      streak++;
    } else break;
  }
  return streak;
};

// Generate weekly workout frequency data for charts
const getWeeklyData = (history) => {
  const today = new Date();
  const data = Array(7).fill(0);
  Object.values(history).flat().forEach(entry => {
    const date = new Date(entry.timestamp);
    const diff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
    if (diff < 7) {
      data[6 - diff] += 1;
    }
  });
  return data.map((count, i) => ({ day: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][i], count }));
};

const RestTimer = ({ duration, onFinish }) => {
  const [seconds, setSeconds] = useState(duration);

  useEffect(() => {
    if (seconds === 0) {
      onFinish();
      return;
    }
    const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds, onFinish]);

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-xl shadow-lg">
      ⏱️ Rest: {seconds}s
    </div>
  );
};

const WorkoutDay = ({ day, data, onComplete }) => {
  const [checked, setChecked] = useState(data.sections.map(s => s.exercises.map(() => false)));
  const [exerciseData, setExerciseData] = useState(() => JSON.parse(localStorage.getItem(`exerciseData-${day}`) || '{}'));
  const [lastUsed, setLastUsed] = useState(() => JSON.parse(localStorage.getItem("lastExerciseData") || '{}'));
  const [showSummary, setShowSummary] = useState(false);
  const [exerciseQueue, setExerciseQueue] = useState([]);
  const [current, setCurrent] = useState(null);
  const [showTimer, setShowTimer] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const currentRef = useRef(null);

  useEffect(() => {
    const all = data.sections.flatMap(s => s.exercises);
    setExerciseQueue(all);
    setCurrent(all[0]);

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [data]);

  useEffect(() => {
    localStorage.setItem(`exerciseData-${day}`, JSON.stringify(exerciseData));
  }, [exerciseData, day]);

  useEffect(() => {
    if (currentRef.current) {
      currentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [current]);

  const toggleCheckbox = (i, j) => {
    const updated = [...checked];
    updated[i][j] = !updated[i][j];
    setChecked(updated);
  };

  const handleChange = (exercise, field, value) => {
    setExerciseData(prev => {
      const updated = {
        ...prev,
        [exercise]: {
          ...prev[exercise],
          [field]: value,
        },
      };
      if (field === "sets") {
        const sets = parseInt(value) || 0;
        updated[exercise].reps = Array(sets).fill("");
      }
      return updated;
    });
  };

  const handleRepChange = (exercise, index, value) => {
    setExerciseData(prev => {
      const updatedReps = [...(prev[exercise]?.reps || [])];
      updatedReps[index] = value;
      return {
        ...prev,
        [exercise]: {
          ...prev[exercise],
          reps: updatedReps,
        },
      };
    });
  };

  const incrementValue = (exercise, field, step = 1) => {
    const currentVal = parseInt(exerciseData[exercise]?.[field]) || 0;
    handleChange(exercise, field, currentVal + step);
  };
  const decrementValue = (exercise, field, step = 1) => {
    const currentVal = parseInt(exerciseData[exercise]?.[field]) || 0;
    handleChange(exercise, field, Math.max(0, currentVal - step));
  };

  const goToNextExercise = () => {
    const index = exerciseQueue.indexOf(current);
    const next = exerciseQueue[index + 1];
    if (next) {
      setShowTimer(true);
      setTimeout(() => setCurrent(next), 1000);
    }
  };

  const totalExercises = checked.reduce((sum, s) => sum + s.length, 0);
  const completedExercises = checked.reduce((sum, s) => sum + s.filter(Boolean).length, 0);
  const progress = Math.round((completedExercises / totalExercises) * 100);

  const handleCompleteSession = () => {
    const timestamp = new Date().toLocaleString();
    const history = JSON.parse(localStorage.getItem("workoutHistory") || "{}");
    history[day] = [...(history[day] || []), timestamp];
    localStorage.setItem("workoutHistory", JSON.stringify(history));
    localStorage.setItem("lastExerciseData", JSON.stringify({ ...lastUsed, ...exerciseData }));
    setShowSummary(true);
    onComplete();
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="text-white p-4 space-y-6"
    >
      <h2 className="text-2xl font-bold mb-4">{day} – {data.title}</h2>
      <div className="sticky top-0 z-10 bg-black py-2 mb-6">
        <div className="w-full bg-gray-800 h-4 rounded-full overflow-hidden">
          <div
            className="h-4 bg-green-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      {data.sections.map((section, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="mb-6"
        >
          <h3 className="text-xl font-semibold mb-2 sticky top-0 bg-black z-10 py-1">{section.name}</h3>
          <ul className="space-y-6">
            {section.exercises.map((exercise, j) => {
              const last = lastUsed[exercise];
              const isCurrent = exercise === current;
              const videoLink = exerciseData[exercise]?.video || workouts?.[day]?.sections?.[i]?.video;
              return (
                <li
                  key={j}
                  ref={isCurrent ? currentRef : null}
                  className={`p-4 rounded-xl shadow ${isCurrent ? 'bg-green-700' : 'bg-gray-900'}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" checked={checked[i][j]} onChange={() => toggleCheckbox(i, j)} />
                      <span className="font-semibold">{exercise}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {videoLink && (
                        <a href={videoLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-300 underline">
                          ▶️ Video
                        </a>
                      )}
                      {isCurrent && (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => { setShowTimer(true); goToNextExercise(); }}
                          className="text-sm px-3 py-1 bg-white text-black rounded"
                        >✅ Done / Next</motion.button>
                      )}
                    </div>
                  </div>
                  {last && (
                    <div className="text-sm text-gray-400 mb-2">
                      Last used: {last.sets || 0} sets @ {last.weight || 0} lbs {last.reps?.length ? `– Reps: ${last.reps.join(', ')}` : ""}
                    </div>
                  )}
                  <div className="flex gap-6 flex-wrap mb-2">
                    <div>
                      <label className="text-sm">Sets</label>
                      <div className="flex items-center gap-1">
                        <button onClick={() => decrementValue(exercise, "sets")} className="px-2 bg-gray-700">-</button>
                        <input
                          type="number"
                          value={exerciseData[exercise]?.sets || ""}
                          onChange={(e) => handleChange(exercise, "sets", e.target.value)}
                          className="w-16 px-2 py-1 bg-black border border-gray-600 text-white rounded text-center"
                        />
                        <button onClick={() => incrementValue(exercise, "sets")} className="px-2 bg-gray-700">+</button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm">Weight (lbs)</label>
                      <div className="flex items-center gap-1">
                        <button onClick={() => decrementValue(exercise, "weight", 5)} className="px-2 bg-gray-700">-</button>
                        <input
                          type="number"
                          value={exerciseData[exercise]?.weight || ""}
                          onChange={(e) => handleChange(exercise, "weight", e.target.value)}
                          className="w-20 px-2 py-1 bg-black border border-gray-600 text-white rounded text-center"
                        />
                        <button onClick={() => incrementValue(exercise, "weight", 5)} className="px-2 bg-gray-700">+</button>
                      </div>
                    </div>
                  </div>
                  {exerciseData[exercise]?.reps?.length > 0 && (
                    <div className="mt-2">
                      <label className="text-sm">Reps per set:</label>
                      <div className="flex gap-2 flex-wrap mt-1">
                        {exerciseData[exercise].reps.map((rep, idx) => (
                          <input
                            key={idx}
                            type="number"
                            value={rep}
                            onChange={(e) => handleRepChange(exercise, idx, e.target.value)}
                            className="w-16 px-2 py-1 bg-black border border-gray-600 text-white rounded text-center text-sm"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-3">
                    <label className="text-sm block mb-1">Notes</label>
                    <textarea
                      rows={2}
                      className="w-full bg-black border border-gray-600 text-white rounded px-2 py-1 text-sm"
                      placeholder="e.g. Felt strong, next time increase weight"
                      value={exerciseData[exercise]?.note || ""}
                      onChange={(e) => handleChange(exercise, "note", e.target.value)}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </motion.div>
      ))}
      {completedExercises === totalExercises && (
        <div className="mt-8 text-center">
          <button
            onClick={handleCompleteSession}
            className="px-6 py-3 border border-green-500 text-green-500 rounded-full hover:bg-green-700/20"
          >
            ✅ Mark Session Complete
          </button>
        </div>
      )}
      {showTimer && <RestTimer duration={30} onFinish={() => setShowTimer(false)} />}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-full shadow-lg"
        >⬆️ Top</button>
      )}
    </motion.div>
  );
};

export default function App() {
  const [selectedDay, setSelectedDay] = useState(() => localStorage.getItem("selectedDay") || null);
  const [history, setHistory] = useState({});
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("workoutHistory") || "{}");
    setHistory(saved);
  }, []);

  useEffect(() => {
    if (selectedDay) localStorage.setItem("selectedDay", selectedDay);
    else localStorage.removeItem("selectedDay");
  }, [selectedDay]);

  const streak = calculateStreak(history);
  const personalBests = getPersonalBests(history);
  const weeklyData = getWeeklyData(history);

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <AnimatePresence mode="wait">
        {!selectedDay ? (
          <motion.div
            key="home"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 max-w-4xl mx-auto">
              {Object.keys(workouts).map((day) => (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  key={day}
                  className="w-full bg-gray-900 py-4 rounded-xl text-xl font-semibold shadow transition"
                  onClick={() => setSelectedDay(day)}
                >
                  {day}
                </motion.button>
              ))}
            </div>

            <div className="text-center mb-6">
              <h2 className="text-xl font-bold mb-2">🔥 Workout Streak: {streak} day{streak !== 1 ? 's' : ''}</h2>
              {streak === 3 && <p className="text-green-400">💪 3-Day Streak! Keep it up!</p>}
              {streak === 7 && <p className="text-yellow-400">🔥 One Week Streak! You're on fire!</p>}
              {streak === 30 && <p className="text-pink-400">🏆 30-Day Legend! Amazing!</p>}
            </div>

            <div className="sticky top-0 bg-black z-10 py-2">
              <h2 className="text-xl font-bold mb-4 text-center">Workout History</h2>
            </div>
            <div className="flex justify-center mb-4">
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
            {Object.keys(history).length === 0 ? (
              <p className="text-gray-400 text-center">No sessions completed yet.</p>
            ) : (
              <ul className="space-y-4 max-w-xl mx-auto">
                {Object.entries(history).map(([day, entries]) => (
                  <li key={day}>
                    <h3 className="font-semibold text-lg">{day}</h3>
                    <ul className="ml-4 list-disc text-sm text-gray-300">
                      {entries.map((entry, i) => (
                        <li key={i}>{entry.timestamp}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-10 max-w-xl mx-auto">
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
            </div>

            {showChart && (
              <div className="mt-4 max-w-xl mx-auto bg-gray-900 p-4 rounded-xl shadow">
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
          </motion.div>
        ) : (
          <motion.div
            key="day"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={() => setSelectedDay(null)}
              className="text-blue-400 underline mb-4"
            >
              ← Back
            </button>
            <WorkoutDay
              day={selectedDay}
              data={workouts[selectedDay]}
              onComplete={() => {
                const saved = JSON.parse(localStorage.getItem("workoutHistory") || "{}");
                setHistory(saved);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

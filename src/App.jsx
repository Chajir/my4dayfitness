import React, { useState, useEffect, useRef } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { motion, AnimatePresence } from "framer-motion";

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
  const currentRef = useRef(null);

  useEffect(() => {
    const all = data.sections.flatMap(s => s.exercises);
    setExerciseQueue(all);
    setCurrent(all[0]);
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

  if (showSummary) {
    return (
      <div className="text-white p-4">
        <h2 className="text-2xl font-bold mb-4">{day} – Summary</h2>
        <ul className="space-y-4">
          {Object.entries(exerciseData).map(([exercise, data], i) => (
            <li key={i} className="bg-gray-900 p-4 rounded">
              <div className="font-semibold">{exercise}</div>
              <div className="text-sm text-gray-400">{data.sets} sets @ {data.weight} lbs</div>
              {data.reps && (
                <div className="text-sm text-gray-500">Reps: {data.reps.join(', ')}</div>
              )}
            </li>
          ))}
        </ul>
        <button
          onClick={() => setShowSummary(false)}
          className="mt-6 px-4 py-2 border border-blue-500 rounded-full text-blue-500"
        >← Back to Workout</button>
      </div>
    );
  }

  return (
    <div className="text-white p-4">
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
        <div key={i} className="mb-6">
          <h3 className="text-xl font-semibold mb-2">{section.name}</h3>
          <ul className="space-y-6">
            {section.exercises.map((exercise, j) => {
              const last = lastUsed[exercise];
              const isCurrent = exercise === current;
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
                    {isCurrent && (
                      <button
                        onClick={() => { setShowTimer(true); goToNextExercise(); }}
                        className="text-sm px-3 py-1 bg-white text-black rounded"
                      >✅ Done / Next</button>
                    )}
                  </div>
                  {last && (
                    <div className="text-sm text-gray-400 mb-2">
                      Last used: {last.sets || 0} sets @ {last.weight || 0} lbs {last.reps?.length ? `– Reps: ${last.reps.join(', ')}` : ""}
                    </div>
                  )}
                  <div className="flex gap-6 flex-wrap">
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
                    <div className="mt-3">
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
                </li>
              );
            })}
          </ul>
        </div>
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
    </div>
  );
};

export default function App() {
  const [selectedDay, setSelectedDay] = useState(null);
  const [history, setHistory] = useState({});

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("workoutHistory") || "{}");
    setHistory(saved);
  }, []);

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
            <div className="space-y-4 mb-6">
              {Object.keys(workouts).map((day) => (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  key={day}
                  className="w-full max-w-md bg-gray-900 py-4 rounded-xl text-xl font-semibold shadow transition"
                  onClick={() => setSelectedDay(day)}
                >
                  {day}
                </motion.button>
              ))}
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Workout History</h2>
              <Calendar
                className="mb-4 rounded-xl overflow-hidden"
                tileClassName={({ date }) => {
                  const formatted = date.toLocaleDateString();
                  return Object.values(history).flat().some(h => h.includes(formatted))
                    ? "bg-green-500 text-white rounded-full"
                    : null;
                }}
              />
              {Object.keys(history).length === 0 ? (
                <p className="text-gray-400">No sessions completed yet.</p>
              ) : (
                <ul className="space-y-4">
                  {Object.entries(history).map(([day, entries]) => (
                    <li key={day}>
                      <h3 className="font-semibold text-lg">{day}</h3>
                      <ul className="ml-4 list-disc text-sm text-gray-300">
                        {entries.map((entry, i) => (
                          <li key={i}>{entry}</li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
            </div>
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

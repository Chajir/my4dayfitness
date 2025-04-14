import React, { useState, useEffect } from "react";

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

const WorkoutDay = ({ day, data, onComplete }) => {
  const [completed, setCompleted] = useState(false);
  const [checked, setChecked] = useState(
    data.sections.map((section) => section.exercises.map(() => false))
  );
  const [exerciseData, setExerciseData] = useState(() => {
    const saved = localStorage.getItem(`exerciseData-${day}`);
    return saved ? JSON.parse(saved) : {};
  });
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    localStorage.setItem(`exerciseData-${day}`, JSON.stringify(exerciseData));
  }, [exerciseData, day]);

  const toggleCheckbox = (sectionIndex, exerciseIndex) => {
    const updated = [...checked];
    updated[sectionIndex][exerciseIndex] = !updated[sectionIndex][exerciseIndex];
    setChecked(updated);
  };

  const handleChange = (exercise, field, value) => {
    setExerciseData((prev) => {
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
    setExerciseData((prev) => {
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
    const current = parseInt(exerciseData[exercise]?.[field]) || 0;
    handleChange(exercise, field, current + step);
  };

  const decrementValue = (exercise, field, step = 1) => {
    const current = parseInt(exerciseData[exercise]?.[field]) || 0;
    handleChange(exercise, field, Math.max(0, current - step));
  };

  const allExercisesChecked = checked.every((section) =>
    section.every((exercise) => exercise)
  );

  const totalExercises = checked.reduce((sum, section) => sum + section.length, 0);
  const totalCompleted = checked.reduce(
    (sum, section) => sum + section.filter(Boolean).length,
    0
  );
  const progress = Math.round((totalCompleted / totalExercises) * 100);

  const handleComplete = () => {
    const timestamp = new Date().toLocaleString();
    const history = JSON.parse(localStorage.getItem("workoutHistory") || "{}");
    history[day] = [...(history[day] || []), timestamp];
    localStorage.setItem("workoutHistory", JSON.stringify(history));
    setCompleted(true);
    setShowSummary(true);
    onComplete();
  };

  if (showSummary) {
    return (
      <div className="text-white p-4">
        <h2 className="text-2xl font-bold mb-4">{day} – Summary</h2>
        <ul className="space-y-4">
          {Object.entries(exerciseData).map(([exercise, data], idx) => (
            <li key={idx} className="bg-gray-900 p-4 rounded-lg">
              <div className="text-lg font-semibold mb-1">{exercise}</div>
              <div className="text-sm text-gray-300">
                Sets: {data.sets || 0} | Weight: {data.weight || 0} lbs
              </div>
              {data.reps && (
                <div className="text-sm text-gray-400 mt-1">
                  Reps: {data.reps.join(", ")}
                </div>
              )}
            </li>
          ))}
        </ul>
        <button
          onClick={() => setShowSummary(false)}
          className="mt-6 px-4 py-2 border border-blue-500 rounded-full text-blue-500 hover:bg-blue-500 hover:text-black"
        >
          ← Back to Workout
        </button>
      </div>
    );
  }

  return (
    <div className="text-white p-4">
      <h2 className="text-2xl font-bold mb-4">{day} – {data.title}</h2>
      <div className="w-full bg-gray-800 h-4 rounded-full mb-6 overflow-hidden">
        <div
          className="h-4 bg-green-500 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      {data.sections.map((section, i) => (
        <div key={i} className="mb-6">
          <h3 className="text-xl font-semibold mb-2">{section.name}</h3>
          <ul className="space-y-6">
            {section.exercises.map((exercise, j) => (
              <li key={j} className="bg-[#1a1a1a] rounded-xl p-4 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={checked[i][j]}
                      onChange={() => toggleCheckbox(i, j)}
                      className="w-5 h-5"
                    />
                    <span className="text-lg font-semibold">{exercise}</span>
                  </div>
                </div>
                <div className="ml-6 mt-2 flex flex-wrap gap-6">
                  <div>
                    <label className="block text-sm mb-1">Sets</label>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => decrementValue(exercise, "sets")} className="px-2 py-1 bg-gray-700 rounded">-</button>
                      <input
                        type="number"
                        value={exerciseData[exercise]?.sets || ""}
                        onChange={(e) => handleChange(exercise, "sets", e.target.value)}
                        className="bg-black text-white border border-gray-600 rounded px-2 py-1 w-16 text-center"
                      />
                      <button onClick={() => incrementValue(exercise, "sets")} className="px-2 py-1 bg-gray-700 rounded">+</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Weight (lbs)</label>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => decrementValue(exercise, "weight", 5)} className="px-2 py-1 bg-gray-700 rounded">-</button>
                      <input
                        type="number"
                        value={exerciseData[exercise]?.weight || ""}
                        onChange={(e) => handleChange(exercise, "weight", e.target.value)}
                        className="bg-black text-white border border-gray-600 rounded px-2 py-1 w-20 text-center"
                      />
                      <button onClick={() => incrementValue(exercise, "weight", 5)} className="px-2 py-1 bg-gray-700 rounded">+</button>
                    </div>
                  </div>
                </div>
                {exerciseData[exercise]?.reps?.length > 0 && (
                  <div className="ml-6 mt-4">
                    <label className="block text-sm font-medium mb-1">Reps per set:</label>
                    <div className="flex flex-wrap gap-2">
                      {exerciseData[exercise].reps.map((rep, idx) => (
                        <input
                          key={idx}
                          type="number"
                          placeholder={`Set ${idx + 1}`}
                          value={rep}
                          onChange={(e) => handleRepChange(exercise, idx, e.target.value)}
                          className="bg-black border border-gray-600 rounded px-2 py-1 w-16 text-center text-sm"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
      {allExercisesChecked && (
        <div className="mt-6">
          <button
            onClick={handleComplete}
            className="w-full max-w-md mx-auto flex items-center justify-center gap-2 px-6 py-3 border border-green-500 rounded-full text-green-500 hover:bg-green-700/10"
          >
            <span>✓</span> Mark Entire Session as Complete
          </button>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [selectedDay, setSelectedDay] = useState(null);
  const [history, setHistory] = useState({});

  useEffect(() => {
    const storedHistory = JSON.parse(localStorage.getItem("workoutHistory") || "{}");
    setHistory(storedHistory);
  }, [selectedDay]);

  const handleUpdateHistory = () => {
    const updated = JSON.parse(localStorage.getItem("workoutHistory") || "{}");
    setHistory(updated);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      {!selectedDay ? (
        <>
          <div className="flex flex-col items-center gap-4 mb-8">
            {Object.keys(workouts).map((day) => (
              <button
                key={day}
                className="w-full max-w-md bg-gray-900 text-white py-4 rounded-2xl text-xl shadow-lg"
                onClick={() => setSelectedDay(day)}
              >
                {day}
              </button>
            ))}
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2">Workout History</h2>
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
        </>
      ) : (
        <div>
          <button
            onClick={() => setSelectedDay(null)}
            className="mb-4 text-blue-400 underline"
          >
            ← Back
          </button>
          <WorkoutDay day={selectedDay} data={workouts[selectedDay]} onComplete={handleUpdateHistory} />
        </div>
      )}
    </div>
  );
}

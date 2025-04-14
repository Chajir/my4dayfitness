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

      // Reset reps if sets number changes
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

  const allExercisesChecked = checked.every((section) =>
    section.every((exercise) => exercise)
  );

  const handleComplete = () => {
    const timestamp = new Date().toLocaleString();
    const history = JSON.parse(localStorage.getItem("workoutHistory") || "{}");
    history[day] = [...(history[day] || []), timestamp];
    localStorage.setItem("workoutHistory", JSON.stringify(history));
    setCompleted(true);
    onComplete();
  };

  return (
    <div className="text-white p-4">
      <h2 className="text-2xl font-bold mb-4">{day} – {data.title}</h2>
      {data.sections.map((section, i) => (
        <div key={i} className="mb-6">
          <h3 className="text-xl font-semibold mb-2">{section.name}</h3>
          <ul className="space-y-6">
            {section.exercises.map((exercise, j) => (
              <li key={j} className="space-y-1">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={checked[i][j]}
                    onChange={() => toggleCheckbox(i, j)}
                    className="w-5 h-5"
                  />
                  <span className="font-medium">{exercise}</span>
                </div>
                <div className="ml-6 flex flex-wrap gap-4">
                  <div>
                    <label className="block text-sm">Sets</label>
                    <input
                      type="number"
                      value={exerciseData[exercise]?.sets || ""}
                      onChange={(e) => handleChange(exercise, "sets", e.target.value)}
                      className="bg-gray-800 border border-gray-600 rounded px-2 py-1 w-20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm">Weight (lbs)</label>
                    <input
                      type="text"
                      value={exerciseData[exercise]?.weight || ""}
                      onChange={(e) => handleChange(exercise, "weight", e.target.value)}
                      className="bg-gray-800 border border-gray-600 rounded px-2 py-1 w-24"
                    />
                  </div>
                </div>
                {exerciseData[exercise]?.reps?.length > 0 && (
                  <div className="ml-6 mt-2">
                    <label className="block text-sm font-medium mb-1">Reps per set:</label>
                    <div className="flex flex-wrap gap-2">
                      {exerciseData[exercise].reps.map((rep, idx) => (
                        <input
                          key={idx}
                          type="number"
                          placeholder={`Set ${idx + 1}`}
                          value={rep}
                          onChange={(e) => handleRepChange(exercise, idx, e.target.value)}
                          className="bg-gray-800 border border-gray-600 rounded px-2 py-1 w-16 text-sm"
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
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={completed}
              onChange={handleComplete}
              className="w-6 h-6 mr-2"
            />
            <span className="text-lg">Mark entire session as completed</span>
          </label>
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
                className="w-full max-w-md bg-gray-800 text-white py-4 rounded-2xl text-xl shadow-lg"
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

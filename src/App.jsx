import React, { useState } from "react";

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

const WorkoutDay = ({ day, data }) => {
  const [completed, setCompleted] = useState(false);
  const [checked, setChecked] = useState(
    data.sections.map((section) => section.exercises.map(() => false))
  );

  const toggleCheckbox = (sectionIndex, exerciseIndex) => {
    const updated = [...checked];
    updated[sectionIndex][exerciseIndex] = !updated[sectionIndex][exerciseIndex];
    setChecked(updated);
  };

  const allExercisesChecked = checked.every((section) =>
    section.every((exercise) => exercise)
  );

  return (
    <div className="text-white p-4">
      <h2 className="text-2xl font-bold mb-4">{day} – {data.title}</h2>
      {data.sections.map((section, i) => (
        <div key={i} className="mb-4">
          <h3 className="text-xl font-semibold mb-2">{section.name}</h3>
          <ul className="space-y-2">
            {section.exercises.map((exercise, j) => (
              <li key={j} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={checked[i][j]}
                  onChange={() => toggleCheckbox(i, j)}
                  className="w-5 h-5"
                />
                <span>{exercise}</span>
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
              onChange={() => setCompleted(!completed)}
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

  return (
    <div className="min-h-screen bg-black text-white p-4">
      {!selectedDay ? (
        <div className="grid grid-cols-1 gap-4">
          {Object.keys(workouts).map((day) => (
            <button
              key={day}
              className="bg-gray-800 text-white py-4 rounded-2xl text-xl shadow-lg"
              onClick={() => setSelectedDay(day)}
            >
              {day}
            </button>
          ))}
        </div>
      ) : (
        <div>
          <button
            onClick={() => setSelectedDay(null)}
            className="mb-4 text-blue-400 underline"
          >
            ← Back
          </button>
          <WorkoutDay day={selectedDay} data={workouts[selectedDay]} />
        </div>
      )}
    </div>
  );
}

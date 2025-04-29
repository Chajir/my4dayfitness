// src/data/exerciseMap.js
const exerciseMap = {
  // AI Mode Exercises
  "Jumping Jacks": { bodyParts: ["legs", "arms"], category: "warmup" },
  "Push Ups": { bodyParts: ["chest", "shoulders", "arms"], category: "strength" },
  "Dumbbell Squats": { bodyParts: ["legs"], category: "strength" },
  "Kettlebell Swing": { bodyParts: ["legs", "back"], category: "strength" },
  "Plank": { bodyParts: ["core"], category: "core" },
  "Mountain Climbers": { bodyParts: ["core", "legs"], category: "cardio" },
  "Bicep Curls": { bodyParts: ["arms"], category: "strength" },
  "Leg Press": { bodyParts: ["legs"], category: "strength" },
  "Treadmill Run": { bodyParts: ["legs"], category: "cardio" },
  // CrossFit Exercises
  "Burpees": { bodyParts: ["legs", "chest", "arms"], category: "cardio" },
  "Thrusters": { bodyParts: ["legs", "shoulders"], category: "strength" },
  "Wall Balls": { bodyParts: ["legs", "shoulders"], category: "strength" },
  "Box Jumps": { bodyParts: ["legs"], category: "cardio" },
  "Double Unders": { bodyParts: ["legs", "arms"], category: "cardio" },
  "Pull-Ups": { bodyParts: ["back", "arms", "shoulders"], category: "strength" },
  "Deadlifts": { bodyParts: ["back", "legs"], category: "strength" },
  "Rowing (calories)": { bodyParts: ["back", "arms", "legs"], category: "cardio" },
  "Handstand Push-Ups": { bodyParts: ["shoulders", "arms"], category: "strength" },
  "Overhead Squats": { bodyParts: ["legs", "shoulders"], category: "strength" },
  "Sit-Ups": { bodyParts: ["core"], category: "core" },
  // Rehab Exercises
  "Rotator Cuff Stretch": { bodyParts: ["shoulders"], category: "rehab" },
  "Pendulum Swing": { bodyParts: ["shoulders"], category: "rehab" },
  "Quad Stretch": { bodyParts: ["legs"], category: "rehab" },
  "Hamstring Stretch": { bodyParts: ["legs"], category: "rehab" },
};

export default exerciseMap;
// src/helpers/helpers.js

export function generateAIWorkout(lastUsed, injuries = [], streak = 0, preferences = {}) {
  const { goal = "fat_loss", equipment = "bodyweight", sessionLength = "30" } = preferences;

  const allExercises = [
    { name: "Jumping Jacks", category: "warmup", type: "cardio", duration: 30 },
    { name: "Push Ups", category: "strength", type: "bodyweight" },
    { name: "Dumbbell Squats", category: "strength", type: "dumbbell" },
    { name: "Kettlebell Swing", category: "strength", type: "full_gym" },
    { name: "Plank", category: "core", type: "bodyweight", duration: 30 },
    { name: "Mountain Climbers", category: "cardio", type: "bodyweight", duration: 30 },
    { name: "Bicep Curls", category: "strength", type: "dumbbell" },
    { name: "Leg Press", category: "strength", type: "full_gym" },
    { name: "Treadmill Run", category: "cardio", type: "full_gym", duration: 300 }
  ];

  const filtered = allExercises.filter(ex => {
    if (injuries.some(inj => ex.name.toLowerCase().includes(inj))) return false;
    if (equipment === "bodyweight" && ex.type !== "bodyweight") return false;
    if (equipment === "dumbbells" && ex.type === "full_gym") return false;
    return true;
  });

  const getWorkoutByGoal = (goal) => {
    if (goal === "fat_loss") {
      return filtered.filter(ex => ex.category === "cardio" || ex.duration);
    } else if (goal === "muscle_gain") {
      return filtered.filter(ex => ex.category === "strength").slice(0, 5);
    } else if (goal === "strength") {
      return filtered.filter(ex => ex.category === "strength").map(ex => ({ ...ex, sets: 4, reps: 6 }));
    } else if (goal === "endurance") {
      return filtered.filter(ex => ex.category === "cardio" || ex.duration);
    }
    return filtered.slice(0, 5);
  };

  const baseWorkout = getWorkoutByGoal(goal);
  const sections = [
    {
      name: "Main Session",
      exercises: baseWorkout.map(ex => ({
        name: ex.name,
        duration: ex.duration || undefined,
        sets: ex.sets || 3,
        reps: ex.reps || 12,
        weight: lastUsed[ex.name]?.weight || 0
      }))
    }
  ];

  if (sessionLength === "45") {
    sections.push({
      name: "Bonus Round",
      exercises: filtered.filter(e => !baseWorkout.includes(e)).slice(0, 3).map(ex => ({
        name: ex.name,
        duration: ex.duration || undefined,
        sets: 2,
        reps: 15,
        weight: lastUsed[ex.name]?.weight || 0
      }))
    });
  }

  return {
    title: "AI Generated Workout",
    sections
  };
}

export function generateCrossFitWorkout() {
  const wodStyles = ["AMRAP", "RFT", "EMOM"];
  const selectedStyle = wodStyles[Math.floor(Math.random() * wodStyles.length)];

  const movements = [
    { name: "Burpees", reps: 15 },
    { name: "Thrusters", reps: 12 },
    { name: "Wall Balls", reps: 20 },
    { name: "Box Jumps", reps: 10 },
    { name: "Kettlebell Swings", reps: 15 },
    { name: "Double Unders", reps: 50 },
    { name: "Pull-Ups", reps: 8 },
    { name: "Deadlifts", reps: 5 },
    { name: "Rowing (calories)", reps: 12 },
    { name: "Handstand Push-Ups", reps: 6 },
    { name: "Overhead Squats", reps: 10 },
    { name: "Sit-Ups", reps: 25 }
  ];

  // Randomize and pick 4 exercises
  const shuffled = movements.sort(() => 0.5 - Math.random());
  const selectedExercises = shuffled.slice(0, 4);

  const formatted = selectedExercises.map(ex => ({
    name: ex.name,
    reps: ex.reps,
    sets: 3, // default
    weight: 0,
  }));

  const titleMap = {
    AMRAP: "⏱ 12-Min AMRAP: As Many Rounds As Possible",
    RFT: "🏁 3 Rounds For Time",
    EMOM: "⏲ EMOM: Every Minute On the Minute (12 min)"
  };

  return {
    title: titleMap[selectedStyle],
    sections: [
      {
        name: selectedStyle,
        exercises: formatted
      }
    ]
  };
}

export function calculateStreak(history) {
  return Object.values(history).flat().reduce((acc, session) => acc + 1, 0);
}

export function getPersonalBests(history) {
  const bests = {};
  const sessions = Object.values(history).flat();
  sessions.forEach((s) => {
    try {
      const data = JSON.parse(s.data);
      for (const [name, record] of Object.entries(data)) {
        const prev = bests[name];
        if (!prev || record.weight > prev.weight) {
          bests[name] = { ...record };
        }
      }
    } catch {}
  });
  return bests;
}

export function getWeeklyData(history) {
  const counts = {};
  Object.values(history).flat().forEach(({ timestamp }) => {
    const day = new Date(timestamp).toLocaleDateString(undefined, { weekday: 'short' });
    counts[day] = (counts[day] || 0) + 1;
  });
  return Object.entries(counts).map(([day, count]) => ({ day, count }));
}

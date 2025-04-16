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

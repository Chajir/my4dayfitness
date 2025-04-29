// src/helpers/helpers.js
import exerciseMap from "../data/exerciseMap";

export function generateAIWorkout(lastUsed, injuries = [], streak = 0, preferences = {}) {
  const { goal = "fat_loss", equipment = "bodyweight", sessionLength = "30" } = preferences;

  const safeExercises = Object.keys(exerciseMap).filter((ex) => {
    const exercise = exerciseMap[ex];
    return (
      exercise.category !== "rehab" &&
      !injuries.some((injury) => exercise.bodyParts.includes(injury)) &&
      (equipment === "full_gym" ||
        (equipment === "dumbbells" && exercise.type !== "full_gym") ||
        (equipment === "bodyweight" && exercise.type === "bodyweight"))
    );
  });

  const rehabExercises = injuries
    .flatMap((injury) =>
      Object.keys(exerciseMap).filter(
        (ex) => exerciseMap[ex].category === "rehab" && exerciseMap[ex].bodyParts.includes(injury)
      )
    )
    .slice(0, 2);

  const getWorkoutByGoal = (goal) => {
    if (goal === "fat_loss") {
      return safeExercises.filter((ex) => exerciseMap[ex].category === "cardio" || exerciseMap[ex].duration);
    } else if (goal === "muscle_gain") {
      return safeExercises.filter((ex) => exerciseMap[ex].category === "strength").slice(0, 5);
    } else if (goal === "strength") {
      return safeExercises.filter((ex) => exerciseMap[ex].category === "strength").map((ex) => ({
        name: ex,
        sets: 4,
        reps: 6,
      }));
    } else if (goal === "endurance") {
      return safeExercises.filter((ex) => exerciseMap[ex].category === "cardio" || exerciseMap[ex].duration);
    }
    return safeExercises.slice(0, 5);
  };

  const baseWorkout = getWorkoutByGoal(goal);
  const sections = [
    {
      name: "Warm-up",
      exercises: safeExercises
        .filter((ex) => exerciseMap[ex].category === "warmup")
        .slice(0, 1)
        .map((ex) => ({
          name: ex,
          duration: 30,
          sets: 3,
          reps: 15,
          rest: 30,
        })),
    },
    {
      name: "Main Session",
      exercises: baseWorkout.map((ex) => ({
        name: typeof ex === "string" ? ex : ex.name,
        sets: ex.sets || 3,
        reps: ex.reps || 12,
        rest: 60,
        weight: lastUsed[typeof ex === "string" ? ex : ex.name]?.weight || 0,
      })),
    },
    {
      name: "Rehab",
      exercises: rehabExercises.map((ex) => ({
        name: ex,
        sets: 2,
        reps: 10,
        rest: 30,
      })),
    },
    {
      name: "Cool-down",
      exercises: [{ name: "Hamstring Stretch", sets: 2, reps: 10, rest: 30 }],
    },
  ].filter((section) => section.exercises.length > 0);

  return {
    title: "AI Generated Workout",
    sections,
  };
}

export function generateCrossFitWorkout(injuries = []) {
  const wodStyles = ["AMRAP", "RFT", "EMOM"];
  const selectedStyle = wodStyles[Math.floor(Math.random() * wodStyles.length)];

  const safeExercises = Object.keys(exerciseMap).filter(
    (ex) =>
      exerciseMap[ex].category !== "rehab" &&
      !injuries.some((injury) => exerciseMap[ex].bodyParts.includes(injury))
  );

  const rehabExercises = injuries
    .flatMap((injury) =>
      Object.keys(exerciseMap).filter(
        (ex) => exerciseMap[ex].category === "rehab" && exerciseMap[ex].bodyParts.includes(injury)
      )
    )
    .slice(0, 2);

  const shuffled = safeExercises.sort(() => 0.5 - Math.random());
  const selectedExercises = shuffled.slice(0, 4);

  const titleMap = {
    AMRAP: "⏱ 12-Min AMRAP: As Many Rounds As Possible",
    RFT: "🏁 3 Rounds For Time",
    EMOM: "⏲ EMOM: Every Minute On the Minute (12 min)",
  };

  const sections = [
    {
      name: "Warm-up",
      exercises: [{ name: "Jumping Jacks", sets: 3, reps: 15, rest: 30 }],
    },
    {
      name: selectedStyle,
      exercises: selectedExercises.map((ex) => ({
        name: ex,
        sets: 3,
        reps: 12,
        rest: 45,
        weight: 0,
      })),
    },
    {
      name: "Rehab",
      exercises: rehabExercises.map((ex) => ({
        name: ex,
        sets: 2,
        reps: 10,
        rest: 30,
      })),
    },
    {
      name: "Cool-down",
      exercises: [{ name: "Quad Stretch", sets: 2, reps: 10, rest: 30 }],
    },
  ].filter((section) => section.exercises.length > 0);

  return {
    title: titleMap[selectedStyle],
    sections,
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
    const day = new Date(timestamp).toLocaleDateString(undefined, { weekday: "short" });
    counts[day] = (counts[day] || 0) + 1;
  });
  return Object.entries(counts).map(([day, count]) => ({ day, count }));
}
// src/components/WorkoutDay.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import RestTimer from "./RestTimer";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";

// Simple preset list
const availableExercises = [
  "Pull-Ups", "Lunges", "Russian Twists", "Push Ups",
  "Jump Rope", "Burpees", "Overhead Press", "Sit-Ups"
];

export default function WorkoutDay({ day, data, onComplete, lastUsed = {}, user, setMode }) {
  const [checked, setChecked] = useState(data.sections.map(s => s.exercises.map(() => false)));
  const [skipped, setSkipped] = useState(data.sections.map(s => s.exercises.map(() => false)));
  const [exerciseData, setExerciseData] = useState({});
  const [current, setCurrent] = useState(null);
  const [showTimer, setShowTimer] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [customExercise, setCustomExercise] = useState("");
  const currentRef = useRef(null);
  const navigate = useNavigate();

  const [sections, setSections] = useState(data.sections);

  useEffect(() => {
    const allExercises = sections.flatMap(s => s.exercises.map(e => typeof e === "string" ? e : e.name));
    setCurrent(allExercises[0]);

    const fetchExisting = async () => {
      if (!user?.uid) return;
      const ref = doc(db, "exerciseData", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) setExerciseData(snap.data());
    };

    fetchExisting();
    const scrollHandler = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", scrollHandler);
    return () => window.removeEventListener("scroll", scrollHandler);
  }, [user, sections]);

  useEffect(() => {
    if (currentRef.current) currentRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [current]);

  const totalExercises =
  checked.flat().length - skipped.flat().filter(Boolean).length;

  const completedExercises = checked.flat().filter(Boolean).length;

  const progress = totalExercises > 0
    ? Math.round((completedExercises / totalExercises) * 100)
    : 0;

  const toggleCheckbox = (i, j) => {
    const updated = [...checked];
    updated[i][j] = !updated[i][j];
    setChecked(updated);
  };

  const handleSkip = (i, j) => {
    const updated = [...skipped];
    updated[i][j] = !updated[i][j];
    setSkipped(updated);
  };

  const handleChange = (name, field, value) => {
    setExerciseData(prev => {
      const updated = {
        ...prev,
        [name]: {
          ...prev[name],
          [field]: value,
        },
      };
      if (field === "sets") {
        const reps = Array(parseInt(value) || 0).fill("");
        updated[name].reps = reps;
      }
      return updated;
    });
  };

  const handleRepChange = (name, idx, value) => {
    setExerciseData(prev => {
      const reps = [...(prev[name]?.reps || [])];
      reps[idx] = value;
      return {
        ...prev,
        [name]: {
          ...prev[name],
          reps,
        },
      };
    });
  };

  const handleAddExercise = () => {
    if (!customExercise) return;

    const updatedSections = [...sections];
    updatedSections[0].exercises.push({ name: customExercise });

    setSections(updatedSections);

    setChecked(prev => {
      const updated = [...prev];
      updated[0].push(false);
      return updated;
    });

    setSkipped(prev => {
      const updated = [...prev];
      updated[0].push(false);
      return updated;
    });

    setCustomExercise("");
  };

  const handleCompleteSession = async () => {
    if (!user?.uid) return;

    const parsedData = {};
    sections.forEach(section => {
      section.exercises.forEach(ex => {
        const name = typeof ex === "string" ? ex : ex.name;
        parsedData[name] = {
          ...exerciseData[name],
          date: new Date().toLocaleDateString(),
        };
      });
    });

    await setDoc(doc(db, "exerciseData", user.uid), { ...lastUsed, ...parsedData });
    onComplete();
    setCompleted(true);
    confetti({ spread: 120, particleCount: 100, origin: { y: 0.6 } });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <motion.div className="bg-black text-white min-h-screen p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="sticky top-0 z-30 bg-black py-3 shadow-lg">
          <h2 className="text-2xl font-bold mb-2">{day} – {data.title}</h2>
          <div className="w-full bg-gray-800 h-4 rounded-full overflow-hidden">
            <div className="h-4 bg-green-500 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-sm text-center mt-1">{completedExercises} of {totalExercises} completed</p>
        </div>

        {!completed && (
          <div className="mb-4">
            <label className="text-sm block mb-2">➕ Add Exercise</label>
            <div className="flex items-center gap-2">
              <select
                value={customExercise}
                onChange={(e) => setCustomExercise(e.target.value)}
                className="bg-black border border-gray-600 text-white rounded px-3 py-1"
              >
                <option value="">Select an exercise</option>
                {availableExercises.map((ex, i) => (
                  <option key={i} value={ex}>{ex}</option>
                ))}
              </select>
              <button
                onClick={handleAddExercise}
                className="bg-green-700 text-white px-4 py-1 rounded hover:bg-green-600"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {completed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-green-800 text-white text-center py-4 rounded-lg shadow mt-4"
          >
            🎉 Workout Complete! Great job.
          </motion.div>
        )}

        {!completed && sections.map((section, i) => (
          <motion.div key={i} className="mb-6">
            <h3 className="text-xl font-semibold mb-2 sticky top-0 bg-black z-10 py-1">{section.name}</h3>
            <ul className="space-y-6">
              {section.exercises.map((exercise, j) => {
                const name = typeof exercise === "string" ? exercise : exercise.name;
                const isCurrent = name === current;
                const rest = exercise.rest || 30;
                const tip = exercise.tip || null;

                return (
                  <li
                    key={j}
                    ref={isCurrent ? currentRef : null}
                    className={`p-4 rounded-xl shadow ${
                      skipped[i][j]
                        ? "opacity-50 grayscale"
                        : isCurrent
                        ? "bg-green-700"
                        : "bg-gray-900"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={checked[i][j]} onChange={() => toggleCheckbox(i, j)} />
                        <span className="font-semibold">{name}</span>
                      </div>
                      <button onClick={() => handleSkip(i, j)} className="text-yellow-400 text-xs underline">Skip</button>
                    </div>

                    {tip && <div className="text-sm italic text-yellow-400 mb-2">💡 {tip}</div>}

                    <div className="flex gap-6 flex-wrap mb-2">
                      <div>
                        <label className="text-sm">Sets</label>
                        <input
                          type="number"
                          value={exerciseData[name]?.sets || ""}
                          onChange={e => handleChange(name, "sets", e.target.value)}
                          className="w-16 text-center px-2 py-1 bg-black border border-gray-600 text-white rounded"
                        />
                      </div>
                      <div>
                        <label className="text-sm">Weight (lbs)</label>
                        <input
                          type="number"
                          value={exerciseData[name]?.weight || ""}
                          onChange={e => handleChange(name, "weight", e.target.value)}
                          className="w-20 text-center px-2 py-1 bg-black border border-gray-600 text-white rounded"
                        />
                      </div>
                      <div>
                        <label className="text-sm">Rest</label>
                        <div className="text-sm text-gray-300">{rest} sec</div>
                      </div>
                    </div>

                    {exerciseData[name]?.reps?.length > 0 && (
                      <div className="mt-2">
                        <label className="text-sm">Reps per set</label>
                        <div className="flex gap-2 mt-1">
                          {exerciseData[name].reps.map((rep, idx) => (
                            <input
                              key={idx}
                              type="number"
                              value={rep}
                              onChange={(e) => handleRepChange(name, idx, e.target.value)}
                              className="w-16 px-2 py-1 text-center bg-black border border-gray-600 text-white rounded text-sm"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-3">
                      <label className="text-sm block mb-1">Notes</label>
                      <textarea
                        rows={2}
                        value={exerciseData[name]?.note || ""}
                        onChange={(e) => handleChange(name, "note", e.target.value)}
                        className="w-full bg-black border border-gray-600 text-white rounded px-2 py-1 text-sm"
                        placeholder="e.g. Felt strong, next time increase weight"
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ))}

        {completedExercises === totalExercises && !completed && (
          <div className="text-center mt-8">
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
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-full shadow-lg"
          >
            ⬆️ Top
          </button>
        )}
      </div>
    </motion.div>
  );
}

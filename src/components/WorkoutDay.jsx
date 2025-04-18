// src/components/WorkoutDay.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import RestTimer from "./RestTimer";
import { useNavigate } from "react-router-dom";

export default function WorkoutDay({ day, data, onComplete, lastUsed = {}, user, setMode }) {
  const [checked, setChecked] = useState(data.sections.map(s => s.exercises.map(() => false)));
  const [exerciseData, setExerciseData] = useState({});
  const [current, setCurrent] = useState(null);
  const [showTimer, setShowTimer] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const currentRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const allExercises = data.sections.flatMap(s => s.exercises.map(e => typeof e === "string" ? e : e.name));
    setCurrent(allExercises[0]);

    const fetchExisting = async () => {
      if (!user || !user.uid) return; // ✅ Prevent error if user is undefined
      const ref = doc(db, "exerciseData", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setExerciseData(snap.data());
      }
    };
    fetchExisting();

    const scrollHandler = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", scrollHandler);
    return () => window.removeEventListener("scroll", scrollHandler);
  }, [data, user]);

  useEffect(() => {
    if (currentRef.current) currentRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [current]);

  const totalExercises = checked.flat().length;
  const completedExercises = checked.flat().filter(Boolean).length;
  const progress = Math.round((completedExercises / totalExercises) * 100);

  const toggleCheckbox = (i, j) => {
    const updated = [...checked];
    updated[i][j] = !updated[i][j];
    setChecked(updated);
  };

  const handleChange = (exerciseName, field, value) => {
    setExerciseData(prev => {
      const updated = {
        ...prev,
        [exerciseName]: {
          ...prev[exerciseName],
          [field]: value,
        },
      };
      if (field === "sets") {
        const reps = Array(parseInt(value) || 0).fill("");
        updated[exerciseName].reps = reps;
      }
      return updated;
    });
  };

  const handleRepChange = (exerciseName, index, value) => {
    setExerciseData(prev => {
      const updatedReps = [...(prev[exerciseName]?.reps || [])];
      updatedReps[index] = value;
      return {
        ...prev,
        [exerciseName]: {
          ...prev[exerciseName],
          reps: updatedReps,
        },
      };
    });
  };

  const handleCompleteSession = async () => {
    if (!user || !user.uid) return; // ✅ Prevent error if user is undefined
    const parsedData = {};
    data.sections.forEach(section => {
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
  };

  return (
    <motion.div className="bg-black text-white min-h-screen p-4">
      <div className="max-w-3xl mx-auto space-y-6">

        <div className="sticky top-0 z-30 bg-black py-3 shadow-lg">
        <h2 className="text-2xl font-bold mb-2">{day} – {data.title}</h2>
          <div className="w-full bg-gray-800 h-4 rounded-full overflow-hidden">
            <div
              className="h-4 bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-center mt-1">{completedExercises} of {totalExercises} completed</p>
        </div>

        {data.sections.map((section, i) => (
          <motion.div key={i} className="mb-6">
            <h3 className="text-xl font-semibold mb-2 sticky top-0 bg-black z-10 py-1">{section.name}</h3>
            <ul className="space-y-6">
              {section.exercises.map((exercise, j) => {
                const name = typeof exercise === "string" ? exercise : exercise.name;
                const image = typeof exercise === "object" && exercise.image ? exercise.image : null;
                const video = exerciseData[name]?.video;
                const isCurrent = name === current;
                const restTime = exercise.rest || 30;
                const aiTip = exercise.tip || null;

                return (
                  <li
                    key={j}
                    ref={isCurrent ? currentRef : null}
                    className={`p-4 rounded-xl shadow ${isCurrent ? "bg-green-700" : "bg-gray-900"}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" checked={checked[i][j]} onChange={() => toggleCheckbox(i, j)} />
                        <span className="font-semibold">{name}</span>
                      </div>
                      {video && (
                        <a href={video} target="_blank" rel="noreferrer" className="text-blue-400 text-sm underline">
                          ▶️ Video
                        </a>
                      )}
                    </div>

                    {image && (
                      <img
                        src={`/images/exercises/${image}`}
                        alt={name}
                        className="w-full max-w-xs mx-auto rounded mb-4"
                      />
                    )}

                    {aiTip && <div className="text-sm text-yellow-400 italic mb-2">💡 {aiTip}</div>}

                    <div className="flex gap-6 flex-wrap mb-2">
                      <div>
                        <label className="text-sm">Sets</label>
                        <input
                          type="number"
                          value={exerciseData[name]?.sets || ""}
                          onChange={e => handleChange(name, "sets", e.target.value)}
                          className="w-16 px-2 py-1 bg-black border border-gray-600 text-white rounded text-center"
                        />
                      </div>
                      <div>
                        <label className="text-sm">Weight (lbs)</label>
                        <input
                          type="number"
                          value={exerciseData[name]?.weight || ""}
                          onChange={e => handleChange(name, "weight", e.target.value)}
                          className="w-20 px-2 py-1 bg-black border border-gray-600 text-white rounded text-center"
                        />
                      </div>
                      <div>
                        <label className="text-sm">Rest</label>
                        <div className="text-sm text-gray-300">{restTime} sec</div>
                      </div>
                    </div>

                    {exerciseData[name]?.reps?.length > 0 && (
                      <div className="mt-2">
                        <label className="text-sm">Reps per set:</label>
                        <div className="flex gap-2 flex-wrap mt-1">
                          {exerciseData[name].reps.map((rep, idx) => (
                            <input
                              key={idx}
                              type="number"
                              value={rep}
                              onChange={(e) => handleRepChange(name, idx, e.target.value)}
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
                        value={exerciseData[name]?.note || ""}
                        onChange={(e) => handleChange(name, "note", e.target.value)}
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
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-full shadow-lg"
          >⬆️ Top</button>
        )}
      </div>
    </motion.div>
  );
}

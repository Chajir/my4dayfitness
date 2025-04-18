// src/ModeSelection.jsx
import React from "react";

export default function ModeSelection({ setMode }) {
  return (
    <div className="flex flex-col gap-4 text-white text-center p-8 min-h-screen bg-black">
      <h2 className="text-2xl font-bold mb-4">Choose Your Workout Mode</h2>
      <button
        onClick={() => setMode("static")}
        className="bg-gray-800 py-3 rounded text-lg hover:bg-gray-700 transition"
      >
        🏋️‍♂️ 4-Day Classic Program
      </button>
      <button
        onClick={() => setMode("ai")}
        className="bg-green-600 py-3 rounded text-lg hover:bg-green-500 transition"
      >
        🤖 Train with AI Coach
      </button>
      <button
        onClick={() => setMode("crossfit")}
        className="bg-yellow-500 py-3 rounded text-lg hover:bg-yellow-400 transition"
      >
        💥 CrossFit Mode
      </button>
    </div>
  );
}

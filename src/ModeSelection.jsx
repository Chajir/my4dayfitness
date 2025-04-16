// src/ModeSelection.jsx
import React from "react";

export default function ModeSelection({ setMode }) {
  return (
    <div className="flex flex-col gap-4 text-white text-center p-8 min-h-screen bg-black">
      <h2 className="text-2xl font-bold mb-6">Choose Your Workout Mode</h2>

      <button
        onClick={() => setMode("static")}
        className="bg-gray-800 hover:bg-gray-700 py-4 px-6 rounded text-lg shadow"
      >
        🏋️‍♂️ 4-Day Classic Program
      </button>

      <button
        onClick={() => setMode("ai")}
        className="bg-green-600 hover:bg-green-700 py-4 px-6 rounded text-lg shadow"
      >
        🧠 Train with AI Coach
      </button>
    </div>
  );
}

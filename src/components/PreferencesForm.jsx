// src/components/PreferencesForm.jsx
import React, { useState } from "react";

export default function PreferencesForm({ onSave }) {
  const [goal, setGoal] = useState("fat_loss");
  const [equipment, setEquipment] = useState("bodyweight");
  const [sessionLength, setSessionLength] = useState("30");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ goal, equipment, sessionLength });
  };

  return (
    <form onSubmit={handleSubmit} className="text-white space-y-4 bg-gray-800 p-6 rounded-xl shadow max-w-lg mx-auto mt-8">
      <h2 className="text-2xl font-bold">🧠 Set Your Training Preferences</h2>

      <div>
        <label className="block mb-1 font-semibold">Goal</label>
        <select value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full bg-black text-white p-2 rounded">
          <option value="fat_loss">Fat Loss</option>
          <option value="muscle_gain">Muscle Gain</option>
          <option value="strength">Strength</option>
          <option value="endurance">Endurance</option>
        </select>
      </div>

      <div>
        <label className="block mb-1 font-semibold">Available Equipment</label>
        <select value={equipment} onChange={(e) => setEquipment(e.target.value)} className="w-full bg-black text-white p-2 rounded">
          <option value="bodyweight">Bodyweight Only</option>
          <option value="dumbbells">Dumbbells</option>
          <option value="full_gym">Full Gym</option>
        </select>
      </div>

      <div>
        <label className="block mb-1 font-semibold">Session Length (minutes)</label>
        <select value={sessionLength} onChange={(e) => setSessionLength(e.target.value)} className="w-full bg-black text-white p-2 rounded">
          <option value="15">15</option>
          <option value="30">30</option>
          <option value="45">45+</option>
        </select>
      </div>

      <button type="submit" className="w-full bg-green-600 py-2 rounded hover:bg-green-500 transition">
        ✅ Save & Continue
      </button>
    </form>
  );
}

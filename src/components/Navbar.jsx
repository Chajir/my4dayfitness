// src/components/Navbar.jsx
import React from "react";
import { motion } from "framer-motion";

export default function Navbar({ showBack, onBack, onLogout }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex justify-between items-center mb-6 bg-gray-900 px-4 py-3 rounded-xl shadow-md"
    >
      <div>
        {showBack && (
          <button
            onClick={onBack}
            className="text-blue-400 underline text-sm hover:text-blue-300"
          >
            ← Back to Mode Selection
          </button>
        )}
      </div>

      <div>
        <button
          onClick={onLogout}
          className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded"
        >
          Log Out
        </button>
      </div>
    </motion.div>
  );
}
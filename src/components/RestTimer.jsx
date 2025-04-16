import React, { useState, useEffect } from "react";

const RestTimer = ({ duration, onFinish }) => {
  const [seconds, setSeconds] = useState(duration);

  // Reset timer when duration changes
  useEffect(() => {
    setSeconds(duration);
  }, [duration]);

  // Countdown effect
  useEffect(() => {
    if (seconds === 0) {
      onFinish();
      return;
    }
    const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds, onFinish]);

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-xl shadow-lg">
      ⏱️ Rest: {seconds}s
    </div>
  );
};

export default RestTimer;

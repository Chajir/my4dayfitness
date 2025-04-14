import React, { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onLogin(); // Notify parent component
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-xl w-full max-w-sm shadow space-y-4">
        <h2 className="text-2xl font-bold">{isLogin ? "Log In" : "Sign Up"}</h2>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div>
          <label>Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 mt-1 rounded bg-black border border-gray-700 text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 mt-1 rounded bg-black border border-gray-700 text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 py-2 rounded font-semibold"
        >
          {isLogin ? "Log In" : "Sign Up"}
        </button>
        <p
          className="text-sm text-blue-400 text-center cursor-pointer hover:underline"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Need an account? Sign up" : "Already have an account? Log in"}
        </p>
      </form>
    </div>
  );
};

export default Login;

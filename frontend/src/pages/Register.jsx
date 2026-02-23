import { useState,useEffect } from "react";
import { registerUser } from "../auth/authService";

function Register({ onRegister, onSwitchToLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(
  localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      await registerUser(email, password);
      setMessage("Account created successfully! Redirecting...");
      setTimeout(() => onRegister(), 1000);
    } catch {
      setMessage("Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">

        <h2 className="text-2xl font-bold text-center text-green-600 mb-6">
          Create Account
        </h2>

        {message && (
          <p className="text-center text-sm mb-4 text-gray-600 dark:text-gray-300">
            {message}
          </p>
        )}

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="absolute top-5 right-5 px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 dark:text-white"
        >
          {darkMode ? "🌙 Dark" : "☀️ Light"}
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Register"}
          </button>
          <p className="text-center text-sm mt-4">
            Already have an account?{" "}
            <button 
              onClick={onSwitchToLogin} 
              className="text-blue-600 hover:underline"
            >
              Login
            </button>
          </p>
          

        </form>
      </div>
    </div>
  );
}

export default Register;
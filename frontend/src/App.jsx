import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { isAuthenticated, logout} from "./auth/authService";
import Expenses from "./pages/Expenses";
import Analytics from "./pages/Analytics";
import Prediction from "./pages/Prediction";



function App(){
  const [auth, setAuth] = useState(isAuthenticated());
  const [showRegister, setShowRegister] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
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

  if (!auth) {
  return showRegister ? (
    <Register 
      onRegister={() => setShowRegister(false)} 
      onSwitchToLogin={() => setShowRegister(false)} 
    />
  ) : (
    <Login 
      onLogin={() => setAuth(true)} 
      onSwitchToRegister={() => setShowRegister(true)} 
    />
  );
}

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h1 className="text-2xl font-bold text-blue-600">
            Expense Tracker
          </h1>
          
          <div className="flex gap-3">
          <button
          onClick={() => setDarkMode(!darkMode)}
          className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
        </div>

          <div className="flex gap-4 items-center">
            {["dashboard", "expenses", "analytics", "prediction"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`capitalize px-3 py-1 rounded ${
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab}
              </button>
            ))}

            <button
              onClick={() => {
                logout();
                setAuth(false);
              }}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
        
        {activeTab === "dashboard" && (
  <div className="space-y-6">
    <Analytics />
    <Prediction />
  </div>
)}

{activeTab === "expenses" && <Expenses />}

{activeTab === "analytics" && <Analytics />}

{activeTab === "prediction" && <Prediction />}
      </div>
    </div>
  );
}

export default App;
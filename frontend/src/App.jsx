import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { isAuthenticated, logout} from "./auth/authService";
import Expenses from "./pages/Expenses";
import Analytics from "./pages/Analytics";
import Prediction from "./pages/Prediction";


function App(){
  const [auth, setAuth] = useState(isAuthenticated());
  const [showRegister, setShowRegister] = useState(false);

  if (!auth) {
    return showRegister ? (
      <Register onRegister={() => setShowRegister(false)} />
    ) : (
      <>
        <Login onLogin={() => setAuth(true)} />
        <p>
          No account?{" "}
          <button onClick={() => setShowRegister(true)}>Register</button>
        </p>  
      </>    
    );
  }

  return (
    <div>
      <h1>Expense Tracker Dashboard</h1>

      <button
        onClick={() => {
          logout();
          setAuth(false);
        }}
      >
        Logout
      </button>

      <Expenses />
      <Analytics />
      <Prediction />
    </div>
  );
}

export default App;
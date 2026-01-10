import { useState } from "react";
import { registerUser } from "../auth/authService";

function Register({ onRegister }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await registerUser(email, password);
            setMessage("Account created! You can login now.");
            onRegister();
        } catch {
            setMessage("Registration failed.");
        }

        
    };

    return (
        <div>
            <h2>Register</h2>

            {message && <p>{message}</p>}

            <form onSubmit={handleSubmit}>
                <input
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <br />

                <input
                  type="password"
                  placeholder = "Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  />
                  <br />

                  <button type="submit">Register</button>
            </form>    
        </div>
    );
}

export default Register;
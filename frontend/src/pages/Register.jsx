import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                `${API_URL}/auth/register`,
                {
                    name,
                    email,
                    password
                }
            );

            alert(response.data.message);

            navigate("/login");
        } catch (error) {
            console.error(
                "REGISTER ERROR:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                "Registration failed"
            );
        }
    };

    return (
        <div>
            <h1>Cine-X Register</h1>

            <form onSubmit={handleRegister}>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit">
                    Register
                </button>
            </form>
        </div>
    );
}

export default Register;
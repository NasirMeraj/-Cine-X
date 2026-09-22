import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowLeft
} from "lucide-react";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;

    const handleRegister = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

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

            setError(
                error.response?.data?.message ||
                "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>

            <button
                style={styles.backButton}
                onClick={() => navigate("/")}
            >
                <ArrowLeft size={18} />
                Back to Home
            </button>

            <div style={styles.glow}></div>

            <div style={styles.card}>

                <div style={styles.logo}>
                    <span style={styles.logoIcon}>▶</span>
                    CINE-X
                </div>

                <h1 style={styles.title}>
                    Create Your Account
                </h1>

                <p style={styles.subtitle}>
                    Join Cine-X and start watching your favorite movies.
                </p>

                {error && (
                    <div style={styles.error}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister}>

                    <div style={styles.inputGroup}>
                        <User
                            size={20}
                            style={styles.inputIcon}
                        />

                        <input
                            type="text"
                            placeholder="Full name"
                            value={name}
                            onChange={(e) =>
                                setName(e.target.value)
                            }
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <Mail
                            size={20}
                            style={styles.inputIcon}
                        />

                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <Lock
                            size={20}
                            style={styles.inputIcon}
                        />

                        <input
                            type={
                                showPassword
                                    ? "text"
                                    : "password"
                            }
                            placeholder="Password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            style={styles.input}
                            required
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setShowPassword(!showPassword)
                            }
                            style={styles.eyeButton}
                        >
                            {showPassword ? (
                                <EyeOff size={20} />
                            ) : (
                                <Eye size={20} />
                            )}
                        </button>
                    </div>

                    <p style={styles.passwordHint}>
                        Password must be at least 6 characters.
                    </p>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.registerButton,
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading
                            ? "Creating account..."
                            : "Create Account"}
                    </button>

                </form>

                <div style={styles.divider}>
                    <span style={styles.line}></span>
                    <p style={styles.or}>OR</p>
                    <span style={styles.line}></span>
                </div>

                <p style={styles.loginText}>
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        style={styles.loginLink}
                    >
                        Sign in
                    </Link>
                </p>

            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        background:
            "radial-gradient(circle at top, #242424 0%, #080808 45%, #000 100%)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "30px 20px",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden"
    },

    glow: {
        position: "absolute",
        width: "500px",
        height: "500px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.03)",
        filter: "blur(80px)",
        bottom: "-250px",
        left: "-180px"
    },

    backButton: {
        position: "absolute",
        top: "25px",
        left: "25px",
        background: "transparent",
        border: "none",
        color: "#aaa",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        cursor: "pointer",
        fontSize: "14px",
        zIndex: 2
    },

    card: {
        width: "100%",
        maxWidth: "430px",
        background: "rgba(20,20,20,0.92)",
        border: "1px solid #2d2d2d",
        borderRadius: "16px",
        padding: "42px",
        boxSizing: "border-box",
        boxShadow:
            "0 25px 70px rgba(0,0,0,0.65)",
        position: "relative",
        zIndex: 1
    },

    logo: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "9px",
        fontSize: "24px",
        fontWeight: "800",
        letterSpacing: "2px",
        marginBottom: "28px"
    },

    logoIcon: {
        fontSize: "22px"
    },

    title: {
        textAlign: "center",
        fontSize: "28px",
        margin: "0 0 10px"
    },

    subtitle: {
        textAlign: "center",
        color: "#999",
        fontSize: "14px",
        lineHeight: "1.6",
        marginBottom: "28px"
    },

    error: {
        background: "#2a1515",
        border: "1px solid #633333",
        color: "#ffb3b3",
        padding: "12px",
        borderRadius: "7px",
        fontSize: "13px",
        marginBottom: "18px"
    },

    inputGroup: {
        position: "relative",
        display: "flex",
        alignItems: "center",
        marginBottom: "15px"
    },

    inputIcon: {
        position: "absolute",
        left: "15px",
        color: "#777"
    },

    input: {
        width: "100%",
        boxSizing: "border-box",
        background: "#0d0d0d",
        border: "1px solid #333",
        borderRadius: "8px",
        padding: "14px 45px",
        color: "#fff",
        fontSize: "14px",
        outline: "none"
    },

    eyeButton: {
        position: "absolute",
        right: "10px",
        background: "transparent",
        border: "none",
        color: "#777",
        cursor: "pointer",
        display: "flex"
    },

    passwordHint: {
        color: "#666",
        fontSize: "12px",
        margin: "-5px 0 18px"
    },

    registerButton: {
        width: "100%",
        padding: "14px",
        background: "#fff",
        color: "#000",
        border: "none",
        borderRadius: "8px",
        fontSize: "15px",
        fontWeight: "700",
        cursor: "pointer"
    },

    divider: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        margin: "28px 0 20px"
    },

    line: {
        flex: 1,
        height: "1px",
        background: "#333"
    },

    or: {
        color: "#666",
        fontSize: "11px",
        margin: 0
    },

    loginText: {
        textAlign: "center",
        color: "#888",
        fontSize: "14px",
        margin: 0
    },

    loginLink: {
        color: "#fff",
        fontWeight: "600",
        textDecoration: "none"
    }
};

export default Register;
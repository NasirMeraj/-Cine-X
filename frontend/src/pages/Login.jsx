import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await axios.post(
                `${API_URL}/auth/login`,
                {
                    email,
                    password
                }
            );

            localStorage.setItem(
                "token",
                response.data.token
            );

            localStorage.setItem(
                "role",
                response.data.user.role
            );

            if (response.data.user.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/");
            }

        } catch (error) {
            console.error(
                "LOGIN ERROR:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.message ||
                "Login failed. Please check your credentials."
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

            <div style={styles.overlay}></div>

            <div style={styles.card}>

                <div style={styles.logo}>
                    <span style={styles.logoIcon}>▶</span>
                    CINE-X
                </div>

                <h1 style={styles.title}>
                    Welcome Back
                </h1>

                <p style={styles.subtitle}>
                    Sign in to continue watching your favorite movies.
                </p>

                {error && (
                    <div style={styles.error}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>

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

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.loginButton,
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading
                            ? "Signing in..."
                            : "Sign In"}
                    </button>

                </form>

                <div style={styles.divider}>
                    <span></span>
                    <p>OR</p>
                    <span></span>
                </div>

                <p style={styles.registerText}>
                    New to Cine-X?{" "}
                    <Link
                        to="/register"
                        style={styles.registerLink}
                    >
                        Create an account
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

    overlay: {
        position: "absolute",
        width: "500px",
        height: "500px",
        borderRadius: "50%",
        background:
            "rgba(255,255,255,0.03)",
        filter: "blur(80px)",
        top: "-200px",
        right: "-150px"
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
        fontSize: "30px",
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

    loginButton: {
        width: "100%",
        marginTop: "8px",
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

    registerText: {
        textAlign: "center",
        color: "#888",
        fontSize: "14px",
        margin: 0
    },

    registerLink: {
        color: "#fff",
        fontWeight: "600",
        textDecoration: "none"
    }
};

styles.divider.span = {
    flex: 1,
    height: "1px",
    background: "#333"
};

styles.divider.p = {
    color: "#666",
    fontSize: "11px",
    margin: 0
};

export default Login;
import { useState } from "react";
import axios from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
    Lock,
    Eye,
    EyeOff,
    ArrowLeft,
    CheckCircle
} from "lucide-react";

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (!token) {
            setError("Invalid or missing reset link.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                `${API_URL}/auth/reset-password`,
                {
                    token,
                    password
                }
            );

            setMessage(
                response.data.message ||
                "Password reset successfully."
            );

            setPassword("");
            setConfirmPassword("");

            setTimeout(() => {
                navigate("/login");
            }, 2000);

        } catch (error) {
            console.error(
                "RESET PASSWORD ERROR:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.message ||
                "Unable to reset password. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>

            <button
                style={styles.backButton}
                onClick={() => navigate("/login")}
            >
                <ArrowLeft size={18} />
                Back to Login
            </button>

            <div style={styles.overlay}></div>

            <div style={styles.card}>

                <div style={styles.logo}>
                    <span style={styles.logoIcon}>▶</span>
                    CINE-X
                </div>

                <div style={styles.iconContainer}>
                    <Lock size={30} />
                </div>

                <h1 style={styles.title}>
                    Reset Password
                </h1>

                <p style={styles.subtitle}>
                    Create a new password for your Cine-X account.
                </p>

                {message && (
                    <div style={styles.success}>
                        <CheckCircle size={18} />
                        <span>{message}</span>
                    </div>
                )}

                {error && (
                    <div style={styles.error}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <label style={styles.label}>
                        New Password
                    </label>

                    <div style={styles.inputContainer}>

                        <Lock
                            size={19}
                            style={styles.inputIcon}
                        />

                        <input
                            type={
                                showPassword
                                    ? "text"
                                    : "password"
                            }
                            placeholder="Enter new password"
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
                                <EyeOff size={19} />
                            ) : (
                                <Eye size={19} />
                            )}
                        </button>

                    </div>

                    <label style={styles.label}>
                        Confirm Password
                    </label>

                    <div style={styles.inputContainer}>

                        <Lock
                            size={19}
                            style={styles.inputIcon}
                        />

                        <input
                            type={
                                showConfirmPassword
                                    ? "text"
                                    : "password"
                            }
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(e.target.value)
                            }
                            style={styles.input}
                            required
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setShowConfirmPassword(
                                    !showConfirmPassword
                                )
                            }
                            style={styles.eyeButton}
                        >
                            {showConfirmPassword ? (
                                <EyeOff size={19} />
                            ) : (
                                <Eye size={19} />
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
                            ...styles.submitButton,
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading
                            ? "Resetting..."
                            : "Reset Password"}
                    </button>

                </form>

                <div style={styles.loginText}>
                    Remember your password?{" "}
                    <Link
                        to="/login"
                        style={styles.link}
                    >
                        Back to Login
                    </Link>
                </div>

            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        background:
            "radial-gradient(circle at top, #252525 0%, #080808 45%, #000 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        padding: "40px 20px",
        boxSizing: "border-box",
        fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: "#fff"
    },

    overlay: {
        position: "absolute",
        inset: 0,
        background:
            "linear-gradient(135deg, rgba(229,9,20,0.08), transparent 40%)",
        pointerEvents: "none"
    },

    backButton: {
        position: "absolute",
        top: "25px",
        left: "25px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "transparent",
        border: "none",
        color: "#bbb",
        fontSize: "14px",
        cursor: "pointer",
        zIndex: 2
    },

    card: {
        width: "100%",
        maxWidth: "430px",
        background: "rgba(20, 20, 20, 0.94)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "18px",
        padding: "42px",
        boxSizing: "border-box",
        boxShadow:
            "0 25px 70px rgba(0,0,0,0.6)",
        position: "relative",
        zIndex: 1
    },

    logo: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "8px",
        fontSize: "27px",
        fontWeight: "800",
        letterSpacing: "2px",
        marginBottom: "28px"
    },

    logoIcon: {
        color: "#e50914",
        fontSize: "22px"
    },

    iconContainer: {
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        background:
            "rgba(229,9,20,0.12)",
        color: "#e50914",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 20px"
    },

    title: {
        textAlign: "center",
        fontSize: "27px",
        margin: "0 0 10px",
        fontWeight: "700"
    },

    subtitle: {
        textAlign: "center",
        color: "#999",
        fontSize: "14px",
        lineHeight: "1.6",
        margin: "0 0 28px"
    },

    label: {
        display: "block",
        fontSize: "13px",
        color: "#ccc",
        marginBottom: "8px"
    },

    inputContainer: {
        position: "relative",
        marginBottom: "18px"
    },

    inputIcon: {
        position: "absolute",
        left: "14px",
        top: "50%",
        transform: "translateY(-50%)",
        color: "#777"
    },

    input: {
        width: "100%",
        height: "50px",
        boxSizing: "border-box",
        background: "#111",
        border: "1px solid #333",
        borderRadius: "8px",
        outline: "none",
        color: "#fff",
        fontSize: "14px",
        padding: "0 45px"
    },

    eyeButton: {
        position: "absolute",
        right: "10px",
        top: "50%",
        transform: "translateY(-50%)",
        background: "transparent",
        border: "none",
        color: "#777",
        cursor: "pointer",
        display: "flex"
    },

    passwordHint: {
        color: "#777",
        fontSize: "12px",
        margin: "-5px 0 18px"
    },

    submitButton: {
        width: "100%",
        height: "50px",
        border: "none",
        borderRadius: "8px",
        background: "#e50914",
        color: "#fff",
        fontSize: "15px",
        fontWeight: "600",
        cursor: "pointer"
    },

    success: {
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        background: "rgba(34,197,94,0.12)",
        border: "1px solid rgba(34,197,94,0.3)",
        color: "#86efac",
        borderRadius: "8px",
        padding: "12px",
        fontSize: "13px",
        lineHeight: "1.5",
        marginBottom: "18px"
    },

    error: {
        background: "rgba(229,9,20,0.1)",
        border: "1px solid rgba(229,9,20,0.3)",
        color: "#ff7b7b",
        borderRadius: "8px",
        padding: "12px",
        fontSize: "13px",
        marginBottom: "18px"
    },

    loginText: {
        textAlign: "center",
        color: "#888",
        fontSize: "13px",
        marginTop: "24px"
    },

    link: {
        color: "#e50914",
        textDecoration: "none",
        fontWeight: "600"
    }
};

export default ResetPassword;
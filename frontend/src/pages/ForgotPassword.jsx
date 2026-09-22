import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (!email) {
            setError("Please enter your email address.");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                `${API_URL}/auth/forgot-password`,
                {
                    email
                }
            );

            setMessage(
                response.data.message ||
                "If an account exists with this email, a reset link has been sent."
            );

            setEmail("");
        } catch (error) {
            console.error(
                "FORGOT PASSWORD ERROR:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.message ||
                "Unable to process your request. Please try again."
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
                    <Mail size={30} />
                </div>

                <h1 style={styles.title}>
                    Forgot Password?
                </h1>

                <p style={styles.subtitle}>
                    Enter your email address and we'll send you a
                    link to reset your password.
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
                        Email Address
                    </label>

                    <div style={styles.inputContainer}>
                        <Mail
                            size={19}
                            style={styles.inputIcon}
                        />

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            style={styles.input}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        style={{
                            ...styles.submitButton,
                            opacity: loading ? 0.7 : 1
                        }}
                        disabled={loading}
                    >
                        {loading
                            ? "Sending..."
                            : "Send Reset Link"}
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
        background:
            "rgba(20, 20, 20, 0.94)",
        border:
            "1px solid rgba(255,255,255,0.08)",
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
        marginBottom: "20px"
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
        padding: "0 15px 0 45px"
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
        cursor: "pointer",
        transition: "0.2s"
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

export default ForgotPassword;
import { useEffect, useState } from "react";
import axios from "axios";
import { Check, Crown, Home, X } from "lucide-react";
import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";

function Subscription() {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        loadRazorpay();
        fetchSubscription();
    }, []);

    const loadRazorpay = () => {
        if (window.Razorpay) {
            return;
        }

        const script = document.createElement("script");

        script.src =
            "https://checkout.razorpay.com/v1/checkout.js";

        script.async = true;

        document.body.appendChild(script);
    };

    const fetchSubscription = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setLoading(false);
                return;
            }

            const response = await axios.get(
                `${API_URL}/subscription`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setSubscription(
                response.data.subscription || null
            );

        } catch (error) {
            console.error(
                "SUBSCRIPTION ERROR:",
                error.response?.data ||
                error.message
            );
        } finally {
            setLoading(false);
        }
    };

    const subscribe = async (plan) => {
        try {
            setSubscribing(true);

            const token =
                localStorage.getItem("token");

            const response = await axios.post(
                `${API_URL}/subscription/create-order`,
                {
                    plan
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            const order = response.data.order;

            if (!window.Razorpay) {
                alert(
                    "Razorpay Checkout is still loading. Please try again."
                );

                setSubscribing(false);
                return;
            }

            const options = {
                key:
                    import.meta.env
                        .VITE_RAZORPAY_KEY_ID,

                amount: order.amount,

                currency: order.currency,

                name: "CINE-X",

                description:
                    plan === "monthly"
                        ? "CINE-X Monthly Premium"
                        : "CINE-X Yearly Premium",

                order_id: order.id,

                handler: async function (response) {
                    try {
                        const verifyResponse =
                            await axios.post(
                                `${API_URL}/subscription/verify-payment`,
                                {
                                    razorpay_order_id:
                                        response.razorpay_order_id,

                                    razorpay_payment_id:
                                        response.razorpay_payment_id,

                                    razorpay_signature:
                                        response.razorpay_signature,

                                    plan: plan
                                },
                                {
                                    headers: {
                                        Authorization:
                                            `Bearer ${token}`
                                    }
                                }
                            );

                        alert(
                            verifyResponse.data.message
                        );

                        await fetchSubscription();

                    } catch (error) {
                        console.error(
                            "VERIFY PAYMENT ERROR:",
                            error.response?.data ||
                            error.message
                        );

                        alert(
                            error.response?.data?.message ||
                            "Payment verification failed"
                        );
                    } finally {
                        setSubscribing(false);
                    }
                },

                modal: {
                    ondismiss: function () {
                        setSubscribing(false);
                    }
                },

                prefill: {
                    name: "CINE-X User"
                },

                theme: {
                    color: "#e50914"
                }
            };

            const razorpay =
                new window.Razorpay(options);

            razorpay.open();

        } catch (error) {
            console.error(
                "PAYMENT ERROR:",
                error.response?.data ||
                error.message
            );

            alert(
                error.response?.data?.message ||
                "Payment failed"
            );

            setSubscribing(false);
        }
    };

    const cancelSubscription = async () => {
        const confirmCancel =
            window.confirm(
                "Are you sure you want to cancel your subscription?"
            );

        if (!confirmCancel) {
            return;
        }

        try {
            setCancelling(true);

            const token =
                localStorage.getItem("token");

            const response = await axios.patch(
                `${API_URL}/subscription/cancel`,
                {},
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            alert(response.data.message);

            await fetchSubscription();

        } catch (error) {
            console.error(
                "CANCEL SUBSCRIPTION ERROR:",
                error.response?.data ||
                error.message
            );

            alert(
                error.response?.data?.message ||
                "Failed to cancel subscription"
            );
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <div style={styles.loading}>
                <h2>Loading subscription...</h2>
            </div>
        );
    }

    return (
        <div style={styles.page}>

            <Navbar />

            <div style={styles.container}>

                <Link
                    to="/"
                    style={styles.homeButton}
                >
                    <Home size={18} />
                    Home
                </Link>

                <div style={styles.header}>
                    <Crown
                        size={45}
                        fill="#e50914"
                    />

                    <h1 style={styles.title}>
                        CINE-X Premium
                    </h1>

                    <p style={styles.subtitle}>
                        Enjoy premium movies and
                        exclusive content.
                    </p>
                </div>

                {subscription ? (

                    <div style={styles.activeCard}>

                        <div style={styles.premiumBadge}>
                            <Crown size={18} />
                            PREMIUM MEMBER
                        </div>

                        <h2 style={styles.activeTitle}>
                            Your subscription is active
                        </h2>

                        <div style={styles.details}>

                            <p>
                                <strong>Plan</strong>
                                <span>
                                    {subscription.plan}
                                </span>
                            </p>

                            <p>
                                <strong>Amount</strong>
                                <span>
                                    ₹{subscription.amount}
                                </span>
                            </p>

                            <p>
                                <strong>Status</strong>
                                <span>
                                    {subscription.status}
                                </span>
                            </p>

                            <p>
                                <strong>Started</strong>
                                <span>
                                    {new Date(
                                        subscription.startDate
                                    ).toLocaleDateString()}
                                </span>
                            </p>

                            <p>
                                <strong>Valid Until</strong>
                                <span>
                                    {new Date(
                                        subscription.endDate
                                    ).toLocaleDateString()}
                                </span>
                            </p>

                        </div>

                        <div style={styles.features}>

                            <div>
                                <Check size={18} />
                                Premium movie access
                            </div>

                            <div>
                                <Check size={18} />
                                High-quality streaming
                            </div>

                            <div>
                                <Check size={18} />
                                Exclusive content
                            </div>

                        </div>

                        <button
                            style={{
                                ...styles.cancelButton,
                                opacity: cancelling ? 0.6 : 1
                            }}
                            disabled={cancelling}
                            onClick={
                                cancelSubscription
                            }
                        >
                            <X size={18} />

                            {cancelling
                                ? "Cancelling..."
                                : "Cancel Subscription"}
                        </button>

                    </div>

                ) : (

                    <div style={styles.plans}>

                        <div style={styles.card}>

                            <h2>
                                Monthly
                            </h2>

                            <div style={styles.price}>
                                ₹199
                                <span>
                                    / month
                                </span>
                            </div>

                            <p style={styles.description}>
                                Premium access for
                                one month.
                            </p>

                            <div style={styles.features}>

                                <div>
                                    <Check size={18} />
                                    Premium movies
                                </div>

                                <div>
                                    <Check size={18} />
                                    High-quality streaming
                                </div>

                                <div>
                                    <Check size={18} />
                                    Cancel anytime
                                </div>

                            </div>

                            <button
                                style={{
                                    ...styles.button,
                                    opacity:
                                        subscribing
                                            ? 0.6
                                            : 1
                                }}
                                disabled={subscribing}
                                onClick={() =>
                                    subscribe(
                                        "monthly"
                                    )
                                }
                            >
                                {subscribing
                                    ? "Processing..."
                                    : "Subscribe"}
                            </button>

                        </div>

                        <div
                            style={{
                                ...styles.card,
                                border:
                                    "2px solid #e50914"
                            }}
                        >

                            <div style={styles.popular}>
                                POPULAR
                            </div>

                            <h2>
                                Yearly
                            </h2>

                            <div style={styles.price}>
                                ₹1999
                                <span>
                                    / year
                                </span>
                            </div>

                            <p style={styles.description}>
                                Premium access for
                                one full year.
                            </p>

                            <div style={styles.features}>

                                <div>
                                    <Check size={18} />
                                    Premium movies
                                </div>

                                <div>
                                    <Check size={18} />
                                    High-quality streaming
                                </div>

                                <div>
                                    <Check size={18} />
                                    Cancel anytime
                                </div>

                            </div>

                            <button
                                style={{
                                    ...styles.button,
                                    opacity:
                                        subscribing
                                            ? 0.6
                                            : 1
                                }}
                                disabled={subscribing}
                                onClick={() =>
                                    subscribe(
                                        "yearly"
                                    )
                                }
                            >
                                {subscribing
                                    ? "Processing..."
                                    : "Subscribe"}
                            </button>

                        </div>

                    </div>
                )}

            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        background:
            "linear-gradient(180deg, #080808 0%, #111 100%)",
        color: "#fff"
    },

    loading: {
        minHeight: "100vh",
        background: "#111",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },

    container: {
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "50px 25px"
    },

    homeButton: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        color: "#fff",
        textDecoration: "none",
        background: "#222",
        padding: "10px 16px",
        borderRadius: "8px",
        marginBottom: "40px"
    },

    header: {
        textAlign: "center",
        marginBottom: "45px"
    },

    title: {
        fontSize: "42px",
        margin: "15px 0 10px"
    },

    subtitle: {
        color: "#aaa",
        fontSize: "17px"
    },

    plans: {
        display: "flex",
        justifyContent: "center",
        gap: "30px",
        flexWrap: "wrap"
    },

    card: {
        position: "relative",
        width: "300px",
        background: "#1c1c1c",
        padding: "35px",
        borderRadius: "15px",
        textAlign: "center",
        boxSizing: "border-box"
    },

    popular: {
        position: "absolute",
        top: "-14px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#e50914",
        padding: "6px 15px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "bold"
    },

    price: {
        fontSize: "34px",
        fontWeight: "bold",
        margin: "20px 0 10px"
    },

    description: {
        color: "#aaa",
        minHeight: "45px"
    },

    features: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        margin: "25px 0",
        textAlign: "left"
    },

    feature: {
        display: "flex",
        alignItems: "center",
        gap: "8px"
    },

    button: {
        width: "100%",
        padding: "14px",
        background: "#e50914",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "16px",
        fontWeight: "bold"
    },

    activeCard: {
        maxWidth: "500px",
        margin: "0 auto",
        background: "#1c1c1c",
        padding: "35px",
        borderRadius: "15px"
    },

    premiumBadge: {
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
        color: "#e50914",
        fontWeight: "bold",
        fontSize: "14px"
    },

    activeTitle: {
        fontSize: "28px",
        marginTop: "20px"
    },

    details: {
        marginTop: "25px"
    },

    detailsRow: {
        display: "flex",
        justifyContent: "space-between"
    },

    cancelButton: {
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "13px",
        background: "#444",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "15px"
    }
};

export default Subscription;
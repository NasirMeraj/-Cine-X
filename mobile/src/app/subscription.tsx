import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import RazorpayCheckout from "react-native-razorpay";

const API_BASE = "https://cine-x-1.onrender.com";

export default function SubscriptionScreen() {
    const [loading, setLoading] = useState(false);
    const [subscription, setSubscription] = useState<any>(null);

    useEffect(() => {
        loadSubscription();
    }, []);

    const loadSubscription = async () => {
        try {
            const token = await AsyncStorage.getItem("token");

            if (!token) {
                return;
            }

            const response = await axios.get(
                `${API_BASE}/api/subscriptions`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setSubscription(response.data.subscription);
        } catch (error) {
            console.log("SUBSCRIPTION ERROR:", error);
        }
    };

    const subscribe = async (
        plan: "monthly" | "yearly"
    ) => {
        try {
            setLoading(true);

            const token = await AsyncStorage.getItem("token");

            if (!token) {
                Alert.alert(
                    "Login Required",
                    "Please login first."
                );
                return;
            }

            const response = await axios.post(
                `${API_BASE}/api/subscriptions/create-order`,
                { plan },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const order = response.data.order;
            const keyId = response.data.keyId;

            if (!order || !keyId) {
                throw new Error(
                    "Payment configuration missing"
                );
            }

            const options = {
                description: `Cine-X ${plan} Premium`,
                image: "https://cdn.razorpay.com/logos/7K3bV8Y2V5mFQzKJ.png",
                currency: "INR",
                key: keyId,
                amount: order.amount,
                name: "Cine-X",
                order_id: order.id,
                prefill: {},
                theme: {
                    color: "#E50914",
                },
            };

            const payment =
                await RazorpayCheckout.open(options);

            console.log(
                "RAZORPAY PAYMENT:",
                payment
            );

            const verifyResponse =
                await axios.post(
                    `${API_BASE}/api/subscriptions/verify-payment`,
                    {
                        razorpay_order_id:
                            payment.razorpay_order_id,

                        razorpay_payment_id:
                            payment.razorpay_payment_id,

                        razorpay_signature:
                            payment.razorpay_signature,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

            if (verifyResponse.data.success) {
                Alert.alert(
                    "Payment Successful",
                    "Cine-X Premium has been activated."
                );

                await loadSubscription();
            }
        } catch (error: any) {
            console.log(
                "PAYMENT ERROR:",
                error?.response?.data ||
                    error?.message ||
                    error
            );

            if (
                error?.description ===
                "Payment Cancelled"
            ) {
                Alert.alert(
                    "Payment Cancelled",
                    "You cancelled the payment."
                );
                return;
            }

            Alert.alert(
                "Payment Error",
                error?.response?.data?.message ||
                    error?.description ||
                    error?.message ||
                    "Something went wrong."
            );
        } finally {
            setLoading(false);
        }
    };

    const cancelSubscription =
        async () => {
            try {
                setLoading(true);

                const token =
                    await AsyncStorage.getItem("token");

                if (!token) {
                    Alert.alert(
                        "Login Required",
                        "Please login first."
                    );
                    return;
                }

                await axios.patch(
                    `${API_BASE}/api/subscriptions/cancel`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                Alert.alert(
                    "Subscription Cancelled",
                    "Your subscription has been cancelled."
                );

                await loadSubscription();
            } catch (error: any) {
                Alert.alert(
                    "Error",
                    error?.response?.data?.message ||
                        "Failed to cancel subscription."
                );
            } finally {
                setLoading(false);
            }
        };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Cine-X Premium
            </Text>

            {subscription ? (
                <>
                    <Text style={styles.active}>
                        Premium Active
                    </Text>

                    <Text style={styles.info}>
                        Plan: {subscription.plan}
                    </Text>

                    <Text style={styles.info}>
                        Amount: ₹{subscription.amount}
                    </Text>

                    <Text style={styles.info}>
                        Start Date:{" "}
                        {new Date(
                            subscription.startDate
                        ).toLocaleDateString()}
                    </Text>

                    <Text style={styles.info}>
                        Expiry Date:{" "}
                        {new Date(
                            subscription.endDate
                        ).toLocaleDateString()}
                    </Text>

                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={cancelSubscription}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            Cancel Subscription
                        </Text>
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <Text style={styles.subtitle}>
                        Watch Cine-X Premium content
                        without limits.
                    </Text>

                    <TouchableOpacity
                        style={styles.plan}
                        onPress={() =>
                            subscribe("monthly")
                        }
                        disabled={loading}
                    >
                        <Text style={styles.planTitle}>
                            Monthly
                        </Text>

                        <Text style={styles.price}>
                            ₹199 / month
                        </Text>

                        <Text style={styles.planButton}>
                            Subscribe Now
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.plan}
                        onPress={() =>
                            subscribe("yearly")
                        }
                        disabled={loading}
                    >
                        <Text style={styles.planTitle}>
                            Yearly
                        </Text>

                        <Text style={styles.price}>
                            ₹1999 / year
                        </Text>

                        <Text style={styles.planButton}>
                            Subscribe Now
                        </Text>
                    </TouchableOpacity>
                </>
            )}

            {loading && (
                <ActivityIndicator
                    size="large"
                    style={styles.loader}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        padding: 24,
        paddingTop: 70,
    },

    title: {
        color: "#fff",
        fontSize: 30,
        fontWeight: "bold",
        marginBottom: 20,
    },

    subtitle: {
        color: "#aaa",
        fontSize: 16,
        marginBottom: 30,
    },

    plan: {
        backgroundColor: "#181818",
        borderRadius: 14,
        padding: 24,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: "#333",
    },

    planTitle: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 8,
    },

    price: {
        color: "#E50914",
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 18,
    },

    planButton: {
        backgroundColor: "#E50914",
        color: "#fff",
        textAlign: "center",
        padding: 12,
        borderRadius: 8,
        fontWeight: "bold",
        overflow: "hidden",
    },

    active: {
        color: "#22c55e",
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
    },

    info: {
        color: "#ddd",
        fontSize: 17,
        marginBottom: 10,
    },

    cancelButton: {
        backgroundColor: "#333",
        padding: 16,
        borderRadius: 10,
        marginTop: 30,
    },

    buttonText: {
        color: "#fff",
        textAlign: "center",
        fontSize: 16,
        fontWeight: "bold",
    },

    loader: {
        marginTop: 25,
    },
});
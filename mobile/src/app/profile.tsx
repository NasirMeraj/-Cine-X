import React, {
    useCallback,
    useState
} from "react";

import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ScrollView
} from "react-native";

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    router,
    useFocusEffect
} from "expo-router";

const API_URL = "https://cine-x-1.onrender.com";

type User = {
    name: string;
    email: string;
    role: string;
    subscription: string;
    subscriptionStart?: string | null;
    subscriptionEnd?: string | null;
};

export default function ProfileScreen() {
    const [user, setUser] =
        useState<User | null>(null);

    const [loading, setLoading] =
        useState(true);

    const loadProfile = async () => {
        try {
            const token =
                await AsyncStorage.getItem(
                    "token"
                );

            if (!token) {
                router.replace("/login");
                return;
            }

            const response =
                await axios.get(
                    `${API_URL}/api/profile`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            setUser(
                response.data.user
            );
        } catch (error: any) {
            console.log(
                "PROFILE ERROR:",
                error?.response?.data ||
                    error
            );

            if (
                error?.response?.status ===
                401
            ) {
                Alert.alert(
                    "Session Expired",
                    "Please login again.",
                    [
                        {
                            text: "OK",
                            onPress: () =>
                                router.replace(
                                    "/login"
                                )
                        }
                    ]
                );

                return;
            }

            Alert.alert(
                "Error",
                "Failed to load profile"
            );
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadProfile();
        }, [])
    );

    const logout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        await AsyncStorage.multiRemove([
                            "token",
                            "role"
                        ]);

                        router.replace(
                            "/login"
                        );
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View
                style={
                    styles.center
                }
            >
                <ActivityIndicator
                    size="large"
                    color="#E50914"
                />

                <Text
                    style={
                        styles.loadingText
                    }
                >
                    Loading Profile...
                </Text>
            </View>
        );
    }

    if (!user) {
        return (
            <View
                style={
                    styles.center
                }
            >
                <Text
                    style={
                        styles.errorText
                    }
                >
                    Profile not available
                </Text>

                <TouchableOpacity
                    style={
                        styles.backButton
                    }
                    onPress={() =>
                        router.replace(
                            "/"
                        )
                    }
                >
                    <Text
                        style={
                            styles.backText
                        }
                    >
                        Go Home
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    const isPremium =
        user.subscription ===
        "premium";

    const expiryDate =
        user.subscriptionEnd
            ? new Date(
                  user.subscriptionEnd
              ).toLocaleDateString()
            : null;

    return (
        <ScrollView
            style={
                styles.container
            }
            contentContainerStyle={
                styles.content
            }
            showsVerticalScrollIndicator={
                false
            }
        >
            <Text style={styles.logo}>
                CINE-X
            </Text>

            <TouchableOpacity
                style={
                    styles.backButton
                }
                onPress={() =>
                    router.replace(
                        "/"
                    )
                }
            >
                <Text
                    style={
                        styles.backText
                    }
                >
                    ← Back
                </Text>
            </TouchableOpacity>

            <View
                style={
                    styles.profileHeader
                }
            >
                <View
                    style={
                        styles.avatar
                    }
                >
                    <Text
                        style={
                            styles.avatarText
                        }
                    >
                        {user.name
                            .charAt(0)
                            .toUpperCase()}
                    </Text>
                </View>

                <Text
                    style={
                        styles.name
                    }
                >
                    {user.name}
                </Text>

                <Text
                    style={
                        styles.email
                    }
                >
                    {user.email}
                </Text>
            </View>

            <Text
                style={
                    styles.sectionTitle
                }
            >
                Account
            </Text>

            <View
                style={
                    styles.infoCard
                }
            >
                <Text
                    style={
                        styles.label
                    }
                >
                    Name
                </Text>

                <Text
                    style={
                        styles.value
                    }
                >
                    {user.name}
                </Text>
            </View>

            <View
                style={
                    styles.infoCard
                }
            >
                <Text
                    style={
                        styles.label
                    }
                >
                    Email
                </Text>

                <Text
                    style={
                        styles.value
                    }
                >
                    {user.email}
                </Text>
            </View>

            <View
                style={
                    styles.infoCard
                }
            >
                <Text
                    style={
                        styles.label
                    }
                >
                    Account Type
                </Text>

                <Text
                    style={
                        styles.value
                    }
                >
                    {user.role === "admin"
                        ? "Administrator"
                        : "User"}
                </Text>
            </View>

            <Text
                style={
                    styles.sectionTitle
                }
            >
                Subscription
            </Text>

            <View
                style={[
                    styles.subscriptionCard,
                    isPremium &&
                        styles.premiumCard
                ]}
            >
                <Text
                    style={
                        styles.subscriptionTitle
                    }
                >
                    {isPremium
                        ? "Premium"
                        : "Free"}
                </Text>

                <Text
                    style={
                        styles.subscriptionText
                    }
                >
                    {isPremium
                        ? "You have access to Premium movies."
                        : "Upgrade to Premium to access Premium movies."}
                </Text>

                {isPremium &&
                    expiryDate && (
                        <Text
                            style={
                                styles.expiry
                            }
                        >
                            Expires:{" "}
                            {expiryDate}
                        </Text>
                    )}
            </View>

            {!isPremium &&
                user.role !== "admin" && (
                    <TouchableOpacity
                        style={
                            styles.upgradeButton
                        }
                        onPress={() =>
                            router.push(
                                "/subscription"
                            )
                        }
                    >
                        <Text
                            style={
                                styles.upgradeText
                            }
                        >
                            Upgrade to Premium
                        </Text>
                    </TouchableOpacity>
                )}

            <Text
                style={
                    styles.sectionTitle
                }
            >
                Settings
            </Text>

            <TouchableOpacity
                style={
                    styles.settingButton
                }
                onPress={() =>
                    router.push(
                        "/notification-settings"
                    )
                }
            >
                <Text
                    style={
                        styles.settingText
                    }
                >
                    🔔 Notification Settings
                </Text>

                <Text
                    style={
                        styles.arrow
                    }
                >
                    ›
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={
                    styles.settingButton
                }
                onPress={() =>
                    router.push(
                        "/edit-profile"
                    )
                }
            >
                <Text
                    style={
                        styles.settingText
                    }
                >
                    Edit Profile
                </Text>

                <Text
                    style={
                        styles.arrow
                    }
                >
                    ›
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={
                    styles.settingButton
                }
                onPress={() =>
                    router.push(
                        "/change-password"
                    )
                }
            >
                <Text
                    style={
                        styles.settingText
                    }
                >
                    Change Password
                </Text>

                <Text
                    style={
                        styles.arrow
                    }
                >
                    ›
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={
                    styles.logoutButton
                }
                onPress={logout}
            >
                <Text
                    style={
                        styles.logoutText
                    }
                >
                    Logout
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles =
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: "#000"
        },

        content: {
            padding: 20,
            paddingTop: 55,
            paddingBottom: 120
        },

        center: {
            flex: 1,
            backgroundColor: "#000",
            justifyContent:
                "center",
            alignItems: "center"
        },

        loadingText: {
            color: "#888",
            marginTop: 12
        },

        errorText: {
            color: "#fff",
            fontSize: 16,
            marginBottom: 20
        },

        logo: {
            color: "#E50914",
            fontSize: 30,
            fontWeight: "900",
            letterSpacing: 2,
            marginBottom: 15
        },

        backButton: {
            alignSelf: "flex-start",
            backgroundColor: "#222",
            paddingVertical: 9,
            paddingHorizontal: 15,
            borderRadius: 7,
            marginBottom: 25
        },

        backText: {
            color: "#fff",
            fontWeight: "bold"
        },

        profileHeader: {
            alignItems: "center",
            marginBottom: 30
        },

        avatar: {
            width: 90,
            height: 90,
            borderRadius: 45,
            backgroundColor: "#E50914",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 15
        },

        avatarText: {
            color: "#fff",
            fontSize: 38,
            fontWeight: "bold"
        },

        name: {
            color: "#fff",
            fontSize: 27,
            fontWeight: "bold"
        },

        email: {
            color: "#888",
            fontSize: 14,
            marginTop: 5
        },

        sectionTitle: {
            color: "#fff",
            fontSize: 20,
            fontWeight: "bold",
            marginBottom: 12,
            marginTop: 8
        },

        infoCard: {
            backgroundColor: "#1a1a1a",
            padding: 16,
            borderRadius: 10,
            marginBottom: 10
        },

        label: {
            color: "#777",
            fontSize: 12,
            marginBottom: 5
        },

        value: {
            color: "#fff",
            fontSize: 16
        },

        subscriptionCard: {
            backgroundColor: "#1a1a1a",
            borderRadius: 12,
            padding: 18,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: "#333"
        },

        premiumCard: {
            borderColor: "#ffd700",
            backgroundColor: "#211c00"
        },

        subscriptionTitle: {
            color: "#fff",
            fontSize: 22,
            fontWeight: "bold"
        },

        subscriptionText: {
            color: "#999",
            marginTop: 7,
            lineHeight: 20
        },

        expiry: {
            color: "#ffd700",
            marginTop: 10,
            fontWeight: "bold"
        },

        upgradeButton: {
            backgroundColor: "#E50914",
            padding: 15,
            borderRadius: 10,
            marginBottom: 25
        },

        upgradeText: {
            color: "#fff",
            textAlign: "center",
            fontSize: 16,
            fontWeight: "bold"
        },

        settingButton: {
            backgroundColor: "#1a1a1a",
            padding: 17,
            borderRadius: 10,
            marginBottom: 10,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center"
        },

        settingText: {
            color: "#fff",
            fontSize: 16
        },

        arrow: {
            color: "#777",
            fontSize: 25
        },

        logoutButton: {
            backgroundColor: "#222",
            paddingVertical: 16,
            paddingHorizontal: 16,
            borderRadius: 10,
            marginTop: 20,
            marginBottom: 30
        },

        logoutText: {
            color: "#E50914",
            textAlign: "center",
            fontSize: 16,
            fontWeight: "bold"
        }
    });
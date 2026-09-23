import React, {
    useCallback,
    useState
} from "react";

import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
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

const API_URL =
    "https://cine-x-1.onrender.com";

type NotificationSettings = {
    newMovies: boolean;
    subscriptions: boolean;
    system: boolean;
};

export default function NotificationSettingsScreen() {
    const [settings, setSettings] =
        useState<NotificationSettings>({
            newMovies: true,
            subscriptions: true,
            system: true
        });

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const loadSettings = async () => {
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
                    `${API_URL}/api/notification-settings`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            if (response.data.settings) {
                setSettings(
                    response.data.settings
                );
            }
        } catch (error: any) {
            console.log(
                "LOAD NOTIFICATION SETTINGS ERROR:",
                error?.response?.data ||
                    error.message
            );

            Alert.alert(
                "Error",
                "Failed to load notification settings"
            );
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadSettings();
        }, [])
    );

    const updateSetting = async (
        key: keyof NotificationSettings,
        value: boolean
    ) => {
        const previousSettings =
            settings;

        const updatedSettings = {
            ...settings,
            [key]: value
        };

        setSettings(
            updatedSettings
        );

        try {
            setSaving(true);

            const token =
                await AsyncStorage.getItem(
                    "token"
                );

            await axios.patch(
                `${API_URL}/api/notification-settings`,
                updatedSettings,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );
        } catch (error: any) {
            console.log(
                "UPDATE NOTIFICATION SETTINGS ERROR:",
                error?.response?.data ||
                    error.message
            );

            setSettings(
                previousSettings
            );

            Alert.alert(
                "Error",
                "Failed to update notification setting"
            );
        } finally {
            setSaving(false);
        }
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
                    color="#e50914"
                />

                <Text
                    style={
                        styles.loadingText
                    }
                >
                    Loading Settings...
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={
                    false
                }
                contentContainerStyle={
                    styles.content
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
                        router.back()
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

                <Text style={styles.title}>
                    Notification Settings
                </Text>

                <Text
                    style={
                        styles.subtitle
                    }
                >
                    Choose which notifications
                    you want to receive.
                </Text>

                <View
                    style={
                        styles.section
                    }
                >
                    <Text
                        style={
                            styles.sectionTitle
                        }
                    >
                        Notifications
                    </Text>

                    <View
                        style={
                            styles.settingCard
                        }
                    >
                        <View
                            style={
                                styles.iconContainer
                            }
                        >
                            <Text
                                style={
                                    styles.icon
                                }
                            >
                                🎬
                            </Text>
                        </View>

                        <View
                            style={
                                styles.settingContent
                            }
                        >
                            <Text
                                style={
                                    styles.settingTitle
                                }
                            >
                                New Movies
                            </Text>

                            <Text
                                style={
                                    styles.settingDescription
                                }
                            >
                                Get notified when new
                                movies are added.
                            </Text>
                        </View>

                        <Switch
                            value={
                                settings.newMovies
                            }
                            onValueChange={(
                                value
                            ) =>
                                updateSetting(
                                    "newMovies",
                                    value
                                )
                            }
                            trackColor={{
                                false: "#333",
                                true: "#e50914"
                            }}
                            thumbColor="#fff"
                        />
                    </View>

                    <View
                        style={
                            styles.settingCard
                        }
                    >
                        <View
                            style={
                                styles.iconContainer
                            }
                        >
                            <Text
                                style={
                                    styles.icon
                                }
                            >
                                💎
                            </Text>
                        </View>

                        <View
                            style={
                                styles.settingContent
                            }
                        >
                            <Text
                                style={
                                    styles.settingTitle
                                }
                            >
                                Subscription
                            </Text>

                            <Text
                                style={
                                    styles.settingDescription
                                }
                            >
                                Get Premium activation,
                                cancellation and
                                expiry notifications.
                            </Text>
                        </View>

                        <Switch
                            value={
                                settings.subscriptions
                            }
                            onValueChange={(
                                value
                            ) =>
                                updateSetting(
                                    "subscriptions",
                                    value
                                )
                            }
                            trackColor={{
                                false: "#333",
                                true: "#e50914"
                            }}
                            thumbColor="#fff"
                        />
                    </View>

                    <View
                        style={
                            styles.settingCard
                        }
                    >
                        <View
                            style={
                                styles.iconContainer
                            }
                        >
                            <Text
                                style={
                                    styles.icon
                                }
                            >
                                🔔
                            </Text>
                        </View>

                        <View
                            style={
                                styles.settingContent
                            }
                        >
                            <Text
                                style={
                                    styles.settingTitle
                                }
                            >
                                System
                            </Text>

                            <Text
                                style={
                                    styles.settingDescription
                                }
                            >
                                Receive important Cine-X
                                system notifications.
                            </Text>
                        </View>

                        <Switch
                            value={
                                settings.system
                            }
                            onValueChange={(
                                value
                            ) =>
                                updateSetting(
                                    "system",
                                    value
                                )
                            }
                            trackColor={{
                                false: "#333",
                                true: "#e50914"
                            }}
                            thumbColor="#fff"
                        />
                    </View>
                </View>

                {saving && (
                    <View
                        style={
                            styles.savingContainer
                        }
                    >
                        <ActivityIndicator
                            size="small"
                            color="#e50914"
                        />

                        <Text
                            style={
                                styles.savingText
                            }
                        >
                            Saving...
                        </Text>
                    </View>
                )}

                <View
                    style={
                        styles.infoBox
                    }
                >
                    <Text
                        style={
                            styles.infoIcon
                        }
                    >
                        ℹ️
                    </Text>

                    <Text
                        style={
                            styles.infoText
                        }
                    >
                        You can change these
                        notification preferences
                        anytime.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000"
    },

    content: {
        padding: 20,
        paddingTop: 55,
        paddingBottom: 100
    },

    center: {
        flex: 1,
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center"
    },

    loadingText: {
        color: "#888",
        marginTop: 12
    },

    logo: {
        color: "#e50914",
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

    title: {
        color: "#fff",
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 8
    },

    subtitle: {
        color: "#777",
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 30
    },

    section: {
        marginBottom: 25
    },

    sectionTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 12
    },

    settingCard: {
        backgroundColor: "#181818",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#282828"
    },

    iconContainer: {
        width: 45,
        height: 45,
        borderRadius: 23,
        backgroundColor: "#252525",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12
    },

    icon: {
        fontSize: 21
    },

    settingContent: {
        flex: 1,
        paddingRight: 10
    },

    settingTitle: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 4
    },

    settingDescription: {
        color: "#777",
        fontSize: 12,
        lineHeight: 17
    },

    savingContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20
    },

    savingText: {
        color: "#888",
        marginLeft: 8,
        fontSize: 12
    },

    infoBox: {
        flexDirection: "row",
        backgroundColor: "#111",
        borderRadius: 10,
        padding: 15,
        borderWidth: 1,
        borderColor: "#222"
    },

    infoIcon: {
        fontSize: 18,
        marginRight: 10
    },

    infoText: {
        flex: 1,
        color: "#777",
        fontSize: 12,
        lineHeight: 18
    }
});
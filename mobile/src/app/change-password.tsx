import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    ScrollView,
} from "react-native";
import { router } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://cine-x-1.onrender.com";

export default function ChangePasswordScreen() {
    const [currentPassword, setCurrentPassword] =
        useState("");

    const [newPassword, setNewPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [saving, setSaving] =
        useState(false);

    const changePassword = async () => {
        if (
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ) {
            Alert.alert(
                "Missing Fields",
                "Please fill in all password fields."
            );
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert(
                "Invalid Password",
                "New password must be at least 6 characters."
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert(
                "Password Mismatch",
                "New password and confirm password do not match."
            );
            return;
        }

        try {
            setSaving(true);

            const token =
                await AsyncStorage.getItem(
                    "token"
                );

            if (!token) {
                router.replace("/login");
                return;
            }

            await axios.patch(
                `${API_URL}/api/profile/password`,
                {
                    currentPassword,
                    newPassword,
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            Alert.alert(
                "Success",
                "Your password has been changed successfully.",
                [
                    {
                        text: "OK",
                        onPress: () =>
                            router.replace(
                                "/profile"
                            ),
                    },
                ]
            );

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            console.log(
                "CHANGE PASSWORD ERROR:",
                error?.response?.data ||
                    error.message
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
                                ),
                        },
                    ]
                );

                return;
            }

            Alert.alert(
                "Error",
                error?.response?.data?.message ||
                    "Failed to change password"
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={
                    styles.content
                }
            >
                <Text style={styles.logo}>
                    CINE-X
                </Text>

                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() =>
                        router.back()
                    }
                >
                    <Text style={styles.backText}>
                        ← Back
                    </Text>
                </TouchableOpacity>

                <Text style={styles.title}>
                    Change Password
                </Text>

                <Text style={styles.description}>
                    Enter your current password
                    and choose a new password.
                </Text>

                <Text style={styles.label}>
                    Current Password
                </Text>

                <TextInput
                    style={styles.input}
                    value={currentPassword}
                    onChangeText={
                        setCurrentPassword
                    }
                    placeholder="Enter current password"
                    placeholderTextColor="#777"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                <Text style={styles.label}>
                    New Password
                </Text>

                <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password"
                    placeholderTextColor="#777"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                <Text style={styles.label}>
                    Confirm New Password
                </Text>

                <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={
                        setConfirmPassword
                    }
                    placeholder="Confirm new password"
                    placeholderTextColor="#777"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                <TouchableOpacity
                    style={[
                        styles.changeButton,
                        saving &&
                            styles.disabledButton,
                    ]}
                    onPress={changePassword}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator
                            color="#fff"
                        />
                    ) : (
                        <Text
                            style={
                                styles.changeText
                            }
                        >
                            Change Password
                        </Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },

    content: {
        padding: 20,
        paddingTop: 60,
        paddingBottom: 80,
    },

    logo: {
        color: "#e50914",
        fontSize: 30,
        fontWeight: "900",
        letterSpacing: 2,
        marginBottom: 15,
    },

    backButton: {
        alignSelf: "flex-start",
        backgroundColor: "#222",
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 7,
        marginBottom: 25,
    },

    backText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 14,
    },

    title: {
        color: "#fff",
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 10,
    },

    description: {
        color: "#888",
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 30,
    },

    label: {
        color: "#aaa",
        fontSize: 14,
        marginBottom: 8,
    },

    input: {
        backgroundColor: "#181818",
        borderWidth: 1,
        borderColor: "#333",
        borderRadius: 10,
        color: "#fff",
        padding: 15,
        fontSize: 16,
        marginBottom: 20,
    },

    changeButton: {
        backgroundColor: "#e50914",
        padding: 16,
        borderRadius: 10,
        marginTop: 10,
    },

    disabledButton: {
        opacity: 0.6,
    },

    changeText: {
        color: "#fff",
        textAlign: "center",
        fontSize: 17,
        fontWeight: "bold",
    },
});
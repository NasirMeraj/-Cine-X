import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    ScrollView,
} from "react-native";
import { router } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.1.41:5001";

export default function EditProfileScreen() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const loadProfile = async () => {
        try {
            const token =
                await AsyncStorage.getItem("token");

            if (!token) {
                router.replace("/login");
                return;
            }

            const response = await axios.get(
                `${API_URL}/api/profile`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            const user =
                response.data.user;

            setName(user.name || "");
            setEmail(user.email || "");
        } catch (error: any) {
            console.log(
                "LOAD PROFILE ERROR:",
                error?.response?.data ||
                    error.message
            );

            Alert.alert(
                "Error",
                "Failed to load profile"
            );

            router.back();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const updateProfile = async () => {
        const cleanName = name.trim();
        const cleanEmail =
            email.trim().toLowerCase();

        if (!cleanName || !cleanEmail) {
            Alert.alert(
                "Missing Fields",
                "Please enter your name and email."
            );
            return;
        }

        if (!cleanEmail.includes("@")) {
            Alert.alert(
                "Invalid Email",
                "Please enter a valid email address."
            );
            return;
        }

        try {
            setSaving(true);

            const token =
                await AsyncStorage.getItem(
                    "token"
                );

            await axios.patch(
                `${API_URL}/api/profile`,
                {
                    name: cleanName,
                    email: cleanEmail,
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
                "Profile updated successfully.",
                [
                    {
                        text: "OK",
                        onPress: () =>
                            router.back(),
                    },
                ]
            );
        } catch (error: any) {
            console.log(
                "UPDATE PROFILE ERROR:",
                error?.response?.data ||
                    error.message
            );

            Alert.alert(
                "Error",
                error?.response?.data?.message ||
                    "Failed to update profile"
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator
                    size="large"
                    color="#e50914"
                />

                <Text style={styles.loadingText}>
                    Loading Profile...
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
                    Edit Profile
                </Text>

                <Text style={styles.label}>
                    Name
                </Text>

                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your name"
                    placeholderTextColor="#777"
                    autoCapitalize="words"
                />

                <Text style={styles.label}>
                    Email
                </Text>

                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor="#777"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        saving &&
                            styles.disabledButton,
                    ]}
                    onPress={updateProfile}
                    disabled={saving}
                >
                    <Text style={styles.saveText}>
                        {saving
                            ? "Saving..."
                            : "Save Changes"}
                    </Text>
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

    center: {
        flex: 1,
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
    },

    loadingText: {
        color: "#888",
        marginTop: 12,
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

    saveButton: {
        backgroundColor: "#e50914",
        padding: 16,
        borderRadius: 10,
        marginTop: 10,
    },

    disabledButton: {
        opacity: 0.6,
    },

    saveText: {
        color: "#fff",
        textAlign: "center",
        fontSize: 17,
        fontWeight: "bold",
    },
});
import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const API_URL = "http://192.168.1.41:5001";

export default function AddMovieScreen() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [genre, setGenre] = useState("");
    const [language, setLanguage] = useState("");
    const [year, setYear] = useState("");
    const [rating, setRating] = useState("");
    const [duration, setDuration] = useState("");
    const [poster, setPoster] = useState<any>(null);
    const [video, setVideo] = useState<any>(null);
    const [premium, setPremium] = useState(false);
    const [loading, setLoading] = useState(false);

    const pickFile = async (
        type: "poster" | "video"
    ) => {
        const result =
            await DocumentPicker.getDocumentAsync({
                type:
                    type === "poster"
                        ? ["image/*"]
                        : ["video/*"],
                copyToCacheDirectory: true
            });

        if (!result.canceled) {
            if (type === "poster") {
                setPoster(result.assets[0]);
            } else {
                setVideo(result.assets[0]);
            }
        }
    };

    const addMovie = async () => {
        if (
            !title ||
            !description ||
            !genre ||
            !language ||
            !year
        ) {
            Alert.alert(
                "Missing Fields",
                "Please fill all required fields."
            );
            return;
        }

        if (rating) {
            const ratingNumber =
                Number(rating);

            if (
                isNaN(ratingNumber) ||
                ratingNumber < 0 ||
                ratingNumber > 10
            ) {
                Alert.alert(
                    "Invalid Rating",
                    "Rating must be between 0 and 10."
                );
                return;
            }
        }

        try {
            setLoading(true);

            const token =
                await AsyncStorage.getItem(
                    "token"
                );

            if (!token) {
                router.replace("/login");
                return;
            }

            const formData =
                new FormData();

            formData.append(
                "title",
                title
            );

            formData.append(
                "description",
                description
            );

            formData.append(
                "genre",
                genre
            );

            formData.append(
                "language",
                language
            );

            formData.append(
                "year",
                year
            );

            formData.append(
                "rating",
                rating || "0"
            );

            formData.append(
                "duration",
                duration
            );

            formData.append(
                "premium",
                premium
                    ? "true"
                    : "false"
            );

            if (poster) {
                formData.append(
                    "poster",
                    {
                        uri: poster.uri,
                        name:
                            poster.name ||
                            "poster.jpg",
                        type:
                            poster.mimeType ||
                            "image/jpeg"
                    } as any
                );
            }

            if (video) {
                formData.append(
                    "video",
                    {
                        uri: video.uri,
                        name:
                            video.name ||
                            "movie.mp4",
                        type:
                            video.mimeType ||
                            "video/mp4"
                    } as any
                );
            }

            await axios.post(
                `${API_URL}/api/movies`,
                formData,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                        "Content-Type":
                            "multipart/form-data"
                    }
                }
            );

            Alert.alert(
                "Success",
                "Movie added successfully",
                [
                    {
                        text: "OK",
                        onPress: () =>
                            router.back()
                    }
                ]
            );
        } catch (error: any) {
            console.log(
                "ADD MOVIE ERROR:",
                error?.response
                    ?.data ||
                    error.message
            );

            Alert.alert(
                "Error",
                error?.response
                    ?.data?.message ||
                    "Failed to add movie"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={
                styles.content
            }
        >
            <Text style={styles.title}>
                ➕ Add Movie
            </Text>

            <TextInput
                style={styles.input}
                placeholder="Movie Title"
                placeholderTextColor="#777"
                value={title}
                onChangeText={setTitle}
            />

            <TextInput
                style={[
                    styles.input,
                    styles.textArea
                ]}
                placeholder="Description"
                placeholderTextColor="#777"
                value={description}
                onChangeText={
                    setDescription
                }
                multiline
            />

            <TextInput
                style={styles.input}
                placeholder="Genre"
                placeholderTextColor="#777"
                value={genre}
                onChangeText={setGenre}
            />

            <TextInput
                style={styles.input}
                placeholder="Language"
                placeholderTextColor="#777"
                value={language}
                onChangeText={setLanguage}
            />

            <TextInput
                style={styles.input}
                placeholder="Year"
                placeholderTextColor="#777"
                value={year}
                onChangeText={setYear}
                keyboardType="numeric"
            />

            <TextInput
                style={styles.input}
                placeholder="Rating (0 - 10)"
                placeholderTextColor="#777"
                value={rating}
                onChangeText={setRating}
                keyboardType="decimal-pad"
            />

            <TextInput
                style={styles.input}
                placeholder="Duration"
                placeholderTextColor="#777"
                value={duration}
                onChangeText={setDuration}
            />

            <TouchableOpacity
                style={styles.fileButton}
                onPress={() =>
                    pickFile("poster")
                }
            >
                <Text style={styles.fileText}>
                    🖼️{" "}
                    {poster
                        ? poster.name
                        : "Choose Poster"}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.fileButton}
                onPress={() =>
                    pickFile("video")
                }
            >
                <Text style={styles.fileText}>
                    🎬{" "}
                    {video
                        ? video.name
                        : "Choose Video"}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.premiumButton,
                    premium &&
                        styles.premiumActive
                ]}
                onPress={() =>
                    setPremium(!premium)
                }
            >
                <Text style={styles.premiumText}>
                    {premium
                        ? "⭐ Premium Movie"
                        : "○ Free Movie"}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.addButton}
                onPress={addMovie}
                disabled={loading}
            >
                <Text style={styles.addText}>
                    {loading
                        ? "Adding..."
                        : "Add Movie"}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000"
    },

    content: {
        padding: 20,
        paddingBottom: 50
    },

    title: {
        color: "#fff",
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 25
    },

    input: {
        backgroundColor: "#1a1a1a",
        color: "#fff",
        borderRadius: 10,
        padding: 15,
        marginBottom: 12,
        fontSize: 16
    },

    textArea: {
        height: 120,
        textAlignVertical: "top"
    },

    fileButton: {
        backgroundColor: "#222",
        padding: 16,
        borderRadius: 10,
        marginBottom: 12
    },

    fileText: {
        color: "#fff",
        fontSize: 16
    },

    premiumButton: {
        backgroundColor: "#222",
        padding: 16,
        borderRadius: 10,
        marginTop: 5,
        marginBottom: 15
    },

    premiumActive: {
        backgroundColor: "#4a3900"
    },

    premiumText: {
        color: "#fff",
        textAlign: "center",
        fontSize: 16,
        fontWeight: "bold"
    },

    addButton: {
        backgroundColor: "#E50914",
        padding: 16,
        borderRadius: 10
    },

    addText: {
        color: "#fff",
        textAlign: "center",
        fontSize: 17,
        fontWeight: "bold"
    }
});
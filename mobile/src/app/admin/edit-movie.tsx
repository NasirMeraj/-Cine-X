import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.1.41:5001";

export default function EditMovieScreen() {
    const { id } = useLocalSearchParams();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [genre, setGenre] = useState("");
    const [language, setLanguage] = useState("");
    const [year, setYear] = useState("");
    const [duration, setDuration] = useState("");
    const [premium, setPremium] = useState(false);

    const [poster, setPoster] = useState<any>(null);
    const [video, setVideo] = useState<any>(null);

    const [currentPoster, setCurrentPoster] = useState("");
    const [currentVideo, setCurrentVideo] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const loadMovie = async () => {
        try {
            const token =
                await AsyncStorage.getItem("token");

            const response = await axios.get(
                `${API_URL}/api/movies/${id}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            const movie =
                response.data.movie ||
                response.data;

            setTitle(movie.title || "");
            setDescription(movie.description || "");
            setGenre(movie.genre || "");
            setLanguage(movie.language || "");
            setYear(
                movie.year
                    ? String(movie.year)
                    : ""
            );
            setDuration(movie.duration || "");
            setPremium(movie.premium === true);

            setCurrentPoster(movie.poster || "");
            setCurrentVideo(movie.video || "");
        } catch (error) {
            console.log(
                "LOAD MOVIE ERROR:",
                error
            );

            Alert.alert(
                "Error",
                "Failed to load movie"
            );

            router.back();
        } finally {
            setLoading(false);
        }
    };

    const pickPoster = async () => {
        try {
            const result =
                await DocumentPicker.getDocumentAsync({
                    type: [
                        "image/jpeg",
                        "image/png",
                        "image/webp"
                    ],
                    copyToCacheDirectory: true
                });

            if (
                !result.canceled &&
                result.assets?.length
            ) {
                setPoster(result.assets[0]);
            }
        } catch (error) {
            console.log(
                "POSTER PICK ERROR:",
                error
            );
        }
    };

    const pickVideo = async () => {
        try {
            const result =
                await DocumentPicker.getDocumentAsync({
                    type: "video/*",
                    copyToCacheDirectory: true
                });

            if (
                !result.canceled &&
                result.assets?.length
            ) {
                setVideo(result.assets[0]);
            }
        } catch (error) {
            console.log(
                "VIDEO PICK ERROR:",
                error
            );
        }
    };

    const updateMovie = async () => {
        if (
            !title.trim() ||
            !description.trim() ||
            !genre.trim() ||
            !language.trim() ||
            !year.trim()
        ) {
            Alert.alert(
                "Missing Fields",
                "Please fill all required fields."
            );
            return;
        }

        try {
            setSaving(true);

            const token =
                await AsyncStorage.getItem("token");

            const formData = new FormData();

            formData.append(
                "title",
                title.trim()
            );

            formData.append(
                "description",
                description.trim()
            );

            formData.append(
                "genre",
                genre.trim()
            );

            formData.append(
                "language",
                language.trim()
            );

            formData.append(
                "year",
                year.trim()
            );

            formData.append(
                "duration",
                duration.trim()
            );

            formData.append(
                "premium",
                String(premium)
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

            const response =
                await axios.patch(
                    `${API_URL}/api/movies/${id}`,
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

            console.log(
                "UPDATE RESPONSE:",
                response.data
            );

            Alert.alert(
                "Success",
                "Movie updated successfully",
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
                "UPDATE MOVIE ERROR:",
                error?.response?.data ||
                    error.message
            );

            Alert.alert(
                "Error",
                error?.response?.data?.message ||
                    "Failed to update movie"
            );
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        loadMovie();
    }, [id]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator
                    size="large"
                    color="#E50914"
                />

                <Text style={styles.loadingText}>
                    Loading Movie...
                </Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={
                styles.content
            }
        >
            <Text style={styles.title}>
                Edit Movie
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
                onChangeText={setDescription}
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
                placeholder="Duration"
                placeholderTextColor="#777"
                value={duration}
                onChangeText={setDuration}
            />

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    Poster
                </Text>

                <Text style={styles.currentText}>
                    {poster
                        ? `Selected: ${poster.name}`
                        : currentPoster
                            ? "Current poster will be kept"
                            : "No poster selected"}
                </Text>

                <TouchableOpacity
                    style={styles.fileButton}
                    onPress={pickPoster}
                >
                    <Text style={styles.fileButtonText}>
                        {poster
                            ? "Change Poster"
                            : "Select New Poster"}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    Video
                </Text>

                <Text style={styles.currentText}>
                    {video
                        ? `Selected: ${video.name}`
                        : currentVideo
                            ? "Current video will be kept"
                            : "No video selected"}
                </Text>

                <TouchableOpacity
                    style={styles.fileButton}
                    onPress={pickVideo}
                >
                    <Text style={styles.fileButtonText}>
                        {video
                            ? "Change Video"
                            : "Select New Video"}
                    </Text>
                </TouchableOpacity>
            </View>

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
                        ? "Premium Movie"
                        : "Free Movie"}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.saveButton,
                    saving &&
                        styles.saveDisabled
                ]}
                onPress={updateMovie}
                disabled={saving}
            >
                <Text style={styles.saveText}>
                    {saving
                        ? "Saving..."
                        : "Save Changes"}
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
        paddingTop: 60,
        paddingBottom: 60
    },

    center: {
        flex: 1,
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center"
    },

    loadingText: {
        color: "#888",
        marginTop: 12,
        fontSize: 14
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

    section: {
        backgroundColor: "#111",
        padding: 15,
        borderRadius: 10,
        marginTop: 8,
        marginBottom: 12
    },

    sectionTitle: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "bold",
        marginBottom: 7
    },

    currentText: {
        color: "#888",
        fontSize: 13,
        marginBottom: 12
    },

    fileButton: {
        backgroundColor: "#333",
        padding: 13,
        borderRadius: 8
    },

    fileButtonText: {
        color: "#fff",
        textAlign: "center",
        fontWeight: "bold"
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

    saveButton: {
        backgroundColor: "#E50914",
        padding: 16,
        borderRadius: 10
    },

    saveDisabled: {
        opacity: 0.6
    },

    saveText: {
        color: "#fff",
        textAlign: "center",
        fontSize: 17,
        fontWeight: "bold"
    }
});
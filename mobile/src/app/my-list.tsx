import React, { useCallback, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    StyleSheet,
    Text,
    View,
    Image,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

const API_URL = "http://192.168.1.41:5001";

export default function MyListScreen() {
    const router = useRouter();

    const [list, setList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            fetchMyList();
        }, [])
    );

    const fetchMyList = async () => {
        try {
            setLoading(true);

            const token =
                await AsyncStorage.getItem("token");

            if (!token) {
                setList([]);
                return;
            }

            const response = await axios.get(
                `${API_URL}/api/my-list`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            setList(
                response.data.list || []
            );
        } catch (error: any) {
            console.log(
                "MY LIST ERROR:",
                error.response?.data ||
                    error.message
            );

            setList([]);
        } finally {
            setLoading(false);
        }
    };

    const getPosterUrl = (
        poster: string
    ) => {
        if (!poster) {
            return null;
        }

        if (poster.startsWith("http")) {
            return poster;
        }

        if (poster.startsWith("/uploads/")) {
            return `${API_URL}${poster}`;
        }

        return null;
    };

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator
                    size="large"
                    color="#e50914"
                />

                <Text style={styles.loadingText}>
                    Loading My List...
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() =>
                        router.replace("/")
                    }
                >
                    <Text style={styles.backText}>
                        ← Back
                    </Text>
                </TouchableOpacity>

                <Text style={styles.title}>
                    My List
                </Text>
            </View>

            {list.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={styles.emptyIcon}>
                        + 
                    </Text>

                    <Text style={styles.emptyTitle}>
                        Your List is Empty
                    </Text>

                    <Text style={styles.emptyText}>
                        Add movies to My List and
                        they will appear here.
                    </Text>

                    <TouchableOpacity
                        style={styles.browseButton}
                        onPress={() =>
                            router.replace("/")
                        }
                    >
                        <Text
                            style={
                                styles.browseText
                            }
                        >
                            Browse Movies
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={
                        false
                    }
                    contentContainerStyle={
                        styles.grid
                    }
                >
                    {list.map((item) => {
                        const movie =
                            item.movie;

                        if (!movie) {
                            return null;
                        }

                        const posterUrl =
                            getPosterUrl(
                                movie.poster
                            );

                        return (
                            <TouchableOpacity
                                key={item._id}
                                style={styles.card}
                                activeOpacity={0.8}
                                onPress={() =>
                                    router.push(
                                        `/${movie._id}`
                                    )
                                }
                            >
                                {posterUrl ? (
                                    <Image
                                        source={{
                                            uri: posterUrl,
                                        }}
                                        style={
                                            styles.poster
                                        }
                                    />
                                ) : (
                                    <View
                                        style={
                                            styles.noPoster
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.noPosterText
                                            }
                                        >
                                            No Poster
                                        </Text>
                                    </View>
                                )}

                                <Text
                                    style={
                                        styles.movieTitle
                                    }
                                    numberOfLines={1}
                                >
                                    {movie.title}
                                </Text>

                                <Text
                                    style={
                                        styles.movieInfo
                                    }
                                >
                                    {movie.year} • ⭐{" "}
                                    {movie.rating}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        paddingTop: 55,
        paddingHorizontal: 16,
    },

    loading: {
        flex: 1,
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
    },

    loadingText: {
        color: "#999",
        marginTop: 12,
        fontSize: 14,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 25,
    },

    backButton: {
        backgroundColor: "#222",
        paddingVertical: 9,
        paddingHorizontal: 12,
        borderRadius: 7,
        marginRight: 15,
    },

    backText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },

    title: {
        color: "#fff",
        fontSize: 28,
        fontWeight: "800",
    },

    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingBottom: 30,
    },

    card: {
        width: "48%",
        marginBottom: 25,
    },

    poster: {
        width: "100%",
        height: 250,
        borderRadius: 8,
        backgroundColor: "#151515",
    },

    noPoster: {
        width: "100%",
        height: 250,
        borderRadius: 8,
        backgroundColor: "#151515",
        justifyContent: "center",
        alignItems: "center",
    },

    noPosterText: {
        color: "#777",
    },

    movieTitle: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
        marginTop: 9,
    },

    movieInfo: {
        color: "#888",
        fontSize: 12,
        marginTop: 5,
    },

    empty: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 100,
    },

    emptyIcon: {
        color: "#e50914",
        fontSize: 60,
        fontWeight: "300",
        marginBottom: 10,
    },

    emptyTitle: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "800",
        marginBottom: 10,
    },

    emptyText: {
        color: "#888",
        fontSize: 14,
        textAlign: "center",
        lineHeight: 21,
        maxWidth: 280,
        marginBottom: 25,
    },

    browseButton: {
        backgroundColor: "#e50914",
        paddingVertical: 13,
        paddingHorizontal: 25,
        borderRadius: 8,
    },

    browseText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
    },
});
import React, { useCallback, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

const API_URL = "https://cine-x-1.onrender.com";

export default function HistoryScreen() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    useFocusEffect(
        useCallback(() => {
            fetchHistory();
        }, [])
    );

    const fetchHistory = async () => {
        try {
            setLoading(true);

            const token =
                await AsyncStorage.getItem("token");

            if (!token) {
                setHistory([]);
                return;
            }

            const response = await axios.get(
                `${API_URL}/api/watch-history`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            setHistory(
                response.data.history || []
            );
        } catch (error: any) {
            console.log(
                "HISTORY ERROR:",
                error.response?.data ||
                    error.message
            );

            setHistory([]);
        } finally {
            setLoading(false);
        }
    };

    const getPosterUrl = async (
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

        try {
            const token =
                await AsyncStorage.getItem("token");

            const response = await axios.get(
                `${API_URL}/api/storage/url`,
                {
                    params: {
                        key: poster,
                    },
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            return response.data.url;
        } catch (error) {
            console.log(
                "POSTER ERROR:",
                error
            );

            return null;
        }
    };

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator
                    size="large"
                    color="#e50914"
                />

                <Text style={styles.loadingText}>
                    Loading history...
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() =>
                        router.back()
                    }
                >
                    <Text style={styles.back}>
                        ‹
                    </Text>
                </TouchableOpacity>

                <Text style={styles.title}>
                    Watch History
                </Text>
            </View>

            {history.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={styles.emptyIcon}>
                        🎬
                    </Text>

                    <Text style={styles.emptyTitle}>
                        No Watch History
                    </Text>

                    <Text style={styles.emptyText}>
                        Movies you watch will appear
                        here.
                    </Text>
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={
                        false
                    }
                >
                    {history.map((item) => {
                        if (!item.movie) {
                            return null;
                        }

                        return (
                            <HistoryCard
                                key={item._id}
                                item={item}
                                getPosterUrl={
                                    getPosterUrl
                                }
                                onPress={() =>
                                    router.push(
                                        `/${item.movie._id}`
                                    )
                                }
                            />
                        );
                    })}
                </ScrollView>
            )}
        </View>
    );
}

function HistoryCard({
    item,
    getPosterUrl,
    onPress,
}: {
    item: any;
    getPosterUrl: (
        poster: string
    ) => Promise<string | null>;
    onPress: () => void;
}) {
    const [posterUrl, setPosterUrl] =
        useState<string | null>(null);

    const movie = item.movie;

    React.useEffect(() => {
        const loadPoster = async () => {
            const url =
                await getPosterUrl(movie.poster);

            setPosterUrl(url);
        };

        loadPoster();
    }, [movie.poster]);

    const progress =
        item.duration > 0
            ? Math.min(
                  (item.progress /
                      item.duration) *
                      100,
                  100
              )
            : 0;

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.8}
        >
            {posterUrl ? (
                <Image
                    source={{
                        uri: posterUrl,
                    }}
                    style={styles.poster}
                />
            ) : (
                <View style={styles.noPoster}>
                    <Text
                        style={
                            styles.noPosterText
                        }
                    >
                        No Poster
                    </Text>
                </View>
            )}

            <View style={styles.info}>
                <Text
                    style={styles.movieTitle}
                    numberOfLines={2}
                >
                    {movie.title}
                </Text>

                <Text style={styles.movieInfo}>
                    {movie.year} • ⭐{" "}
                    {movie.rating}
                </Text>

                <Text style={styles.progressText}>
                    {Math.round(progress)}% watched
                </Text>

                <View
                    style={
                        styles.progressBackground
                    }
                >
                    <View
                        style={[
                            styles.progress,
                            {
                                width: `${progress}%`,
                            },
                        ]}
                    />
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        paddingTop: 60,
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
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 25,
    },

    back: {
        color: "#fff",
        fontSize: 40,
        lineHeight: 40,
        marginRight: 15,
    },

    title: {
        color: "#fff",
        fontSize: 26,
        fontWeight: "800",
    },

    empty: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 100,
    },

    emptyIcon: {
        fontSize: 50,
        marginBottom: 15,
    },

    emptyTitle: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "700",
    },

    emptyText: {
        color: "#777",
        fontSize: 14,
        marginTop: 8,
    },

    card: {
        flexDirection: "row",
        marginBottom: 20,
        backgroundColor: "#111",
        borderRadius: 10,
        padding: 10,
    },

    poster: {
        width: 100,
        height: 140,
        borderRadius: 7,
        backgroundColor: "#151515",
    },

    noPoster: {
        width: 100,
        height: 140,
        borderRadius: 7,
        backgroundColor: "#151515",
        justifyContent: "center",
        alignItems: "center",
    },

    noPosterText: {
        color: "#777",
        fontSize: 12,
    },

    info: {
        flex: 1,
        marginLeft: 14,
        justifyContent: "center",
    },

    movieTitle: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "700",
    },

    movieInfo: {
        color: "#888",
        fontSize: 12,
        marginTop: 8,
    },

    progressText: {
        color: "#aaa",
        fontSize: 12,
        marginTop: 18,
    },

    progressBackground: {
        height: 4,
        backgroundColor: "#444",
        borderRadius: 4,
        marginTop: 6,
    },

    progress: {
        height: 4,
        backgroundColor: "#e50914",
        borderRadius: 4,
    },
});
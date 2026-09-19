import React, {
    useCallback,
    useState
} from "react";

import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Alert,
    ActivityIndicator,
    RefreshControl
} from "react-native";

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    router,
    useFocusEffect
} from "expo-router";

const API_URL = "http://192.168.1.41:5001";

type Stats = {
    totalMovies: number;
    premiumMovies: number;
    freeMovies: number;
    totalUsers: number;
    premiumUsers: number;
    freeUsers: number;
};

export default function AdminScreen() {
    const [movies, setMovies] =
        useState<any[]>([]);

    const [stats, setStats] =
        useState<Stats>({
            totalMovies: 0,
            premiumMovies: 0,
            freeMovies: 0,
            totalUsers: 0,
            premiumUsers: 0,
            freeUsers: 0
        });

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const checkAdmin =
        async () => {
            try {
                const token =
                    await AsyncStorage.getItem(
                        "token"
                    );

                const role =
                    await AsyncStorage.getItem(
                        "role"
                    );

                if (!token) {
                    router.replace(
                        "/login"
                    );

                    return false;
                }

                if (role !== "admin") {
                    Alert.alert(
                        "Access Denied",
                        "You do not have permission to access the Admin Panel.",
                        [
                            {
                                text: "OK",
                                onPress: () =>
                                    router.replace(
                                        "/"
                                    )
                            }
                        ]
                    );

                    return false;
                }

                return true;
            } catch (error) {
                console.log(
                    "ADMIN CHECK ERROR:",
                    error
                );

                router.replace(
                    "/login"
                );

                return false;
            }
        };

    const loadDashboard =
        async (
            showLoader = true
        ) => {
            try {
                if (showLoader) {
                    setLoading(true);
                }

                const isAdmin =
                    await checkAdmin();

                if (!isAdmin) {
                    return;
                }

                const token =
                    await AsyncStorage.getItem(
                        "token"
                    );

                const headers = {
                    Authorization:
                        `Bearer ${token}`
                };

                const [
                    dashboardResponse,
                    moviesResponse
                ] = await Promise.all([
                    axios.get(
                        `${API_URL}/api/admin/dashboard`,
                        {
                            headers
                        }
                    ),

                    axios.get(
                        `${API_URL}/api/movies`,
                        {
                            headers
                        }
                    )
                ]);

                setStats(
                    dashboardResponse
                        .data
                        .stats
                );

                setMovies(
                    moviesResponse.data.movies ||
                        []
                );
            } catch (error: any) {
                console.log(
                    "ADMIN DASHBOARD ERROR:",
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

                if (
                    error?.response?.status ===
                    403
                ) {
                    Alert.alert(
                        "Access Denied",
                        "Admin access required.",
                        [
                            {
                                text: "OK",
                                onPress: () =>
                                    router.replace(
                                        "/"
                                    )
                            }
                        ]
                    );

                    return;
                }

                Alert.alert(
                    "Error",
                    "Failed to load dashboard"
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        };

    const refreshDashboard =
        async () => {
            setRefreshing(true);

            await loadDashboard(false);
        };

    const deleteMovie =
        async (id: string) => {
            Alert.alert(
                "Delete Movie",
                "Are you sure you want to delete this movie?",
                [
                    {
                        text: "Cancel",
                        style: "cancel"
                    },
                    {
                        text: "Delete",
                        style: "destructive",

                        onPress:
                            async () => {
                                try {
                                    const token =
                                        await AsyncStorage.getItem(
                                            "token"
                                        );

                                    await axios.delete(
                                        `${API_URL}/api/movies/${id}`,
                                        {
                                            headers: {
                                                Authorization:
                                                    `Bearer ${token}`
                                            }
                                        }
                                    );

                                    setMovies(
                                        previousMovies =>
                                            previousMovies.filter(
                                                movie =>
                                                    movie._id !==
                                                    id
                                            )
                                    );

                                    setStats(
                                        previousStats => ({
                                            ...previousStats,

                                            totalMovies:
                                                Math.max(
                                                    0,
                                                    previousStats.totalMovies -
                                                        1
                                                )
                                        })
                                    );

                                    Alert.alert(
                                        "Success",
                                        "Movie deleted"
                                    );
                                } catch (error: any) {
                                    console.log(
                                        "DELETE MOVIE ERROR:",
                                        error
                                    );

                                    if (
                                        error.response
                                            ?.status ===
                                        403
                                    ) {
                                        Alert.alert(
                                            "Access Denied",
                                            "Admin access required."
                                        );

                                        router.replace(
                                            "/"
                                        );

                                        return;
                                    }

                                    Alert.alert(
                                        "Error",
                                        "Failed to delete movie"
                                    );
                                }
                            }
                    }
                ]
            );
        };

    useFocusEffect(
        useCallback(() => {
            loadDashboard();
        }, [])
    );

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
                    Loading Admin Dashboard...
                </Text>
            </View>
        );
    }

    return (
        <View
            style={
                styles.container
            }
        >
            <FlatList
                data={movies}
                keyExtractor={item =>
                    item._id
                }
                refreshControl={
                    <RefreshControl
                        refreshing={
                            refreshing
                        }
                        onRefresh={
                            refreshDashboard
                        }
                        tintColor="#E50914"
                    />
                }
                showsVerticalScrollIndicator={
                    false
                }
                ListHeaderComponent={
                    <>
                        <View
                            style={
                                styles.header
                            }
                        >
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
                                    Back
                                </Text>
                            </TouchableOpacity>

                            <View
                                style={
                                    styles.headerTextContainer
                                }
                            >
                                <Text
                                    style={
                                        styles.title
                                    }
                                >
                                    Admin Dashboard
                                </Text>

                                <Text
                                    style={
                                        styles.subtitle
                                    }
                                >
                                    Cine-X Management
                                </Text>
                            </View>
                        </View>

                        <Text
                            style={
                                styles.sectionTitle
                            }
                        >
                            Overview
                        </Text>

                        <View
                            style={
                                styles.statsGrid
                            }
                        >
                            <View
                                style={[
                                    styles.statCard,
                                    styles.redCard
                                ]}
                            >
                                <Text
                                    style={
                                        styles.statNumber
                                    }
                                >
                                    {
                                        stats.totalMovies
                                    }
                                </Text>

                                <Text
                                    style={
                                        styles.statLabel
                                    }
                                >
                                    Total Movies
                                </Text>
                            </View>

                            <View
                                style={[
                                    styles.statCard,
                                    styles.goldCard
                                ]}
                            >
                                <Text
                                    style={
                                        styles.statNumber
                                    }
                                >
                                    {
                                        stats.premiumMovies
                                    }
                                </Text>

                                <Text
                                    style={
                                        styles.statLabel
                                    }
                                >
                                    Premium Movies
                                </Text>
                            </View>

                            <View
                                style={
                                    styles.statCard
                                }
                            >
                                <Text
                                    style={
                                        styles.statNumber
                                    }
                                >
                                    {
                                        stats.freeMovies
                                    }
                                </Text>

                                <Text
                                    style={
                                        styles.statLabel
                                    }
                                >
                                    Free Movies
                                </Text>
                            </View>

                            <View
                                style={[
                                    styles.statCard,
                                    styles.blueCard
                                ]}
                            >
                                <Text
                                    style={
                                        styles.statNumber
                                    }
                                >
                                    {
                                        stats.totalUsers
                                    }
                                </Text>

                                <Text
                                    style={
                                        styles.statLabel
                                    }
                                >
                                    Total Users
                                </Text>
                            </View>

                            <View
                                style={[
                                    styles.statCard,
                                    styles.premiumUserCard
                                ]}
                            >
                                <Text
                                    style={
                                        styles.statNumber
                                    }
                                >
                                    {
                                        stats.premiumUsers
                                    }
                                </Text>

                                <Text
                                    style={
                                        styles.statLabel
                                    }
                                >
                                    Premium Users
                                </Text>
                            </View>

                            <View
                                style={
                                    styles.statCard
                                }
                            >
                                <Text
                                    style={
                                        styles.statNumber
                                    }
                                >
                                    {
                                        stats.freeUsers
                                    }
                                </Text>

                                <Text
                                    style={
                                        styles.statLabel
                                    }
                                >
                                    Free Users
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={
                                styles.addButton
                            }
                            onPress={() =>
                                router.push(
                                    "/admin/add-movie"
                                )
                            }
                        >
                            <Text
                                style={
                                    styles.addText
                                }
                            >
                                + Add Movie
                            </Text>
                        </TouchableOpacity>

                        <Text
                            style={
                                styles.sectionTitle
                            }
                        >
                            Movie Management
                        </Text>
                    </>
                }
                renderItem={({
                    item
                }) => (
                    <View
                        style={
                            styles.movieCard
                        }
                    >
                        <View
                            style={
                                styles.movieInfo
                            }
                        >
                            <Text
                                style={
                                    styles.movieTitle
                                }
                                numberOfLines={
                                    2
                                }
                            >
                                {item.title}
                            </Text>

                            <Text
                                style={
                                    styles.movieDetails
                                }
                            >
                                {item.genre} •{" "}
                                {item.year}
                            </Text>

                            <Text
                                style={
                                    styles.movieLanguage
                                }
                            >
                                {item.language}
                                {item.duration
                                    ? ` • ${item.duration}`
                                    : ""}
                            </Text>

                            {item.premium && (
                                <Text
                                    style={
                                        styles.premium
                                    }
                                >
                                    PREMIUM
                                </Text>
                            )}
                        </View>

                        <View
                            style={
                                styles.actions
                            }
                        >
                            <TouchableOpacity
                                style={
                                    styles.editButton
                                }
                                onPress={() =>
                                    router.push(
                                        {
                                            pathname:
                                                "/admin/edit-movie",
                                            params: {
                                                id: item._id
                                            }
                                        }
                                    )
                                }
                            >
                                <Text
                                    style={
                                        styles.buttonText
                                    }
                                >
                                    Edit
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={
                                    styles.deleteButton
                                }
                                onPress={() =>
                                    deleteMovie(
                                        item._id
                                    )
                                }
                            >
                                <Text
                                    style={
                                        styles.buttonText
                                    }
                                >
                                    Delete
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <View
                        style={
                            styles.empty
                        }
                    >
                        <Text
                            style={
                                styles.emptyText
                            }
                        >
                            No movies found
                        </Text>
                    </View>
                }
                ListFooterComponent={
                    <View
                        style={
                            styles.footer
                        }
                    >
                        <Text
                            style={
                                styles.footerText
                            }
                        >
                            Pull down to refresh
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles =
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: "#000",
            paddingTop: 55,
            paddingHorizontal: 16
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
            marginTop: 12,
            fontSize: 14
        },

        header: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 25
        },

        backButton: {
            backgroundColor: "#222",
            paddingVertical: 9,
            paddingHorizontal: 13,
            borderRadius: 7,
            marginRight: 13
        },

        backText: {
            color: "#fff",
            fontSize: 13,
            fontWeight: "700"
        },

        headerTextContainer: {
            flex: 1
        },

        title: {
            color: "#fff",
            fontSize: 25,
            fontWeight: "bold"
        },

        subtitle: {
            color: "#777",
            marginTop: 3,
            fontSize: 13
        },

        sectionTitle: {
            color: "#fff",
            fontSize: 20,
            fontWeight: "bold",
            marginBottom: 12,
            marginTop: 5
        },

        statsGrid: {
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent:
                "space-between",
            marginBottom: 15
        },

        statCard: {
            width: "48%",
            backgroundColor: "#1a1a1a",
            borderRadius: 12,
            padding: 18,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: "#292929"
        },

        redCard: {
            borderColor: "#E50914"
        },

        goldCard: {
            borderColor: "#ffd700"
        },

        blueCard: {
            borderColor: "#3b82f6"
        },

        premiumUserCard: {
            borderColor: "#a855f7"
        },

        statNumber: {
            color: "#fff",
            fontSize: 28,
            fontWeight: "bold"
        },

        statLabel: {
            color: "#999",
            fontSize: 13,
            marginTop: 5
        },

        addButton: {
            backgroundColor: "#E50914",
            padding: 15,
            borderRadius: 10,
            marginBottom: 25
        },

        addText: {
            color: "#fff",
            textAlign: "center",
            fontSize: 17,
            fontWeight: "bold"
        },

        movieCard: {
            backgroundColor: "#1a1a1a",
            padding: 15,
            borderRadius: 12,
            marginBottom: 12,
            flexDirection: "row",
            justifyContent:
                "space-between",
            borderWidth: 1,
            borderColor: "#222"
        },

        movieInfo: {
            flex: 1,
            marginRight: 10
        },

        movieTitle: {
            color: "#fff",
            fontSize: 18,
            fontWeight: "bold"
        },

        movieDetails: {
            color: "#aaa",
            marginTop: 6
        },

        movieLanguage: {
            color: "#777",
            marginTop: 4,
            fontSize: 12
        },

        premium: {
            color: "#ffd700",
            marginTop: 7,
            fontWeight: "bold",
            fontSize: 12
        },

        actions: {
            justifyContent:
                "center"
        },

        editButton: {
            backgroundColor: "#333",
            paddingVertical: 9,
            paddingHorizontal: 13,
            borderRadius: 7,
            marginBottom: 7
        },

        deleteButton: {
            backgroundColor: "#b00020",
            paddingVertical: 9,
            paddingHorizontal: 13,
            borderRadius: 7
        },

        buttonText: {
            color: "#fff",
            fontWeight: "bold"
        },

        empty: {
            alignItems: "center",
            paddingTop: 50
        },

        emptyText: {
            color: "#777",
            fontSize: 16
        },

        footer: {
            alignItems: "center",
            paddingVertical: 25
        },

        footerText: {
            color: "#555",
            fontSize: 12
        }
    });
    
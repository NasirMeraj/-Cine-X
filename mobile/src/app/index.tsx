import React, { useEffect, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import {
    StyleSheet,
    Text,
    View,
    ActivityIndicator,
    ScrollView,
    Image,
    TouchableOpacity,
    TextInput,
} from "react-native";

const API_URL = "https://cine-x-1.onrender.com";

const categories = [
    "Action",
    "Comedy",
    "Drama",
    "Horror",
    "Romance",
    "Thriller",
];

export default function HomeScreen() {
    const [movies, setMovies] = useState<any[]>([]);
    const [continueWatching, setContinueWatching] =
        useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] =
        useState("");
    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] =
        useState(false);
    const [unreadNotifications, setUnreadNotifications] =
        useState(0);

    const router = useRouter();

    useEffect(() => {
        fetchMovies();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            fetchContinueWatching();
            fetchUnreadNotifications();
        }, [])
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search.trim()) {
                setSelectedCategory("");
                searchMovies(search);
            } else if (selectedCategory) {
                searchMovies(selectedCategory);
            } else {
                fetchMovies();
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [search, selectedCategory]);

    const fetchMovies = async () => {
        try {
            const response = await axios.get(
                `${API_URL}/api/movies`
            );

            setMovies(
                response.data.movies || []
            );
        } catch (error: any) {
            console.log(
                "MOVIES ERROR:",
                error.response?.data ||
                    error.message
            );
        } finally {
            setLoading(false);
        }
    };

    const searchMovies = async (
        searchText: string
    ) => {
        try {
            setSearchLoading(true);

            const response = await axios.get(
                `${API_URL}/api/movies`,
                {
                    params: {
                        search: searchText,
                    },
                }
            );

            setMovies(
                response.data.movies || []
            );
        } catch (error: any) {
            console.log(
                "SEARCH ERROR:",
                error.response?.data ||
                    error.message
            );

            setMovies([]);
        } finally {
            setSearchLoading(false);
        }
    };

    const fetchContinueWatching = async () => {
        try {
            const token =
                await AsyncStorage.getItem("token");

            if (!token) {
                setContinueWatching([]);
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

            setContinueWatching(
                response.data.history || []
            );
        } catch (error: any) {
            console.log(
                "CONTINUE WATCHING ERROR:",
                error.response?.data ||
                    error.message
            );

            setContinueWatching([]);
        }
    };

    const fetchUnreadNotifications = async () => {
        try {
            const token =
                await AsyncStorage.getItem("token");

            if (!token) {
                setUnreadNotifications(0);
                return;
            }

            const response = await axios.get(
                `${API_URL}/api/notifications`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            setUnreadNotifications(
                response.data.unreadCount || 0
            );
        } catch (error: any) {
            console.log(
                "NOTIFICATION COUNT ERROR:",
                error.response?.data ||
                    error.message
            );

            setUnreadNotifications(0);
        }
    };

    const getPosterUrl = async (
        poster: string
    ): Promise<string | null> => {
        if (!poster) {
            console.log(
                "POSTER ERROR: No poster value"
            );

            return null;
        }

        console.log(
            "POSTER VALUE:",
            poster
        );

        if (
            poster.startsWith("http://") ||
            poster.startsWith("https://")
        ) {
            console.log(
                "POSTER TYPE: Direct URL"
            );

            return poster;
        }

        if (
            poster.startsWith("/uploads/")
        ) {
            const uploadUrl =
                `${API_URL}${poster}`;

            console.log(
                "POSTER TYPE: Upload URL",
                uploadUrl
            );

            return uploadUrl;
        }

        if (
            poster.startsWith("posters/")
        ) {
            const imageUrl =
                `${API_URL}/api/storage/image?key=${encodeURIComponent(
                    poster
                )}`;

            console.log(
                "POSTER TYPE: R2 PROXY"
            );

            console.log(
                "R2 PROXY URL:",
                imageUrl
            );

            return imageUrl;
        }

        console.log(
            "POSTER TYPE: Unknown"
        );

        return null;
    };

    const handleCategory = (
        category: string
    ) => {
        setSearch("");
        setSelectedCategory(
            selectedCategory === category
                ? ""
                : category
        );
    };

    const handleClearSearch = () => {
        setSearch("");
        setSelectedCategory("");
    };

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator
                    size="large"
                    color="#e50914"
                />

                <Text style={styles.loadingText}>
                    Loading Cine-X...
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.logo}>
                    CINE-X
                </Text>

                <View style={styles.headerButtons}>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={() =>
                            router.push("/my-list")
                        }
                    >
                        <Text
                            style={
                                styles.headerButtonText
                            }
                        >
                            My List
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={() =>
                            router.push("/history")
                        }
                    >
                        <Text
                            style={
                                styles.headerButtonText
                            }
                        >
                            History
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.adminButton}
                        onPress={() =>
                            router.push("/admin")
                        }
                    >
                        <Text
                            style={
                                styles.adminButtonText
                            }
                        >
                            Admin
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.profileButton}
                        onPress={() =>
                            router.push("/profile")
                        }
                    >
                        <Text
                            style={
                                styles.profileButtonText
                            }
                        >
                            Profile
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={
                            styles.notificationButton
                        }
                        onPress={() =>
                            router.push(
                                "/notifications"
                            )
                        }
                    >
                        <Text
                            style={
                                styles.notificationButtonText
                            }
                        >
                            🔔
                        </Text>

                        {unreadNotifications >
                            0 && (
                            <View
                                style={
                                    styles.notificationBadge
                                }
                            >
                                <Text
                                    style={
                                        styles.notificationBadgeText
                                    }
                                >
                                    {unreadNotifications >
                                    9
                                        ? "9+"
                                        : unreadNotifications}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={async () => {
                            await AsyncStorage.removeItem(
                                "token"
                            );

                            await AsyncStorage.removeItem(
                                "role"
                            );

                            router.replace(
                                "/login"
                            );
                        }}
                    >
                        <Text
                            style={styles.logoutText}
                        >
                            Logout
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.searchContainer}>
                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Search movies..."
                        placeholderTextColor="#777"
                        style={styles.searchInput}
                    />

                    {search.length > 0 && (
                        <TouchableOpacity
                            onPress={
                                handleClearSearch
                            }
                            style={styles.clearButton}
                        >
                            <Text
                                style={
                                    styles.clearText
                                }
                            >
                                ×
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {!search.trim() && (
                    <>
                        <Text
                            style={
                                styles.categoryTitle
                            }
                        >
                            Browse by Genre
                        </Text>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={
                                false
                            }
                            style={
                                styles.categoryList
                            }
                        >
                            {categories.map(
                                (category) => (
                                    <TouchableOpacity
                                        key={
                                            category
                                        }
                                        style={[
                                            styles.categoryButton,
                                            selectedCategory ===
                                                category &&
                                                styles.selectedCategory,
                                        ]}
                                        onPress={() =>
                                            handleCategory(
                                                category
                                            )
                                        }
                                    >
                                        <Text
                                            style={[
                                                styles.categoryText,
                                                selectedCategory ===
                                                    category &&
                                                    styles.selectedCategoryText,
                                            ]}
                                        >
                                            {category}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            )}
                        </ScrollView>
                    </>
                )}

                {continueWatching.length > 0 &&
                    !search.trim() &&
                    !selectedCategory && (
                        <>
                            <Text
                                style={
                                    styles.sectionTitle
                                }
                            >
                                Continue Watching
                            </Text>

                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={
                                    false
                                }
                                style={
                                    styles.horizontalList
                                }
                            >
                                {continueWatching.map(
                                    (item) => {
                                        if (
                                            !item.movie
                                        ) {
                                            return null;
                                        }

                                        return (
                                            <ContinueWatchingCard
                                                key={
                                                    item._id
                                                }
                                                item={
                                                    item
                                                }
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
                                    }
                                )}
                            </ScrollView>
                        </>
                    )}

                <View style={styles.moviesHeader}>
                    <Text style={styles.heading}>
                        {search.trim()
                            ? "Search Results"
                            : selectedCategory
                            ? selectedCategory
                            : "Movies"}
                    </Text>

                    {(search.trim() ||
                        selectedCategory) && (
                        <Text
                            style={
                                styles.resultCount
                            }
                        >
                            {movies.length} found
                        </Text>
                    )}
                </View>

                {searchLoading ? (
                    <View
                        style={
                            styles.searchLoading
                        }
                    >
                        <ActivityIndicator
                            size="small"
                            color="#e50914"
                        />

                        <Text
                            style={
                                styles.searchLoadingText
                            }
                        >
                            Loading...
                        </Text>
                    </View>
                ) : movies.length === 0 ? (
                    <View
                        style={styles.noResults}
                    >
                        <Text
                            style={
                                styles.noResultsIcon
                            }
                        >
                            🎬
                        </Text>

                        <Text
                            style={
                                styles.noResultsTitle
                            }
                        >
                            No Movies Found
                        </Text>

                        <Text
                            style={
                                styles.noResultsText
                            }
                        >
                            No movies are available
                            in this category.
                        </Text>
                    </View>
                ) : (
                    <View style={styles.grid}>
                        {movies.map((movie) => (
                            <MoviePoster
                                key={movie._id}
                                movie={movie}
                                getPosterUrl={
                                    getPosterUrl
                                }
                                onPress={() =>
                                    router.push(
                                        `/${movie._id}`
                                    )
                                }
                            />
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

function ContinueWatchingCard({
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

    useEffect(() => {
        if (!movie?.poster) {
            return;
        }

        const loadPoster = async () => {
            const url =
                await getPosterUrl(movie.poster);

            setPosterUrl(url);
        };

        loadPoster();
    }, [movie?.poster]);

    const progressPercentage =
        item.duration > 0
            ? Math.min(
                  (item.progress /
                      item.duration) *
                      100,
                  100
              )
            : 5;

    return (
        <TouchableOpacity
            style={styles.continueCard}
            onPress={onPress}
            activeOpacity={0.8}
        >
            {posterUrl ? (
                <Image
                    source={{
                        uri: posterUrl,
                    }}
                    style={styles.continuePoster}
                    onError={(event) =>
                        console.log(
                            "CONTINUE POSTER IMAGE ERROR:",
                            event.nativeEvent
                                .error
                        )
                    }
                />
            ) : (
                <View
                    style={
                        styles.continueNoPoster
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

            <View
                style={
                    styles.progressBarBackground
                }
            >
                <View
                    style={[
                        styles.progressBar,
                        {
                            width: `${progressPercentage}%`,
                        },
                    ]}
                />
            </View>

            <Text
                style={styles.continueTitle}
                numberOfLines={1}
            >
                {movie?.title}
            </Text>
        </TouchableOpacity>
    );
}

function MoviePoster({
    movie,
    getPosterUrl,
    onPress,
}: {
    movie: any;
    getPosterUrl: (
        poster: string
    ) => Promise<string | null>;
    onPress: () => void;
}) {
    const [posterUrl, setPosterUrl] =
        useState<string | null>(null);

    useEffect(() => {
        const loadPoster = async () => {
            const url =
                await getPosterUrl(movie.poster);

            setPosterUrl(url);
        };

        loadPoster();
    }, [movie.poster]);

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
                    onError={(event) =>
                        console.log(
                            "MOVIE POSTER IMAGE ERROR:",
                            event.nativeEvent
                                .error
                        )
                    }
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

            <Text
                style={styles.movieTitle}
                numberOfLines={1}
            >
                {movie.title}
            </Text>

            <Text style={styles.movieInfo}>
                {movie.year} • ⭐ {movie.rating}
            </Text>
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
        fontSize: 14,
    },

    header: {
        marginBottom: 18,
    },

    logo: {
        color: "#e50914",
        fontSize: 30,
        fontWeight: "900",
        letterSpacing: 2,
        marginBottom: 15,
    },

    headerButtons: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 6,
    },

    headerButton: {
        backgroundColor: "#222",
        paddingVertical: 8,
        paddingHorizontal: 9,
        borderRadius: 7,
    },

    headerButtonText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "700",
    },

    adminButton: {
        backgroundColor: "#4a3900",
        paddingVertical: 8,
        paddingHorizontal: 9,
        borderRadius: 7,
    },

    adminButtonText: {
        color: "#ffd700",
        fontSize: 12,
        fontWeight: "700",
    },

    profileButton: {
        backgroundColor: "#222",
        paddingVertical: 8,
        paddingHorizontal: 9,
        borderRadius: 7,
    },

    profileButtonText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "700",
    },

    notificationButton: {
        backgroundColor: "#222",
        width: 38,
        height: 34,
        borderRadius: 7,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },

    notificationButtonText: {
        fontSize: 17,
    },

    notificationBadge: {
        position: "absolute",
        top: -5,
        right: -5,
        minWidth: 17,
        height: 17,
        borderRadius: 9,
        backgroundColor: "#e50914",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 3,
    },

    notificationBadgeText: {
        color: "#fff",
        fontSize: 9,
        fontWeight: "bold",
    },

    logoutButton: {
        backgroundColor: "#e50914",
        paddingVertical: 8,
        paddingHorizontal: 11,
        borderRadius: 7,
    },

    logoutText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "700",
    },

    searchContainer: {
        position: "relative",
        marginBottom: 25,
    },

    searchInput: {
        height: 48,
        backgroundColor: "#181818",
        borderWidth: 1,
        borderColor: "#333",
        borderRadius: 8,
        color: "#fff",
        paddingHorizontal: 16,
        paddingRight: 45,
        fontSize: 15,
    },

    clearButton: {
        position: "absolute",
        right: 10,
        top: 9,
        width: 30,
        height: 30,
        justifyContent: "center",
        alignItems: "center",
    },

    clearText: {
        color: "#aaa",
        fontSize: 25,
        lineHeight: 28,
    },

    categoryTitle: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "800",
        marginBottom: 12,
    },

    categoryList: {
        marginBottom: 30,
    },

    categoryButton: {
        backgroundColor: "#1c1c1c",
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: "#333",
    },

    selectedCategory: {
        backgroundColor: "#e50914",
        borderColor: "#e50914",
    },

    categoryText: {
        color: "#ccc",
        fontSize: 13,
        fontWeight: "700",
    },

    selectedCategoryText: {
        color: "#fff",
    },

    sectionTitle: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "800",
        marginBottom: 15,
    },

    horizontalList: {
        marginBottom: 30,
    },

    continueCard: {
        width: 150,
        marginRight: 14,
    },

    continuePoster: {
        width: 150,
        height: 210,
        borderRadius: 8,
        backgroundColor: "#151515",
    },

    continueNoPoster: {
        width: 150,
        height: 210,
        borderRadius: 8,
        backgroundColor: "#151515",
        justifyContent: "center",
        alignItems: "center",
    },

    progressBarBackground: {
        height: 4,
        backgroundColor: "#444",
        marginTop: 4,
        borderRadius: 4,
    },

    progressBar: {
        height: 4,
        backgroundColor: "#e50914",
        borderRadius: 4,
    },

    continueTitle: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "700",
        marginTop: 8,
    },

    moviesHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
    },

    heading: {
        color: "#fff",
        fontSize: 26,
        fontWeight: "700",
    },

    resultCount: {
        color: "#777",
        fontSize: 13,
    },

    searchLoading: {
        alignItems: "center",
        paddingTop: 30,
    },

    searchLoadingText: {
        color: "#777",
        marginTop: 10,
        fontSize: 13,
    },

    noResults: {
        alignItems: "center",
        paddingTop: 60,
    },

    noResultsIcon: {
        fontSize: 40,
        marginBottom: 15,
    },

    noResultsTitle: {
        color: "#fff",
        fontSize: 21,
        fontWeight: "800",
        marginBottom: 8,
    },

    noResultsText: {
        color: "#777",
        fontSize: 14,
        textAlign: "center",
        maxWidth: 280,
        lineHeight: 20,
    },

    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingBottom: 30,
    },

    card: {
        width: "48%",
        marginBottom: 22,
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
});
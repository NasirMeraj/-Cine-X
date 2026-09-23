import { useEffect, useRef, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { VideoView, useVideoPlayer } from "expo-video";
import {
    StyleSheet,
    Text,
    View,
    Image,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    TextInput,
} from "react-native";
import {
    useLocalSearchParams,
    useRouter,
} from "expo-router";

const API_URL = "https://cine-x-1.onrender.com";

export default function MovieDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [movie, setMovie] = useState<any>(null);
    const [posterUrl, setPosterUrl] =
        useState<string | null>(null);
    const [videoUrl, setVideoUrl] =
        useState<string | null>(null);
    const [loading, setLoading] =
        useState(true);
    const [watching, setWatching] =
        useState(false);
    const [premiumRequired, setPremiumRequired] =
        useState(false);
    const [progress, setProgress] =
        useState(0);
    const [progressLoaded, setProgressLoaded] =
        useState(false);
    const [inMyList, setInMyList] =
        useState(false);
    const [myListLoading, setMyListLoading] =
        useState(false);

    const [averageRating, setAverageRating] =
        useState(0);
    const [totalRatings, setTotalRatings] =
        useState(0);
    const [ratings, setRatings] =
        useState<any[]>([]);
    const [userRating, setUserRating] =
        useState(0);
    const [review, setReview] =
        useState("");
    const [ratingLoading, setRatingLoading] =
        useState(false);
    const [ratingsLoading, setRatingsLoading] =
        useState(false);

    const savedTime = useRef(0);
    const lastSavedProgress = useRef(0);
    const latestTime = useRef(0);
    const videoDuration = useRef(0);
    const resumeApplied = useRef(false);

    const savingProgress = useRef(false);
    const savingWatchHistory = useRef(false);
    const playerSession = useRef(0);

    const player = useVideoPlayer(
        videoUrl,
        (player) => {
            player.loop = false;
        }
    );

    useEffect(() => {
        fetchMovie();
        checkMyList();
        fetchRatings();
        fetchUserRating();
    }, [id]);

    useEffect(() => {
        if (!videoUrl) {
            return;
        }

        const session =
            ++playerSession.current;

        savedTime.current = 0;
        lastSavedProgress.current = 0;
        latestTime.current = 0;
        videoDuration.current = 0;
        resumeApplied.current = false;

        setProgress(0);
        setProgressLoaded(false);

        loadProgress(session);

        return () => {
            if (
                playerSession.current ===
                session
            ) {
                playerSession.current++;
            }
        };
    }, [videoUrl]);

    useEffect(() => {
        if (
            !videoUrl ||
            !progressLoaded
        ) {
            return;
        }

        const session =
            playerSession.current;

        const interval = setInterval(() => {
            if (
                session !==
                playerSession.current
            ) {
                return;
            }

            try {
                const currentTime =
                    player.currentTime;

                const duration =
                    player.duration;

                if (duration > 0) {
                    videoDuration.current =
                        duration;
                }

                if (currentTime <= 0) {
                    return;
                }

                latestTime.current =
                    currentTime;

                setProgress(currentTime);

                if (!resumeApplied.current) {
                    return;
                }

                if (savingProgress.current) {
                    return;
                }

                if (
                    Math.abs(
                        currentTime -
                            lastSavedProgress.current
                    ) >= 5
                ) {
                    saveProgress(
                        currentTime,
                        videoDuration.current,
                        session
                    );
                }
            } catch (error) {
                console.log(
                    "PLAYER TIME ERROR:",
                    error
                );
            }
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, [
        videoUrl,
        player,
        progressLoaded,
    ]);

    useEffect(() => {
        if (
            !videoUrl ||
            !progressLoaded
        ) {
            return;
        }

        const session =
            playerSession.current;

        if (savedTime.current <= 5) {
            resumeApplied.current = true;
            return;
        }

        const interval = setInterval(() => {
            if (
                session !==
                playerSession.current
            ) {
                clearInterval(interval);
                return;
            }

            try {
                if (
                    !resumeApplied.current &&
                    player.duration > 0
                ) {
                    videoDuration.current =
                        player.duration;

                    const resumeTime =
                        savedTime.current;

                    player.currentTime =
                        resumeTime;

                    latestTime.current =
                        resumeTime;

                    setProgress(resumeTime);

                    resumeApplied.current =
                        true;

                    console.log(
                        "RESUMED FROM:",
                        resumeTime
                    );

                    clearInterval(interval);
                }
            } catch (error) {
                console.log(
                    "RESUME ERROR:",
                    error
                );
            }
        }, 500);

        return () => {
            clearInterval(interval);
        };
    }, [
        videoUrl,
        player,
        progressLoaded,
    ]);

    const fetchMovie = async () => {
        try {
            const token =
                await AsyncStorage.getItem(
                    "token"
                );

            if (!token) {
                Alert.alert(
                    "Login Required",
                    "Please login to view this movie."
                );

                router.replace("/login");

                return;
            }

            console.log(
                "FETCHING MOVIE:",
                id
            );

            const response =
                await axios.get(
                    `${API_URL}/api/movies/${id}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );

            console.log(
                "MOVIE API RESPONSE:",
                response.data
            );

            const movieData =
                response.data.movie ||
                response.data;

            console.log(
                "MOVIE DATA:",
                movieData
            );

            console.log(
                "MOVIE POSTER VALUE:",
                movieData.poster
            );

            setMovie(movieData);

            setPremiumRequired(
                response.data.premiumRequired ===
                    true
            );

            if (movieData.poster) {
                if (
                    movieData.poster.startsWith(
                        "http://"
                    ) ||
                    movieData.poster.startsWith(
                        "https://"
                    )
                ) {
                    console.log(
                        "POSTER TYPE: DIRECT URL"
                    );

                    console.log(
                        "POSTER URL:",
                        movieData.poster
                    );

                    setPosterUrl(
                        movieData.poster
                    );
                } else if (
                    movieData.poster.startsWith(
                        "/uploads/"
                    )
                ) {
                    const uploadUrl =
                        `${API_URL}${movieData.poster}`;

                    console.log(
                        "POSTER TYPE: UPLOAD"
                    );

                    console.log(
                        "POSTER URL:",
                        uploadUrl
                    );

                    setPosterUrl(
                        uploadUrl
                    );
                } else if (
                    movieData.poster.startsWith(
                        "posters/"
                    )
                ) {
                    const proxyUrl =
                        `${API_URL}/api/storage/image?key=${encodeURIComponent(
                            movieData.poster
                        )}`;

                    console.log(
                        "POSTER TYPE: R2 PROXY"
                    );

                    console.log(
                        "POSTER KEY:",
                        movieData.poster
                    );

                    console.log(
                        "POSTER PROXY URL:",
                        proxyUrl
                    );

                    setPosterUrl(
                        proxyUrl
                    );
                } else {
                    console.log(
                        "POSTER TYPE: UNKNOWN"
                    );

                    console.log(
                        "UNKNOWN POSTER VALUE:",
                        movieData.poster
                    );

                    setPosterUrl(null);
                }
            } else {
                console.log(
                    "NO POSTER IN MOVIE DATA"
                );

                setPosterUrl(null);
            }
        } catch (error: any) {
            console.log(
                "MOVIE DETAILS ERROR:",
                error.response?.data ||
                    error.message
            );

            if (
                error.response?.status ===
                401
            ) {
                Alert.alert(
                    "Login Required",
                    "Please login again."
                );

                router.replace("/login");
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchRatings = async () => {
        try {
            setRatingsLoading(true);

            const response =
                await axios.get(
                    `${API_URL}/api/ratings/${id}`
                );

            setAverageRating(
                response.data.average || 0
            );

            setTotalRatings(
                response.data.total || 0
            );

            setRatings(
                response.data.ratings || []
            );
        } catch (error) {
            console.log(
                "GET RATINGS ERROR:",
                error
            );
        } finally {
            setRatingsLoading(false);
        }
    };

    const fetchUserRating = async () => {
        try {
            const token =
                await AsyncStorage.getItem(
                    "token"
                );

            if (!token || !id) {
                return;
            }

            const response =
                await axios.get(
                    `${API_URL}/api/ratings/user/${id}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );

            const rating =
                response.data.rating;

            if (rating) {
                setUserRating(
                    rating.rating
                );

                setReview(
                    rating.review || ""
                );
            }
        } catch (error: any) {
            console.log(
                "GET USER RATING ERROR:",
                error.response?.data ||
                    error.message
            );
        }
    };

    const submitRating = async () => {
        try {
            if (userRating < 1) {
                Alert.alert(
                    "Rating Required",
                    "Please select a star rating."
                );

                return;
            }

            const token =
                await AsyncStorage.getItem(
                    "token"
                );

            if (!token) {
                Alert.alert(
                    "Login Required",
                    "Please login to rate this movie."
                );

                router.push("/login");

                return;
            }

            setRatingLoading(true);

            await axios.post(
                `${API_URL}/api/ratings/${id}`,
                {
                    rating: userRating,
                    review: review,
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            Alert.alert(
                "Rating Saved",
                "Your rating has been saved."
            );

            fetchRatings();
            fetchUserRating();
        } catch (error: any) {
            console.log(
                "SUBMIT RATING ERROR:",
                error.response?.data ||
                    error.message
            );

            Alert.alert(
                "Error",
                error.response?.data
                    ?.message ||
                    "Unable to save rating."
            );
        } finally {
            setRatingLoading(false);
        }
    };

    const checkMyList = async () => {
        try {
            const token =
                await AsyncStorage.getItem(
                    "token"
                );

            if (!token || !id) {
                setInMyList(false);
                return;
            }

            const response =
                await axios.get(
                    `${API_URL}/api/my-list/check/${id}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );

            setInMyList(
                response.data.added === true
            );
        } catch (error: any) {
            console.log(
                "CHECK MY LIST ERROR:",
                error.response?.data ||
                    error.message
            );
        }
    };

    const toggleMyList = async () => {
        try {
            setMyListLoading(true);

            const token =
                await AsyncStorage.getItem(
                    "token"
                );

            if (!token) {
                Alert.alert(
                    "Login Required",
                    "Please login to use My List."
                );

                router.push("/login");

                return;
            }

            const response =
                await axios.post(
                    `${API_URL}/api/my-list/${id}`,
                    {},
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );

            const added =
                response.data.added === true;

            setInMyList(added);

            Alert.alert(
                added
                    ? "Added to My List"
                    : "Removed from My List",
                added
                    ? `${movie.title} was added to your list.`
                    : `${movie.title} was removed from your list.`
            );
        } catch (error: any) {
            console.log(
                "MY LIST ERROR:",
                error.response?.data ||
                    error.message
            );

            if (
                error.response?.status ===
                401
            ) {
                Alert.alert(
                    "Login Required",
                    "Please login again."
                );

                router.push("/login");
            } else {
                Alert.alert(
                    "Error",
                    error.response?.data
                        ?.message ||
                        "Unable to update My List."
                );
            }
        } finally {
            setMyListLoading(false);
        }
    };

    const handleWatchNow = async () => {
        try {
            if (premiumRequired) {
                Alert.alert(
                    "Premium Required",
                    "This movie is available only for Premium members.",
                    [
                        {
                            text: "Cancel",
                            style: "cancel",
                        },
                        {
                            text: "Go Premium",
                            onPress: () =>
                                router.push(
                                    "/subscription"
                                ),
                        },
                    ]
                );

                return;
            }

            setWatching(true);

            const token =
                await AsyncStorage.getItem(
                    "token"
                );

            if (!token) {
                Alert.alert(
                    "Login Required",
                    "Please login to watch this movie."
                );

                router.push("/login");

                return;
            }

            const response =
                await axios.get(
                    `${API_URL}/api/videos/${id}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );

            if (
                response.data.success &&
                response.data.url
            ) {
                setVideoUrl(
                    response.data.url
                );
            }
        } catch (error: any) {
            console.log(
                "WATCH ERROR:",
                error.response?.data ||
                    error.message
            );

            if (
                error.response?.status ===
                401
            ) {
                Alert.alert(
                    "Login Required",
                    "Please login again."
                );
            } else if (
                error.response?.status ===
                403
            ) {
                Alert.alert(
                    "Premium Required",
                    "This movie requires a premium subscription.",
                    [
                        {
                            text: "Cancel",
                            style: "cancel",
                        },
                        {
                            text: "Go Premium",
                            onPress: () =>
                                router.push(
                                    "/subscription"
                                ),
                        },
                    ]
                );
            } else {
                Alert.alert(
                    "Error",
                    error.response?.data
                        ?.message ||
                        "Unable to play this movie."
                );
            }
        } finally {
            setWatching(false);
        }
    };

    const loadProgress = async (
        session: number
    ) => {
        try {
            const token =
                await AsyncStorage.getItem(
                    "token"
                );

            if (
                session !==
                playerSession.current
            ) {
                return;
            }

            if (!token) {
                resumeApplied.current =
                    true;

                setProgressLoaded(true);

                return;
            }

            const response =
                await axios.get(
                    `${API_URL}/api/progress/${id}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );

            if (
                session !==
                playerSession.current
            ) {
                return;
            }

            const savedProgress =
                response.data.progress;

            if (
                savedProgress &&
                typeof savedProgress.progress ===
                    "number"
            ) {
                const time =
                    savedProgress.progress;

                setProgress(time);

                savedTime.current =
                    time;

                lastSavedProgress.current =
                    time;

                latestTime.current =
                    time;

                console.log(
                    "LOADED POSITION:",
                    time
                );
            } else {
                savedTime.current = 0;
                lastSavedProgress.current = 0;
                latestTime.current = 0;
            }

            setProgressLoaded(true);
        } catch (error) {
            if (
                session !==
                playerSession.current
            ) {
                return;
            }

            console.log(
                "LOAD PROGRESS ERROR:",
                error
            );

            setProgressLoaded(true);

            resumeApplied.current = true;
        }
    };

    const saveWatchHistory = async (
        currentTime: number,
        duration: number,
        session: number
    ) => {
        if (
            session !==
            playerSession.current
        ) {
            return;
        }

        if (
            savingWatchHistory.current
        ) {
            return;
        }

        if (!id || currentTime <= 0) {
            return;
        }

        savingWatchHistory.current =
            true;

        try {
            const token =
                await AsyncStorage.getItem(
                    "token"
                );

            if (!token) {
                return;
            }

            if (
                session !==
                playerSession.current
            ) {
                return;
            }

            await axios.post(
                `${API_URL}/api/watch-history/${id}`,
                {
                    progress: currentTime,
                    duration: duration || 0,
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            if (
                session !==
                playerSession.current
            ) {
                return;
            }

            console.log(
                "WATCH HISTORY SAVED:",
                currentTime
            );
        } catch (error: any) {
            console.log(
                "WATCH HISTORY SAVE ERROR:",
                error.response?.data ||
                    error.message
            );
        } finally {
            savingWatchHistory.current =
                false;
        }
    };

    const saveProgress = async (
        currentTime: number,
        duration: number,
        session: number
    ) => {
        if (
            session !==
            playerSession.current
        ) {
            return;
        }

        if (savingProgress.current) {
            return;
        }

        if (!id || currentTime <= 0) {
            return;
        }

        savingProgress.current = true;

        try {
            const token =
                await AsyncStorage.getItem(
                    "token"
                );

            if (!token) {
                return;
            }

            if (
                session !==
                playerSession.current
            ) {
                return;
            }

            await axios.post(
                `${API_URL}/api/progress/${id}`,
                {
                    progress: currentTime,
                    duration: duration || 0,
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            if (
                session !==
                playerSession.current
            ) {
                return;
            }

            lastSavedProgress.current =
                currentTime;

            console.log(
                "PROGRESS SAVED:",
                currentTime
            );

            saveWatchHistory(
                currentTime,
                duration,
                session
            );
        } catch (error: any) {
            console.log(
                "SAVE PROGRESS ERROR:",
                error.response?.data ||
                    error.message
            );
        } finally {
            savingProgress.current =
                false;
        }
    };

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator
                    size="large"
                    color="#e50914"
                />

                <Text
                    style={
                        styles.loadingText
                    }
                >
                    Loading movie...
                </Text>
            </View>
        );
    }

    if (!movie) {
        return (
            <View style={styles.loading}>
                <Text
                    style={
                        styles.errorText
                    }
                >
                    Movie not found
                </Text>

                <TouchableOpacity
                    style={
                        styles.backButton
                    }
                    onPress={() =>
                        router.replace("/")
                    }
                >
                    <Text
                        style={
                            styles.buttonText
                        }
                    >
                        Go Back
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={
                    false
                }
            >
                <TouchableOpacity
                    style={styles.back}
                    onPress={() =>
                        router.replace("/")
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

                {videoUrl ? (
                    <View
                        style={
                            styles.videoContainer
                        }
                    >
                        <VideoView
                            player={player}
                            style={styles.video}
                            nativeControls
                            contentFit="contain"
                        />
                    </View>
                ) : posterUrl ? (
                    <View>
                        <Image
                            source={{
                                uri: posterUrl,
                            }}
                            style={styles.poster}
                            onLoad={() =>
                                console.log(
                                    "POSTER IMAGE LOADED"
                                )
                            }
                            onError={(error) =>
                                console.log(
                                    "POSTER IMAGE ERROR:",
                                    error.nativeEvent
                                )
                            }
                        />

                        {movie.premium && (
                            <View
                                style={
                                    styles.premiumBadge
                                }
                            >
                                <Text
                                    style={
                                        styles.premiumBadgeText
                                    }
                                >
                                    ⭐ PREMIUM
                                </Text>
                            </View>
                        )}
                    </View>
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

                <View
                    style={styles.content}
                >
                    <View
                        style={
                            styles.titleRow
                        }
                    >
                        <Text
                            style={styles.title}
                        >
                            {movie.title}
                        </Text>

                        {movie.premium && (
                            <View
                                style={
                                    styles.smallPremiumBadge
                                }
                            >
                                <Text
                                    style={
                                        styles.smallPremiumText
                                    }
                                >
                                    PREMIUM
                                </Text>
                            </View>
                        )}
                    </View>

                    <View
                        style={styles.meta}
                    >
                        <Text
                            style={
                                styles.metaText
                            }
                        >
                            {movie.year}
                        </Text>

                        <Text
                            style={styles.dot}
                        >
                            •
                        </Text>

                        <Text
                            style={
                                styles.metaText
                            }
                        >
                            {movie.genre}
                        </Text>

                        <Text
                            style={styles.dot}
                        >
                            •
                        </Text>

                        <Text
                            style={
                                styles.rating
                            }
                        >
                            ⭐ {movie.rating}
                        </Text>
                    </View>

                    <Text
                        style={
                            styles.language
                        }
                    >
                        {movie.language}
                    </Text>

                    <Text
                        style={
                            styles.description
                        }
                    >
                        {movie.description}
                    </Text>

                    <TouchableOpacity
                        style={
                            styles.myListButton
                        }
                        onPress={
                            toggleMyList
                        }
                        disabled={
                            myListLoading
                        }
                    >
                        {myListLoading ? (
                            <ActivityIndicator
                                color="#fff"
                            />
                        ) : (
                            <Text
                                style={
                                    styles.myListText
                                }
                            >
                                {inMyList
                                    ? "✓ My List"
                                    : "+ My List"}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {premiumRequired ? (
                        <View
                            style={
                                styles.premiumBox
                            }
                        >
                            <Text
                                style={
                                    styles.lockIcon
                                }
                            >
                                🔒
                            </Text>

                            <Text
                                style={
                                    styles.premiumTitle
                                }
                            >
                                Premium Content
                            </Text>

                            <Text
                                style={
                                    styles.premiumDescription
                                }
                            >
                                This movie is available
                                only for Cine-X Premium
                                members.
                            </Text>

                            <TouchableOpacity
                                style={
                                    styles.premiumButton
                                }
                                onPress={() =>
                                    router.push(
                                        "/subscription"
                                    )
                                }
                            >
                                <Text
                                    style={
                                        styles.premiumButtonText
                                    }
                                >
                                    ⭐ Go Premium
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        !videoUrl && (
                            <TouchableOpacity
                                style={
                                    styles.watchButton
                                }
                                onPress={
                                    handleWatchNow
                                }
                                disabled={
                                    watching
                                }
                            >
                                {watching ? (
                                    <ActivityIndicator
                                        color="#fff"
                                    />
                                ) : (
                                    <Text
                                        style={
                                            styles.watchText
                                        }
                                    >
                                        ▶ Watch Now
                                    </Text>
                                )}
                            </TouchableOpacity>
                        )
                    )}

                    {videoUrl &&
                        progress > 5 && (
                            <Text
                                style={
                                    styles.progressText
                                }
                            >
                                Continuing from{" "}
                                {Math.floor(
                                    progress
                                )}{" "}
                                seconds
                            </Text>
                        )}

                    {movie.duration && (
                        <Text
                            style={
                                styles.duration
                            }
                        >
                            Duration:{" "}
                            {movie.duration}
                        </Text>
                    )}

                    <View
                        style={
                            styles.ratingSection
                        }
                    >
                        <Text
                            style={
                                styles.sectionTitle
                            }
                        >
                            Ratings & Reviews
                        </Text>

                        <View
                            style={
                                styles.averageBox
                            }
                        >
                            <Text
                                style={
                                    styles.averageNumber
                                }
                            >
                                ⭐{" "}
                                {averageRating > 0
                                    ? averageRating.toFixed(
                                          1
                                      )
                                    : "0.0"}
                            </Text>

                            <Text
                                style={
                                    styles.totalRatings
                                }
                            >
                                {totalRatings}{" "}
                                {totalRatings ===
                                1
                                    ? "rating"
                                    : "ratings"}
                            </Text>
                        </View>

                        <Text
                            style={
                                styles.yourRatingTitle
                            }
                        >
                            Your Rating
                        </Text>

                        <View
                            style={
                                styles.stars
                            }
                        >
                            {[1, 2, 3, 4, 5].map(
                                (star) => (
                                    <TouchableOpacity
                                        key={
                                            star
                                        }
                                        onPress={() =>
                                            setUserRating(
                                                star
                                            )
                                        }
                                    >
                                        <Text
                                            style={[
                                                styles.star,
                                                star <=
                                                    userRating &&
                                                    styles.selectedStar,
                                            ]}
                                        >
                                            ★
                                        </Text>
                                    </TouchableOpacity>
                                )
                            )}
                        </View>

                        <TextInput
                            value={review}
                            onChangeText={
                                setReview
                            }
                            placeholder="Write a review..."
                            placeholderTextColor="#777"
                            multiline
                            style={
                                styles.reviewInput
                            }
                        />

                        <TouchableOpacity
                            style={
                                styles.submitRatingButton
                            }
                            onPress={
                                submitRating
                            }
                            disabled={
                                ratingLoading
                            }
                        >
                            {ratingLoading ? (
                                <ActivityIndicator
                                    color="#fff"
                                />
                            ) : (
                                <Text
                                    style={
                                        styles.submitRatingText
                                    }
                                >
                                    Submit Rating
                                </Text>
                            )}
                        </TouchableOpacity>

                        <Text
                            style={
                                styles.reviewsTitle
                            }
                        >
                            Reviews
                        </Text>

                        {ratingsLoading ? (
                            <ActivityIndicator
                                size="small"
                                color="#e50914"
                            />
                        ) : ratings.length ===
                          0 ? (
                            <Text
                                style={
                                    styles.noReviews
                                }
                            >
                                No reviews yet.
                                Be the first to
                                review this movie.
                            </Text>
                        ) : (
                            ratings.map(
                                (item) => (
                                    <View
                                        key={
                                            item._id
                                        }
                                        style={
                                            styles.reviewCard
                                        }
                                    >
                                        <View
                                            style={
                                                styles.reviewHeader
                                            }
                                        >
                                            <Text
                                                style={
                                                    styles.reviewUser
                                                }
                                            >
                                                {item
                                                    .user
                                                    ?.name ||
                                                    "User"}
                                            </Text>

                                            <Text
                                                style={
                                                    styles.reviewRating
                                                }
                                            >
                                                ⭐{" "}
                                                {
                                                    item.rating
                                                }
                                            </Text>
                                        </View>

                                        {item.review ? (
                                            <Text
                                                style={
                                                    styles.reviewText
                                                }
                                            >
                                                {
                                                    item.review
                                                }
                                            </Text>
                                        ) : null}
                                    </View>
                                )
                            )
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
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

    errorText: {
        color: "#fff",
        fontSize: 20,
        marginBottom: 20,
    },

    back: {
        position: "absolute",
        top: 55,
        left: 18,
        zIndex: 10,
        backgroundColor:
            "rgba(0,0,0,0.7)",
        paddingVertical: 9,
        paddingHorizontal: 14,
        borderRadius: 7,
    },

    backText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
    },

    poster: {
        width: "100%",
        height: 500,
        resizeMode: "cover",
    },

    noPoster: {
        width: "100%",
        height: 500,
        backgroundColor: "#151515",
        justifyContent: "center",
        alignItems: "center",
    },

    noPosterText: {
        color: "#777",
    },

    videoContainer: {
        width: "100%",
        height: 260,
        backgroundColor: "#000",
    },

    video: {
        width: "100%",
        height: "100%",
    },

    premiumBadge: {
        position: "absolute",
        top: 80,
        right: 15,
        backgroundColor: "#e50914",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
    },

    premiumBadgeText: {
        color: "#fff",
        fontWeight: "800",
        fontSize: 12,
    },

    content: {
        padding: 20,
    },

    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        marginBottom: 12,
    },

    title: {
        color: "#fff",
        fontSize: 30,
        fontWeight: "800",
        marginRight: 10,
    },

    smallPremiumBadge: {
        backgroundColor: "#e50914",
        paddingVertical: 5,
        paddingHorizontal: 8,
        borderRadius: 5,
    },

    smallPremiumText: {
        color: "#fff",
        fontSize: 9,
        fontWeight: "800",
    },

    meta: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 10,
    },

    metaText: {
        color: "#aaa",
        fontSize: 14,
    },

    dot: {
        color: "#666",
    },

    rating: {
        color: "#f5c518",
        fontSize: 14,
        fontWeight: "600",
    },

    language: {
        color: "#e50914",
        fontSize: 14,
        fontWeight: "700",
        marginBottom: 18,
    },

    description: {
        color: "#bbb",
        fontSize: 15,
        lineHeight: 23,
        marginBottom: 25,
    },

    myListButton: {
        backgroundColor: "#222",
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#444",
    },

    myListText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },

    watchButton: {
        backgroundColor: "#e50914",
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: "center",
    },

    watchText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },

    premiumBox: {
        backgroundColor: "#151515",
        borderWidth: 1,
        borderColor: "#333",
        borderRadius: 12,
        padding: 22,
        alignItems: "center",
        marginTop: 5,
    },

    lockIcon: {
        fontSize: 38,
        marginBottom: 10,
    },

    premiumTitle: {
        color: "#fff",
        fontSize: 21,
        fontWeight: "800",
        marginBottom: 8,
    },

    premiumDescription: {
        color: "#999",
        fontSize: 14,
        textAlign: "center",
        lineHeight: 21,
        marginBottom: 18,
    },

    premiumButton: {
        width: "100%",
        backgroundColor: "#e50914",
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
    },

    premiumButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "800",
    },

    progressText: {
        color: "#e50914",
        fontSize: 14,
        marginTop: 18,
        fontWeight: "600",
    },

    duration: {
        color: "#777",
        fontSize: 13,
        marginTop: 18,
    },

    backButton: {
        backgroundColor: "#e50914",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 7,
    },

    buttonText: {
        color: "#fff",
        fontWeight: "700",
    },

    ratingSection: {
        marginTop: 35,
        paddingTop: 25,
        borderTopWidth: 1,
        borderTopColor: "#222",
    },

    sectionTitle: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "800",
        marginBottom: 20,
    },

    averageBox: {
        backgroundColor: "#151515",
        borderRadius: 10,
        padding: 18,
        alignItems: "center",
        marginBottom: 25,
    },

    averageNumber: {
        color: "#f5c518",
        fontSize: 30,
        fontWeight: "800",
    },

    totalRatings: {
        color: "#888",
        fontSize: 13,
        marginTop: 5,
    },

    yourRatingTitle: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "700",
        marginBottom: 10,
    },

    stars: {
        flexDirection: "row",
        marginBottom: 18,
    },

    star: {
        color: "#444",
        fontSize: 38,
        marginRight: 6,
    },

    selectedStar: {
        color: "#f5c518",
    },

    reviewInput: {
        backgroundColor: "#151515",
        borderWidth: 1,
        borderColor: "#333",
        borderRadius: 8,
        minHeight: 100,
        padding: 14,
        color: "#fff",
        fontSize: 14,
        textAlignVertical: "top",
        marginBottom: 12,
    },

    submitRatingButton: {
        backgroundColor: "#e50914",
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 30,
    },

    submitRatingText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
    },

    reviewsTitle: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "800",
        marginBottom: 15,
    },

    noReviews: {
        color: "#777",
        fontSize: 14,
        lineHeight: 21,
        marginBottom: 20,
    },

    reviewCard: {
        backgroundColor: "#151515",
        borderRadius: 9,
        padding: 15,
        marginBottom: 12,
    },

    reviewHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },

    reviewUser: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
    },

    reviewRating: {
        color: "#f5c518",
        fontSize: 13,
        fontWeight: "700",
    },

    reviewText: {
        color: "#aaa",
        fontSize: 14,
        lineHeight: 21,
    },
});
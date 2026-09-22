import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { getR2Url } from "../utils/r2Url";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5001/api";

const BACKEND_URL = API_URL.replace(/\/api$/, "");

function WatchMovie() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [videoUrl, setVideoUrl] = useState("");
    const [posterUrl, setPosterUrl] = useState("");
    const [videoError, setVideoError] = useState("");
    const [userRating, setUserRating] = useState(0);
    const [ratingMessage, setRatingMessage] = useState("");

    const videoRef = useRef(null);

    useEffect(() => {
        fetchMovie();
    }, [id]);

    useEffect(() => {
        if (movie?.video) {
            loadVideo();
        }

        if (movie?.poster) {
            loadPoster();
        }
    }, [movie]);

    const loadVideo = async () => {
        try {
            const token = localStorage.getItem("token");

            if (movie.video.startsWith("http")) {
                setVideoUrl(movie.video);
                return;
            }

            if (movie.video.startsWith("/videos/")) {
                setVideoUrl(
                    `${BACKEND_URL}${movie.video}`
                );
                return;
            }

            const response = await axios.get(
                `${API_URL}/videos/${movie._id}`,
                {
                    params: {
                        token
                    }
                }
            );

            setVideoUrl(response.data.url);

        } catch (error) {
            console.error(
                "LOAD VIDEO ERROR:",
                error.response?.data ||
                error.message
            );

            if (error.response?.status === 403) {
                setVideoError("Premium subscription required");
            } else {
                setVideoError("Unable to load video");
            }
        }
    };

    const loadPoster = async () => {
        try {
            if (movie.poster.startsWith("http")) {
                setPosterUrl(movie.poster);
                return;
            }

            if (movie.poster.startsWith("/uploads/")) {
                setPosterUrl(
                    `${BACKEND_URL}${movie.poster}`
                );
                return;
            }

            const url = await getR2Url(movie.poster);

            if (url) {
                setPosterUrl(url);
            }

        } catch (error) {
            console.error(
                "LOAD POSTER ERROR:",
                error.message
            );
        }
    };

    const submitRating = async (rating) => {
        try {
            const token = localStorage.getItem("token");

            await axios.post(
                `${API_URL}/ratings/${movie._id}`,
                {
                    rating
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setUserRating(rating);
            setRatingMessage("Rating saved!");

        } catch (error) {
            console.error(
                "RATING ERROR:",
                error.response?.data ||
                error.message
            );

            setRatingMessage("Failed to save rating");
        }
    };

    const loadProgress = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await axios.get(
                `${API_URL}/progress/${movie._id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const savedProgress =
                response.data.watchProgress;

            if (
                savedProgress &&
                videoRef.current &&
                savedProgress.progress > 0
            ) {
                videoRef.current.currentTime =
                    savedProgress.progress;
            }

        } catch (error) {
            console.error(
                "LOAD PROGRESS ERROR:",
                error.response?.data ||
                error.message
            );
        }
    };

    const saveProgress = async () => {
        if (!videoRef.current || !movie) {
            return;
        }

        try {
            const token = localStorage.getItem("token");

            await axios.post(
                `${API_URL}/progress/${movie._id}`,
                {
                    progress:
                        videoRef.current.currentTime,
                    duration:
                        videoRef.current.duration
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

        } catch (error) {
            console.error(
                "SAVE PROGRESS ERROR:",
                error.response?.data ||
                error.message
            );
        }
    };

    const addToWatchlist = async () => {
        try {
            const token = localStorage.getItem("token");

            await axios.post(
                `${API_URL}/watchlist/${movie._id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Movie added to watchlist");

        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Failed to add movie to watchlist"
            );
        }
    };

    const fetchMovie = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await axios.get(
                `${API_URL}/movies/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMovie(response.data.movie);

        } catch (error) {
            console.error(
                "FETCH MOVIE ERROR:",
                error.response?.data ||
                error.message
            );

        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={styles.center}>
                <h2>Loading...</h2>
            </div>
        );
    }

    if (!movie) {
        return (
            <div style={styles.center}>
                <h2>Movie not found</h2>

                <button
                    style={styles.backButton}
                    onClick={() => navigate(-1)}
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div style={styles.page}>

            <button
                style={styles.backButton}
                onClick={() => navigate(-1)}
            >
                ← Back
            </button>

            <h1 style={styles.title}>
                {movie.title}
            </h1>

            <button
                style={styles.watchlistButton}
                onClick={addToWatchlist}
            >
                + Add to Watchlist
            </button>

            <div style={styles.videoContainer}>

                {movie.video && videoUrl ? (
                    <video
                        ref={videoRef}
                        controls
                        autoPlay
                        style={styles.video}
                        src={videoUrl}
                        onLoadedMetadata={loadProgress}
                        onPause={saveProgress}
                        onEnded={saveProgress}
                    >
                        Your browser does not support video playback.
                    </video>
                ) : videoError ? (
                    <div style={styles.noVideo}>
                        <div>
                            <h2>🔒 {videoError}</h2>
                            <p>Subscribe to watch this movie.</p>
                        </div>
                    </div>
                ) : movie.video ? (
                    <div style={styles.noVideo}>
                        Loading video...
                    </div>
                ) : (
                    <div style={styles.noVideo}>
                        Video not available
                    </div>
                )}

            </div>

            <div style={styles.info}>

                <div style={styles.posterContainer}>

                    {posterUrl && (
                        <img
                            src={posterUrl}
                            alt={movie.title}
                            style={styles.poster}
                        />
                    )}

                </div>

                <div style={styles.details}>

                    <h2>{movie.title}</h2>

                    <div style={styles.meta}>

                        <span>
                            ⭐ {movie.rating || "N/A"}
                        </span>

                        <span>
                            {movie.year}
                        </span>

                        <span>
                            {movie.genre}
                        </span>

                        <span>
                            {movie.language}
                        </span>

                        {movie.duration && (
                            <span>
                                {movie.duration}
                            </span>
                        )}

                        {movie.premium && (
                            <span style={styles.premium}>
                                PREMIUM
                            </span>
                        )}

                    </div>

                    <p style={styles.description}>
                        {movie.description}
                    </p>

                    <div style={styles.ratingBox}>

                        <h3>Rate this movie</h3>

                        <div>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() =>
                                        submitRating(star)
                                    }
                                    style={{
                                        ...styles.ratingButton,
                                        opacity:
                                            star <= userRating
                                                ? 1
                                                : 0.4
                                    }}
                                >
                                    ⭐
                                </button>
                            ))}
                        </div>

                        {ratingMessage && (
                            <p style={styles.ratingMessage}>
                                {ratingMessage}
                            </p>
                        )}

                    </div>

                </div>

            </div>

        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        padding: "30px"
    },

    center: {
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
    },

    backButton: {
        background: "#fff",
        color: "#000",
        border: "none",
        padding: "10px 18px",
        borderRadius: "5px",
        cursor: "pointer",
        fontWeight: "bold",
        marginBottom: "20px"
    },

    title: {
        fontSize: "32px",
        marginBottom: "20px"
    },

    videoContainer: {
        width: "100%",
        maxWidth: "1100px",
        margin: "0 auto",
        background: "#111"
    },

    video: {
        width: "100%",
        display: "block",
        maxHeight: "650px",
        background: "#000"
    },

    noVideo: {
        height: "500px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#aaa"
    },

    watchlistButton: {
        background: "#fff",
        color: "#000",
        border: "none",
        padding: "12px 20px",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "bold",
        marginBottom: "20px"
    },

    info: {
        maxWidth: "1100px",
        margin: "35px auto",
        display: "flex",
        gap: "30px"
    },

    posterContainer: {
        width: "220px",
        flexShrink: 0
    },

    poster: {
        width: "100%",
        borderRadius: "8px",
        display: "block"
    },

    details: {
        flex: 1
    },

    meta: {
        display: "flex",
        flexWrap: "wrap",
        gap: "15px",
        color: "#aaa",
        margin: "15px 0"
    },

    premium: {
        color: "#fff",
        background: "#e50914",
        padding: "5px 10px",
        borderRadius: "5px",
        fontWeight: "bold"
    },

    description: {
        color: "#ccc",
        lineHeight: "1.7"
    },

    ratingBox: {
        marginTop: "30px"
    },

    ratingButton: {
        background: "transparent",
        border: "none",
        fontSize: "28px",
        cursor: "pointer",
        padding: "4px"
    },

    ratingMessage: {
        color: "#aaa",
        marginTop: "10px"
    }
};

export default WatchMovie;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5001/api";

function Watchlist() {
    const navigate = useNavigate();

    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWatchlist();
    }, []);

    const fetchWatchlist = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await axios.get(
                `${API_URL}/watchlist`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setWatchlist(response.data.watchlist);
        } catch (error) {
            console.error(
                "WATCHLIST ERROR:",
                error.response?.data || error.message
            );
        } finally {
            setLoading(false);
        }
    };

    const removeFromWatchlist = async (movieId) => {
        try {
            const token = localStorage.getItem("token");

            await axios.delete(
                `${API_URL}/watchlist/${movieId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setWatchlist(
                watchlist.filter(
                    item => item.movie?._id !== movieId
                )
            );
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Failed to remove movie"
            );
        }
    };

    if (loading) {
        return (
            <div style={styles.center}>
                <h2>Loading Watchlist...</h2>
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

            <h1 style={styles.heading}>My Watchlist</h1>

            {watchlist.length === 0 ? (
                <div style={styles.empty}>
                    <h2>Your watchlist is empty</h2>
                    <p>Add movies to your watchlist to see them here.</p>
                </div>
            ) : (
                <div style={styles.grid}>

                    {watchlist.map(item => {
                        const movie = item.movie;

                        if (!movie) return null;

                        return (
                            <div
                                key={item._id}
                                style={styles.card}
                            >

                                {movie.poster && (
                                    <img
                                        src={`http://localhost:5001${movie.poster}`}
                                        alt={movie.title}
                                        style={styles.poster}
                                    />
                                )}

                                <div style={styles.cardBody}>

                                    <h2>{movie.title}</h2>

                                    <p style={styles.meta}>
                                        {movie.genre} • {movie.year}
                                    </p>

                                    <div style={styles.buttons}>

                                        <button
                                            style={styles.watchButton}
                                            onClick={() =>
                                                navigate(
                                                    `/watch/${movie._id}`
                                                )
                                            }
                                        >
                                            Watch
                                        </button>

                                        <button
                                            style={styles.removeButton}
                                            onClick={() =>
                                                removeFromWatchlist(
                                                    movie._id
                                                )
                                            }
                                        >
                                            Remove
                                        </button>

                                    </div>

                                </div>

                            </div>
                        );
                    })}

                </div>
            )}

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
        justifyContent: "center",
        alignItems: "center"
    },

    backButton: {
        background: "#fff",
        color: "#000",
        border: "none",
        padding: "10px 18px",
        borderRadius: "5px",
        cursor: "pointer",
        fontWeight: "bold"
    },

    heading: {
        fontSize: "32px",
        margin: "30px 0"
    },

    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: "25px"
    },

    card: {
        background: "#111",
        borderRadius: "10px",
        overflow: "hidden"
    },

    poster: {
        width: "100%",
        height: "300px",
        objectFit: "cover",
        display: "block"
    },

    cardBody: {
        padding: "15px"
    },

    meta: {
        color: "#aaa"
    },

    buttons: {
        display: "flex",
        gap: "10px",
        marginTop: "15px"
    },

    watchButton: {
        flex: 1,
        background: "#fff",
        color: "#000",
        border: "none",
        padding: "10px",
        borderRadius: "5px",
        cursor: "pointer",
        fontWeight: "bold"
    },

    removeButton: {
        flex: 1,
        background: "#222",
        color: "#fff",
        border: "1px solid #444",
        padding: "10px",
        borderRadius: "5px",
        cursor: "pointer"
    },

    empty: {
        textAlign: "center",
        marginTop: "100px",
        color: "#aaa"
    }
};

export default Watchlist;
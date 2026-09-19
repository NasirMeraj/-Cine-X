import { useEffect, useState } from "react";
import { getR2Url } from "../utils/r2Url";
import axios from "axios";
import { Trash2, Edit, Play, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function AdminDashboard() {
    const navigate = useNavigate();

    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [posterUrls, setPosterUrls] = useState({});

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        genre: "",
        language: "",
        year: "",
        rating: "",
        duration: "",
        type: "movie",
        premium: false
    });

    const [poster, setPoster] = useState(null);
    const [video, setVideo] = useState(null);

    const API_URL = "http://localhost:5001/api";

    useEffect(() => {
        fetchMovies();
    }, []);

    const fetchMovies = async () => {
        try {
            const response = await axios.get(
                `${API_URL}/movies`
            );

            const movieList = response.data.movies;

            setMovies(movieList);

            const urls = {};

            for (const movie of movieList) {
                if (!movie.poster) {
                    continue;
                }

                if (movie.poster.startsWith("http")) {
                    urls[movie._id] = movie.poster;
                } else if (
                    movie.poster.startsWith("/uploads/")
                ) {
                    urls[movie._id] =
                        `${API_URL.replace("/api", "")}${movie.poster}`;
                } else {
                    const url = await getR2Url(movie.poster);

                    if (url) {
                        urls[movie._id] = url;
                    }
                }
            }

            setPosterUrls(urls);
        } catch (error) {
            console.error(
                "FETCH MOVIES ERROR:",
                error.response?.data || error.message
            );
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value
        });
    };

    const addMovie = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");

            const data = new FormData();

            data.append("title", formData.title);
            data.append("description", formData.description);
            data.append("genre", formData.genre);
            data.append("language", formData.language);
            data.append("year", formData.year);
            data.append("rating", formData.rating);
            data.append("duration", formData.duration);
            data.append("type", formData.type);
            data.append("premium", formData.premium);

            if (poster) {
                data.append("poster", poster);
            }

            if (video) {
                data.append("video", video);
            }

            await axios.post(
                `${API_URL}/movies`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Movie added successfully");

            setFormData({
                title: "",
                description: "",
                genre: "",
                language: "",
                year: "",
                rating: "",
                duration: "",
                type: "movie",
                premium: false
            });

            setPoster(null);
            setVideo(null);

            document.getElementById("posterInput").value = "";
            document.getElementById("videoInput").value = "";

            fetchMovies();
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Failed to add movie"
            );
        }
    };

    const deleteMovie = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this movie?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            const token = localStorage.getItem("token");

            await axios.delete(
                `${API_URL}/movies/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Movie deleted successfully");

            fetchMovies();
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Failed to delete movie"
            );
        }
    };

    const editMovie = async (movie) => {
        const newTitle = window.prompt(
            "Enter new movie title:",
            movie.title
        );

        if (!newTitle || newTitle === movie.title) {
            return;
        }

        try {
            const token = localStorage.getItem("token");

            await axios.patch(
                `${API_URL}/movies/${movie._id}`,
                {
                    title: newTitle
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Movie updated successfully");

            fetchMovies();
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Failed to update movie"
            );
        }
    };

    if (loading) {
        return (
            <div>
                <Navbar />

                <div style={styles.page}>
                    <h2>Loading Admin Dashboard...</h2>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Navbar />

            <div style={styles.page}>

                <div style={styles.header}>

                    <div>
                        <h1 style={styles.title}>
                            CINE-X Admin Dashboard
                        </h1>

                        <p style={styles.subtitle}>
                            Manage your movies and premium content
                        </p>
                    </div>

                    <Link
                        to="/"
                        style={{
                            ...styles.homeButton,
                            textDecoration: "none"
                        }}
                    >
                        <Play size={18} />
                        Home
                    </Link>

                </div>

                <div style={styles.stats}>

                    <div style={styles.statCard}>
                        <h3>Total Movies</h3>
                        <p>{movies.length}</p>
                    </div>

                    <div style={styles.statCard}>
                        <h3>Premium Movies</h3>
                        <p>
                            {
                                movies.filter(
                                    (movie) =>
                                        movie.premium === true
                                ).length
                            }
                        </p>
                    </div>

                    <div style={styles.statCard}>
                        <h3>Free Movies</h3>
                        <p>
                            {
                                movies.filter(
                                    (movie) =>
                                        movie.premium !== true
                                ).length
                            }
                        </p>
                    </div>

                </div>

                <div style={styles.formCard}>

                    <h2 style={styles.sectionTitle}>
                        <Plus size={22} />
                        Add New Movie
                    </h2>

                    <form onSubmit={addMovie}>

                        <div style={styles.formGrid}>

                            <input
                                type="text"
                                name="title"
                                placeholder="Movie Title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                style={styles.input}
                            />

                            <input
                                type="text"
                                name="genre"
                                placeholder="Genre"
                                value={formData.genre}
                                onChange={handleChange}
                                required
                                style={styles.input}
                            />

                            <input
                                type="text"
                                name="language"
                                placeholder="Language"
                                value={formData.language}
                                onChange={handleChange}
                                required
                                style={styles.input}
                            />

                            <input
                                type="number"
                                name="year"
                                placeholder="Year"
                                value={formData.year}
                                onChange={handleChange}
                                required
                                style={styles.input}
                            />

                            <input
                                type="number"
                                step="0.1"
                                name="rating"
                                placeholder="Rating"
                                value={formData.rating}
                                onChange={handleChange}
                                style={styles.input}
                            />

                            <input
                                type="text"
                                name="duration"
                                placeholder="Duration e.g. 2h 10m"
                                value={formData.duration}
                                onChange={handleChange}
                                style={styles.input}
                            />

                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                style={styles.input}
                            >
                                <option value="movie">
                                    Movie
                                </option>

                                <option value="series">
                                    Series
                                </option>
                            </select>

                        </div>

                        <textarea
                            name="description"
                            placeholder="Movie Description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            style={styles.textarea}
                        />

                        <label style={styles.premiumLabel}>

                            <input
                                type="checkbox"
                                name="premium"
                                checked={formData.premium}
                                onChange={handleChange}
                            />

                            <span>
                                Premium Movie
                            </span>

                        </label>

                        <div style={styles.uploadSection}>

                            <div>
                                <label style={styles.fileLabel}>
                                    Poster
                                </label>

                                <input
                                    id="posterInput"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setPoster(
                                            e.target.files[0]
                                        )
                                    }
                                    style={styles.fileInput}
                                />
                            </div>

                            <div>
                                <label style={styles.fileLabel}>
                                    Video
                                </label>

                                <input
                                    id="videoInput"
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) =>
                                        setVideo(
                                            e.target.files[0]
                                        )
                                    }
                                    style={styles.fileInput}
                                />
                            </div>

                        </div>

                        <button
                            type="submit"
                            style={styles.addButton}
                        >
                            <Plus size={18} />
                            Add Movie
                        </button>

                    </form>

                </div>

                <div style={styles.movieSection}>

                    <h2 style={styles.sectionTitle}>
                        Movies
                    </h2>

                    <div style={styles.movieGrid}>

                        {movies.map((movie) => (

                            <div
                                key={movie._id}
                                style={styles.movieCard}
                            >

                                <div style={styles.posterContainer}>

                                    {movie.poster ? (
                                        <img
                                            src={posterUrls[movie._id]}
                                            alt={movie.title}
                                            style={styles.poster}
                                        />
                                    ) : (
                                        <div style={styles.noPoster}>
                                            No Poster
                                        </div>
                                    )}

                                    {movie.premium && (
                                        <span
                                            style={
                                                styles.premiumBadge
                                            }
                                        >
                                            PREMIUM
                                        </span>
                                    )}

                                </div>

                                <div style={styles.movieInfo}>

                                    <h3>
                                        {movie.title}
                                    </h3>

                                    <p>
                                        {movie.year} •{" "}
                                        {movie.genre}
                                    </p>

                                    <p>
                                        {movie.language}
                                    </p>

                                    <div style={styles.actions}>

                                        <button
                                            style={
                                                styles.watchButton
                                            }
                                            onClick={() =>
                                                navigate(
                                                    `/watch/${movie._id}`
                                                )
                                            }
                                        >
                                            <Play size={16} />
                                            Watch
                                        </button>

                                        <button
                                            style={
                                                styles.editButton
                                            }
                                            onClick={() =>
                                                editMovie(movie)
                                            }
                                        >
                                            <Edit size={16} />
                                            Edit
                                        </button>

                                        <button
                                            style={
                                                styles.deleteButton
                                            }
                                            onClick={() =>
                                                deleteMovie(
                                                    movie._id
                                                )
                                            }
                                        >
                                            <Trash2 size={16} />
                                            Delete
                                        </button>

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                </div>

            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        background: "#111",
        color: "#fff",
        padding: "40px"
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "40px"
    },

    title: {
        margin: 0,
        fontSize: "32px"
    },

    subtitle: {
        color: "#999",
        marginTop: "8px"
    },

    homeButton: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 18px",
        background: "#222",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer"
    },

    stats: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "20px",
        marginBottom: "35px"
    },

    statCard: {
        background: "#1c1c1c",
        padding: "25px",
        borderRadius: "10px"
    },

    formCard: {
        background: "#1c1c1c",
        padding: "30px",
        borderRadius: "12px",
        marginBottom: "40px"
    },

    sectionTitle: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "25px"
    },

    formGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "15px"
    },

    input: {
        padding: "12px",
        background: "#2a2a2a",
        color: "#fff",
        border: "1px solid #444",
        borderRadius: "6px"
    },

    textarea: {
        width: "100%",
        minHeight: "100px",
        marginTop: "15px",
        padding: "12px",
        background: "#2a2a2a",
        color: "#fff",
        border: "1px solid #444",
        borderRadius: "6px",
        boxSizing: "border-box"
    },

    premiumLabel: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginTop: "20px",
        cursor: "pointer"
    },

    uploadSection: {
        display: "flex",
        gap: "30px",
        marginTop: "25px",
        flexWrap: "wrap"
    },

    fileLabel: {
        display: "block",
        marginBottom: "8px"
    },

    fileInput: {
        color: "#fff"
    },

    addButton: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginTop: "25px",
        padding: "12px 20px",
        background: "#e50914",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "bold"
    },

    movieGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fill, minmax(220px, 1fr))",
        gap: "20px"
    },

    movieCard: {
        background: "#1c1c1c",
        borderRadius: "10px",
        overflow: "hidden"
    },

    posterContainer: {
        position: "relative"
    },

    poster: {
        width: "100%",
        height: "260px",
        objectFit: "cover",
        display: "block"
    },

    noPoster: {
        height: "260px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#292929",
        color: "#888"
    },

    premiumBadge: {
        position: "absolute",
        top: "12px",
        right: "12px",
        background: "#e50914",
        color: "#fff",
        padding: "6px 10px",
        borderRadius: "5px",
        fontSize: "11px",
        fontWeight: "bold"
    },

    movieInfo: {
        padding: "18px"
    },

    actions: {
        display: "flex",
        gap: "8px",
        marginTop: "15px",
        flexWrap: "wrap"
    },

    watchButton: {
        display: "flex",
        alignItems: "center",
        gap: "5px",
        padding: "8px 12px",
        background: "#e50914",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer"
    },

    editButton: {
        display: "flex",
        alignItems: "center",
        gap: "5px",
        padding: "8px 12px",
        background: "#333",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer"
    },

    deleteButton: {
        display: "flex",
        alignItems: "center",
        gap: "5px",
        padding: "8px 12px",
        background: "#661111",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer"
    }
};

export default AdminDashboard;
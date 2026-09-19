import { useEffect, useState } from "react";
import axios from "axios";
import { Search, SlidersHorizontal } from "lucide-react";

import Navbar from "../components/Navbar";
import MovieCard from "../components/MovieCard";

function Movies() {
    const [movies, setMovies] = useState([]);
    const [search, setSearch] = useState("");
    const [genre, setGenre] = useState("All");
    const [language, setLanguage] = useState("All");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMovies();
    }, []);

    const fetchMovies = async () => {
        try {
            const response = await axios.get(
                "http://localhost:5001/api/movies"
            );

            setMovies(response.data.movies || []);
        } catch (error) {
            console.error(
                "FETCH MOVIES ERROR:",
                error.response?.data || error.message
            );
        } finally {
            setLoading(false);
        }
    };

    const movieList = movies
        .filter((movie) => movie.type === "movie")
        .filter((movie) =>
            movie.title
                .toLowerCase()
                .includes(search.toLowerCase())
        )
        .filter(
            (movie) =>
                genre === "All" || movie.genre === genre
        )
        .filter(
            (movie) =>
                language === "All" ||
                movie.language === language
        );

    if (loading) {
        return (
            <div style={styles.loading}>
                <h2>Loading movies...</h2>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <Navbar />

            <main className="content">

                <section style={styles.header}>
                    <div>
                        <p style={styles.label}>
                            CINE-X COLLECTION
                        </p>

                        <h1 style={styles.title}>
                            Movies
                        </h1>

                        <p style={styles.subtitle}>
                            Explore the latest movies, classics,
                            blockbusters and Cine-X originals.
                        </p>
                    </div>

                    <div style={styles.count}>
                        <strong>{movieList.length}</strong>
                        <span>Movies</span>
                    </div>
                </section>

                <div style={styles.filters}>

                    <div style={styles.searchBox}>
                        <Search size={19} />

                        <input
                            type="text"
                            placeholder="Search movies..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            style={styles.searchInput}
                        />
                    </div>

                    <div style={styles.selectBox}>
                        <SlidersHorizontal size={17} />

                        <select
                            value={genre}
                            onChange={(e) =>
                                setGenre(e.target.value)
                            }
                            style={styles.select}
                        >
                            <option value="All">
                                All Genres
                            </option>
                            <option value="Action">
                                Action
                            </option>
                            <option value="Adventure">
                                Adventure
                            </option>
                            <option value="Comedy">
                                Comedy
                            </option>
                            <option value="Crime">
                                Crime
                            </option>
                            <option value="Drama">
                                Drama
                            </option>
                            <option value="Romance">
                                Romance
                            </option>
                            <option value="Sci-Fi">
                                Sci-Fi
                            </option>
                            <option value="Thriller">
                                Thriller
                            </option>
                        </select>
                    </div>

                    <select
                        value={language}
                        onChange={(e) =>
                            setLanguage(e.target.value)
                        }
                        style={styles.languageSelect}
                    >
                        <option value="All">
                            All Languages
                        </option>
                        <option value="Hindi">
                            Hindi
                        </option>
                        <option value="English">
                            English
                        </option>
                    </select>

                </div>

                <section>
                    <div style={styles.sectionHeader}>
                        <h2>All Movies</h2>

                        <span>
                            {movieList.length} results
                        </span>
                    </div>

                    {!movieList.length ? (
                        <div style={styles.empty}>
                            <h2>No movies found</h2>

                            <p>
                                Try changing your search or filters.
                            </p>
                        </div>
                    ) : (
                        <div className="movie-grid">
                            {movieList.map((movie) => (
                                <MovieCard
                                    key={movie._id}
                                    movie={{
                                        ...movie,
                                        id: movie._id
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </section>

            </main>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        background: "#000",
        color: "#fff"
    },

    loading: {
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: "30px",
        paddingTop: "10px"
    },

    label: {
        color: "#e50914",
        fontSize: "12px",
        fontWeight: "bold",
        letterSpacing: "2px",
        marginBottom: "8px"
    },

    title: {
        fontSize: "42px",
        margin: "0 0 8px",
        fontWeight: "800"
    },

    subtitle: {
        color: "#999",
        fontSize: "15px",
        margin: 0
    },

    count: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#151515",
        border: "1px solid #292929",
        borderRadius: "10px",
        padding: "12px 22px",
        minWidth: "90px"
    },

    filters: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        background: "#101010",
        border: "1px solid #252525",
        padding: "14px",
        borderRadius: "10px",
        marginBottom: "35px"
    },

    searchBox: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        background: "#1d1d1d",
        borderRadius: "7px",
        padding: "11px 14px",
        color: "#aaa"
    },

    searchInput: {
        width: "100%",
        background: "transparent",
        border: "none",
        outline: "none",
        color: "#fff",
        fontSize: "14px"
    },

    selectBox: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "#1d1d1d",
        borderRadius: "7px",
        padding: "0 10px",
        color: "#aaa"
    },

    select: {
        padding: "11px 8px",
        background: "#1d1d1d",
        color: "#fff",
        border: "none",
        outline: "none",
        borderRadius: "7px"
    },

    languageSelect: {
        padding: "11px 12px",
        background: "#1d1d1d",
        color: "#fff",
        border: "none",
        outline: "none",
        borderRadius: "7px"
    },

    sectionHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "18px"
    },

    empty: {
        textAlign: "center",
        padding: "80px 20px",
        background: "#101010",
        borderRadius: "10px",
        border: "1px solid #222"
    }
};

export default Movies;
import { useEffect, useState } from "react";
import axios from "axios";
import { Play, Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import MovieCard from "../components/MovieCard";

function Home() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [movies, setMovies] = useState([]);
  const [continueWatching, setContinueWatching] = useState([]);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");
  const [language, setLanguage] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovies();
    fetchContinueWatching();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/movies`
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

  const fetchContinueWatching = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      const response = await axios.get(
        `${API_URL}/progress`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setContinueWatching(response.data.progress || []);
    } catch (error) {
      console.error(
        "CONTINUE WATCHING ERROR:",
        error.response?.data || error.message
      );
    }
  };

  const filteredMovies = movies.filter((movie) => {
    const matchesSearch = movie.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesGenre =
      genre === "All" || movie.genre === genre;

    const matchesLanguage =
      language === "All" || movie.language === language;

    return matchesSearch && matchesGenre && matchesLanguage;
  });

  const featuredMovie = movies[0];

  const trendingMovies = filteredMovies.slice(0, 6);

  const popularMovies = filteredMovies
    .slice()
    .sort((a, b) => {
      return (b.rating || 0) - (a.rating || 0);
    })
    .slice(0, 6);

  if (loading) {
    return (
      <div style={styles.center}>
        <h2>Loading movies...</h2>
      </div>
    );
  }

  if (!movies.length) {
    return (
      <div>
        <Navbar />

        <div style={styles.center}>
          <h2>No movies available</h2>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      <section
        className="hero"
        style={{
          backgroundImage: `linear-gradient(
            to right,
            rgba(0,0,0,0.95),
            rgba(0,0,0,0.25)
          ), url(${featuredMovie.backdrop || featuredMovie.poster})`
        }}
      >
        <div className="hero-content">
          <p className="hero-label">CINE-X ORIGINAL</p>

          <h1>{featuredMovie.title}</h1>

          <div className="hero-meta">
            <span>{featuredMovie.year}</span>
            <span>{featuredMovie.genre}</span>

            {featuredMovie.duration && (
              <span>{featuredMovie.duration}</span>
            )}

            <span>
              ⭐ {featuredMovie.rating || "N/A"}
            </span>
          </div>

          <p>{featuredMovie.description}</p>

          <div className="hero-buttons">
            <button
              className="watch-btn"
              onClick={() =>
                navigate(`/watch/${featuredMovie._id}`)
              }
            >
              <Play size={20} fill="currentColor" />
              Watch Now
            </button>

            <button className="list-btn">
              <Plus size={20} />
              My List
            </button>
          </div>
        </div>
      </section>

      <main className="content">

        <div style={styles.filters}>

          <div style={styles.searchBox}>
            <Search size={20} />

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

          <select
            value={genre}
            onChange={(e) =>
              setGenre(e.target.value)
            }
            style={styles.select}
          >
            <option value="All">All Genres</option>
            <option value="Adventure">Adventure</option>
            <option value="Thriller">Thriller</option>
            <option value="Sci-Fi">Sci-Fi</option>
            <option value="Crime">Crime</option>
            <option value="Romance">Romance</option>
            <option value="Drama">Drama</option>
            <option value="Action">Action</option>
            <option value="Comedy">Comedy</option>
          </select>

          <select
            value={language}
            onChange={(e) =>
              setLanguage(e.target.value)
            }
            style={styles.select}
          >
            <option value="All">All Languages</option>
            <option value="Hindi">Hindi</option>
            <option value="English">English</option>
          </select>

        </div>

        {continueWatching.filter((item) => item.movie).length > 0 && (
          <section>
            <h2>Continue Watching</h2>

            <div className="movie-grid">

              {continueWatching
                .filter((item) => item.movie)
                .map((item) => {

                  const percentage = Math.min(
                    (item.progress / item.duration) * 100,
                    100
                  );

                  return (
                    <div key={item._id}>

                      <MovieCard
                        movie={{
                          ...item.movie,
                          id: item.movie._id
                        }}
                      />

                      <div
                        style={styles.resumeButton}
                        onClick={() =>
                          navigate(
                            `/watch/${item.movie._id}`
                          )
                        }
                      >
                        ▶ Resume Watching
                      </div>

                      <div style={styles.progressBackground}>
                        <div
                          style={{
                            width: `${percentage}%`,
                            height: "100%",
                            background: "#e50914"
                          }}
                        />
                      </div>

                      <p style={styles.progressText}>
                        {Math.round(percentage)}% watched
                      </p>

                    </div>
                  );
                })}

            </div>
          </section>
        )}

        <section>
          <h2>🔥 Trending Now</h2>

          <div className="movie-grid">
            {trendingMovies.map((movie) => (
              <MovieCard
                key={movie._id}
                movie={{
                  ...movie,
                  id: movie._id
                }}
              />
            ))}
          </div>
        </section>

        <section>
          <h2>⭐ Popular Movies</h2>

          <div className="movie-grid">
            {popularMovies.map((movie) => (
              <MovieCard
                key={movie._id}
                movie={{
                  ...movie,
                  id: movie._id
                }}
              />
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}

const styles = {
  center: {
    minHeight: "100vh",
    background: "#000",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },

  filters: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "35px"
  },

  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#222",
    padding: "12px 16px",
    borderRadius: "8px",
    flex: 1
  },

  searchInput: {
    width: "100%",
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#fff",
    fontSize: "16px"
  },

  select: {
    padding: "12px",
    background: "#222",
    color: "#fff",
    border: "none",
    borderRadius: "8px"
  },

  resumeButton: {
    marginTop: "8px",
    padding: "10px",
    background: "#e50914",
    color: "#fff",
    textAlign: "center",
    borderRadius: "5px",
    fontWeight: "bold",
    cursor: "pointer"
  },

  progressBackground: {
    width: "100%",
    height: "4px",
    background: "#444",
    borderRadius: "5px",
    marginTop: "8px",
    overflow: "hidden"
  },

  progressText: {
    marginTop: "5px",
    fontSize: "12px",
    color: "#aaa"
  }
};

export default Home;
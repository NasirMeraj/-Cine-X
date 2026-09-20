import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getR2Url } from "../utils/r2Url";

function MovieCard({ movie }) {
  const navigate = useNavigate();
  const [posterUrl, setPosterUrl] = useState(null);

  useEffect(() => {
    const loadPoster = async () => {
      if (!movie.poster) {
        return;
      }

      if (movie.poster.startsWith("http")) {
        setPosterUrl(movie.poster);
        return;
      }

      if (movie.poster.startsWith("/uploads/")) {
        setPosterUrl(`${import.meta.env.VITE_API_URL.replace(/\/api$/, "")}${movie.poster}`);
        return;
      }

      const url = await getR2Url(movie.poster);

      setPosterUrl(url);
    };

    loadPoster();
  }, [movie.poster]);

  return (
    <div
      className="movie-card"
      onClick={() => navigate(`/watch/${movie.id}`)}
      style={{ cursor: "pointer" }}
    >
      {posterUrl && (
        <img
          src={posterUrl}
          alt={movie.title}
        />
      )}

      <div className="movie-info">
        <h3>{movie.title}</h3>

        <div className="movie-meta">
          <span>{movie.year}</span>

          <span>{movie.genre}</span>

          <span className="rating">
            <Star size={14} fill="currentColor" />
            {movie.rating}
          </span>
        </div>
      </div>
    </div>
  );
}

export default MovieCard;
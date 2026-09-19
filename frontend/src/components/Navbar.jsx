import { Search, User, Play } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    navigate("/login");
  };

  return (
    <nav className="cine-navbar">
      <div className="cine-navbar-logo">
        <Play size={20} fill="currentColor" />
        CINE-X
      </div>

      <div className="cine-navbar-links">
        <Link to="/">Home</Link>
        <Link to="/movies">Movies</Link>
        <Link to="/series">Series</Link>
        <Link to="/watchlist">My Watchlist</Link>
        <Link to="/subscription">Subscription</Link>

        {role === "admin" && (
          <Link to="/admin">Admin</Link>
        )}
      </div>

      <div className="cine-navbar-actions">
        <Search size={22} />
        <User size={22} />

        {!token ? (
          <button onClick={() => navigate("/login")}>
            Login
          </button>
        ) : (
          <button onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
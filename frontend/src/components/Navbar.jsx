import { Search, User, Play, Bell } from "lucide-react";
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

        {token && (
          <button
            onClick={() => navigate("/notifications")}
            style={styles.iconButton}
            title="Notifications"
          >
            <Bell size={22} />
          </button>
        )}

        <button
          onClick={() => navigate("/profile")}
          style={styles.iconButton}
          title="Profile"
        >
          <User size={22} />
        </button>

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

const styles = {
  iconButton: {
    background: "transparent",
    border: "none",
    color: "inherit",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }
};

export default Navbar;
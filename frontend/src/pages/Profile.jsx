import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
      }
    } catch (error) {
      console.error("PROFILE ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div style={styles.page}>
        <h2>Loading profile...</h2>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={styles.page}>
        <h2>Failed to load profile</h2>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.icon}>👤</div>

        <h1>My Profile</h1>

        <div style={styles.card}>
          <div style={styles.row}>
            <span style={styles.label}>Name</span>
            <span>{user.name}</span>
          </div>

          <div style={styles.row}>
            <span style={styles.label}>Email</span>
            <span>{user.email}</span>
          </div>

          <div style={styles.row}>
            <span style={styles.label}>Role</span>
            <span>{user.role}</span>
          </div>

          <div style={styles.row}>
            <span style={styles.label}>Subscription</span>
            <span>{user.subscription}</span>
          </div>
        </div>

        <button
          style={styles.backButton}
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#000",
    color: "#fff",
    padding: "40px",
    boxSizing: "border-box"
  },

  container: {
    maxWidth: "700px",
    margin: "0 auto"
  },

  icon: {
    fontSize: "45px",
    marginBottom: "10px"
  },

  card: {
    background: "#151515",
    borderRadius: "10px",
    padding: "25px",
    marginTop: "30px"
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    padding: "18px 0",
    borderBottom: "1px solid #333"
  },

  label: {
    color: "#aaa"
  },

  backButton: {
    marginTop: "25px",
    background: "#fff",
    color: "#000",
    border: "none",
    padding: "10px 16px",
    borderRadius: "6px",
    cursor: "pointer"
  }
};

export default Profile;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("NOTIFICATION ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      loadNotifications();
    } catch (error) {
      console.error("MARK READ ERROR:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");

      await fetch(`${API_URL}/notifications/read-all`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      loadNotifications();
    } catch (error) {
      console.error("MARK ALL READ ERROR:", error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(`${API_URL}/notifications/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      loadNotifications();
    } catch (error) {
      console.error("DELETE NOTIFICATION ERROR:", error);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <h2>Loading notifications...</h2>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1>Notifications</h1>

          {unreadCount > 0 && (
            <p style={styles.unread}>
              {unreadCount} unread notification
              {unreadCount > 1 ? "s" : ""}
            </p>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            style={styles.readAllButton}
            onClick={markAllAsRead}
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.bell}>🔔</div>
          <h2>No notifications</h2>
          <p>You're all caught up.</p>
        </div>
      ) : (
        <div style={styles.list}>
          {notifications.map((notification) => (
            <div
              key={notification._id}
              style={{
                ...styles.notification,
                backgroundColor: notification.read
                  ? "#151515"
                  : "#222"
              }}
            >
              <div style={styles.icon}>🔔</div>

              <div style={styles.content}>
                <h3>{notification.title}</h3>

                <p>{notification.message}</p>

                <small>
                  {new Date(
                    notification.createdAt
                  ).toLocaleString()}
                </small>

                {!notification.read && (
                  <button
                    style={styles.readButton}
                    onClick={() =>
                      markAsRead(notification._id)
                    }
                  >
                    Mark as read
                  </button>
                )}
              </div>

              <button
                style={styles.deleteButton}
                onClick={() =>
                  deleteNotification(notification._id)
                }
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        style={styles.backButton}
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>
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

  header: {
    maxWidth: "900px",
    margin: "0 auto 30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  unread: {
    color: "#aaa",
    marginTop: "5px"
  },

  readAllButton: {
    background: "#fff",
    color: "#000",
    border: "none",
    padding: "10px 16px",
    borderRadius: "6px",
    cursor: "pointer"
  },

  list: {
    maxWidth: "900px",
    margin: "0 auto"
  },

  notification: {
    display: "flex",
    alignItems: "flex-start",
    gap: "15px",
    padding: "20px",
    marginBottom: "12px",
    borderRadius: "8px"
  },

  icon: {
    fontSize: "25px"
  },

  content: {
    flex: 1
  },


  readButton: {
    marginTop: "12px",
    background: "transparent",
    color: "#fff",
    border: "1px solid #555",
    padding: "7px 12px",
    borderRadius: "5px",
    cursor: "pointer"
  },

  deleteButton: {
    background: "transparent",
    color: "#888",
    border: "none",
    fontSize: "25px",
    cursor: "pointer"
  },

  empty: {
    maxWidth: "900px",
    margin: "100px auto",
    textAlign: "center"
  },

  bell: {
    fontSize: "60px"
  },

  backButton: {
    display: "block",
    margin: "30px auto",
    background: "transparent",
    color: "#fff",
    border: "1px solid #555",
    padding: "10px 18px",
    borderRadius: "6px",
    cursor: "pointer"
  }
};

export default Notifications;
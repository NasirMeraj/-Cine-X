const express = require("express");
const dotenv = require("dotenv");

dotenv.config({
    path: process.env.NODE_ENV === "production"
        ? ".env.production"
        : ".env"
});

const cors = require("cors");
const connectDB = require("./config/db");

const movieRoutes = require("./routes/movieRoutes");
const authRoutes = require("./routes/authRoutes");
const videoRoutes = require("./routes/videoRoutes");
const watchlistRoutes = require("./routes/watchlistRoutes");
const progressRoutes = require("./routes/progressRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const storageRoutes = require("./routes/storageRoutes");
const watchHistoryRoutes = require("./routes/watchHistoryRoutes");
const myListRoutes = require("./routes/myListRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const profileRoutes = require("./routes/profileRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const notificationSettingsRoutes = require("./routes/notificationSettingsRoutes");

const startSubscriptionNotificationJob = require("./jobs/subscriptionNotifications");
const startNotificationCleanupJob = require("./jobs/notificationCleanup");

connectDB();

const app = express();

const PORT = process.env.PORT || 5001;

const corsOptions = {
    origin: process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : true,
    credentials: true
};

app.use(cors(corsOptions));

app.use(express.json());

app.use("/uploads", express.static("uploads"));
app.use("/videos", express.static("videos"));

app.use("/api/videos", videoRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/storage", storageRoutes);
app.use("/api/watch-history", watchHistoryRoutes);
app.use("/api/my-list", myListRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/notification-settings", notificationSettingsRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Welcome to Cine-X OTT API"
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        message: "Cine-X backend is running"
    });
});

app.use("/api/movies", movieRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/progress", progressRoutes);

app.listen(PORT, () => {
    console.log(`Cine-X server running on port ${PORT}`);
    startSubscriptionNotificationJob();
    startNotificationCleanupJob();
});
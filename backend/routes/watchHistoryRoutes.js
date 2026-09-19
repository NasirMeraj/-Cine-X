const express = require("express");
const WatchHistory = require("../models/WatchHistory");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/:movieId", authMiddleware, async (req, res) => {
    try {
        const { progress, duration } = req.body;

        const history = await WatchHistory.findOneAndUpdate(
            {
                user: req.user.id,
                movie: req.params.movieId,
            },
            {
                progress: progress || 0,
                duration: duration || 0,
                lastWatched: new Date(),
            },
            {
                new: true,
                upsert: true,
            }
        );

        res.json({
            success: true,
            history,
        });
    } catch (error) {
        console.log("WATCH HISTORY ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to save watch history",
        });
    }
});

router.get("/", authMiddleware, async (req, res) => {
    try {
        const history = await WatchHistory.find({
            user: req.user.id,
            $expr: {
                $or: [
                    { $eq: ["$duration", 0] },
                    { $lt: ["$progress", "$duration"] },
                ],
            },
        })
            .populate("movie")
            .sort({ lastWatched: -1 });

        res.json({
            success: true,
            history,
        });
    } catch (error) {
        console.log("GET WATCH HISTORY ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get watch history",
        });
    }
});

module.exports = router;
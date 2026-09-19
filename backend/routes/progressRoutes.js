const express = require("express");
const jwt = require("jsonwebtoken");
const Progress = require("../models/watchProgress");

const router = express.Router();

const protect = async (req, res, next) => {
    try {
        const token =
            req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

router.get("/", protect, async (req, res) => {
    try {
        const progress = await Progress.find({
            user: req.user.id,
            progress: { $gt: 0 }
        })
            .populate("movie")
            .sort({ updatedAt: -1 });

        return res.json({
            success: true,
            progress: progress
        });
    } catch (error) {
        console.error(
            "GET ALL PROGRESS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to get watch progress"
        });
    }
});

router.get("/:movieId", protect, async (req, res) => {
    try {
        const progress = await Progress.findOne({
            user: req.user.id,
            movie: req.params.movieId
        });

        return res.json({
            success: true,
            progress: progress || null
        });
    } catch (error) {
        console.error(
            "GET PROGRESS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to get progress"
        });
    }
});

router.post("/:movieId", protect, async (req, res) => {
    try {
        const {
            progress,
            duration
        } = req.body;

        if (
            progress === undefined ||
            progress < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid progress"
            });
        }

        const updatedProgress =
            await Progress.findOneAndUpdate(
                {
                    user: req.user.id,
                    movie: req.params.movieId
                },
                {
                    user: req.user.id,
                    movie: req.params.movieId,
                    progress: progress,
                    duration: duration || 0
                },
                {
                    new: true,
                    upsert: true
                }
            );

        return res.json({
            success: true,
            progress: updatedProgress
        });
    } catch (error) {
        console.error(
            "SAVE PROGRESS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to save progress"
        });
    }
});

module.exports = router;
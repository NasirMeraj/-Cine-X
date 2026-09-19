const express = require("express");

const Watchlist = require("../models/Watchlist");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/:movieId", protect, async (req, res) => {
    try {
        const existing = await Watchlist.findOne({
            user: req.user.id,
            movie: req.params.movieId
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Movie already in watchlist"
            });
        }

        const watchlist = await Watchlist.create({
            user: req.user.id,
            movie: req.params.movieId
        });

        res.status(201).json({
            success: true,
            message: "Movie added to watchlist",
            watchlist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.get("/", protect, async (req, res) => {
    try {
        const watchlist = await Watchlist.find({
            user: req.user.id
        }).populate("movie");

        res.json({
            success: true,
            watchlist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.delete("/:movieId", protect, async (req, res) => {
    try {
        const deleted = await Watchlist.findOneAndDelete({
            user: req.user.id,
            movie: req.params.movieId
        });

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Movie not found in watchlist"
            });
        }

        res.json({
            success: true,
            message: "Movie removed from watchlist"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
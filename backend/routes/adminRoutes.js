const express = require("express");

const Movie = require("../models/Movie");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const router = express.Router();

router.get(
    "/dashboard",
    protect,
    admin,
    async (req, res) => {
        try {
            const [
                totalMovies,
                premiumMovies,
                totalUsers,
                premiumUsers
            ] = await Promise.all([
                Movie.countDocuments(),

                Movie.countDocuments({
                    premium: true
                }),

                User.countDocuments(),

                User.countDocuments({
                    subscription: "premium"
                })
            ]);

            const freeMovies =
                totalMovies - premiumMovies;

            const freeUsers =
                totalUsers - premiumUsers;

            res.json({
                success: true,
                stats: {
                    totalMovies,
                    premiumMovies,
                    freeMovies,
                    totalUsers,
                    premiumUsers,
                    freeUsers
                }
            });
        } catch (error) {
            console.error(
                "ADMIN DASHBOARD ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to load dashboard"
            });
        }
    }
);

module.exports = router;
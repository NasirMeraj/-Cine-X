const express = require("express");

const User =
    require("../models/User");

const protect =
    require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/",
    protect,
    async (req, res) => {
        try {
            const user =
                await User.findById(
                    req.user.id
                ).select(
                    "notificationSettings"
                );

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            res.json({
                success: true,
                settings:
                    user.notificationSettings
            });
        } catch (error) {
            console.error(
                "GET NOTIFICATION SETTINGS ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to load notification settings"
            });
        }
    }
);

router.patch(
    "/",
    protect,
    async (req, res) => {
        try {
            const {
                newMovies,
                subscriptions,
                system
            } = req.body;

            const user =
                await User.findById(
                    req.user.id
                );

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            user.notificationSettings = {
                newMovies:
                    typeof newMovies ===
                    "boolean"
                        ? newMovies
                        : user
                              .notificationSettings
                              .newMovies,

                subscriptions:
                    typeof subscriptions ===
                    "boolean"
                        ? subscriptions
                        : user
                              .notificationSettings
                              .subscriptions,

                system:
                    typeof system ===
                    "boolean"
                        ? system
                        : user
                              .notificationSettings
                              .system
            };

            await user.save();

            res.json({
                success: true,
                message:
                    "Notification settings updated",
                settings:
                    user.notificationSettings
            });
        } catch (error) {
            console.error(
                "UPDATE NOTIFICATION SETTINGS ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to update notification settings"
            });
        }
    }
);

module.exports = router;
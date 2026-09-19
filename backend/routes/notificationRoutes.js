const express = require("express");

const Notification =
    require("../models/Notification");

const protect =
    require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/",
    protect,
    async (req, res) => {
        try {
            const notifications =
                await Notification.find({
                    user: req.user.id
                })
                    .populate(
                        "movie",
                        "title poster"
                    )
                    .sort({
                        createdAt: -1
                    });

            const unreadCount =
                await Notification.countDocuments({
                    user: req.user.id,
                    read: false
                });

            res.json({
                success: true,
                notifications,
                unreadCount
            });
        } catch (error) {
            console.error(
                "NOTIFICATION ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to load notifications"
            });
        }
    }
);

router.patch(
    "/:id/read",
    protect,
    async (req, res) => {
        try {
            const notification =
                await Notification.findOneAndUpdate(
                    {
                        _id: req.params.id,
                        user: req.user.id
                    },
                    {
                        read: true
                    },
                    {
                        new: true
                    }
                );

            if (!notification) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Notification not found"
                });
            }

            res.json({
                success: true,
                notification
            });
        } catch (error) {
            console.error(
                "READ NOTIFICATION ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to update notification"
            });
        }
    }
);

router.patch(
    "/read-all",
    protect,
    async (req, res) => {
        try {
            await Notification.updateMany(
                {
                    user: req.user.id,
                    read: false
                },
                {
                    read: true
                }
            );

            res.json({
                success: true,
                message:
                    "All notifications marked as read"
            });
        } catch (error) {
            console.error(
                "READ ALL NOTIFICATIONS ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to update notifications"
            });
        }
    }
);

router.delete(
    "/:id",
    protect,
    async (req, res) => {
        try {
            const notification =
                await Notification.findOneAndDelete(
                    {
                        _id: req.params.id,
                        user: req.user.id
                    }
                );

            if (!notification) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Notification not found"
                });
            }

            res.json({
                success: true,
                message:
                    "Notification deleted"
            });
        } catch (error) {
            console.error(
                "DELETE NOTIFICATION ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to delete notification"
            });
        }
    }
);

module.exports = router;
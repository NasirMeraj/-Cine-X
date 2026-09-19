const express = require("express");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, async (req, res) => {
    try {
        const user = await User.findById(
            req.user.id
        ).select(
            "-password"
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error(
            "PROFILE ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to load profile"
        });
    }
});

router.patch("/", protect, async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: "Name and email are required"
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase().trim(),
            _id: {
                $ne: req.user.id
            }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email is already in use"
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                name: name.trim(),
                email: email.toLowerCase().trim()
            },
            {
                new: true,
                runValidators: true
            }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            message: "Profile updated successfully",
            user
        });
    } catch (error) {
        console.error(
            "UPDATE PROFILE ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to update profile"
        });
    }
});

router.patch(
    "/password",
    protect,
    async (req, res) => {
        try {
            const {
                currentPassword,
                newPassword
            } = req.body;

            if (
                !currentPassword ||
                !newPassword
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Current password and new password are required"
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message:
                        "New password must be at least 6 characters"
                });
            }

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

            const passwordMatch =
                await bcrypt.compare(
                    currentPassword,
                    user.password
                );

            if (!passwordMatch) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Current password is incorrect"
                });
            }

            const samePassword =
                await bcrypt.compare(
                    newPassword,
                    user.password
                );

            if (samePassword) {
                return res.status(400).json({
                    success: false,
                    message:
                        "New password must be different from current password"
                });
            }

            const hashedPassword =
                await bcrypt.hash(
                    newPassword,
                    10
                );

            user.password =
                hashedPassword;

            await user.save();

            res.json({
                success: true,
                message:
                    "Password changed successfully"
            });
        } catch (error) {
            console.error(
                "CHANGE PASSWORD ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to change password"
            });
        }
    }
);

module.exports = router;
const express = require("express");
const MyList = require("../models/MyList");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/:movieId", authMiddleware, async (req, res) => {
    try {
        const existing = await MyList.findOne({
            user: req.user.id,
            movie: req.params.movieId,
        });

        if (existing) {
            await MyList.deleteOne({
                _id: existing._id,
            });

            return res.json({
                success: true,
                added: false,
                message: "Removed from My List",
            });
        }

        const item = await MyList.create({
            user: req.user.id,
            movie: req.params.movieId,
        });

        res.json({
            success: true,
            added: true,
            item,
            message: "Added to My List",
        });
    } catch (error) {
        console.log("MY LIST ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update My List",
        });
    }
});

router.get("/", authMiddleware, async (req, res) => {
    try {
        const list = await MyList.find({
            user: req.user.id,
        })
            .populate("movie")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            list,
        });
    } catch (error) {
        console.log("GET MY LIST ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get My List",
        });
    }
});

router.get("/check/:movieId", authMiddleware, async (req, res) => {
    try {
        const item = await MyList.findOne({
            user: req.user.id,
            movie: req.params.movieId,
        });

        res.json({
            success: true,
            added: !!item,
        });
    } catch (error) {
        console.log("CHECK MY LIST ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to check My List",
        });
    }
});

module.exports = router;
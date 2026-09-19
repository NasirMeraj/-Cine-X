const express = require("express");
const Rating = require("../models/Rating");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/:movieId", protect, async (req, res) => {
    try {
        const { rating, review } = req.body;

        if (
            !rating ||
            Number(rating) < 1 ||
            Number(rating) > 5
        ) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5"
            });
        }

        const result = await Rating.findOneAndUpdate(
            {
                user: req.user.id,
                movie: req.params.movieId
            },
            {
                rating: Number(rating),
                review: review || ""
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        res.json({
            success: true,
            rating: result
        });
    } catch (error) {
        console.log(
            "RATING ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to save rating"
        });
    }
});

router.get("/:movieId", async (req, res) => {
    try {
        const ratings = await Rating.find({
            movie: req.params.movieId
        })
            .populate(
                "user",
                "name"
            )
            .sort({
                createdAt: -1
            });

        const total = ratings.length;

        const average =
            total > 0
                ? ratings.reduce(
                      (sum, item) =>
                          sum + item.rating,
                      0
                  ) / total
                : 0;

        res.json({
            success: true,
            average: Number(
                average.toFixed(1)
            ),
            total,
            ratings
        });
    } catch (error) {
        console.log(
            "GET RATINGS ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to get ratings"
        });
    }
});

router.get(
    "/user/:movieId",
    protect,
    async (req, res) => {
        try {
            const rating =
                await Rating.findOne({
                    user: req.user.id,
                    movie: req.params.movieId
                });

            res.json({
                success: true,
                rating: rating
            });
        } catch (error) {
            console.log(
                "GET USER RATING ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to get user rating"
            });
        }
    }
);

module.exports = router;
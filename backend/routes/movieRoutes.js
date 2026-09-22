const express = require("express");
const multer = require("multer");
const {
    PutObjectCommand
} = require("@aws-sdk/client-s3");

const Movie = require("../models/Movie");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const r2 = require("../config/r2");
const Notification = require("../models/Notification");

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage()
});

const checkPremium = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        return false;
    }

    if (user.role === "admin") {
        return true;
    }

    if (user.subscription !== "premium") {
        return false;
    }

    if (
        user.subscriptionEnd &&
        new Date() > new Date(user.subscriptionEnd)
    ) {
        user.subscription = "free";
        user.subscriptionStart = null;
        user.subscriptionEnd = null;

        await user.save();

        return false;
    }

    return true;
};

router.get("/", async (req, res) => {
    try {
        const { search } = req.query;

        let query = {};

        if (search && search.trim()) {
            query = {
                $or: [
                    {
                        title: {
                            $regex: search.trim(),
                            $options: "i"
                        }
                    },
                    {
                        genre: {
                            $regex: search.trim(),
                            $options: "i"
                        }
                    }
                ]
            };
        }

        const movies = await Movie.find(query);

        const moviesWithoutPremiumVideo = movies.map((movie) => {
            const movieObject = movie.toObject();

            if (movieObject.premium) {
                movieObject.video = null;
            }

            return movieObject;
        });

        res.json({
            success: true,
            count: moviesWithoutPremiumVideo.length,
            movies: moviesWithoutPremiumVideo
        });
    } catch (error) {
        console.error(
            "SEARCH MOVIES ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch movies"
        });
    }
});

router.get("/:id", protect, async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: "Movie not found"
            });
        }

        if (movie.premium) {
            const isPremium =
                await checkPremium(req.user.id);

            if (!isPremium) {
                const movieObject = movie.toObject();

                movieObject.video = null;

                return res.json({
                    success: true,
                    premiumRequired: true,
                    movie: movieObject
                });
            }
        }

        res.json({
            success: true,
            premiumRequired: false,
            movie: movie
        });
    } catch (error) {
        console.error(
            "GET MOVIE ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch movie"
        });
    }
});

router.post(
    "/",
    protect,
    admin,
    upload.fields([
        {
            name: "poster",
            maxCount: 1
        },
        {
            name: "video",
            maxCount: 1
        }
    ]),
    async (req, res) => {
        try {
            let posterUrl = req.body.poster;
            let videoUrl = req.body.video;

            if (req.files?.poster) {
                const poster = req.files.poster[0];

                const posterKey =
                    `posters/${Date.now()}-${poster.originalname.replace(/\s+/g, "-")}`;

                await r2.send(
                    new PutObjectCommand({
                        Bucket:
                            process.env.R2_BUCKET_NAME,

                        Key: posterKey,

                        Body: poster.buffer,

                        ContentType:
                            poster.mimetype
                    })
                );

                posterUrl = posterKey;
            }

            if (req.files?.video) {
                const video = req.files.video[0];

                const videoKey =
                    `movies/${Date.now()}-${video.originalname.replace(/\s+/g, "-")}`;

                await r2.send(
                    new PutObjectCommand({
                        Bucket:
                            process.env.R2_BUCKET_NAME,

                        Key: videoKey,

                        Body: video.buffer,

                        ContentType:
                            video.mimetype
                    })
                );

                videoUrl = videoKey;
            }

            const movie = await Movie.create({
                ...req.body,

                year: Number(req.body.year),

                premium:
                    req.body.premium === "true",

                rating:
                    req.body.rating
                        ? Number(req.body.rating)
                        : 0,

                poster: posterUrl,

                video: videoUrl
            });

            const users = await User.find({
                role: "user",
                "notificationSettings.newMovies": true
            }).select("_id");

            console.log(
                "NOTIFICATION USERS:",
                users
            );

            if (users.length > 0) {
                await Notification.insertMany(
                    users.map((user) => ({
                        user: user._id,

                        title: "New Movie Added",

                        message:
                            `${movie.title} is now available on Cine-X.`,

                        type: "movie",

                        movie: movie._id
                    }))
                );
            }

            res.status(201).json({
                success: true,
                movie: movie
            });

        } catch (error) {
            console.error(
                "R2 MOVIE UPLOAD ERROR:",
                error
            );

            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
);

router.patch(
    "/:id",
    protect,
    admin,
    upload.fields([
        {
            name: "poster",
            maxCount: 1
        },
        {
            name: "video",
            maxCount: 1
        }
    ]),
    async (req, res) => {
        try {
            const movie =
                await Movie.findById(
                    req.params.id
                );

            if (!movie) {
                return res.status(404).json({
                    success: false,
                    message: "Movie not found"
                });
            }

            const updateData = {
                title: req.body.title,
                description: req.body.description,
                genre: req.body.genre,
                language: req.body.language,
                year: Number(req.body.year),
                duration: req.body.duration,
                premium:
                    req.body.premium === "true"
            };

            if (req.files?.poster) {
                const poster =
                    req.files.poster[0];

                const posterKey =
                    `posters/${Date.now()}-${poster.originalname.replace(/\s+/g, "-")}`;

                await r2.send(
                    new PutObjectCommand({
                        Bucket:
                            process.env.R2_BUCKET_NAME,

                        Key: posterKey,

                        Body: poster.buffer,

                        ContentType:
                            poster.mimetype
                    })
                );

                updateData.poster =
                    posterKey;
            }

            if (req.files?.video) {
                const video =
                    req.files.video[0];

                const videoKey =
                    `movies/${Date.now()}-${video.originalname.replace(/\s+/g, "-")}`;

                await r2.send(
                    new PutObjectCommand({
                        Bucket:
                            process.env.R2_BUCKET_NAME,

                        Key: videoKey,

                        Body: video.buffer,

                        ContentType:
                            video.mimetype
                    })
                );

                updateData.video =
                    videoKey;
            }

            const updatedMovie =
                await Movie.findByIdAndUpdate(
                    req.params.id,
                    updateData,
                    {
                        new: true,
                        runValidators: true
                    }
                );

            res.json({
                success: true,
                message:
                    "Movie updated successfully",
                movie: updatedMovie
            });

        } catch (error) {
            console.error(
                "UPDATE MOVIE ERROR:",
                error
            );

            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
);

router.delete(
    "/:id",
    protect,
    admin,
    async (req, res) => {
        try {
            const movie =
                await Movie.findByIdAndDelete(
                    req.params.id
                );

            if (!movie) {
                return res.status(404).json({
                    success: false,
                    message: "Movie not found"
                });
            }

            res.json({
                success: true,
                message:
                    "Movie deleted successfully"
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message:
                    "Failed to delete movie"
            });
        }
    }
);

module.exports = router;
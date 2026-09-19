const express = require("express");
const jwt = require("jsonwebtoken");

const {
    GetObjectCommand
} = require("@aws-sdk/client-s3");

const {
    getSignedUrl
} = require("@aws-sdk/s3-request-presigner");

const Movie = require("../models/Movie");
const User = require("../models/User");

const router = express.Router();

router.get("/:movieId", async (req, res) => {
    try {
        const token =
            req.query.token ||
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

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        const movie = await Movie.findById(
            req.params.movieId
        );

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: "Movie not found"
            });
        }

        if (
    movie.premium &&
    user.subscription !== "premium" &&
    user.role !== "admin"
) {
    return res.status(403).json({
        success: false,
        message: "Premium subscription required"
    });
}

        if (!movie.video) {
            return res.status(404).json({
                success: false,
                message: "Video not available"
            });
        }

        if (
            movie.video.startsWith("http")
        ) {
            return res.redirect(movie.video);
        }

        if (
            movie.video.startsWith("/videos/")
        ) {
            return res.status(404).json({
                success: false,
                message:
                    "Old local video storage is not supported by R2 streaming"
            });
        }

        const command = new GetObjectCommand({
            Bucket:
                process.env.R2_BUCKET_NAME,

            Key: movie.video,

            ResponseContentType:
                "video/mp4"
        });

        const signedUrl = await getSignedUrl(
            require("../config/r2"),
            command,
            {
                expiresIn: 3600
            }
        );

        return res.json({
    success: true,
    url: signedUrl
});

    } catch (error) {

        console.error(
            "VIDEO ERROR:",
            error.message
        );

        return res.status(401).json({
            success: false,
            message:
                "Invalid or expired token"
        });
    }
});

module.exports = router;
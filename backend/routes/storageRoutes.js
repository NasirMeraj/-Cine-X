const express = require("express");
const {
    GetObjectCommand
} = require("@aws-sdk/client-s3");
const {
    getSignedUrl
} = require("@aws-sdk/s3-request-presigner");

const protect = require("../middleware/authMiddleware");
const r2 = require("../config/r2");

const router = express.Router();

router.get("/url", protect, async (req, res) => {
    try {
        const { key } = req.query;

        if (!key) {
            return res.status(400).json({
                success: false,
                message: "File key is required"
            });
        }

        const command = new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key
        });

        const url = await getSignedUrl(
            r2,
            command,
            {
                expiresIn: 3600
            }
        );

        res.json({
            success: true,
            url
        });

    } catch (error) {
        console.error(
            "R2 SIGNED URL ERROR:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to generate file URL"
        });
    }
});

router.get("/image", async (req, res) => {
    try {
        const { key } = req.query;

        if (!key) {
            return res.status(400).json({
                success: false,
                message: "File key is required"
            });
        }

        if (!key.startsWith("posters/")) {
            return res.status(403).json({
                success: false,
                message: "Only poster files are allowed"
            });
        }

        const command = new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key
        });

        const result = await r2.send(command);

        if (result.ContentType) {
            res.setHeader(
                "Content-Type",
                result.ContentType
            );
        }

        if (result.ContentLength) {
            res.setHeader(
                "Content-Length",
                result.ContentLength
            );
        }

        res.setHeader(
            "Cache-Control",
            "public, max-age=3600"
        );

        if (result.Body) {
            result.Body.pipe(res);
        } else {
            return res.status(404).json({
                success: false,
                message: "File not found"
            });
        }

    } catch (error) {
        console.error(
            "R2 IMAGE ERROR:",
            error.message
        );

        if (
            error.name === "NoSuchKey" ||
            error.$metadata?.httpStatusCode === 404
        ) {
            return res.status(404).json({
                success: false,
                message: "Poster not found"
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to load image"
        });
    }
});

module.exports = router;
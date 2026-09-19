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

module.exports = router;
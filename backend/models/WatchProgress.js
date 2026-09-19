const mongoose = require("mongoose");

const watchProgressSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        movie: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Movie",
            required: true
        },

        progress: {
            type: Number,
            default: 0
        },

        duration: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

watchProgressSchema.index(
    { user: 1, movie: 1 },
    { unique: true }
);

module.exports = mongoose.model(
    "WatchProgress",
    watchProgressSchema
);
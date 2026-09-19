const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },

        description: {
            type: String,
            required: true
        },

        genre: {
            type: String,
            required: true
        },

        language: {
            type: String,
            required: true
        },

        year: {
            type: Number,
            required: true
        },

        rating: {
            type: Number,
            default: 0
        },

        duration: {
            type: String
        },

        poster: {
            type: String
        },

        backdrop: {
            type: String
        },

        trailer: {
            type: String
        },

        video: {
            type: String
        },

        type: {
            type: String,
            enum: ["movie", "series"],
            default: "movie"
        },

        premium: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Movie", movieSchema);
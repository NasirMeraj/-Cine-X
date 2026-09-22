const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true
        },

        password: {
            type: String,
            required: true
        },

        resetPasswordToken: {
            type: String,
            default: null
        },

        resetPasswordExpires: {
            type: Date,
            default: null
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },

        subscription: {
            type: String,
            enum: ["free", "premium"],
            default: "free"
        },

        subscriptionStart: {
            type: Date,
            default: null
        },

        notificationSettings: {
            newMovies: {
                type: Boolean,
                default: true
            },
            subscriptions: {
                type: Boolean,
                default: true
            },
            system: {
                type: Boolean,
                default: true
            }
        },

        subscriptionEnd: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);
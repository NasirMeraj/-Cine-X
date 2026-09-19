const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        plan: {
            type: String,
            enum: ["monthly", "yearly"],
            required: true
        },

        amount: {
            type: Number,
            required: true
        },

        status: {
            type: String,
            enum: ["active", "expired", "cancelled"],
            default: "active"
        },

        startDate: {
            type: Date,
            required: true
        },

        endDate: {
            type: Date,
            required: true
        },

        paymentId: {
            type: String,
           required: true,
           unique: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Subscription",
    subscriptionSchema
);
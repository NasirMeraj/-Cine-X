const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const Subscription = require("../models/Subscription");
const User = require("../models/User");
const Notification = require("../models/Notification");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

router.get("/", protect, async (req, res) => {
    try {
        const subscription =
            await Subscription.findOne({
                user: req.user.id,
                status: "active"
            }).sort({ createdAt: -1 });

        if (!subscription) {
            return res.json({
                success: true,
                subscription: null
            });
        }

        if (new Date() > subscription.endDate) {
            subscription.status = "expired";
            await subscription.save();

            await User.findByIdAndUpdate(
                req.user.id,
                {
                    subscription: "free",
                    subscriptionStart: null,
                    subscriptionEnd: null
                }
            );

            await Notification.create({
                user: req.user.id,
                title: "Premium Expired",
                message:
                    "Your Cine-X Premium subscription has expired. Renew your subscription to continue watching Premium content.",
                type: "subscription"
            });

            return res.json({
                success: true,
                subscription: null
            });
        }

        res.json({
            success: true,
            subscription
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.post(
    "/create-order",
    protect,
    async (req, res) => {
        try {
            const { plan } = req.body;

            let amount;

            if (plan === "monthly") {
                amount = 19900;
            } else if (plan === "yearly") {
                amount = 199900;
            } else {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid subscription plan"
                });
            }

            const options = {
                amount: amount,
                currency: "INR",
                receipt: `cine_x_${Date.now()}`,
                notes: {
                    userId: req.user.id,
                    plan: plan
                }
            };

            const order =
                await razorpay.orders.create(
                    options
                );

            res.json({
                success: true,
                order,
                keyId:
                    process.env.RAZORPAY_KEY_ID
            });

        } catch (error) {
            console.error(
                "RAZORPAY ORDER ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);

router.post(
    "/verify-payment",
    protect,
    async (req, res) => {
        try {
            const {
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            } = req.body;

            if (
                !razorpay_order_id ||
                !razorpay_payment_id ||
                !razorpay_signature
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Payment verification data missing"
                });
            }

            const existingPayment =
                await Subscription.findOne({
                    paymentId:
                        razorpay_payment_id
                });

            if (existingPayment) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Payment already processed"
                });
            }

            const generatedSignature =
                crypto
                    .createHmac(
                        "sha256",
                        process.env
                            .RAZORPAY_KEY_SECRET
                    )
                    .update(
                        razorpay_order_id +
                        "|" +
                        razorpay_payment_id
                    )
                    .digest("hex");

            if (
                generatedSignature !==
                razorpay_signature
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid payment signature"
                });
            }

            const order =
                await razorpay.orders.fetch(
                    razorpay_order_id
                );

            if (!order) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Razorpay order not found"
                });
            }

            if (
                order.notes?.userId !==
                req.user.id
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Order does not belong to this user"
                });
            }

            const verifiedPlan =
                order.notes?.plan;

            if (
                verifiedPlan !== "monthly" &&
                verifiedPlan !== "yearly"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid subscription plan"
                });
            }

            const expectedAmount =
                verifiedPlan === "monthly"
                    ? 19900
                    : 199900;

            if (
                order.amount !==
                expectedAmount
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid payment amount"
                });
            }

            if (order.currency !== "INR") {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid payment currency"
                });
            }

            const startDate = new Date();
            const endDate = new Date();

            if (verifiedPlan === "monthly") {
                endDate.setMonth(
                    endDate.getMonth() + 1
                );
            } else {
                endDate.setFullYear(
                    endDate.getFullYear() + 1
                );
            }

            const amount =
                verifiedPlan === "monthly"
                    ? 199
                    : 1999;

            const subscription =
                await Subscription.create({
                    user: req.user.id,
                    plan: verifiedPlan,
                    amount,
                    status: "active",
                    startDate,
                    endDate,
                    paymentId:
                        razorpay_payment_id
                });

            await User.findByIdAndUpdate(
                req.user.id,
                {
                    subscription: "premium",
                    subscriptionStart:
                        startDate,
                    subscriptionEnd:
                        endDate
                }
            );

            await Notification.create({
                user: req.user.id,
                title: "Premium Activated",
                message:
                    verifiedPlan === "monthly"
                        ? "Your monthly Premium subscription is now active."
                        : "Your yearly Premium subscription is now active.",
                type: "subscription"
            });

            res.json({
                success: true,
                message:
                    "Payment verified and Premium activated",
                subscription
            });

        } catch (error) {
            console.error(
                "PAYMENT VERIFICATION ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);

router.patch(
    "/cancel",
    protect,
    async (req, res) => {
        try {
            const subscription =
                await Subscription.findOne({
                    user: req.user.id,
                    status: "active"
                }).sort({
                    createdAt: -1
                });

            if (!subscription) {
                return res.status(404).json({
                    success: false,
                    message:
                        "No active subscription found"
                });
            }

            subscription.status =
                "cancelled";

            await subscription.save();

            await User.findByIdAndUpdate(
                req.user.id,
                {
                    subscription: "free",
                    subscriptionStart: null,
                    subscriptionEnd: null
                }
            );

            await Notification.create({
                user: req.user.id,
                title: "Premium Cancelled",
                message:
                    "Your Cine-X Premium subscription has been cancelled.",
                type: "subscription"
            });

            res.json({
                success: true,
                message:
                    "Subscription cancelled successfully"
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);

module.exports = router;
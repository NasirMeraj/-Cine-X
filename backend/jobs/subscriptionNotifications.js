const cron = require("node-cron");

const Subscription =
    require("../models/Subscription");

const Notification =
    require("../models/Notification");

const startSubscriptionNotificationJob =
    () => {
        cron.schedule(
            "0 9 * * *",
            async () => {
                try {
                    console.log(
                        "Running subscription notification job..."
                    );

                    const now = new Date();

                    const threeDaysFromNow =
                        new Date();

                    threeDaysFromNow.setDate(
                        threeDaysFromNow.getDate() +
                            3
                    );

                    const subscriptions =
                        await Subscription.find({
                            status: "active",
                            endDate: {
                                $gte: now,
                                $lte: threeDaysFromNow
                            }
                        });

                    for (const subscription of subscriptions) {
                        const endDate =
                            new Date(
                                subscription.endDate
                            );

                        const difference =
                            endDate.getTime() -
                            now.getTime();

                        const daysRemaining =
                            Math.ceil(
                                difference /
                                    (1000 *
                                        60 *
                                        60 *
                                        24)
                            );

                        if (
                            daysRemaining <= 0 ||
                            daysRemaining > 3
                        ) {
                            continue;
                        }

                        const existingNotification =
                            await Notification.findOne(
                                {
                                    user:
                                        subscription.user,

                                    type:
                                        "subscription",

                                    title:
                                        "Premium Expiring Soon",

                                    createdAt: {
                                        $gte: new Date(
                                            now.getFullYear(),
                                            now.getMonth(),
                                            now.getDate()
                                        )
                                    }
                                }
                            );

                        if (
                            existingNotification
                        ) {
                            continue;
                        }

                        await Notification.create({
                            user:
                                subscription.user,

                            title:
                                "Premium Expiring Soon",

                            message:
                                `Your Cine-X Premium subscription expires in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}. Renew your subscription to continue enjoying Premium content.`,

                            type:
                                "subscription"
                        });

                        console.log(
                            `Expiry notification created for user ${subscription.user}`
                        );
                    }

                    console.log(
                        "Subscription notification job completed."
                    );
                } catch (error) {
                    console.error(
                        "SUBSCRIPTION NOTIFICATION JOB ERROR:",
                        error
                    );
                }
            },
            {
                timezone:
                    "Asia/Kolkata"
            }
        );

        console.log(
            "Subscription notification job started."
        );
    };

module.exports =
    startSubscriptionNotificationJob;
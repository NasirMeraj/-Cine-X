const cron = require("node-cron");

const Notification =
    require("../models/Notification");

const startNotificationCleanupJob =
    () => {
        cron.schedule(
            "0 3 * * *",
            async () => {
                try {
                    console.log(
                        "Running notification cleanup job..."
                    );

                    const cutoffDate =
                        new Date();

                    cutoffDate.setDate(
                        cutoffDate.getDate() - 30
                    );

                    const result =
                        await Notification.deleteMany(
                            {
                                createdAt: {
                                    $lt: cutoffDate
                                }
                            }
                        );

                    console.log(
                        `Notification cleanup completed. Deleted ${result.deletedCount} old notifications.`
                    );
                } catch (error) {
                    console.error(
                        "NOTIFICATION CLEANUP ERROR:",
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
            "Notification cleanup job started."
        );
    };

module.exports =
    startNotificationCleanupJob;
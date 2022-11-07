const cron = require("node-cron");
const notify = require('./notify');

cronJob = cron.schedule(process.env.CRON_START_TIME, async() => {
    console.log('Run CronJob job daily at ', process.env.CRON_START_TIME);
    const videosToBeNotified = await notify.getVideosToBeNotified();
    if (videosToBeNotified && videosToBeNotified.rows) {
        await notify.sendNotifications(videosToBeNotified);
    }
});

module.exports.cronJob = cronJob;

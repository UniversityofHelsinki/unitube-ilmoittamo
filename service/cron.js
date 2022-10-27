const cron = require("node-cron");
const notify = require('./notify');

cronJob = cron.schedule(process.env.CRON_START_TIME, async() => {
    console.log('Run CronJob job daily at 01:00');
    const notified = await notify.queryVideosAndSendNotifications();
});

module.exports.cronJob = cronJob;

const cron = require("node-cron");
const notify = require('./notify');

cronJob = cron.schedule(process.env.CRON_START_TIME, async() => {
    console.log('Run CronJob job daily at ', process.env.CRON_START_TIME);
    const videosToArchive = await notify.getVideosToArchive();
    const recipientsMap = await notify.getRecipientsMap(videosToArchive);
    await notify.createEmails(recipientsMap);
});

module.exports.cronJob = cronJob;

const cron = require("node-cron");
const notify = require('./notify');
const databaseService = require('./databaseService');

cronJob = cron.schedule(process.env.CRON_START_TIME, async() => {
    console.log('Run CronJob job daily at ', process.env.CRON_START_TIME);
    const videosToSendNotification = await notify.getVideosToSendNotification();
    const recipientsMap = await notify.getRecipientsMap(videosToSendNotification);
    await notify.createEmails(recipientsMap);
    await databaseService.updateNotificationSentAt(videosToSendNotification);
});

module.exports.cronJob = cronJob;

const cron = require("node-cron");
const notify = require('./notify');
const databaseService = require('./databaseService');
const constants = require("../utils/constants");

cronJobThreeMonths = cron.schedule(process.env.CRON_START_TIME_THREE_MONTHS, async() => {
    console.log('Run CronJob job daily at ', process.env.CRON_START_TIME_THREE_MONTHS);
    const videosToSendNotification = await notify.getVideosToSendNotification(constants.VIDEO_NOTIFIED_THREE_MONTHS, constants.VIDEO_NOTIFIED_INTERVAL_ONE_WEEK, null);
    const recipientsMap = await notify.getRecipientsMap(videosToSendNotification);
    await notify.createEmails(recipientsMap);
    await databaseService.updateNotificationSentAt(videosToSendNotification);
});

cronJobOneMonth = cron.schedule(process.env.CRON_START_TIME_ONE_MONTH, async() => {
    console.log('Run CronJob job daily at ', process.env.CRON_START_TIME_ONE_MONTH);
    const videosToSendNotification = await notify.getVideosToSendNotification(constants.VIDEO_NOTIFIED_ONE_MONTH, null, constants.VIDEO_NOTIFIED_INTERVAL_THREE_DAYS);
    const recipientsMap = await notify.getRecipientsMap(videosToSendNotification);
    await notify.createEmails(recipientsMap);
    await databaseService.updateNotificationSentAt(videosToSendNotification);
});

module.exports.cronJobThreeMonths = cronJobThreeMonths;
module.exports.cronJobOneMonth = cronJobOneMonth;

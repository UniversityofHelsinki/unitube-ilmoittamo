const cron = require("node-cron");
const notify = require("./notify");
const constants = require("../utils/constants");
const databaseService = require("./databaseService");


cronJobOneMonth = cron.schedule(process.env.CRON_START_TIME_ONE_MONTH, async() => {
    console.log('Run CronJob2 job daily at ', process.env.CRON_START_TIME_ONE_MONTH);
    const videosToSendNotification = await notify.getVideosToSendNotification(constants.VIDEO_NOTIFIED_ONE_MONTH, null, constants.VIDEO_NOTIFIED_INTERVAL_THREE_DAYS);
    const recipientsMap = await notify.getRecipientsMap(videosToSendNotification);
    await notify.createEmails(recipientsMap);
    await databaseService.updateNotificationSentAt(videosToSendNotification);
});

module.exports.cronJobOneMonth = cronJobOneMonth;

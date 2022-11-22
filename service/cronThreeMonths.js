const cronThreeMonths = require("node-cron");
const notify = require('./notify');
const databaseService = require('./databaseService');
const constants = require("../utils/constants");

cronJobThreeMonths = cronThreeMonths.schedule(process.env.CRON_START_TIME_THIRTEEN_DAYS, async() => {
    console.log('Run cronJobThreeMonths job at ', process.env.CRON_START_TIME_THIRTEEN_DAYS);
    const videosToSendNotification = await notify.getVideosToSendNotification(constants.VIDEO_NOTIFIED_THREE_MONTHS, constants.VIDEO_NOTIFIED_INTERVAL_ONE_WEEK, null, null, null);
    const recipientsMap = await notify.getRecipientsMap(videosToSendNotification);
    await notify.createEmails(recipientsMap);
    await databaseService.updateNotificationSentAt(videosToSendNotification, constants.THREE_MONTHS);
});

module.exports.cronJobThreeMonths = cronJobThreeMonths;

const cron = require("node-cron");
const notify = require("./notify");
const constants = require("../utils/constants");
const databaseService = require("./databaseService");
const logger = require("../utils/winstonLogger");


cronJobOneMonth = cron.schedule(process.env.CRON_START_TIME_SIX_DAYS, async() => {
    logger.info(`Run cronJobOneMonth job at ${process.env.CRON_START_TIME_SIX_DAYS}`);
    const videosToSendNotification = await notify.getVideosToSendNotification(constants.VIDEO_NOTIFIED_ONE_MONTH, null, constants.VIDEO_NOTIFIED_INTERVAL_THREE_DAYS, null, null);
    const recipientsMap = await notify.getRecipientsMap(videosToSendNotification);
    await notify.createEmails(recipientsMap);
    await databaseService.updateNotificationSentAt(videosToSendNotification, constants.ONE_MONTH);
});

module.exports.cronJobOneMonth = cronJobOneMonth;

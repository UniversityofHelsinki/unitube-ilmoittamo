const cron = require("node-cron");
const notify = require("./notify");
const constants = require("../utils/constants");
const databaseService = require("./databaseService");
const logger = require("../utils/winstonLogger");

cronJobOneWeek = cron.schedule(process.env.CRON_START_TIME_THREE_DAYS, async() => {
    logger.info(`Run cronJobOneWeek job at ${process.env.CRON_START_TIME_THREE_DAYS}`);
    const videosToSendNotification = await notify.getVideosToSendNotification(null, null, null, constants.VIDEO_NOTIFIED_START_SIX_DAYS, constants.VIDEO_NOTIFIED_END_NINE_DAYS);
    const recipientsMap = await notify.getRecipientsMap(videosToSendNotification);
    await notify.createEmails(recipientsMap);
    await databaseService.updateNotificationSentAt(videosToSendNotification, constants.ONE_WEEK);
});

module.exports.cronJobOneWeek = cronJobOneWeek;

const cron = require("node-cron");
const notify = require("./notify");
const constants = require("../utils/constants");
const databaseService = require("./databaseService");
const logger = require("../utils/winstonLogger");


const runOneMonthJob = async() => {
    const videosToSendNotification = await notify.getVideosToSendNotification(constants.VIDEO_NOTIFIED_ONE_MONTH, null, constants.VIDEO_NOTIFIED_INTERVAL_THREE_DAYS, null, null);
    const recipientsEmailsMap = await notify.getRecipientsMap(videosToSendNotification);
    const recipientsUsernamesMap = await notify.getRecipientsMap(videosToSendNotification, true);

    await notify.createEmails(recipientsEmailsMap);
    await notify.createFlammaMessages(recipientsUsernamesMap);
    await databaseService.updateNotificationSentAt(videosToSendNotification, constants.ONE_MONTH);
}

const cronJobOneMonth = cron.schedule(process.env.CRON_START_TIME_SIX_DAYS, async() => {
    logger.info(`Run cronJobOneMonth job at ${process.env.CRON_START_TIME_SIX_DAYS}`);
    await runOneMonthJob();
});

module.exports.cronJobOneMonth = cronJobOneMonth;
module.exports.runOneMonthJob = runOneMonthJob;

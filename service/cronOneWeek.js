const cron = require("node-cron");
const notify = require("./notify");
const constants = require("../utils/constants");
const databaseService = require("./databaseService");
const logger = require("../utils/winstonLogger");
const {runOneMonthJob} = require("./cronOneMonth");

const runOneWeekJob =  async() => {
    const videosToSendNotification = await notify.getVideosToSendNotification(null, null, null, constants.VIDEO_NOTIFIED_START_SIX_DAYS, constants.VIDEO_NOTIFIED_END_NINE_DAYS);
    const recipientsEmailsMap = await notify.getRecipientsMap(videosToSendNotification);
    const recipientsUsernamesMap = await notify.getRecipientsMap(videosToSendNotification, true);

    await notify.createEmails(recipientsEmailsMap);
    await notify.createFlammaMessages(recipientsUsernamesMap);
    await databaseService.updateNotificationSentAt(videosToSendNotification, constants.ONE_WEEK);
}

const cronJobOneWeek = cron.schedule(process.env.CRON_START_TIME_THREE_DAYS, async() => {
    logger.info(`Run cronJobOneWeek job at ${process.env.CRON_START_TIME_THREE_DAYS}`);
    await runOneWeekJob();
});

module.exports.cronJobOneWeek = cronJobOneWeek;
module.exports.runOneWeekJob = runOneMonthJob;

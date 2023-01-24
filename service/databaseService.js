const fs = require("fs");
const path = require("path");
const database = require("./database");
const constants = require("../utils/constants");
const logger = require("../utils/winstonLogger");

const updateNotificationSentAt = async(videosToSendNotifications, period) => {
    try {
        for (const video of videosToSendNotifications.rows) {
            const now = new Date();
            let updateNotificationSentSQL = null;
            if (period === constants.THREE_MONTHS) {
                updateNotificationSentSQL = fs.readFileSync(path.resolve(__dirname, "../sql/updateNotificationSent.sql"), "utf8");
            } else if (period === constants.ONE_MONTH) {
                updateNotificationSentSQL = fs.readFileSync(path.resolve(__dirname, "../sql/updateNotificationSentOneMonth.sql"), "utf8");
            } else if (period === constants.ONE_WEEK) {
                updateNotificationSentSQL = fs.readFileSync(path.resolve(__dirname, "../sql/updateNotificationSentOneWeek.sql"), "utf8");
            }
            const updatedVideoEntry = await database.query(updateNotificationSentSQL, [now, video.video_id]);
            if (updatedVideoEntry.rowCount < 1) {
                logger.error(`error updating row for video ${video.video_id}`);
            }
        }
    } catch (error) {
        logger.error(error);
    }
};

const getEmailTemplate = async(name) => {
    const getEmailTemplates = fs.readFileSync(path.resolve(__dirname, "../sql/getEmailTemplates.sql"), "utf8");
    const resp = await database.query(getEmailTemplates, [name]);
    return resp;
}


const updateSkipEmailStatus = async(videoId) => {
    const skipEmailStatus = true;
    const updateEmailSendStatusSQL = fs.readFileSync(path.resolve(__dirname, "../sql/updateEmailSendStatus.sql"), "utf8");
    const updatedVideoEntry = await database.query(updateEmailSendStatusSQL, [skipEmailStatus, videoId]);
    return updatedVideoEntry.rowCount;
};

module.exports = {
    updateNotificationSentAt : updateNotificationSentAt,
    updateSkipEmailStatus : updateSkipEmailStatus,
    getEmailTemplate : getEmailTemplate
};



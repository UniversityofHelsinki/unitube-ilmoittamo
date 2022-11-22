const fs = require("fs");
const path = require("path");
const database = require("./database");
const constants = require("../utils/constants");

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
                console.log("error updating row for video " + video);
            }
        }
    } catch (error) {
        console.log(error);
    }
};

const updateSkipEmailStatus = async(videoId) => {
    const skipEmailStatus = true;
    const updateEmailSendStatusSQL = fs.readFileSync(path.resolve(__dirname, "../sql/updateEmailSendStatus.sql"), "utf8");
    const updatedVideoEntry = await database.query(updateEmailSendStatusSQL, [skipEmailStatus, videoId]);
    return updatedVideoEntry.rowCount;
};

module.exports = {
    updateNotificationSentAt : updateNotificationSentAt,
    updateSkipEmailStatus : updateSkipEmailStatus
};



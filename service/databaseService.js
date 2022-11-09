const fs = require("fs");
const path = require("path");
const database = require("./database");

const updateNotificationSentAt = async(videoId) => {
    const now = new Date();
    const updateNotificationSentSQL = fs.readFileSync(path.resolve(__dirname, "../sql/updateNotificationSent.sql"), "utf8");
    const updatedVideoEntry = await database.query(updateNotificationSentSQL, [now, videoId]);
    return updatedVideoEntry.rowCount;
};

const updateSkipEmailStatus = async(videoId) => {
    const skipEmailStatus = true;
    const updateEmailSendStatusSQL = fs.readFileSync(path.resolve(__dirname, "../sql/updateEmailSendStatus.sql"), "utf8");
    const updatedVideoEntry = await database.query(updateEmailSendStatusSQL, [skipEmailStatus, videoId]);
    return updatedVideoEntry.rowCount;
};

module.exports = {
    updateNotificationSentAt : updateNotificationSentAt,
    updateSendEmailStatus : updateSkipEmailStatus
};



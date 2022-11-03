const fs = require("fs");
const path = require("path");
const database = require("./database");

exports.updateNotificationSentAt = async(videoId) => {
    const now = new Date();
    const updateNotificationSentSQL = fs.readFileSync(path.resolve(__dirname, "../sql/updateNotificationSent.sql"), "utf8");
    const updatedVideoEntry = await database.query(updateNotificationSentSQL, [now, videoId]);
    return updatedVideoEntry.rowCount;
};



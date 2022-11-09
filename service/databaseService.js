const fs = require("fs");
const path = require("path");
const database = require("./database");

exports.updateNotificationSentAt = async(videosToSendNotifications) => {
    try {
        for (const video of videosToSendNotifications.rows) {
            const now = new Date();
            const updateNotificationSentSQL = fs.readFileSync(path.resolve(__dirname, "../sql/updateNotificationSent.sql"), "utf8");
            const updatedVideoEntry = await database.query(updateNotificationSentSQL, [now, video.video_id]);
            if (updatedVideoEntry.rowCount < 1) {
                console.log("error updating row for video " + video);
            }
        }
    } catch (error) {
        console.log(error);
    }
};



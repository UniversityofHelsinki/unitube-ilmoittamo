
// cron job calls this function
const fs = require('fs');
const path = require('path');
const database = require('./database');
const constants = require("../utils/constants");

const getNotifiedDate = () => {
    let notifiedDate = new Date();
    notifiedDate.setFullYear(notifiedDate.getFullYear(), notifiedDate.getMonth() + constants.DEFAULT_VIDEO_NOTIFIED_MONTH_AMOUNT);
    return notifiedDate;
};

const queryVideosAndSendNotifications = async() => {
    const selectedVideosToBeNotifiedSQL = fs.readFileSync(path.resolve(__dirname, "../sql/getSelectedVideosToBeNotified.sql"), "utf8");
    const notifiedDate = getNotifiedDate();
    console.log(notifiedDate);
    const notifiedVideos = database.query(selectedVideosToBeNotifiedSQL, [notifiedDate]);
    console.log(notifiedVideos);
    return notifiedVideos;
};

module.exports = {
    queryVideosAndSendNotifications : queryVideosAndSendNotifications
};

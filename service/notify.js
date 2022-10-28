
// cron job calls this function
const fs = require('fs');
const path = require('path');
const database = require('./database');
const format = require('date-format');

exports.queryVideosAndSendNotifications = async() => {
    const selectedVideosWithArchivedDatesSQL = fs.readFileSync(path.resolve(__dirname, "../sql/getSelectedVideosToBeArchived.sql"), "utf8");
    let now = new Date();
    let oldAfterThreeMonths =  now.setMonth(now.getMonth() + 3);
    const oldAfterThreeMonthsStr = format.asString('yyyy-MM-dd', new Date(oldAfterThreeMonths));

    const videosToBeNotified = await database.query(selectedVideosWithArchivedDatesSQL, [oldAfterThreeMonthsStr]);

    return videosToBeNotified;
}

// cron job calls this function
const fs = require('fs');
const path = require('path');
const database = require('./database');
const constants = require("../utils/constants");
const apiService = require('./apiService');


const getNotifiedDate = () => {
    let notifiedDate = new Date();
    notifiedDate.setFullYear(notifiedDate.getFullYear(), notifiedDate.getMonth() + constants.DEFAULT_VIDEO_NOTIFIED_MONTH_AMOUNT);
    return notifiedDate;
};

const queryVideos = async() => {
    const selectedVideosToBeNotifiedSQL = fs.readFileSync(path.resolve(__dirname, "../sql/getSelectedVideosToBeNotified.sql"), "utf8");
    const notifiedDate = getNotifiedDate();
    const notifiedVideos = database.query(selectedVideosToBeNotifiedSQL, [notifiedDate]);
    return notifiedVideos;
};

const getSeries = async (video) => {
    const videoId = video.video_id;
    const eventResponse = await apiService.getEvent(videoId);
    if (eventResponse.status == 200) {
        const seriesId = eventResponse.data.is_part_of;
        const seriesData = await apiService.getSeries(seriesId);
        return seriesData.data;
    }
}

module.exports = {
    getVideosToArchive : queryVideos,
    getSeriesData : getSeries
};

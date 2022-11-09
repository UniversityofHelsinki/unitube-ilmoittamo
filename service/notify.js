const fs = require('fs');
const path = require('path');
const database = require('./database');
const constants = require("../utils/constants");
const apiService = require('./apiService');
const emailService = require('./emailService');
const databaseService = require("./databaseService");


const getNotifiedDate = () => {
    let notifiedDate = new Date();
    notifiedDate.setFullYear(notifiedDate.getFullYear(), notifiedDate.getMonth() + constants.DEFAULT_VIDEO_NOTIFIED_MONTH_AMOUNT);
    return notifiedDate;
};

const queryVideosToBeNotified = async() => {
    const selectedVideosToBeNotifiedSQL = fs.readFileSync(path.resolve(__dirname, "../sql/getSelectedVideosToBeNotified.sql"), "utf8");
    const notifiedDate = getNotifiedDate();
    const notifiedVideos = database.query(selectedVideosToBeNotifiedSQL, [notifiedDate]);
    return notifiedVideos;
};

const getSeriesData = async (seriesId) => {
    const seriesData = await apiService.getSeries(seriesId);
    return seriesData.data;
}

const getVideoData = async (video) => {
    const videoId = video.video_id;
    const eventResponse = await apiService.getEvent(videoId);
    return eventResponse;
}

const createEmails = async (seriesData, archive_date, videoData) => {
    if (seriesData.contributors) {
        for (const contributor of seriesData.contributors) {
            const email = contributor + '@ad.helsinki.fi';
            console.log(email);
            await emailService.sendMail(email, seriesData.title, videoData.data.title, archive_date);
        }
    }
}

const isTrashSeries = (series) => series.title.toLowerCase().includes(constants.TRASH);

const sendNotifications = async (videos) => {
    for (const video of videos.rows) {
        const videoData = await getVideoData(video);
        if (videoData.status == 200) {
            const seriesData = await getSeriesData(videoData.data.is_part_of);
            if (!isTrashSeries(seriesData)) {
                await createEmails(seriesData, video.archived_date, videoData);
                await databaseService.updateNotificationSentAt(video.video_id);
            } else {
                await databaseService.updateSendEmailStatus(video.video_id);
            }
        }
    }
}


module.exports = {
    getVideosToBeNotified : queryVideosToBeNotified,
    getSeriesData : getSeriesData,
    getVideoData : getVideoData,
    createEmails: createEmails,
    sendNotifications: sendNotifications
};

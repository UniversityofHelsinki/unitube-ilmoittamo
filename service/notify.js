const fs = require('fs');
const path = require('path');
const database = require('./database');
const constants = require("../utils/constants");
const apiService = require('./apiService');
const emailService = require('./emailService');
const databaseService = require('./databaseService');

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

const getSeriesData = async (seriesId) => {
    const seriesData = await apiService.getSeries(seriesId);
    return seriesData.data;
};

const getVideoData = async (video) => {
    const videoId = video.video_id;
    const videoResponse = await apiService.getEvent(videoId);
    return videoResponse.data;
};

const getRecipientsData = async (contributor) => {
    const recipients = await apiService.getRecipients(contributor);
    return recipients.data;
};

const createEmails = async (recipientsMap) => {
    for (const [recipient, payload] of recipientsMap) {
        await emailService.sendMail(recipient, payload);
    }
};

const getRecipients = async(series) => {
    let recipients = [];
    for (const contributor of series.contributors) {
        const match = constants.IAM_GROUP_PREFIXES.filter(entry => contributor.includes(entry));
        if (match && match.length > 0) {
            let recipientsByGroup = await getRecipientsData(contributor);
            for (const recipientByGroup of recipientsByGroup.members) {
                recipients.push(recipientByGroup + constants.EMAIL_POSTFIX);
            }
        } else {
            recipients.push(contributor + constants.EMAIL_POSTFIX);
        }
    }
    let uniqueRecipients = [...new Set(recipients)];
    return uniqueRecipients;
};

const isTrashSeries = (series) => series.title.toLowerCase().includes(constants.TRASH);

const populateRecipientsMap = (recipientsMap, recipient, videoData, seriesData, video) => {
    const payload = [];
    const payloadObject = {video : {identifier : videoData.identifier, title: videoData.title, archivedDate: video.archived_date }, series : {title : seriesData.title}};
    if (!recipientsMap.has(recipient)) {
        payload.push(payloadObject);
        recipientsMap.set(recipient, payload);
    } else {
        let payload = recipientsMap.get(recipient);
        payload.push(payloadObject);
        recipientsMap[recipient] = payload;
    }
    return recipientsMap;
};

const getRecipientsMap = async (videos) => {
    let recipientsMap = new Map();
    for (const video of videos.rows) {
        const videoData = await getVideoData(video);
        const seriesData = await getSeriesData(videoData.is_part_of);
        if (videoData && seriesData) {
            if (!isTrashSeries(seriesData)) {
                const recipients = await getRecipients(seriesData);
                for (const recipient of recipients) {
                    recipientsMap = populateRecipientsMap(recipientsMap, recipient, videoData, seriesData, video);
                }
            } else {
                await databaseService.updateSkipEmailStatus(videoData.identifier);
            }
        } else {
            await databaseService.updateSkipEmailStatus(video.video_id);
        }
    }
    return recipientsMap;
};


module.exports = {
    getVideosToSendNotification : queryVideos,
    getSeriesData : getSeriesData,
    getVideoData : getVideoData,
    createEmails: createEmails,
    getRecipientsMap: getRecipientsMap
};

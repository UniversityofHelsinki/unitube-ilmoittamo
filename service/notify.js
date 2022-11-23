const fs = require('fs');
const path = require('path');
const database = require('./database');
const constants = require("../utils/constants");
const apiService = require('./apiService');
const emailService = require('./emailService');
const databaseService = require('./databaseService');

const addMonthsToNotifiedDate = (amountOfMonths) => {
    let notifiedDate = new Date();
    notifiedDate.setFullYear(notifiedDate.getFullYear(), notifiedDate.getMonth() + amountOfMonths);
    return notifiedDate;
};

const addWeeks = (notifiedDate, numberOfWeeks) => {
    notifiedDate.setDate(notifiedDate.getDate() + numberOfWeeks * 7);
    return notifiedDate;
};

const addDays = (notifiedDate, numberOfDays) => {
    notifiedDate.setDate(notifiedDate.getDate() + numberOfDays);
    return notifiedDate;
};

const queryVideos = async (months, weeks, days, startingDate, endingDate) => {
    let selectedVideosToBeNotifiedSQL = null;
    if (months === constants.VIDEO_NOTIFIED_THREE_MONTHS) {
        selectedVideosToBeNotifiedSQL = fs.readFileSync(path.resolve(__dirname, "../sql/getSelectedVideosToBeNotified.sql"), "utf8");
    } else  if (months === constants.VIDEO_NOTIFIED_ONE_MONTH) {
        selectedVideosToBeNotifiedSQL = fs.readFileSync(path.resolve(__dirname, "../sql/getSelectedVideosToBeNotifiedOneMonth.sql"), "utf8");
    } else  if (startingDate !== null && endingDate !== null) {
        selectedVideosToBeNotifiedSQL = fs.readFileSync(path.resolve(__dirname, "../sql/getSelectedVideosToBeNotifiedOneWeek.sql"), "utf8");
    }


    const notifiedDate = addMonthsToNotifiedDate(months);
    let startDate = null;
    let endDate = null;

    if (weeks !== null) {
        startDate = addWeeks(new Date(notifiedDate), -1 * weeks);
        endDate = addWeeks(new Date(notifiedDate), weeks);
    }
    if (days !== null) {
        startDate = addDays(new Date(notifiedDate), -1 * days);
        endDate = addDays(new Date(notifiedDate), days);
    }
    if (startingDate !== null && endingDate !== null) {
        startDate = addDays(new Date(notifiedDate), startingDate);
        endDate = addDays(new Date(notifiedDate), endingDate);
    }
    const notifiedVideos = database.query(selectedVideosToBeNotifiedSQL, [startDate, endDate]);
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
    try {
        const recipients = await apiService.getRecipients(contributor);
        return recipients.data;
    } catch (error) {
      console.log(error, "retrieving contributor : " , contributor);
    }
};

const createEmails = async (recipientsMap) => {
    for (const [recipient, payload] of recipientsMap) {
        await emailService.sendMail(recipient, payload);
    }
};

const getRecipients = async(series) => {
    let recipients = new Map();
    for (const contributor of series.contributors) {
        const match = constants.IAM_GROUP_PREFIXES.filter(entry => contributor.includes(entry));
        if (match && match.length > 0) {
            let recipientsByGroup = await getRecipientsData(contributor);
            if (recipientsByGroup && recipientsByGroup.members && recipientsByGroup.members.length > 0) {
                for (const recipientByGroup of recipientsByGroup.members) {
                    const recipientAddress = recipientByGroup + constants.EMAIL_POSTFIX;
                    if (!recipients.has(recipientAddress)) {
                        let payload = [];
                        payload.push(contributor);
                        recipients.set(recipientAddress, payload);
                    } else {
                        let payload = recipients.get(recipientAddress);
                        payload.push(contributor);
                        recipients[contributor] = payload;
                    }
                }
            }
        } else {
            let recipientAddress = contributor + constants.EMAIL_POSTFIX;
            recipients.set(recipientAddress, []);
        }
    }
    return recipients;
};

const isTrashSeries = (series) => series.title.toLowerCase().includes(constants.TRASH);

const populateRecipientsMap = (recipientsMap, recipientEntry, videoData, seriesData, video) => {
    const payload = [];
    const recipient = recipientEntry[0];
    const iamGroups = recipientEntry[1] ? recipientEntry[1] : [];
    const payloadObject = {video : {identifier : videoData.identifier, title: videoData.title, archivedDate: video.archived_date }, series : {title : seriesData.title}, groups: iamGroups};
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
                for (const recipient of recipients.entries()) {
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
    getRecipientsMap: getRecipientsMap,
    populateRecipientsMap: populateRecipientsMap
};

const fs = require('fs');
const path = require('path');
const database = require('./database');
const constants = require("../utils/constants");
const apiService = require('./apiService');
const emailService = require('./emailService');
const flammaMessageService = require('./flammaMessageService');
const databaseService = require('./databaseService');
const logger = require('../utils/winstonLogger');
const validator = require("email-validator");
const {getRecipientsByUserNames} = require("./apiService");
require("dotenv").config();

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

    return await database.query(selectedVideosToBeNotifiedSQL, [startDate, endDate]);
};

const getSeriesData = async (seriesId) => {
    try {
        const seriesData = await apiService.getSeries(seriesId);
        return seriesData.data;
    } catch (error) {
        logger.error(`${error} retrieving series data with id  : ${seriesId}`);
        throw error;
    }
};

const getVideoData = async (video) => {
    try {
        const videoId = video.video_id;
        const videoResponse = await apiService.getEvent(videoId);
        return videoResponse.data;
    } catch (error) {
        logger.error(`${error} retrieving video data with id  : ${video.video_id}`);
        throw error;
    }
};

const getRecipientsDataFromGroup = async (contributor) => {
    try {
        const recipients = await apiService.getRecipientsFromGroup(contributor);
        return recipients.data;
    } catch (error) {
        logger.error(`${error} retrieving contributor from group : ${contributor}`);
    }
};

const getRecipientsData = async (contributors) => {
    try {
        const recipients = await apiService.getRecipientsByUserNames(contributors);
        return recipients.data;
    } catch (error) {
        logger.error(`${error} retrieving contributors : ${contributors}`);
    }
};

const createEmails = async (recipientsMap) => {
    for (const [recipient, payload] of recipientsMap) {
        if (recipient && validator.validate(recipient)) {
            try {
                await emailService.sendMail(recipient, payload);
            } catch (error) {
                logger.error(`sending email to recipient: ${recipient} failed with error: ${error}`);
            }
        } else {
            logger.error(`incorrect email : ${recipient}`);
        }
    }
};

const createFlammaMessages = async (recipientsMap) => {
    for (const [username, payload] of recipientsMap) {
        if (username && payload) {
            try {
                console.log(`sending message to recipient: ${username}`);
                console.log('running environment:', process.env.RUNNING_ENVIRONMENT)
                if (process.env.RUNNING_ENVIRONMENT === 'production') {
                    await flammaMessageService.sendMessage(username, payload);
                }
            } catch (error) {
                logger.error(`sending message to recipient: ${username} failed with error: ${error}`);
            }
        } else {
            logger.error(`incorrect recipient username : ${username}`);
        }
    }
};

const getRecipientsByGroup = async (contributor, recipients, usernames = false) => {
    let recipientsByGroup = await getRecipientsDataFromGroup(contributor);
    if (recipientsByGroup && recipientsByGroup.members && recipientsByGroup.members.length > 0) {
        for (const recipientByGroup of recipientsByGroup.members) {
            if (recipientByGroup.email && !usernames) {
                const recipientAddress = recipientByGroup.email;
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
            else if (recipientByGroup.username && usernames) {
                const recipientAddress = recipientByGroup.username;
                if (!recipients.has(recipientAddress)) {
                    let payload = [];
                    payload.push(contributor);
                    recipients.set(recipientAddress, payload);
                }
                else {
                    let payload = recipients.get(recipientAddress);
                    payload.push(contributor);
                    recipients[contributor] = payload;
                }

            }
        }
    }
}

const getDirectlyAddedRecipients = async (userNamesAddedDirectly, recipients, usernames = false) => {
    if (userNamesAddedDirectly && userNamesAddedDirectly.length > 0) {
        let directlyAddedRecipientsData = await getRecipientsData(userNamesAddedDirectly);
        if (directlyAddedRecipientsData && directlyAddedRecipientsData.length > 0) {
            for (const directlyAddedRecipientData of directlyAddedRecipientsData) {
                if (usernames) {
                    recipients.set(directlyAddedRecipientData.username, []);
                }
                else {
                    recipients.set(directlyAddedRecipientData.email, []);
                }
            }
        }
    }
}

const getRecipients = async(series, usernames = false) => {
    let recipients = new Map();
    let userNamesAddedDirectly = [];
    for (const contributor of series.contributors) {
        const match = constants.IAM_GROUP_PREFIXES.filter(entry => contributor.includes(entry));
        if (match && match.length > 0) {
            await getRecipientsByGroup(contributor, recipients, usernames);
        } else {
            userNamesAddedDirectly.push(contributor);
        }
    }
    await getDirectlyAddedRecipients(userNamesAddedDirectly, recipients, usernames);
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

const getRecipientsMap = async (videos, usernames = false) => {
    let recipientsMap = new Map();
    for (const video of videos.rows) {
        try {
            const videoData = await getVideoData(video);
            const seriesData = await getSeriesData(videoData.is_part_of);
            if (videoData && seriesData) {
                if (!isTrashSeries(seriesData)) {
                    const recipients = await getRecipients(seriesData, usernames);
                    for (const recipient of recipients.entries()) {
                        recipientsMap = populateRecipientsMap(recipientsMap, recipient, videoData, seriesData, video);
                    }
                } else {
                    await databaseService.updateSkipEmailStatus(videoData.identifier);
                }
            } else {
                await databaseService.updateSkipEmailStatus(video.video_id);
            }
        } catch (error) {
            logger.error(`${error}`);
            await databaseService.updateErrorDate(video.video_id);
            await databaseService.insertErrorLog(404, error.message, video.video_id , null, null, null, null);
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
    populateRecipientsMap: populateRecipientsMap,
    createFlammaMessages: createFlammaMessages
};

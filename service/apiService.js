const constants = require('../utils/constants');
const security = require('./security');
const logger = require('../utils/winstonLogger');

const getEvent = async (videoId) => {
    try {
        const eventsUrl = constants.OPENCAST_EVENTS_PATH + videoId;
        const response = await security.opencastBase.get(eventsUrl);
        return response;
    } catch (error) {
        logger.error(error);
        throw error;
    }
};

const getSeries = async (seriesId) => {
    try {
        const seriesUrl = constants.OPENCAST_SERIES_PATH + seriesId;
        const response = await security.opencastBase.get(seriesUrl);
        return response;
    } catch (error) {
        logger.error(error);
        throw error;
    }
};

const getRecipientsFromGroup = async (groupUid) => {
    try {
        const membersUrl = constants.IAM_GROUPS_PATH_PREFIX + groupUid + constants.IAM_GROUPS_PATH_POSTFIX;
        const response = await security.iamGroupsBase(membersUrl);
        return response;
    } catch (error) {
        logger.error(error);
        throw error;
    }
};

const getRecipientsByUserNames = async (contributors) => {
    try {
        const membersUrl = constants.IAM_ACCOUNT_EMAIL;
        const response = await security.iamGroupsBase.post(membersUrl, contributors);
        return response;
    } catch (error) {
        logger.error(error);
        throw error;
    }
};

module.exports = {
    getEvent : getEvent,
    getSeries : getSeries,
    getRecipientsFromGroup : getRecipientsFromGroup,
    getRecipientsByUserNames : getRecipientsByUserNames
};


const constants = require('../utils/constants');
const security = require('./security');

const getEvent = async (videoId) => {
    try {
        const eventsUrl = constants.OPENCAST_EVENTS_PATH + videoId;
        const response = await security.opencastBase.get(eventsUrl);
        return response;
    } catch (error) {
        throw error;
    }
};

const getSeries = async (seriesId) => {
    try {
        const seriesUrl = constants.OPENCAST_SERIES_PATH + seriesId;
        const response = await security.opencastBase.get(seriesUrl);
        return response;
    } catch (error) {
        throw error;
    }
};

const getRecipients = async (groupUid) => {
    try {
        const membersUrl = constants.IAM_GROUPS_PATH_PREFIX + groupUid + constants.IAM_GROUPS_PATH_POSTFIX;
        console.log(membersUrl);
        const response = await security.iamGroupsBase(membersUrl);
        return response;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getEvent : getEvent,
    getSeries : getSeries,
    getRecipients : getRecipients
};


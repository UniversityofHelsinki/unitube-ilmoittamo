const constants = require('../utils/constants');
const security = require('./security');

exports.getEvent = async (videoId) => {
    try {
        const eventsUrl = constants.OPENCAST_EVENTS_PATH + videoId;
        const response = await security.opencastBase.get(eventsUrl);
        return response;
    } catch (error) {
        throw error;
    }
};

exports.getSeries = async (seriesId) => {
    try {
        const seriesUrl = constants.OPENCAST_SERIES_PATH + seriesId;
        const response = await security.opencastBase.get(seriesUrl);
        console.log(response);
        return response;
    } catch (error) {
        throw error;
    }
}


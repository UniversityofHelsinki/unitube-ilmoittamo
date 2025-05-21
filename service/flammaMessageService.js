const logger = require("../utils/winstonLogger");
const databaseService = require('./databaseService');
const constants = require("../utils/constants");
const security = require("./security");
require("dotenv").config();

const getFlammaMessage = async (headingFI) => {
    let response = await databaseService.getFlammaMessageTemplate(headingFI);
    if (response && response.rows) {
        return response.rows[0];
    }
    return null;
};

const parseMessageTemplate = (messageTemplate, expiringVideosList, footer) => {
    if (!messageTemplate || !expiringVideosList || !footer) {
        return messageTemplate;
    }
    return `${messageTemplate}\n\n${expiringVideosList}\n\n${footer}`;

};

exports.sendMessage = async (recipient, payload) => {
    try {
        let flammaMessage = await getFlammaMessage(constants.FLAMMA_MESSAGE_HEADING);

        let expiringVideosList = "";
        const videoGroups = [];
        const videos = [];

        for (const item of payload) {
            let iamGroups = [];
            if (item.groups && item.groups.length > 0) {
                for (const group of item.groups) {
                    iamGroups.push(group);
                }
            }

            let uniqueGroups = [...new Set(iamGroups)];
            let groups = "";

            if (uniqueGroups && uniqueGroups.length > 0) {
                for (const group of uniqueGroups) {
                    groups += group + ", ";
                }
            }
            if (groups.indexOf(", ", groups.length - 2) !== -1) {
                groups = groups.substring(0, groups.length - 2);
            }

            videoGroups.push({ title: item.series.title, groups });
            videos.push({
                title: item.series.title,
                video: `– ${item.video.title} (${item.video.archivedDate})`,
            });
        }

        videos.sort((a, b) => (a.title > b.title ? 1 : b.title > a.title ? -1 : 0));
        videoGroups.sort((a, b) => (a.title > b.title ? 1 : b.title > a.title ? -1 : 0));
        let videoDataTitle = '';

        videos.forEach((videoData, index) => {
            if (videoDataTitle !== videoData.title) {
                const filteredArray = videoGroups.filter(
                    (item) => item.title === videoData.title
                );
                const uniqueGroups = [...new Set(filteredArray.map(item => item.groups))];
                if (uniqueGroups[0].length === 0) {
                    expiringVideosList += `\n${videoData.title}:\n`;
                } else {
                    expiringVideosList += `\n${videoData.title} (${uniqueGroups}):\n`;
                }
                expiringVideosList += `${videoData.video}\n`;
            } else if (videoDataTitle === videoData.title) {
                expiringVideosList += `${videoData.video}\n`;
            }

            if (index < videos.length - 1) {
                expiringVideosList += ", ";
            } else {
                expiringVideosList += ".";
            }

            videoDataTitle = videoData.title;
        });

        const {
            headingfi,
            headingsv,
            headingen,
            messagefi,
            messagesv,
            messageen,
            linktextfi,
            linktextsv,
            linktexten,
            linkurlfi,
            linkurlsv,
            linkurlen,
        } = flammaMessage;

        const messageBody = {
            headingFI: headingfi,
            headingSV: headingsv,
            headingEN: headingen,
            messageFI: parseMessageTemplate(messagefi, expiringVideosList, constants.FLAMMA_MESSAGE_FOOTER_FI),
            messageSV: parseMessageTemplate(messagesv, expiringVideosList, constants.FLAMMA_MESSAGE_FOOTER_SV),
            messageEN: parseMessageTemplate(messageen, expiringVideosList, constants.FLAMMA_MESSAGE_FOOTER_EN),
            linkTextFI: linktextfi,
            linkTextSV: linktextsv,
            linkTextEN: linktexten,
            linkUrlFI: linkurlfi,
            linkUrlSV: linkurlsv,
            linkUrlEN: linkurlen,
            recipients: [`${recipient}@helsinki.fi`]
        }

        const response = await security.flammaMessageBase.post('/post', messageBody);
        logger.info(`Flamma message sent to ${recipient}`);
        return response.data;

    } catch (error) {
        logger.error(`error sending Flamma message: ${error.message}`);
        throw error;
    }
};

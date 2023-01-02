const axios = require('axios');
const logger = require("../utils/winstonLogger");
const databaseService = require('./databaseService');
const constants = require("../utils/constants");
require("dotenv").config();

const getExpiringMessage = async (name) => {
    let response = await databaseService.getEmailTemplate(name);
    if (response && response.rows) {
        return response.rows[0];
    } else {
        return null;
    }
}

exports.sendMail = async (recipient, payload) => {
    let videos = [];
    let videoGroups = [];
    const mailPath = process.env.ILMOITTAMO_EMAIL_SENDER_HOST + '/api/send';
    let expiringMessage = await getExpiringMessage(constants.EXPIRATIONMESSAGE);
    let header = null;
    let footer = null;
    let subject = null;
    if (expiringMessage) {
        header = expiringMessage.header_fi;
        header += '\n\n' + expiringMessage.header_sv;
        header += '\n\n' + expiringMessage.header_en;
        footer = expiringMessage.footer_fi;
        footer += '\n\n' + expiringMessage.footer_sv;
        footer += '\n\n' + expiringMessage.footer_en;
        subject = expiringMessage.subject;
    }
    let message = header +  '\n';
    for (const email of payload) {
        let iamGroups = [];
        if (email.groups && email.groups.length > 0) {
            for (const group of email.groups) {
                iamGroups.push(group);
            }
        }

        let uniqueGroups = [...new Set(iamGroups)];
        let groups = "";
        if (uniqueGroups && uniqueGroups.length > 0) {
            for (const group of uniqueGroups) {
                groups += group + ",";
            }
        }
        if (groups.indexOf(",", groups.length - 1) !== -1) {
            groups = groups.substring(0, groups.length - 1);
        }
        videoGroups.push({ title: email.series.title, groups });
        videos.push({
            title: email.series.title,
            video:
                "-" + email.video.title + " | voimassaolo päättyy / expires on / går ut " + email.video.archivedDate,
        });
    }
    videos.sort((a, b) => (a.title > b.title ? 1 : b.title > a.title ? -1 : 0));
    videoGroups.sort((a, b) => a.title > b.title ? 1 : b.title > a.title ? -1 : 0);
    let videoDataTitle = '';

    videos.forEach((videoData) => {
        if (videoDataTitle !== videoData.title) {
            let filteredArray = videoGroups.filter(
                (item) => item.title === videoData.title
            );
            const uniqueGroups = [...new Set(filteredArray.map(item => item.groups))];
            message += "\n" + videoData.title + " (" + uniqueGroups + "):\n";
            message += videoData.video + "\n";
        } else if (videoDataTitle === videoData.title) {
            message += videoData.video + "\n";
        }
        videoDataTitle = videoData.title;
    });
    message += '\n' + footer;
    const response = await axios.post(mailPath,  {
        to: recipient,
        sub: subject,
        body: message
    });
    logger.info(`mail sent to ${recipient}`);
    return response.data;
};


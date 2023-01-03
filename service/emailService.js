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
    let part_fi = null;
    let part_sv = null;
    let part_en = null;
    let subject = null;
    if (expiringMessage) {
        part_fi = expiringMessage.header_fi;
        part_sv = expiringMessage.header_sv;
        part_en = expiringMessage.header_en;
        subject = expiringMessage.subject;
    }
    let message = "";
    let expiringVideosList = "";
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
                "– " + email.video.title + " (" + email.video.archivedDate + ")",
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
            if (uniqueGroups[0].length === 0) {
                expiringVideosList += "\n" + videoData.title + ":\n";
            } else {
                expiringVideosList += "\n" + videoData.title + " (" + uniqueGroups + "):\n";
            }
            expiringVideosList += videoData.video + "\n";
        } else if (videoDataTitle === videoData.title) {
            expiringVideosList += videoData.video + "\n";
        }
        videoDataTitle = videoData.title;
    });

    part_fi += '\n' + expiringVideosList + '\n' + expiringMessage.footer_fi;
    part_sv += '\n' + expiringVideosList + '\n' + expiringMessage.footer_sv;
    part_en += '\n' + expiringVideosList + '\n' + expiringMessage.footer_en;
    message += part_fi + '\n\n' + part_sv + '\n\n' + part_en;

    const response = await axios.post(mailPath,  {
        to: recipient,
        sub: subject,
        body: message
    });
    logger.info(`mail sent to ${recipient}`);
    return response.data;
};


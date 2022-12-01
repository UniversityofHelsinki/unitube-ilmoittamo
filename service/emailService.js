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
    const mailPath = process.env.ILMOITTAMO_EMAIL_SENDER_HOST + '/api/send';
    let expiringMessage = await getExpiringMessage(constants.EXPIRATIONMESSAGE);
    let header = null;
    let footer = null;
    if (expiringMessage) {
        header = expiringMessage.header_fi;
        footer = expiringMessage.footer_fi;
    }
    let iamGroups = [];
    let message = header +  '\n';//'Hyvä vastaanottaja, ' + 'sinulla on vanhenevia videoita: ' + '\n';
    for (const email of payload) {
        //message += 'video: ' + email.video.title + ' sarjasta: ' + email.series.title + ' vanhentuu ' + email.video.archivedDate + '\n';
        message += '\n' + email.series.title + '(';

        if (email.groups && email.groups.length > 0) {
            for (const group of email.groups) {
                iamGroups.push(group);
            }
        }

        let uniqueGroups = [...new Set(iamGroups)];

        if (uniqueGroups && uniqueGroups.length > 0) {
            for (const group of uniqueGroups) {
                //message += 'Tunnuksesi on lisätty Unitubessa hallinnoijaksi seuraaviin ryhmiin: ' + '\n' + group + '\n';
                message += group + ',';
            }
        }
        if (message.indexOf(',', message.length - 1) !== -1) {
            message = message.substring(0, message.length - 1);
        }
        message += '):\n-' + email.video.title + ' | voimassaolo päättyy / expires on / föråldras ' + email.video.archivedDate + '\n';
    }

    //message += 'Mene https://lataamo.helsinki.fi ja tee jotain.';
    message += '\n' + footer;
    const response = await axios.post(mailPath,  {
        to: recipient,
        sub: 'Vanheneva tallenne Unitubessa',
        body: message
    });
    logger.info(`mail sent to ${recipient}`);
    return response.data;
};


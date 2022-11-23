const axios = require('axios');
const logger = require("../utils/winstonLogger");
require("dotenv").config();

exports.sendMail = async (recipient, payload) => {
    const mailPath = process.env.ILMOITTAMO_EMAIL_SENDER_HOST  + '/api/send';
    let message = 'Hyvä vastaanottaja, ' + 'sinulla on vanhenevia videoita : ' + '\n';
    for (const email of payload) {
        message += 'video: ' + email.video.title + ' sarjasta : ' + email.series.title + ' vanhentuu ' + email.video.archivedDate + '\n';
    }
    message += 'Mene https://lataamo.helsinki.fi ja tee jotain.';
    const response = await axios.post(mailPath,  {
        to: recipient,
        sub: 'Vanheneva tallenne Unitubessa',
        body: message
    });
    logger.info('mail sent to ', recipient);
    return response.data;
};


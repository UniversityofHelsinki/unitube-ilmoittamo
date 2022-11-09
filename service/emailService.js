const axios = require('axios'); // https://www.npmjs.com/package/axios
require("dotenv").config();

exports.sendMail = async (recipient, payload) => {
    const mailPath = process.env.ILMOITTAMO_EMAIL_SENDER_HOST  + '/api/send';
    let message = 'Hyvä ' + recipient + ' sinulla on vanhenevia videoita : ' + '\n';
    for (const email of payload) {
        message += 'video: ' + email.video.title + ' sarjasta : ' + email.series.title + ' vanhentuu ' + email.video.archivedDate + '\n';
    }
    message += 'Mene https://lataamo.helsinki.fi ja tee jotain.';
    const response = await axios.post(mailPath,  {
        to: recipient,
        sub: 'Vanheneva tallenne Unitubessa',
        body: message
    });
    return response.data;
};


const axios = require('axios'); // https://www.npmjs.com/package/axios
require("dotenv").config();

exports.sendMail = async (recipient, payload) => {
    const mailPath = process.env.ILMOITTAMO_EMAIL_SENDER_HOST  + '/api/send';
    let iamGroups = [];
    let message = 'Hyvä vastaanottaja, ' + 'sinulla on vanhenevia videoita : ' + '\n';
    for (const email of payload) {
        message += 'video: ' + email.video.title + ' sarjasta : ' + email.series.title + ' vanhentuu ' + email.video.archivedDate + '\n';
        if (email.groups && email.groups.length > 0) {
            for (const group of email.groups) {
                iamGroups.push(group);
            }
        }
    }

    let uniqueGroups = [...new Set(iamGroups)];

    if (uniqueGroups && uniqueGroups.length > 0) {
        for (const group of uniqueGroups) {
            message += 'Tunnuksesi on lisätty Unitubessa hallinnoijaksi seuraaviin ryhmiin: ' + '\n' + group + '\n';
        }
    }

    message += 'Mene https://lataamo.helsinki.fi ja tee jotain.';
    const response = await axios.post(mailPath,  {
        to: recipient,
        sub: 'Vanheneva tallenne Unitubessa',
        body: message
    });
    return response.data;
};


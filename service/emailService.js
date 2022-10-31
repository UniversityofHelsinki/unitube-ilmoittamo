const axios = require('axios'); // https://www.npmjs.com/package/axios
require("dotenv").config();

exports.sendMail = async (to, series, video, archivedate) => {
    const mailPath = process.env.ILMOITTAMO_EMAIL_SENDER_HOST  + '/api/send';
    console.log(mailPath);
    const message = 'Hyvä ' + to + ', videosi '+ video + ' sarjasta ' + series + ' vanhentuu ' + archivedate + '. Mene https://lataamo.helsinki.fi ja tee jotain.';
    const response = await axios.post(mailPath,  {
        to: to,
        sub: 'Vanheneva tallenne Unitubessa',
        body: message
    });
    return response.data;
};


const adminHost = process.env.ILMOITTAMO_OPENCAST_HOST;
const emailServiceHost = process.env.ILMOITTAMO_EMAIL_SENDER_HOST;
const username = process.env.ILMOITTAMO_OPENCAST_USER;
const password = process.env.ILMOITTAMO_OPENCAST_PASS;
const iamGroupsHost = process.env.IAM_GROUPS_HOST;
const iamGroupsApiKey = process.env.IAM_GROUPS_API_KEY;
const meceMessageHost = process.env.MECE_MESSAGE_HOST;
const meceApiKey = process.env.MECE_HOST_API_KEY;
const userpass = Buffer.from(`${username}:${password}`).toString('base64');
const auth = `Basic ${userpass}`;
const axios = require('axios');

const emailServiceBase = axios.create({
    baseURL :emailServiceHost
});

const opencastBase = axios.create({
    baseURL: adminHost,
    headers: {'authorization': auth}
});

const iamGroups = axios.create({
    baseURL: iamGroupsHost,
    headers: {'X-Api-Key': iamGroupsApiKey, 'Content-Type': 'application/json;charset=utf-8'},
});

const flammaMessage = axios.create({
    baseURL: meceMessageHost,
    headers: {'X-Api-Key': meceApiKey, 'Content-Type': 'application/json;charset=utf-8'},
});

module.exports = {
    opencastBase : opencastBase,
    iamGroupsBase : iamGroups,
    emailServiceBase : emailServiceBase,
    flammaMessageBase : flammaMessage
};

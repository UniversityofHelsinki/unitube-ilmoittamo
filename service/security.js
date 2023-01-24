const adminHost = process.env.ILMOITTAMO_OPENCAST_HOST;
const username = process.env.ILMOITTAMO_OPENCAST_USER;
const password = process.env.ILMOITTAMO_OPENCAST_PASS;
const iamGroupsHost = process.env.IAM_GROUPS_HOST;
const iamGroupsApiKey = process.env.IAM_GROUPS_API_KEY;
const userpass = Buffer.from(`${username}:${password}`).toString('base64');
const auth = `Basic ${userpass}`;
const axios = require('axios');

const opencastBase = axios.create({
    baseURL: adminHost,
    headers: {'authorization': auth},
    validateStatus: () => { // https://github.com/axios/axios/issues/1143
        return true;        // without this axios might throw error on non 200 responses
    }
});

const iamGroups = axios.create({
    baseURL: iamGroupsHost,
    headers: {'X-Api-Key': iamGroupsApiKey, 'Content-Type': 'application/json;charset=utf-8'},
});

module.exports = {
    opencastBase : opencastBase,
    iamGroupsBase : iamGroups
};

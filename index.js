'use strict';
require("dotenv").config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const helmet = require('helmet');
const compression = require('compression');
const database = require('./service/database');
const cronThreeMonths = require('./service/cronThreeMonths');
const cronOneMonth = require('./service/cronOneMonth');
const cronOneWeek = require('./service/cronOneWeek');

const ipaddress = process.env.OPENSHIFT_NODEJS_IP || 'localhost';
const port = process.env.OPENSHIFT_NODEJS_PORT || 3002;

app.use(compression());
app.use(helmet());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/cronThreeMonths', async(req, res) => {
    await cronThreeMonths.runThreeMonthsJob();
    res.send('Three Months Job Executed');
});

app.get('/cronOneMonth', async(req, res) => {
    await cronOneMonth.runOneMonthJob();
    res.send('One Month Job Executed');
});

app.get('/cronOneWeek', async(req, res) => {
    await cronOneWeek.runOneWeekJob();
    res.send('One Week Job Executed');
});

database.query('SELECT NOW()', (err, res) => {
    console.log(err ? "errors: " + err : 'Postgres client connected ' , res.rows[0]);
});

app.listen(port, ipaddress, () => {
    console.log( 'Listening on ' + ipaddress + ', port ' + port );
});


(async () => {
    // START CRONJOB
    await cronThreeMonths.cronJobThreeMonths
    await cronOneMonth.cronJobOneMonth;
    await cronOneWeek.cronJobOneWeek;
})();

module.exports = app;

const cron = require("node-cron");
const notify = require('./notify');

cronJob = cron.schedule(process.env.CRON_START_TIME, async() => {
    console.log('Run CronJob job daily at ', process.env.CRON_START_TIME);
    const videosToArchive = await notify.getVideosToArchive();
    for(const video of videosToArchive.rows) {
        const seriesData = await notify.getSeriesData(video);
    }
});

module.exports.cronJob = cronJob;

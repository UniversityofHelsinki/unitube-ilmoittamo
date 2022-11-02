const cron = require("node-cron");
const notify = require('./notify');
const databaseService = require('./databaseService');

cronJob = cron.schedule(process.env.CRON_START_TIME, async() => {
    console.log('Run CronJob job daily at ', process.env.CRON_START_TIME);
    const videosToArchive = await notify.getVideosToArchive();
    for(const video of videosToArchive.rows) {
        const videoData = await notify.getVideoData(video);
        if (videoData.status == 200) {
            const seriesData = await notify.getSeriesData(videoData.data.is_part_of);
            await notify.createEmails(seriesData, video.archived_date, videoData);
            await databaseService.updateNotificationSentAt(video.video_id);
        }
    }
});

module.exports.cronJob = cronJob;

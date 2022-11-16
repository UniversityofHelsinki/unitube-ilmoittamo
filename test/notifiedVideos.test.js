const notify = require('../service/notify');
const apiService = require('../service/apiService');
require('../service/timer');
const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, '../.env')});
const client = require('../service/database');
const Pool = require('pg-pool');
const constants = require("../utils/constants");

beforeAll(async () => {
    const pool = new Pool({
        user: process.env.POSTGRES_USER,
        host: process.env.HOST,
        database: process.env.DATABASE,
        password: process.env.PASSWORD,
        port: process.env.PORT,
        ssl: process.env.SSL ? true : false,
        max: 1, // Reuse the connection to make sure we always hit the same temporal schema
        idleTimeoutMillis: 0 // Disable auto-disconnection of idle clients to make sure we always hit the same temporal schema
    });

    client.query = (text, values) => {
        return pool.query(text, values);
    };
});

beforeEach(async () => {
    await client.query('CREATE TEMPORARY TABLE videos(video_id VARCHAR(255) NOT NULL, archived_date date, actual_archived_date date, deletion_date date, video_creation_date date, error_date date, first_notification_sent_at timestamp, second_notification_sent_at timestamp, third_notification_sent_at timestamp, skip_email boolean default false, PRIMARY KEY(video_id))');
    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date) VALUES (\'e8a86433-0245-44b8-b0d7-69f6578bac6f\', \'2022-12-01\'::date, \'2008-01-01\'::date)');
    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date) VALUES (\'a637b33c-56a1-11ed-9b6a-0242ac120001\', \'2023-02-01\'::date, \'2009-01-01\'::date)');
    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date) VALUES (\'a637b65c-56a1-11ed-9b6a-0242ac120002\', \'2023-02-16\'::date, \'2010-01-01\'::date)');
    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date) VALUES (\'a637b7ba-56a1-11ed-9b6a-0242ac120003\', \'2023-02-09\'::date, \'2011-01-01\'::date)');
    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date) VALUES (\'a637b8dc-56a1-11ed-9b6a-0242ac120004\', \'2023-01-28\'::date, \'2012-01-01\'::date)');
    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date, skip_email) VALUES (\'a637b8dc-56a1-11ed-9b6a-0242ac120005\', \'2023-01-28\'::date, \'2012-01-01\'::date, true)');

    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date) VALUES (\'499c9d5e-64de-11ed-9022-0242ac120002\', \'2022-11-01\'::date, \'2008-01-01\'::date)');
    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date) VALUES (\'499ca394-64de-11ed-9022-0242ac120002\', \'2022-11-01\'::date, \'2009-01-01\'::date)');
    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date) VALUES (\'499ca72c-64de-11ed-9022-0242ac120002\', \'2022-12-16\'::date, \'2010-01-01\'::date)');
    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date) VALUES (\'499cacea-64de-11ed-9022-0242ac120002\', \'2022-12-15\'::date, \'2011-01-01\'::date)');
    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date) VALUES (\'499cb140-64de-11ed-9022-0242ac120002\', \'2022-11-28\'::date, \'2012-01-01\'::date)');
    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date, skip_email) VALUES (\'499cb55a-64de-11ed-9022-0242ac120002\', \'2022-11-28\'::date, \'2012-01-01\'::date, true)');

});

afterEach(async () => {
    await client.query('DROP TABLE IF EXISTS pg_temp.videos');
});

afterAll(async () => {
    jest.clearAllMocks();
});

describe('Video 3 months tests', () => {

    it('Should Return Two Videos To Be Notified', async () => {
        const videos = await notify.getVideosToSendNotification(constants.VIDEO_NOTIFIED_THREE_MONTHS, constants.VIDEO_NOTIFIED_INTERVAL_ONE_WEEK, null);
        expect(videos.rows).toHaveLength(2);
    });

    it('First Video Should Have Correct Archived Dates And IDs', async () => {
        const videos = await notify.getVideosToSendNotification(constants.VIDEO_NOTIFIED_THREE_MONTHS, constants.VIDEO_NOTIFIED_INTERVAL_ONE_WEEK, null);
        const firstVideoArchivedDate = videos.rows[0].archived_date;
        const expectedArchivedDate = '16.02.2023';
        expect(firstVideoArchivedDate).toEqual(expectedArchivedDate);
        expect(videos.rows[0].video_id).toEqual('a637b65c-56a1-11ed-9b6a-0242ac120002');
    });

    it('Second Video Should Have Correct Archived Dates And IDs', async () => {
        const videos = await notify.getVideosToSendNotification(constants.VIDEO_NOTIFIED_THREE_MONTHS, constants.VIDEO_NOTIFIED_INTERVAL_ONE_WEEK, null);
        const secondVideoArchivedDate = videos.rows[1].archived_date;
        const expectedSecondVideosArchivedDate = '09.02.2023';
        expect(secondVideoArchivedDate).toEqual(expectedSecondVideosArchivedDate);
        expect(videos.rows[1].video_id).toEqual('a637b7ba-56a1-11ed-9b6a-0242ac120003');
    });

    it('should have first_notification_sent_at set after notification is sent', async () => {
        const videos = await notify.getVideosToSendNotification(constants.VIDEO_NOTIFIED_THREE_MONTHS, constants.VIDEO_NOTIFIED_INTERVAL_ONE_WEEK, null);

    });

});


describe('Video onr month tests', () => {

    it('Should Return Two Videos To Be Notified', async () => {
        const videos = await notify.getVideosToSendNotification(constants.VIDEO_NOTIFIED_ONE_MONTH, null, constants.VIDEO_NOTIFIED_INTERVAL_THREE_DAYS);
        expect(videos.rows).toHaveLength(2);
    });

    it('First Video Should Have Correct Archived Dates And IDs', async () => {
        const videos = await notify.getVideosToSendNotification(constants.VIDEO_NOTIFIED_ONE_MONTH, null, constants.VIDEO_NOTIFIED_INTERVAL_THREE_DAYS);
        const firstVideoArchivedDate = videos.rows[0].archived_date;
        const expectedArchivedDate = '16.12.2022';
        expect(firstVideoArchivedDate).toEqual(expectedArchivedDate);
        expect(videos.rows[0].video_id).toEqual('499ca72c-64de-11ed-9022-0242ac120002');
    });

    it('Second Video Should Have Correct Archived Dates And IDs', async () => {
        const videos = await notify.getVideosToSendNotification(constants.VIDEO_NOTIFIED_ONE_MONTH, null, constants.VIDEO_NOTIFIED_INTERVAL_THREE_DAYS);
        const secondVideoArchivedDate = videos.rows[1].archived_date;
        const expectedSecondVideosArchivedDate = '15.12.2022';
        expect(secondVideoArchivedDate).toEqual(expectedSecondVideosArchivedDate);
        expect(videos.rows[1].video_id).toEqual('499cacea-64de-11ed-9022-0242ac120002');
    });

    it('should have first_notification_sent_at set after notification is sent', async () => {
        const videos = await notify.getVideosToSendNotification(constants.VIDEO_NOTIFIED_ONE_MONTH, null, constants.VIDEO_NOTIFIED_INTERVAL_THREE_DAYS);

    });

});


jest.mock('../service/apiService');

test('series metadata is returned', async () => {

    const videoId = 'e8a86433-0245-44b8-b0d7-69f6578bac6f';
    const seriesId = 'e8a86433-0245-44b8-b0d7-69f6578bac6f';

    apiService.getEvent.mockResolvedValue({
        status: 200,
        data: {
            identifier: 'e8a86433-0245-44b8-b0d7-69f6578bac6f',
            is_part_of: '0345f162-9bbe-48fe-bd6f-f061a3300485'
        }
    });
    apiService.getSeries.mockResolvedValue({
        status: 200,
        data: {
            identifier: 'e8a86433-0245-44b8-b0d7-69f6578bac6f',
            contributors: ['seppo']
        }
    });

    const videoMetadata = await notify.getVideoData(videoId);
    const seriesMetadata = await notify.getSeriesData(videoMetadata.is_part_of);
    expect(seriesMetadata.identifier).toBe(seriesId);
    expect(seriesMetadata.contributors).toContain('seppo');
});









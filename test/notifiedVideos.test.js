const notify = require('../service/notify');
const apiService = require('../service/apiService');
require('../service/timer');
const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, '../.env')});
const client = require('../service/database');
const Pool = require('pg-pool');
const { getNotifiedDate } = require("../service/notify");
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
    await client.query('CREATE TEMPORARY TABLE videos(video_id VARCHAR(255) NOT NULL, archived_date date, actual_archived_date date, deletion_date date, informed_date date, video_creation_date date, error_date date, notification_sent_at timestamp, skip_email boolean default false, PRIMARY KEY(video_id))');
    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date) VALUES (\'e8a86433-0245-44b8-b0d7-69f6578bac6f\', current_date + interval \'3 months\' - INTERVAL \'30 DAY\', \'2008-01-01\'::date)');
    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date) VALUES (\'a637b33c-56a1-11ed-9b6a-0242ac120001\', current_date + interval \'3 months\' - INTERVAL \'14 DAY\', \'2009-01-01\'::date)');
    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date) VALUES (\'a637b65c-56a1-11ed-9b6a-0242ac120002\', current_date + interval \'3 months\' - INTERVAL \'7 DAY\', \'2010-01-01\'::date)');
    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date) VALUES (\'a637b7ba-56a1-11ed-9b6a-0242ac120003\', current_date + interval \'3 months\' + INTERVAL \'7 DAY\', \'2011-01-01\'::date)');
    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date) VALUES (\'a637b8dc-56a1-11ed-9b6a-0242ac120004\', current_date + interval \'3 months\' + INTERVAL \'14 DAY\', \'2012-01-01\'::date)');
    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date, skip_email) VALUES (\'a637b8dc-56a1-11ed-9b6a-0242ac120005\', current_date + interval \'3 months\' + INTERVAL \'30 DAY\', \'2012-01-01\'::date, true)');

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
        const videos = await notify.getVideosToSendNotification();
        expect(videos.rows).toHaveLength(2);
    });

    it('First Video Should Have Correct Archived Dates And IDs', async () => {
        const videos = await notify.getVideosToSendNotification();
        const firstVideoArchivedDate = videos.rows[0].archived_date;

        let notifiedDate = new Date();
        notifiedDate.setFullYear(notifiedDate.getFullYear(), notifiedDate.getMonth() + constants.DEFAULT_VIDEO_NOTIFIED_MONTH_AMOUNT);
        notifiedDate.setDate(notifiedDate.getDate() - 7);
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };

        expect(firstVideoArchivedDate).toEqual(notifiedDate.toLocaleDateString('fi-FI', options));
        expect(videos.rows[0].video_id).toEqual('a637b65c-56a1-11ed-9b6a-0242ac120002');
    });

    it('Second Video Should Have Correct Archived Dates And IDs', async () => {
        const videos = await notify.getVideosToSendNotification();
        const secondVideoArchivedDate = videos.rows[1].archived_date;

        let notifiedDate = new Date();
        notifiedDate.setFullYear(notifiedDate.getFullYear(), notifiedDate.getMonth() + constants.DEFAULT_VIDEO_NOTIFIED_MONTH_AMOUNT);
        notifiedDate.setDate(notifiedDate.getDate() + 7);
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };

        expect(secondVideoArchivedDate).toEqual(notifiedDate.toLocaleDateString('fi-FI', options));
        expect(videos.rows[1].video_id).toEqual('a637b7ba-56a1-11ed-9b6a-0242ac120003');
    });

    it('should have notification_sent_at set after notification is sent', async () => {
        const videos = await notify.getVideosToSendNotification();

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









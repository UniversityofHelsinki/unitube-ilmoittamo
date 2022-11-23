const notify = require('../service/notify');
const apiService = require('../service/apiService');
require('../service/timer');
const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, '../.env')});
const client = require('../service/database');
const Pool = require('pg-pool');
//const { getNotifiedDate } = require("../service/notify");
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

    client.end = () => {
        return pool.end();
    };

    client.query = (text, values) => {
        return pool.query(text, values);
    };
});

beforeEach(async () => {
    await client.query('CREATE TEMPORARY TABLE videos(video_id VARCHAR(255) NOT NULL, archived_date date, actual_archived_date date, deletion_date date, video_creation_date date, error_date date, first_notification_sent_at timestamp, second_notification_sent_at timestamp, third_notification_sent_at timestamp, skip_email boolean default false, PRIMARY KEY(video_id))');
    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date) VALUES (\'e8a86433-0245-44b8-b0d7-69f6578bac6f\', current_date + interval \'3 months\' - INTERVAL \'30 DAY\', \'2008-01-01\'::date)');
    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date) VALUES (\'a637b33c-56a1-11ed-9b6a-0242ac120001\', current_date + interval \'3 months\' - INTERVAL \'14 DAY\', \'2009-01-01\'::date)');
    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date) VALUES (\'a637b65c-56a1-11ed-9b6a-0242ac120002\', current_date + interval \'3 months\' - INTERVAL \'7 DAY\', \'2010-01-01\'::date)');
    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date) VALUES (\'a637b7ba-56a1-11ed-9b6a-0242ac120003\', current_date + interval \'3 months\' + INTERVAL \'7 DAY\', \'2011-01-01\'::date)');
    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date) VALUES (\'a637b8dc-56a1-11ed-9b6a-0242ac120004\', current_date + interval \'3 months\' + INTERVAL \'14 DAY\', \'2012-01-01\'::date)');
    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date, skip_email) VALUES (\'a637b8dc-56a1-11ed-9b6a-0242ac120005\', current_date + interval \'3 months\' + INTERVAL \'30 DAY\', \'2012-01-01\'::date, true)');
    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date, first_notification_sent_at) VALUES (\'499c9d5e-64de-11ed-9022-0242ac120002\', current_date + interval \'1 months\' + INTERVAL \'-10 DAY\', \'2008-01-01\'::date, \'2008-01-01\'::date)');
    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date, first_notification_sent_at) VALUES (\'499ca394-64de-11ed-9022-0242ac120002\', current_date + interval \'1 months\' + INTERVAL \'-8 DAY\', \'2009-01-01\'::date, \'2008-01-01\'::date)');
    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date, first_notification_sent_at) VALUES (\'499ca72c-64de-11ed-9022-0242ac120002\', current_date + interval \'1 months\' + INTERVAL \'3 DAY\', \'2010-01-01\'::date, \'2008-01-01\'::date)');
    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date, first_notification_sent_at) VALUES (\'499cacea-64de-11ed-9022-0242ac120002\', current_date + interval \'1 months\' + INTERVAL \'-1 DAY\', \'2011-01-01\'::date, \'2008-01-01\'::date)');
    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date, first_notification_sent_at) VALUES (\'499cb140-64de-11ed-9022-0242ac120002\', current_date + interval \'1 months\' + INTERVAL \'4 DAY\', \'2012-01-01\'::date, \'2008-01-01\'::date)');
    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date, skip_email, first_notification_sent_at) VALUES (\'499cb55a-64de-11ed-9022-0242ac120002\', current_date + interval \'1 months\' + INTERVAL \'-4 DAY\', \'2012-01-01\'::date, true, \'2008-01-01\'::date)');

    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date, first_notification_sent_at, second_notification_sent_at) VALUES (\'fa57e6f0-663f-11ed-9022-0242ac120002\', current_date + INTERVAL \'10 DAY\', \'2008-01-01\'::date, \'2008-01-01\'::date, \'2008-01-01\'::date)');
    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date, first_notification_sent_at, second_notification_sent_at) VALUES (\'fa57ebbe-663f-11ed-9022-0242ac120002\', current_date + INTERVAL \'5 DAY\', \'2009-01-01\'::date, \'2008-01-01\'::date, \'2008-01-01\'::date)');
    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date, first_notification_sent_at, second_notification_sent_at) VALUES (\'fa57ee34-663f-11ed-9022-0242ac120002\', current_date + INTERVAL \'9 DAY\', \'2010-01-01\'::date, \'2008-01-01\'::date, \'2008-01-01\'::date)');
    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date, first_notification_sent_at, second_notification_sent_at) VALUES (\'fa57ef92-663f-11ed-9022-0242ac120002\', current_date + INTERVAL \'6 DAY\', \'2011-01-01\'::date, \'2008-01-01\'::date, \'2008-01-01\'::date)');
    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date, first_notification_sent_at, second_notification_sent_at) VALUES (\'fa57f140-663f-11ed-9022-0242ac120002\', current_date + INTERVAL \'11 DAY\', \'2012-01-01\'::date, \'2008-01-01\'::date, \'2008-01-01\'::date)');
    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date, skip_email, first_notification_sent_at, second_notification_sent_at) VALUES (\'fa57f316-663f-11ed-9022-0242ac120002\', current_date + interval \'1 months\' + INTERVAL \'-4 DAY\', \'2012-01-01\'::date, true, \'2008-01-01\'::date, \'2008-01-01\'::date)');

});

afterEach(async () => {
    await client.query('DROP TABLE IF EXISTS pg_temp.videos');
});

afterAll(async () => {
    jest.clearAllMocks();
});

describe('Video 3 months tests', () => {

    it('Should Return Two Videos To Be Notified', async () => {
        const videos = await notify.getVideosToSendNotification(constants.VIDEO_NOTIFIED_THREE_MONTHS, constants.VIDEO_NOTIFIED_INTERVAL_ONE_WEEK, null, null, null);
        expect(videos.rows).toHaveLength(2);
    });

    it('First Video Should Have Correct Archived Dates And IDs', async () => {
        const videos = await notify.getVideosToSendNotification(constants.VIDEO_NOTIFIED_THREE_MONTHS, constants.VIDEO_NOTIFIED_INTERVAL_ONE_WEEK, null, null, null);
        const firstVideoArchivedDate = videos.rows[0].archived_date;

        let notifiedDate = new Date();
        notifiedDate.setFullYear(notifiedDate.getFullYear(), notifiedDate.getMonth() + constants.VIDEO_NOTIFIED_THREE_MONTHS);
        notifiedDate.setDate(notifiedDate.getDate() - 7);
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };

        expect(firstVideoArchivedDate).toEqual(notifiedDate.toLocaleDateString('fi-FI', options));
        expect(videos.rows[0].video_id).toEqual('a637b65c-56a1-11ed-9b6a-0242ac120002');
    });

    it('Second Video Should Have Correct Archived Dates And IDs', async () => {
        const videos = await notify.getVideosToSendNotification(constants.VIDEO_NOTIFIED_THREE_MONTHS, constants.VIDEO_NOTIFIED_INTERVAL_ONE_WEEK, null, null, null);
        const secondVideoArchivedDate = videos.rows[1].archived_date;

        let notifiedDate = new Date();
        notifiedDate.setFullYear(notifiedDate.getFullYear(), notifiedDate.getMonth() + constants.VIDEO_NOTIFIED_THREE_MONTHS);
        notifiedDate.setDate(notifiedDate.getDate() + 7);
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };

        expect(secondVideoArchivedDate).toEqual(notifiedDate.toLocaleDateString('fi-FI', options));
        expect(videos.rows[1].video_id).toEqual('a637b7ba-56a1-11ed-9b6a-0242ac120003');
    });

    it('should have first_notification_sent_at set after notification is sent', async () => {
        const videos = await notify.getVideosToSendNotification(constants.VIDEO_NOTIFIED_THREE_MONTHS, constants.VIDEO_NOTIFIED_INTERVAL_ONE_WEEK, null, null, null);
    });
});

describe('Video one month tests', () => {

    it('Should Return Two Videos To Be Notified', async () => {
        const videos = await notify.getVideosToSendNotification(constants.VIDEO_NOTIFIED_ONE_MONTH, null, constants.VIDEO_NOTIFIED_INTERVAL_THREE_DAYS, null, null);
        expect(videos.rows).toHaveLength(2);
    });

    it('First Video Should Have Correct Archived Dates And IDs', async () => {
        const videos = await notify.getVideosToSendNotification(constants.VIDEO_NOTIFIED_ONE_MONTH, null, constants.VIDEO_NOTIFIED_INTERVAL_THREE_DAYS, null, null);
        const firstVideoArchivedDate = videos.rows[0].archived_date;
        let notifiedDate = new Date();
        notifiedDate.setFullYear(notifiedDate.getFullYear(), notifiedDate.getMonth() + constants.VIDEO_NOTIFIED_INTERVAL_ONE_WEEK);
        notifiedDate.setDate(notifiedDate.getDate() + 3);
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        expect(firstVideoArchivedDate).toEqual(notifiedDate.toLocaleDateString('fi-FI', options));
        expect(videos.rows[0].video_id).toEqual('499ca72c-64de-11ed-9022-0242ac120002');
    });

    it('Second Video Should Have Correct Archived Dates And IDs', async () => {
        const videos = await notify.getVideosToSendNotification(constants.VIDEO_NOTIFIED_ONE_MONTH, null, constants.VIDEO_NOTIFIED_INTERVAL_THREE_DAYS, null, null);
        const secondVideoArchivedDate = videos.rows[1].archived_date;
        let notifiedDate = new Date();
        notifiedDate.setFullYear(notifiedDate.getFullYear(), notifiedDate.getMonth() + constants.VIDEO_NOTIFIED_INTERVAL_ONE_WEEK);
        notifiedDate.setDate(notifiedDate.getDate() - 1);
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        expect(secondVideoArchivedDate).toEqual(notifiedDate.toLocaleDateString('fi-FI', options));
        expect(videos.rows[1].video_id).toEqual('499cacea-64de-11ed-9022-0242ac120002');
    });

    it('should have first_notification_sent_at set after notification is sent', async () => {
        const videos = await notify.getVideosToSendNotification(constants.VIDEO_NOTIFIED_ONE_MONTH, null, constants.VIDEO_NOTIFIED_INTERVAL_THREE_DAYS, null, null);

    });

});

describe('Video one week tests', () => {

    it('Should Return Two Videos To Be Notified', async () => {
        const videos = await notify.getVideosToSendNotification(null, null, null, 6, 9);
        expect(videos.rows).toHaveLength(2);
    });

    it('First Video Should Have Correct Archived Dates And IDs', async () => {
        const videos = await notify.getVideosToSendNotification(null, null, null, 6, 9);
        const firstVideoArchivedDate = videos.rows[0].archived_date;
        let notifiedDate = new Date();
        notifiedDate.setDate(notifiedDate.getDate() + 9);
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        expect(firstVideoArchivedDate).toEqual(notifiedDate.toLocaleDateString('fi-FI', options));
        expect(videos.rows[0].video_id).toEqual('fa57ee34-663f-11ed-9022-0242ac120002');
    });

    it('Second Video Should Have Correct Archived Dates And IDs', async () => {
        const videos = await notify.getVideosToSendNotification(null, null, null, 6, 9);
        const secondVideoArchivedDate = videos.rows[1].archived_date;
        let notifiedDate = new Date();
        notifiedDate.setDate(notifiedDate.getDate() + 6);
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        expect(secondVideoArchivedDate).toEqual(notifiedDate.toLocaleDateString('fi-FI', options));
        expect(videos.rows[1].video_id).toEqual('fa57ef92-663f-11ed-9022-0242ac120002');
    });

    it('should have first_notification_sent_at set after notification is sent', async () => {
        const videos = await notify.getVideosToSendNotification(null, null, null, 6, 9);

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

afterAll( done => {
    client.end().then(done());
});









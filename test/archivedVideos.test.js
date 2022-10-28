const notify = require('../service/notify');
require('../service/timer');
const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, '../.env')});
const client = require('../service/database');
const Pool = require('pg-pool');
const format = require('date-format');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

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
    await wait(100);
    await client.query('CREATE TEMPORARY TABLE videos(video_id VARCHAR(255) NOT NULL, archived_date date, actual_archived_date date, deletion_date date, informed_date date, video_creation_date date, error_date date, notification_sent_at date, PRIMARY KEY(video_id))');
    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date) VALUES (\'e8a86433-0245-44b8-b0d7-69f6578bac6f\', \'2024-01-01\'::date, \'2008-01-01\'::date)');
    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date) VALUES (\'a637b33c-56a1-11ed-9b6a-0242ac120002\', \'2023-12-01\'::date, \'2009-01-01\'::date)');
    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date) VALUES (\'a637b65c-56a1-11ed-9b6a-0242ac120002\', \'2023-01-21\'::date, \'2010-01-01\'::date)');
    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date) VALUES (\'a637b7ba-56a1-11ed-9b6a-0242ac120002\', \'2023-04-01\'::date, \'2011-01-01\'::date)');
    await client.query('INSERT INTO videos (video_id, archived_date, video_creation_date) VALUES (\'a637b8dc-56a1-11ed-9b6a-0242ac120002\', \'2023-01-28\'::date, \'2012-01-01\'::date)');
    await wait(100);
});

afterEach(async () => {
    await wait(100);
    await client.query('DROP TABLE IF EXISTS pg_temp.videos');
    await wait(100);
});


describe('Video archiving tests', () => {

    it('ARCHIVED_DATE is (today + three months or before)', async () => {

        const videos = await notify.queryVideosAndSendNotifications();

        expect(videos.rows).toHaveLength(2);
        const oldAfterThreeMonthsStr = format.asString('yyyy-MM-dd', new Date(videos.rows[0].archived_date));
        expect(oldAfterThreeMonthsStr).toEqual('2023-01-21');
        expect(videos.rows[0].video_id).toEqual('a637b65c-56a1-11ed-9b6a-0242ac120002');
    });
});





